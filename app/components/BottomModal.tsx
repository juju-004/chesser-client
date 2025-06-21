"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  withBar?: boolean;
  children: React.ReactNode;
  className?: string;
};

export default function BottomModal({
  isOpen,
  onClose,
  withBar,
  children,
  className,
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(1000); // default

  useEffect(() => {
    setViewportHeight(window.innerHeight);
  }, []);

  const handleDragEnd = (_: any, info: { offset: { y: number } }) => {
    if (Math.abs(info.offset.y) > 50) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "#000",
              zIndex: 10,
            }}
          />

          {/* Bottom Modal */}
          <motion.div
            ref={modalRef}
            initial={{ y: viewportHeight }}
            animate={{ y: 0 }}
            exit={{ y: viewportHeight }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
            className={className || "bg-base-100"}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: "1rem",
              zIndex: 20,
              touchAction: "none",
              willChange: "transform",
            }}
          >
            {withBar && (
              <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                <div
                  style={{
                    width: "40px",
                    height: "5px",
                    background: "#ccc",
                    borderRadius: "10px",
                    margin: "0 auto",
                  }}
                />
              </div>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
