"use client";

import { useState, useEffect } from "react";
import { Category, TransactionFormData } from "../types";
import { getCategories, createTransaction, createCategory } from "../lib/api";
import styles from "./AddTransactionForm.module.scss";

interface AddTransactionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddTransactionForm({
  onSuccess,
  onCancel,
}: AddTransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    type: "expense",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Load categories when component mounts or type changes
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories(formData.type);
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    loadCategories();
  }, [formData.type]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset category when type changes
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        category: "",
      }));
    }
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

      if (!formData.date) {
        throw new Error("Please select a date");
      }

      await createTransaction(formData);

      // Reset form
      setFormData({
        category: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        type: "expense",
      });

      onSuccess?.();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to create transaction"
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
        type: formData.type,
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
      <h2 className={styles.title}>Add Transaction</h2>

      <form onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        {/* Transaction Type */}
        <div className={styles.formGroup}>
          <label htmlFor="type">Type *</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        {/* Category */}
        <div className={styles.formGroup}>
          <label htmlFor="category">Category</label>
          <div className={styles.categoryRow}>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
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
                    placeholder={`New ${formData.type} category`}
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
          <label htmlFor="amount">Amount *</label>
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

        {/* Date */}
        <div className={styles.formGroup}>
          <label htmlFor="date">Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Optional description..."
          />
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
            className={`${styles.submitButton} ${styles.blue}`}
          >
            {isLoading ? "Adding..." : "Add Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}
