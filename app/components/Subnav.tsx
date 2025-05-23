import { IconArrowLeft } from "@tabler/icons-react";
import { ReactElement } from "react";

const Subnav = ({
  text,
  onClick,
}: {
  text: string | ReactElement;
  onClick: () => void;
}) => {
  return (
    <nav className=" bg-base-300 items-center py-3 px-6 flex gap-5">
      <button onClick={onClick} className="opacity-70">
        <IconArrowLeft className="" />
      </button>
      <span>{text}</span>
    </nav>
  );
};

export default Subnav;
