"use client";

import React, { useState } from "react";
import { ThemePreview, themes } from "./components/Theme";
import { usePreference } from "@/context/PreferenceProvider";
import { updatePref } from "@/lib/user";
import { IconUpload } from "@tabler/icons-react";
import clsx from "clsx";
import Loading from "@/app/Loading";
import dynamic from "next/dynamic";

const BottomModal = dynamic(() => import("@/app/components/BottomModal"), {
  ssr: false,
});
const ChessThemeSelector = dynamic(() => import("./components/Theme"), {
  ssr: false,
});
const ChessPieceSelector = dynamic(() => import("./components/Piece"), {
  ssr: false,
});

function Page() {
  const [open, setOpen] = useState(false);
  const [openTwo, setOpenTwo] = useState(false);
  const { userPreference, setUserPreference } = usePreference();
  const [saving, setSaving] = useState<boolean | null>(null);

  const data = [
    { name: "theme", type: "svg", action: () => setOpen(true) },
    { name: "piece Style", type: "image", action: () => setOpenTwo(true) },
    { name: "sound", v: userPreference?.sound },
    { name: "premove", v: userPreference?.premove },
    {
      name: "Auto Promote to Queen",
      v: userPreference?.autoQueen,
      str: "autoQueen",
    },
  ];

  const showBtn = () => {
    saving === null && setSaving(false);
  };

  const save = async () => {
    if (!userPreference) return;
    setSaving(true);

    const pref = await updatePref(userPreference);
    pref && typeof pref !== "string" && setUserPreference(pref);

    setSaving(null);
  };

  return (
    <>
      {userPreference ? (
        <>
          <div>
            {data.map((d) => (
              <div
                className="flex items-center click justify-between w-full odd:bg-base-200 px-4 py-4"
                key={d.name}
                onClick={d.action}
              >
                <span className="capitalize">{d.name}</span>

                {d.type ? (
                  d.type === "svg" ? (
                    <ThemePreview
                      light={themes[userPreference?.theme || "classic"][0]}
                      dark={themes[userPreference?.theme || "classic"][1]}
                    ></ThemePreview>
                  ) : (
                    <div className="relative">
                      <img
                        src={`/piece/${userPreference.pieceset}/wK.svg`}
                        alt={`${userPreference.pieceset} wk`}
                        className="w-9 h-9 absolute right-[60%]"
                        draggable={false}
                      />
                      <img
                        src={`/piece/${userPreference.pieceset}/bB.svg`}
                        alt={`${userPreference.pieceset} wk`}
                        className="w-9 h-9"
                        draggable={false}
                      />
                    </div>
                  )
                ) : (
                  <label className="toggle text-white border-gray-500">
                    <input
                      onChange={(e) => {
                        setUserPreference({
                          ...userPreference,
                          [d.str || d.name]: !d.v,
                        });
                        showBtn();
                      }}
                      type="checkbox"
                      checked={d.v}
                      className="checked:bg-green-400 bg-red-500 rounded-full"
                    />

                    <svg
                      aria-label="disabled"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    <svg
                      aria-label="enabled"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <g
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="4"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path d="M20 6 9 17l-5-5"></path>
                      </g>
                    </svg>
                  </label>
                )}
              </div>
            ))}
            {saving !== null && (
              <button
                onClick={save}
                className={clsx(
                  "btn float-right btn-ghost rounded-2xl click mt-3 mr-2",
                  saving ? "text-accent/60" : "text-white/60"
                )}
              >
                {saving ? (
                  <span className="loading loading-bars loading-sm"></span>
                ) : (
                  <IconUpload className="opacity-60" size={16} />
                )}
                {saving ? "Saving" : "Save Changes"}
              </button>
            )}
          </div>
          <BottomModal withBar isOpen={open} onClose={() => setOpen(false)}>
            <ChessThemeSelector
              setTheme={(t) => {
                setUserPreference({ ...userPreference, theme: t });
                setOpen(false);
                showBtn();
              }}
              currentTheme={userPreference.theme}
            />
          </BottomModal>
          <BottomModal
            withBar
            isOpen={openTwo}
            onClose={() => setOpenTwo(false)}
          >
            <ChessPieceSelector
              setPiceSet={(t) => {
                setUserPreference({ ...userPreference, pieceset: t });
                setOpenTwo(false);
                showBtn();
              }}
              currentPieceSet={userPreference.pieceset}
            />
          </BottomModal>
        </>
      ) : (
        <div className="relative h-[80%] w-full">
          <Loading />
        </div>
      )}
    </>
  );
}

export default Page;
