import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
// import { storeTokenInLS } from "../store/auth";
import "./css/login.css";
export default function Login() {
  const { storeTokenInLS } = useAuth();
  const [log, setlog] = useState({
    email: "",
    password: "",
    role: "",
  });
  const navigate = useNavigate();

  const handleInput = (e) => {
    // console.log(e);

    const name = e.target.name;
    const value = e.target.value;

    //  use of this line to if we change only one data all of them to change only those data and another data will be as it is
    setlog({ ...log, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventdefault;
    console.log(log); // this line use when we click on submit button give me alert to fill this detail.

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
        setlog({
          email: "",
          password: "",
          role: "",
        });
      } else {
        alert("invalid");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <section className="login-section">
        <main className="login-main">
          <div className="container grid grid-two-cols">
            <div className="login-htmlForm">
              <h1 className="htmlForm-heading">Login Form</h1>
              <br />

              <htmlForm className="htmlForm">
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
                  <button
                    type="button"
                    className="submit-btn"
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                </div>
              </htmlForm>
            </div>
          </div>
        </main>
      </section>
    </>
  );
}
