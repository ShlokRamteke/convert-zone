/**
 * Lightweight Zero-Dependency In-Browser ZIP Archive Generator
 * Creates a standard PKZIP archive Blob from multiple files/blobs.
 */

interface ZipItem {
  name: string;
  data: Uint8Array;
}

// CRC32 Table for ZIP checksums
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c;
}

function calculateCRC32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export async function createZipArchive(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const zipItems: ZipItem[] = [];

  for (const file of files) {
    const arrayBuffer = await file.blob.arrayBuffer();
    zipItems.push({
      name: file.name,
      data: new Uint8Array(arrayBuffer),
    });
  }

  const parts: Uint8Array[] = [];
  const centralDirectoryHeaders: Uint8Array[] = [];
  let currentOffset = 0;

  const textEncoder = new TextEncoder();

  for (const item of zipItems) {
    const filenameBytes = textEncoder.encode(item.name);
    const crc32 = calculateCRC32(item.data);
    const uncompressedSize = item.data.length;
    const compressedSize = uncompressedSize; // Store mode (no compression overhead)

    // --- Local File Header (30 bytes + filename + data) ---
    const header = new Uint8Array(30 + filenameBytes.length);
    const view = new DataView(header.buffer);

    view.setUint32(0, 0x04034b50, true); // Local header signature
    view.setUint16(4, 20, true);        // Version needed (2.0)
    view.setUint16(6, 0, true);         // General purpose bit flag
    view.setUint16(8, 0, true);         // Compression method (0 = Store)
    view.setUint16(10, 0, true);        // File time
    view.setUint16(12, 0, true);        // File date
    view.setUint32(14, crc32, true);    // CRC-32
    view.setUint32(18, compressedSize, true); // Compressed size
    view.setUint32(22, uncompressedSize, true); // Uncompressed size
    view.setUint16(26, filenameBytes.length, true); // Filename length
    view.setUint16(28, 0, true);        // Extra field length

    header.set(filenameBytes, 30);

    parts.push(header);
    parts.push(item.data);

    // --- Central Directory Header (46 bytes + filename) ---
    const cdHeader = new Uint8Array(46 + filenameBytes.length);
    const cdView = new DataView(cdHeader.buffer);

    cdView.setUint32(0, 0x02014b50, true); // CD signature
    cdView.setUint16(4, 20, true);        // Version made by
    cdView.setUint16(6, 20, true);        // Version needed
    cdView.setUint16(8, 0, true);         // Bit flag
    cdView.setUint16(10, 0, true);        // Compression method (Store)
    cdView.setUint16(12, 0, true);        // File time
    cdView.setUint16(14, 0, true);        // File date
    cdView.setUint32(16, crc32, true);    // CRC-32
    cdView.setUint32(20, compressedSize, true);
    cdView.setUint32(24, uncompressedSize, true);
    cdView.setUint16(28, filenameBytes.length, true);
    cdView.setUint16(30, 0, true);        // Extra length
    cdView.setUint16(32, 0, true);        // Comment length
    cdView.setUint16(34, 0, true);        // Disk start
    cdView.setUint16(36, 0, true);        // Internal attrs
    cdView.setUint32(38, 0, true);        // External attrs
    cdView.setUint32(42, currentOffset, true); // Relative offset of local header

    cdHeader.set(filenameBytes, 46);
    centralDirectoryHeaders.push(cdHeader);

    currentOffset += header.length + item.data.length;
  }

  const centralDirectoryOffset = currentOffset;
  let centralDirectorySize = 0;

  for (const cdHdr of centralDirectoryHeaders) {
    parts.push(cdHdr);
    centralDirectorySize += cdHdr.length;
  }

  // --- End of Central Directory Record (22 bytes) ---
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);

  eocdView.setUint32(0, 0x06054b50, true); // EOCD signature
  eocdView.setUint16(4, 0, true);         // Disk number
  eocdView.setUint16(6, 0, true);         // Disk with CD
  eocdView.setUint16(8, zipItems.length, true); // CD entries on this disk
  eocdView.setUint16(10, zipItems.length, true); // Total CD entries
  eocdView.setUint32(12, centralDirectorySize, true); // CD size
  eocdView.setUint32(16, centralDirectoryOffset, true); // CD offset
  eocdView.setUint16(20, 0, true);        // Comment length

  parts.push(eocd);

  return new Blob(parts as BlobPart[], { type: "application/zip" });
}
