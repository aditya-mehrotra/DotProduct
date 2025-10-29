"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TransactionModal from "../../components/TransactionModal";
import BudgetModal from "../../components/BudgetModal";
import CategoryModal from "../../components/CategoryModal";
import Link from "next/link";
import SummaryChart from "../../components/SummaryChart";
import BudgetVsActualChart from "../../components/BudgetVsActualChart";

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleTransactionSuccess = () => {
    // Refresh data or show success message
    console.log("Transaction added successfully");
  };

  const handleBudgetSuccess = () => {
    // Refresh data or show success message
    console.log("Budget created successfully");
  };

  const handleCategorySuccess = () => {
    console.log("Category created successfully");
  };

  if (isLoading) {
    return (
      <div className="fullscreen-center">
        <div className="text-lg-muted">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="header">
        <h1 className="header-title">DotProduct Dashboard</h1>

        <div className="header-actions">
          <nav className="nav">
            <Link href="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link href="/transactions" className="nav-link">
              Transactions
            </Link>
          </nav>

          <span className="welcome-text">
            Welcome, {user?.first_name || user?.username}!
          </span>
          <button onClick={handleLogout} className="btn btn-red">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="card">
          <h2 className="section-title">Financial Summary</h2>
          <SummaryChart />
        </div>

        <div className="card">
          <h2 className="section-title">Monthly Budget vs Actual</h2>
          <BudgetVsActualChart />
        </div>
        <div className="card">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions">
            <button
              onClick={() => setIsTransactionModalOpen(true)}
              className="btn btn-blue btn-lg"
            >
              Add Transaction
            </button>
            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="btn btn-green btn-lg"
            >
              Create Budget
            </button>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="btn btn-purple btn-lg"
            >
              Add Category
            </button>
          </div>
        </div>
      </main>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSuccess={handleTransactionSuccess}
      />

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSuccess={handleBudgetSuccess}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={handleCategorySuccess}
      />
    </div>
  );
}
