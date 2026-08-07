import { useState, createContext, useContext, useEffect } from "react";
import { API_URL } from "../config";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setuser] = useState("");
  const [service, setservice] = useState("");
  const [IsLoading, setIsLoading] = useState(true);
  const authorizationtoken = `Bearer ${token}`;
  const storeTokenInLS = (serverToken) => {
    setToken(serverToken); // it is use because when we not need to refresh page after login, without use we need to see logout button refresh the page
    return localStorage.setItem("token", serverToken);
  };

  const usercheck = () => {};
  // logout functinality
  const isLoggedIn = !!token;

  const LogoutUser = () => {
    setToken("");
    setuser("");
    setservice("");
    return localStorage.removeItem("token");
  };

  // JWT authentication- to get currently login user data like( "hello arshil ");

  const userAuthentication = async () => {
    if (!token) {
      setuser("");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/auth/user`, {
        method: "GET",
        headers: {
          Authorization: authorizationtoken,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setuser(data.userData);
      } else {
        setuser("");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error fetching data", error);
      setuser("");
      setIsLoading(false);
    }
  };
  const getservice = async () => {
    const response = await fetch(`${API_URL}/api/data/service`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.msg);
      setservice(data.msg);
    }
  };
  useEffect(() => {
    getservice();
    userAuthentication();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        storeTokenInLS,
        LogoutUser,
        user,
        service,
        authorizationtoken,
        IsLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
