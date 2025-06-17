import { PieceSet } from "@/types";
import clsx from "clsx";

const pieceTypes = ["K", "Q", "R", "B", "N", "P"];
const colors = ["w", "b"];

const pieceSets: PieceSet[] = ["alpha", "maestro", "cburnett", "merida"];

export const createLocalPieceSet = (style: PieceSet) => {
  const pieces: { [key: string]: () => JSX.Element } = {};

  for (const color of colors) {
    for (const type of pieceTypes) {
      const id = `${color}${type}`;
      pieces[id] = () => (
        <img
          src={`/piece/${style}/${id}.svg`} // Assumes public folder
          alt={id}
          style={{ width: "100%", height: "100%" }}
          draggable={false}
        />
      );
    }
  }

  return pieces;
};

export default function ChessPieceSelector({
  currentPieceSet,
  setPiceSet,
}: {
  currentPieceSet: PieceSet;
  setPiceSet: (set: PieceSet) => void;
}) {
  return (
    <div className="flex max-h-[60vh] mt-3 overflow-y-scroll flex-col gap-2">
      <div>
        {pieceSets.map((set, key) => (
          <div
            className={clsx(
              "flex items-center py-2 justify-between px-2",
              currentPieceSet === set && "bg-base-200"
            )}
            key={key}
            onClick={() => setPiceSet(set)}
          >
            <span className="pl-3 capitalize">{set}</span>
            <div className="fx gap-1 px-3 py-1">
              <img
                src={`/piece/${set}/wK.svg`}
                alt={`${set} wk`}
                className="w-9 h-9 right-[60%]"
                draggable={false}
              />
              <img
                src={`/piece/${set}/bB.svg`}
                alt={`${set} wk`}
                className="w-9 h-9"
                draggable={false}
              />
              <img
                src={`/piece/${set}/wN.svg`}
                alt={`${set} wk`}
                className="w-9 h-9"
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
