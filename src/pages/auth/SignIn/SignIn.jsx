import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import './SignIn.css'

export default function SignIn() {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setError("");
    try {
      await loginWithGoogle();
      navigate("/"); // send user to home after a successful login
    } catch (err) {
      setError(err.message || "Sign-in failed. Please try again.");
    }
  };

  return (
    <div className="page-shell sign-in-page">
      <section className="page-header-block">
        <h1>Sign In</h1>
        <p className="page-subtitle">
          Use your <strong>@bc.edu</strong> Google email to access the Library Catalog AI.
        </p>

        {/* Sign-In Button */}
        <button className="google-signin-btn" onClick={handleSignIn}>
          Sign in with Google
        </button>

        {/* Error Message */}
        {error && (
          <p style={{ color: "salmon", marginTop: "1rem", fontSize: "0.95rem" }}>
            {error}
          </p>
        )}
      </section>
    </div>
  );
}

