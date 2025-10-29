"use client";

import { useState, useEffect } from "react";
import { Category, TransactionFormData, Transaction } from "../types";
import {
  getCategories,
  createTransaction,
  createCategory,
  updateTransaction,
} from "../lib/api";

interface TransactionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  transaction?: Transaction | null; // For editing existing transaction
}

export default function TransactionForm({
  onSuccess,
  onCancel,
  transaction,
}: TransactionFormProps) {
  const isEditing = !!transaction;

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

  // Initialize form data when editing
  useEffect(() => {
    if (transaction) {
      setFormData({
        category: transaction.category || "",
        amount: transaction.amount.toString(),
        description: transaction.description || "",
        date: transaction.date,
        type: transaction.type,
      });
    }
  }, [transaction]);

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

      if (isEditing && transaction) {
        await updateTransaction(transaction.id, formData);
      } else {
        await createTransaction(formData);
      }

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
          `Failed to ${isEditing ? "update" : "create"} transaction`
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
    <div
      style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        maxWidth: "500px",
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
        {isEditing ? "Edit Transaction" : "Add Transaction"}
      </h2>

      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "0.75rem",
              borderRadius: "4px",
              marginBottom: "1rem",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Transaction Type */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="type"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
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

        {/* Category */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="category"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Category
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              style={{
                flex: 1,
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
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
              style={{
                padding: "0.75rem",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              +
            </button>
          </div>

          {/* New Category Form */}
          {showNewCategoryForm && (
            <div
              style={{
                marginTop: "0.5rem",
                padding: "1rem",
                backgroundColor: "#f9fafb",
                borderRadius: "4px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    placeholder={`New ${formData.type} category`}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                    }}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategoryForm(false);
                      setNewCategoryName("");
                    }}
                    style={{
                      padding: "0.5rem 1rem",
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
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Amount */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="amount"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Amount *
          </label>
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

        {/* Date */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="date"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
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

        {/* Description */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            htmlFor="description"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Optional description..."
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "1rem",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
        </div>

        {/* Buttons */}
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
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Adding..."
              : isEditing
              ? "Update Transaction"
              : "Add Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}
