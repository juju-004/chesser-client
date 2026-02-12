import { IconPuzzle, IconSearch } from "@tabler/icons-react";

interface Props {
  title?: string;
}

export default function NothingToShow({ title = "Nothing to show" }: Props) {
  return (
    <div className="fx flex-col h-[60vh] relative w-full gap-4 items-center justify-center text-center">
      {/* Background faded icon */}
      <IconPuzzle className="absolute opacity-5 z-10" size={260} stroke={1.2} />

      {/* Main icon */}
      <IconSearch size={90} className="text-secondary" stroke={1.5} />

      {/* Title */}
      <div className="text-2xl font-bold">{title}</div>
    </div>
  );
}
