"use client";

import { useState, useEffect } from "react";
import { Category, BudgetFormData, Budget } from "../types";
import {
  getCategories,
  createBudget,
  createCategory,
  updateBudget,
} from "../lib/api";
import styles from "./BudgetForm.module.scss";

interface BudgetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  budget?: Budget | null; // For editing existing budget
}

export default function BudgetForm({
  onSuccess,
  onCancel,
  budget,
}: BudgetFormProps) {
  const isEditing = !!budget;

  const [formData, setFormData] = useState<BudgetFormData>({
    category: "",
    amount: "",
    period: "monthly",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Initialize form data when editing
  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category || "",
        amount: budget.amount.toString(),
        period: budget.period,
      });
    }
  }, [budget]);

  // Load expense categories (budgets are typically for expense categories)
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories("expense");
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    loadCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }

      if (!formData.category) {
        throw new Error("Please select a category");
      }

      if (isEditing && budget) {
        await updateBudget(budget.id, formData);
      } else {
        await createBudget(formData);
      }

      // Reset form
      setFormData({
        category: "",
        amount: "",
        period: "monthly",
      });

      onSuccess?.();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          `Failed to ${isEditing ? "update" : "create"} budget`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const newCategory = await createCategory({
        name: newCategoryName.trim(),
        type: "expense",
      });

      setCategories((prev) => [...prev, newCategory]);
      setFormData((prev) => ({
        ...prev,
        category: newCategory.id,
      }));

      setNewCategoryName("");
      setShowNewCategoryForm(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create category");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {isEditing ? "Edit Budget" : "Create Budget"}
      </h2>

      <form onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        {/* Category */}
        <div className={styles.formGroup}>
          <label htmlFor="category">Category *</label>
          <div className={styles.categoryRow}>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
              className={styles.addButton}
            >
              +
            </button>
          </div>

          {/* New Category Form */}
          {showNewCategoryForm && (
            <div className={styles.newCategoryForm}>
              <div>
                <div className={styles.newCategoryRow}>
                  <input
                    type="text"
                    placeholder="New expense category"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className={styles.addCategoryBtn}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategoryForm(false);
                      setNewCategoryName("");
                    }}
                    className={styles.cancelCategoryBtn}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className={styles.formGroup}>
          <label htmlFor="amount">Budget Amount *</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            required
            min="0.01"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        {/* Period */}
        <div className={`${styles.formGroup} ${styles.largeMargin}`}>
          <label htmlFor="period">Budget Period *</label>
          <select
            id="period"
            name="period"
            value={formData.period}
            onChange={handleInputChange}
            required
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <p>Choose how often this budget resets</p>
        </div>

        {/* Buttons */}
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
            className={`${styles.submitButton} ${styles.green}`}
          >
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Budget"
              : "Create Budget"}
          </button>
        </div>
      </form>
    </div>
  );
}
