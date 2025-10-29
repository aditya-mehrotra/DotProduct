"use client";

import { useState } from "react";
import { createCategory } from "../lib/api";

interface CategoryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CategoryForm({
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!name.trim()) {
        throw new Error("Please enter a category name");
      }
      await createCategory({ name: name.trim(), type });
      setName("");
      setType("expense");
      onSuccess?.();
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Failed to create category"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "600",
          marginBottom: "1.5rem",
          color: "#333",
        }}
      >
        Add Category
      </h2>

      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              backgroundColor: "#fde8e8",
              color: "#991b1b",
              padding: "0.75rem",
              borderRadius: "4px",
              marginBottom: "1rem",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="name"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Category Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Groceries, Salary"
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="type"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Category Type *
          </label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as "income" | "expense")}
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "flex-end",
          }}
        >
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: isLoading ? "#9ca3af" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
            }}
          >
            {isLoading ? "Adding..." : "Add Category"}
          </button>
        </div>
      </form>
    </div>
  );
}
