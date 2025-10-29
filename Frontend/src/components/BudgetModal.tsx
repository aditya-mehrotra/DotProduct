"use client";

import { useEffect } from "react";
import BudgetForm from "./BudgetForm";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  budget?: any; // For editing existing budget
}

export default function BudgetModal({
  isOpen,
  onClose,
  onSuccess,
  budget,
}: BudgetModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          maxHeight: "90vh",
          overflowY: "auto",
          width: "100%",
          maxWidth: "600px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <BudgetForm
          budget={budget}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
