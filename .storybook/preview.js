import "../src/app/globals.css"; 
import "./tailwind.config.js";             
import AppShell from "./AppShell";            

// export const decorators = [
//   (Story) => (
//     <AppShell>
//       <Story />
//     </AppShell>
//   ),
// ];

// .storybook/preview.js
// process.env.STORYBOOK = "true";

// export const parameters = {
//   layout: "fullscreen", // removes the default Storybook frame
//   backgrounds: {
//     default: "app",
//     values: [
//       { name: "app", value: "#f9fafb" }, // Tailwind’s gray-50 background
//       { name: "white", value: "#ffffff" },
//     ],
//   },
// };

// export const decorators = [
//   (Story) => (
//     <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
//       <div className="mx-auto max-w-7xl">
//         <Story />
//       </div>
//     </div>
//   ),
// ];



// // // .storybook/preview.js
// // import "../src/app/globals.css";
// // import RootLayout from "../src/app/layout";

// // export const decorators = [
// //   (Story) => (
// //     <RootLayout>
// //       <div className="min-h-screen bg-gray-50 p-8">
// //         <Story />
// //       </div>
// //     </RootLayout>
// //   ),
// // ];

// // export const parameters = {
// //   layout: "fullscreen",
// // };
// .storybook/preview.js

export const parameters = {
  layout: "fullscreen",
};

export const decorators = [
  (Story) => (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="mx-auto max-w-7xl">
        <Story />
      </div>
    </div>
  ),
];
