import React from "react";
import LogisticRegressionPage from "../../app/logistic-regression/page";

const StoryWrapper = (Component) => {
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", padding: "20px" }}>
      <Component />
    </div>
  );
};

export default {
  title: "ML Pages/Logistic Regression",
  component: LogisticRegressionPage,
};

export const FullPage = () => StoryWrapper(LogisticRegressionPage);
