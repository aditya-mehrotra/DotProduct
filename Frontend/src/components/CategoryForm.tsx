"use client";

import { useState } from "react";
import { createCategory } from "../lib/api";
import styles from "./CategoryForm.module.scss";

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
    <div className={styles.container}>
      <h2 className={styles.title}>Add Category</h2>

      <form onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="name">Category Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Groceries, Salary"
            required
          />
        </div>

        <div className={`${styles.formGroup} ${styles.largeMargin}`}>
          <label htmlFor="type">Category Type *</label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as "income" | "expense")}
            required
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div className={styles.actions}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? "Adding..." : "Add Category"}
          </button>
        </div>
      </form>
    </div>
  );
}
