"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<string>("Checking...");
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/health/`);
        const data = await response.json();
        setHealthStatus(data.status === "healthy" ? "Connected ✓" : "Error");
      } catch (error) {
        setHealthStatus("Disconnected ✗");
      }
    };

    checkHealth();
  }, []);

  if (isLoading) {
    return (
      <div className="fullscreen-center">
        <div className="text-lg-muted">Loading...</div>
      </div>
    );
  }

  return (
    <main className="home-main">
      <div className="hero">
        <h1 className="hero-title">DotProduct</h1>
        <p className="hero-subtitle">
          Full-stack application with Next.js and Django REST Framework
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <h2 className="feature-title">Backend</h2>
          <p className="feature-text">Django + Django REST Framework</p>
          <div
            className={`status-badge ${
              healthStatus.includes("Connected")
                ? "status-success"
                : "status-info"
            }`}
          >
            <strong>Status:</strong> {healthStatus}
          </div>
        </div>

        <div className="feature-card">
          <h2 className="feature-title">Frontend</h2>
          <p className="feature-text">Next.js with TypeScript</p>
          <div className="status-badge status-info">
            <strong>Status:</strong> Running ✓
          </div>
        </div>
      </div>

      <div className="getting-started">
        <h2 className="getting-started-title">Getting Started</h2>
        <ul className="getting-started-list">
          <li className="getting-started-item">
            ✓ Backend is running on <code>http://localhost:8000</code>
          </li>
          <li className="getting-started-item">
            ✓ Frontend is running on <code>http://localhost:3000</code>
          </li>
          <li className="getting-started-item">
            ✓ Visit <code>/api/health/</code> to check backend status
          </li>
        </ul>
      </div>
    </main>
  );
}
