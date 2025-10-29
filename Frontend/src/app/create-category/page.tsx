"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";
import CategoryForm from "../../components/CategoryForm";

export default function CreateCategoryPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSuccess = () => {
    router.push("/dashboard");
  };

  const handleCancel = () => {
    router.push("/dashboard");
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
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <CategoryForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}
