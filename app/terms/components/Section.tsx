import React, { ReactNode } from "react";

export default function Section({ children }: { children: ReactNode }) {
  return <header>{children}</header>;
}
