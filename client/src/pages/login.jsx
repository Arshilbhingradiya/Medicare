import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import "./css/login.css";

export default function Login() {
  const { storeTokenInLS } = useAuth();
  const [log, setlog] = useState({
    email: "",
    password: "",
    role: "",
  });

  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.open("http://localhost:3000/auth/google", "_self");
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setlog({ ...log, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ Corrected this line

    if (!log.role) {
      alert("Please select a role: Patient or Doctor");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(log),
      });

      if (response.ok) {
        const res_data = await response.json();
        storeTokenInLS(res_data.token);
        navigate("/");
        setlog({ email: "", password: "", role: "" });
      } else {
        alert("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <section className="login-section">
      <main className="login-main">
        <div className="container grid grid-two-cols">
          <div className="login-htmlForm">
            <h1 className="htmlForm-heading">Login Form</h1>
            <br />

            <form className="htmlForm" onSubmit={handleSubmit}>
              <div className="htmlForm-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  id="email"
                  value={log.email}
                  onChange={handleInput}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="htmlForm-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  id="password"
                  value={log.password}
                  onChange={handleInput}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="role-selection">
                <div
                  className="role-option"
                  onClick={() => setlog({ ...log, role: "Patient" })}
                  style={{
                    border:
                      log.role === "Patient"
                        ? "2px solid #007bff"
                        : "2px solid #ccc",
                    padding: "10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "inline-block",
                    marginRight: "10px",
                  }}
                >
                  👤 Patient
                </div>
                <div
                  className="role-option"
                  onClick={() => setlog({ ...log, role: "Doctor" })}
                  style={{
                    border:
                      log.role === "Doctor"
                        ? "2px solid #007bff"
                        : "2px solid #ccc",
                    padding: "10px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "inline-block",
                  }}
                >
                  🏢 Doctor
                </div>
              </div>

              <div className="htmlForm-submit">
                <button type="submit" className="submit-btn">
                  Submit
                </button>
              </div>
            </form>

            <div
              className="google-login"
              style={{ marginTop: "20px", textAlign: "center" }}
            >
              <button
                type="button"
                className="google-btn"
                onClick={handleGoogleLogin}
                style={{
                  backgroundColor: "#4285F4",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                🔑 Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
