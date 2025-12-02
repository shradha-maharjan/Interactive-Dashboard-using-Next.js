import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";  

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Evaluation Results",
  description: "CSV visualization and experiments",
};

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         <Navbar />   {}
//         <main className="mx-auto max-w-7xl py-6">{children}</main>
//       </body>
//     </html>
//   );
// }


export default function RootLayout({ children }) {
  const isStorybook = process.env.STORYBOOK === "true";

  return (
    <html lang="en">
      <body>
        {!isStorybook && <Navbar />} {/* Navbar hidden only in Storybook */}
        {children}
      </body>
    </html>
  );
}
