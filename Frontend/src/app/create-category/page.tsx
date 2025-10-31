"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";
import CategoryForm from "../../components/CategoryForm";
import styles from "../page.module.scss";

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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.contentWrapper}>
        <CategoryForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}
