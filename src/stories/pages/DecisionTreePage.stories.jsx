import React from "react";
import DecisionTreePage from "../../app/decision-tree/page";

const StoryWrapper = (Component) => {
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", padding: "20px" }}>
      <Component />
    </div>
  );
};

export default {
  title: "ML Pages/Decision Tree",
  component: DecisionTreePage,
};

export const FullPage = () => StoryWrapper(DecisionTreePage);
