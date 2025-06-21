"use client";

import React, { ReactElement } from "react";

function Button({
  className,
  text,
  disabled,
  clicked,
}: {
  className?: string;
  text: string | ReactElement;
  disabled?: boolean;
  clicked?: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={clicked}
      className={`${className} btn btn-lg fx font-jose-bold grad1 w-full gap-2 rounded-xl text-white disabled:opacity-75`}
    >
      {disabled && (
        <span className="loading text-c2 loading-spinner loading-sm"></span>
      )}{" "}
      {text}
    </button>
  );
}

export default Button;
