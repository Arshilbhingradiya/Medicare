import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import "./css/signup.css";

export default function Signup() {
  const [user, setuser] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  const navigate = useNavigate();
  const handleGooglesignup = () => {
    window.open("http://localhost:3000/auth/google", "_self");
  };
  const { storeTokenInLS } = useAuth();

  const handleInput = (e) => {
    // console.log(e);

    const name = e.target.name;
    const value = e.target.value;

    setuser({ ...user, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.role) {
      alert("Please select a role: Patient or Doctor");
      return;
    }

    console.log(user);
    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      const res_data = await response.json();
      console.log("res from server", res_data);

      if (response.ok) {
        storeTokenInLS(res_data.token);

        navigate(user.role === "Doctor" ? "/doctordashboard" : "/patientdashboard");

        setuser({
          username: "",
          email: "",
          phone: "",
          password: "",
          role: "",
        });
      } else {
        alert(res_data?.msg || "Invalid registration data");
      }
      console.log("myname", response);
    } catch (error) {
      console.log("register", error);
    }
  };

  return (
    <>
      <section>
        <main>
          <div className="section-registration">
            <div className="container grid grid-two-cols">
              <div className="registration-form">
                <h1 className="main-heading mb-3">Registration Form</h1>
                <br />

                <form onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="username">username</label>
                    <input
                      type="text"
                      name="username"
                      placeholder="username"
                      id="username"
                      value={user.username}
                      onChange={handleInput}
                      required
                      autoComplete="off"
                    ></input>
                  </div>
                  <div>
                    <label htmlFor="username">email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="email"
                      id="email"
                      value={user.email}
                      onChange={handleInput}
                      required
                      autoComplete="off"
                    ></input>
                  </div>
                  <div>
                    <label htmlFor="username">phone no.</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="phone"
                      id="phone"
                      value={user.phone}
                      onChange={handleInput}
                      required
                      autoComplete="off"
                    ></input>
                  </div>
                  <div>
                    <label htmlFor="username">password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="password"
                      id="password"
                      value={user.password}
                      onChange={handleInput}
                      required
                      autoComplete="off"
                    ></input>
                  </div>

                  <label>Role</label>
                  <div className="role-selection">
                    <div
                      className="role-option"
                      onClick={() => setuser({ ...user, role: "Patient" })}
                      style={{
                        border:
                          user.role === "Patient"
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
                      onClick={() => setuser({ ...user, role: "Doctor" })}
                      style={{
                        border:
                          user.role === "Doctor"
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
                  <div>
                    <button type="submit">
                      submit
                    </button>
                  </div>
                  <div
                    className="google-login"
                    style={{ marginTop: "20px", textAlign: "center" }}
                  >
                    <button
                      type="button"
                      className="google-btn"
                      onClick={handleGooglesignup}
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
                      🔑 Sign up with Google
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </section>
    </>
  );
}
