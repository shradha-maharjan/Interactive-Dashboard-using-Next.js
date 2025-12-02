"use client";

import Navbar from "@/components/Navbar"; // optional; remove if it causes issues

export default function AppShell({ children }) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar /> {/* remove this line if you don’t want the navbar in stories */}
      <main className="mx-auto max-w-7xl py-6 px-4">{children}</main>
    </div>
  );
}
