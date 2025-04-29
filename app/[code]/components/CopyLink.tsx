"use client";

import React, { ReactNode, useState } from "react";
import { IconCopy } from "@tabler/icons-react";
import { IconChecks } from "@tabler/icons-react";
import clsx from "clsx";
import { useToast } from "@/context/ToastContext";

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
  const { toast } = useToast();
  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: document.title,
        url: window.location.href,
      });
    } catch (e) {
      // Fallback to custom panel if Web Share API isn't supported
      toast("Cannot open share", "error");
    }
  };

  return (
    <button
      onClick={handleNativeShare}
      className={clsx(className || "grad1 px-2.5 py-1 rounded-2xl")}
    >
      {children || "share"}
    </button>
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
