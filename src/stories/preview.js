// .storybook/preview.js
import "../src/app/globals.css";
import RootLayout from "../src/app/layout";

export const decorators = [
  (Story) => (
    <RootLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        <Story />
      </div>
    </RootLayout>
  ),
];

export const parameters = {
  layout: "fullscreen",
};
