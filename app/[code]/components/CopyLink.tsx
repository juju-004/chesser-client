"use client";

import React, { ReactNode, useState } from "react";
import { IconCopy } from "@tabler/icons-react";
import { IconChecks } from "@tabler/icons-react";
import {
  IconX,
  IconBrandTwitter,
  IconBrandFacebook,
  IconBrandLinkedin,
  IconLink,
} from "@tabler/icons-react";

interface CopyLinkButtonProps {
  link: string;
  className?: string;
  iconSize?: number;
  children?: ReactNode;
}

export function ShareButton({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: document.title,
        url: window.location.href,
      });
    } catch (e) {
      // Fallback to custom panel if Web Share API isn't supported
      setIsOpen(true);
    }
  };

  const shareOptions = [
    {
      name: "Twitter",
      icon: <IconBrandTwitter size={20} />,
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            window.location.href
          )}&text=${encodeURIComponent(document.title)}`,
          "_blank"
        ),
    },
    {
      name: "Facebook",
      icon: <IconBrandFacebook size={20} />,
      action: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            window.location.href
          )}`,
          "_blank"
        ),
    },
    {
      name: "LinkedIn",
      icon: <IconBrandLinkedin size={20} />,
      action: () =>
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            window.location.href
          )}`,
          "_blank"
        ),
    },
    {
      name: "Copy Link",
      icon: <IconLink size={20} />,
      action: () => {
        navigator.clipboard.writeText(window.location.href);
        // You might want to add a toast notification here
      },
    },
  ];

  return (
    <>
      <button
        onClick={handleNativeShare}
        className={`grad1 px-2.5 py-1 rounded-2xl ${className}`}
      >
        {children || "share"}
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Share Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-base-100 rounded-t-2xl p-4 shadow-lg z-50 transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Share</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="btn btn-ghost btn-sm"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => {
                option.action();
                setIsOpen(false);
              }}
              className="btn btn-outline flex-col h-auto py-3 gap-2"
            >
              {option.icon}
              <span>{option.name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export const CopyLinkButton = ({
  link,
  children,
  className = "",
  iconSize = 16,
}: CopyLinkButtonProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = link;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <button
      onClick={copyToClipboard}
      className={`${className}`}
      aria-label="Copy"
      title="Copy"
    >
      {copied ? <IconChecks size={iconSize} /> : <IconCopy size={iconSize} />}
      {children || link}
    </button>
  );
};
