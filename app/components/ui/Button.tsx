import React, { ReactNode } from "react";

interface ButtonProps {
  variants: "grad" | "outline" | "normal";
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

function Button({
  variants = "normal",
  children,
  className,
  disabled,
}: ButtonProps) {
  let classList = "";

  if (variants === "grad") {
    classList += "";
  }
  return <div>{children}</div>;
}

export default Button;
