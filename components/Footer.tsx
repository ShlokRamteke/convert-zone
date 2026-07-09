"use client";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16 py-6">
      <div className="container mx-auto px-4">
        <p className="text-gray-500 text-sm text-center">
          © {new Date().getFullYear()} ConvertZone. Local browser-based processing. Privacy First.
        </p>
      </div>
    </footer>
  );
}
