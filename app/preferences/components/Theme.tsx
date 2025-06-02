export type ThemeType =
  | "default"
  | "classic"
  | "blue"
  | "brown"
  | "dark"
  | "green"
  | "gray"
  | "purple"
  | "red"
  | "ocean"
  | "solarized";

export const themes = {
  default: ["#eae9d2", "#4b7399"],
  classic: ["#eeeed2", "#769656"],
  blue: ["#e0e0ff", "#7799cc"],
  brown: ["#f0d9b5", "#b58863"],
  dark: ["#999999", "#444444"],
  green: ["#d1f7d6", "#5c7c54"],
  gray: ["#f0f0f0", "#a0a0a0"],
  purple: ["#f3e5f5", "#7b1fa2"],
  red: ["#ffebee", "#c62828"],
  ocean: ["#e0f7fa", "#006064"],
  solarized: ["#fdf6e3", "#586e75"],
};

export const ThemePreview = ({
  light,
  dark,
  size = 32,
}: {
  size?: number;
  light: string;
  dark: string;
}) => (
  <svg width={size} height={size} className={"rounded overflow-hidden shadow"}>
    <rect width={size / 2} height={size / 2} x="0" y="0" fill={light} />
    <rect width={size / 2} height={size / 2} x={size / 2} y="0" fill={dark} />
    <rect width={size / 2} height={size / 2} x="0" y={size / 2} fill={dark} />
    <rect
      width={size / 2}
      height={size / 2}
      x={size / 2}
      y={size / 2}
      fill={light}
    />
  </svg>
);

export default function ChessThemeSelector({
  currentTheme,
  setTheme,
}: {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}) {
  return (
    <div className="flex max-h-[60vh] overflow-y-scroll flex-col gap-2">
      {Object.entries(themes).map(([name, [light, dark]], key) => (
        <button
          key={key}
          onClick={() => setTheme(name as ThemeType)}
          className={`flex items-center gap-4 px-2 py-2 ${
            name === currentTheme ? "bg-base-300 text-white" : ""
          }`}
        >
          <ThemePreview size={40} light={light} dark={dark} />
          <span className="capitalize">{name}</span>
        </button>
      ))}
    </div>
  );
}
