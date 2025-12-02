import React from "react";
import RandomForestPage from "../../app/random-forest/page";

const StoryWrapper = (Component) => {
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", padding: "20px" }}>
      <Component />
    </div>
  );
};

export default {
  title: "ML Pages/Random Forest",
  component: RandomForestPage,
};

export const FullPage = () => StoryWrapper(RandomForestPage);
