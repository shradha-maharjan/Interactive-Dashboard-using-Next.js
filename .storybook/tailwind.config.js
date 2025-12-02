/** @type {import('tailwindcss').Config} */
// .storybook/tailwind.config.js
module.exports = {
  content: [
    "../src/components/**/*.{js,jsx,ts,tsx}",
    "../src/stories/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: { extend: {} },
  corePlugins: { preflight: false }, // skip resets, faster build
};
