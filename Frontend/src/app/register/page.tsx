"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { RegisterCredentials } from "../../types";

export default function RegisterPage() {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(credentials);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">DotProduct</h1>
          <p className="auth-subtitle">Create your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="first_name" className="form-label">
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={credentials.first_name}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name" className="form-label">
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={credentials.last_name}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group-lg">
            <label htmlFor="password" className="form-label">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="form-submit">
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Already have an account?{" "}
            <Link href="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
