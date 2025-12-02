"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/experiments", label: "Experiments" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/logistic-regression", label: "Logistic Regression" },
    { href: "/random-forest", label: "Random Forest" },
    { href: "/decision-tree", label: "Decision Tree" },
    { href: "/knn", label: "KNN" },
  ];

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 shadow">
      <div className="mx-auto max-w-7xl flex items-center gap-6">
        <h1 className="text-lg font-bold">Evaluation Results</h1>
        <div className="flex gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1 rounded ${
                pathname === item.href
                  ? "bg-gray-700 font-semibold"
                  : "hover:bg-gray-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
