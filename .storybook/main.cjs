// frontend/.storybook/main.cjs
const fs = require("fs");
const path = require("path");

// const dataDir = path.resolve(__dirname, "../data");

// console.log("STATIC DIR EXISTS:", fs.existsSync(dataDir), dataDir);
const pubDir = path.resolve(__dirname, "../public");

console.log("STATIC CHECK:", fs.existsSync(pubDir), pubDir);


/** @type {import('@storybook/nextjs').StorybookConfig} */
module.exports = {
  stories: [
    "../src/components/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../src/stories/**/*.stories.@(js|jsx|ts|tsx|mdx)",
  ],

  addons: ["@storybook/addon-essentials", "@storybook/addon-interactions"],

  // staticDirs: [{ from: dataDir, to: "/data" }],
  staticDirs: [{ from: pubDir, to: "/" }],

  framework: {
    name: "@storybook/nextjs",
    options: {
      nextConfigPath: path.resolve(__dirname, "../next.config.js"),
    },
  },

  core: { disableTelemetry: true },
  docs: { autodocs: "tag" },

  webpackFinal: async (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "../src");
    config.resolve.alias["@/components"] = path.resolve(
      __dirname,
      "../src/components"
    );
    config.resolve.alias["@/app"] = path.resolve(__dirname, "../src/app");

    config.watchOptions = {
      ignored: ["**/node_modules", "**/out", "**/.next"],
    };
    return config;
  },
};
