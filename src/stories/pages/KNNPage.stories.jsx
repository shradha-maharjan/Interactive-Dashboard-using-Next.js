import React from "react";
import KNNPage  from "../../app/knn/page";

const StoryWrapper = (Component) => {
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", padding: "20px" }}>
      <Component />
    </div>
  );
};

export default {
  title: "ML Pages/KNN",
  component: KNNPage ,
};

export const FullPage = () => StoryWrapper(KNNPage );
