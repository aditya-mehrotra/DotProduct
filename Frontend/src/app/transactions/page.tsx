"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { Transaction, Category } from "../../types";
import {
  getTransactions,
  getCategories,
  deleteTransaction,
} from "../../lib/api";
import TransactionModal from "../../components/TransactionModal";
import TransactionForm from "../../components/TransactionForm";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import Link from "next/link";

export default function TransactionsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    type: "" as "" | "income" | "expense",
    category: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Load transactions and categories
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoadingTransactions(true);

        // Load transactions with filters
        const transactionParams = {
          ...(filters.type && { type: filters.type }),
          ...(filters.category && { category: parseInt(filters.category) }),
          ...(filters.startDate && { start_date: filters.startDate }),
          ...(filters.endDate && { end_date: filters.endDate }),
        };

        const transactionsData = await getTransactions(transactionParams);

        // Filter by search term if provided
        let filteredTransactions = transactionsData;
        if (filters.search) {
          filteredTransactions = transactionsData.filter(
            (transaction) =>
              transaction.description
                .toLowerCase()
                .includes(filters.search.toLowerCase()) ||
              transaction.category_name
                ?.toLowerCase()
                .includes(filters.search.toLowerCase())
          );
        }

        setTransactions(filteredTransactions);
        setTotalPages(Math.ceil(filteredTransactions.length / itemsPerPage));
        setCurrentPage(1);

        // Load all categories for filter dropdown
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load transactions:", error);
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    loadData();
  }, [isAuthenticated, filters]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      category: "",
      startDate: "",
      endDate: "",
      search: "",
    });
  };

  const handleTransactionSuccess = () => {
    // Reload transactions
    const loadTransactions = async () => {
      try {
        const transactionsData = await getTransactions();
        setTransactions(transactionsData);
        setTotalPages(Math.ceil(transactionsData.length / itemsPerPage));
      } catch (error) {
        console.error("Failed to reload transactions:", error);
      }
    };
    loadTransactions();
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      await deleteTransaction(selectedTransaction.id);
      handleTransactionSuccess(); // Reload transactions
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: "1.25rem", color: "#666" }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "white",
          padding: "1rem 2rem",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <nav style={{ display: "flex", gap: "1rem" }}>
            <Link
              href="/dashboard"
              style={{
                color: "#374151",
                textDecoration: "none",
                fontWeight: "500",
                fontSize: "0.875rem",
              }}
            >
              Dashboard
            </Link>
            <Link
              href="/transactions"
              style={{
                color: "#3b82f6",
                textDecoration: "none",
                fontWeight: "500",
                fontSize: "0.875rem",
              }}
            >
              Transactions
            </Link>
          </nav>

          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            Transactions
          </h1>
        </div>

        <button
          onClick={() => setIsTransactionModalOpen(true)}
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: "500",
          }}
        >
          Add Transaction
        </button>
      </header>

      {/* Main Content */}
      <main
        style={{
          padding: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Filters */}
        <div
          style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            marginBottom: "2rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "#333",
            }}
          >
            Filters
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            {/* Search */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Search
              </label>
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Type Filter */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* End Date */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Clear Filters
          </button>
        </div>

        {/* Transactions Table */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          {isLoadingTransactions ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#666",
              }}
            >
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#666",
              }}
            >
              No transactions found.{" "}
              <button
                onClick={() => setIsTransactionModalOpen(true)}
                style={{
                  color: "#3b82f6",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Add your first transaction
              </button>
            </div>
          ) : (
            <>
              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f9fafb",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "0.875rem",
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "0.875rem",
                        }}
                      >
                        Type
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "0.875rem",
                        }}
                      >
                        Category
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "0.875rem",
                        }}
                      >
                        Description
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "right",
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "0.875rem",
                        }}
                      >
                        Amount
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#374151",
                          fontSize: "0.875rem",
                          width: "120px",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        style={{
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <td
                          style={{
                            padding: "1rem",
                            color: "#374151",
                            fontSize: "0.875rem",
                          }}
                        >
                          {formatDate(transaction.date)}
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            fontSize: "0.875rem",
                          }}
                        >
                          <span
                            style={{
                              padding: "0.25rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: "500",
                              backgroundColor:
                                transaction.type === "income"
                                  ? "#d1fae5"
                                  : "#fee2e2",
                              color:
                                transaction.type === "income"
                                  ? "#065f46"
                                  : "#991b1b",
                            }}
                          >
                            {transaction.type.charAt(0).toUpperCase() +
                              transaction.type.slice(1)}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            color: "#374151",
                            fontSize: "0.875rem",
                          }}
                        >
                          {transaction.category_name || "Uncategorized"}
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            color: "#374151",
                            fontSize: "0.875rem",
                            maxWidth: "200px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {transaction.description || "-"}
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            textAlign: "right",
                            fontWeight: "500",
                            fontSize: "0.875rem",
                            color:
                              transaction.type === "income"
                                ? "#059669"
                                : "#dc2626",
                          }}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              justifyContent: "center",
                            }}
                          >
                            <button
                              onClick={() => handleEditTransaction(transaction)}
                              style={{
                                padding: "0.25rem 0.5rem",
                                backgroundColor: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                fontWeight: "500",
                              }}
                              title="Edit transaction"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteTransaction(transaction)
                              }
                              style={{
                                padding: "0.25rem 0.5rem",
                                backgroundColor: "#dc2626",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                fontWeight: "500",
                              }}
                              title="Delete transaction"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    padding: "1rem",
                    borderTop: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, transactions.length)} of{" "}
                    {transactions.length} transactions
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      style={{
                        padding: "0.5rem 1rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        backgroundColor: "white",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        opacity: currentPage === 1 ? 0.5 : 1,
                        fontSize: "0.875rem",
                      }}
                    >
                      Previous
                    </button>

                    <span
                      style={{
                        padding: "0.5rem 1rem",
                        color: "#374151",
                        fontSize: "0.875rem",
                      }}
                    >
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      style={{
                        padding: "0.5rem 1rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        backgroundColor: "white",
                        cursor:
                          currentPage === totalPages
                            ? "not-allowed"
                            : "pointer",
                        opacity: currentPage === totalPages ? 0.5 : 1,
                        fontSize: "0.875rem",
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSuccess={handleTransactionSuccess}
      />

      {/* Edit Transaction Modal */}
      {isEditModalOpen && (
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
              setIsEditModalOpen(false);
              setSelectedTransaction(null);
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
            <TransactionForm
              transaction={selectedTransaction}
              onSuccess={() => {
                handleTransactionSuccess();
                setIsEditModalOpen(false);
                setSelectedTransaction(null);
              }}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedTransaction(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedTransaction(null);
        }}
        onConfirm={confirmDeleteTransaction}
        title="Delete Transaction"
        message={`Are you sure you want to delete this ${
          selectedTransaction?.type
        } transaction for ${
          selectedTransaction ? formatCurrency(selectedTransaction.amount) : ""
        }? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
}
