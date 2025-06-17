import React from "react";

function Loading() {
  return (
    <div className="animate-fadein absolute inset-0 z-40">
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="loading text-c2 loading-spinner loading-xl"></span>
      </div>
    </div>
  );
}

export default Loading;
