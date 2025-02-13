import { useState, createContext, useContext, useEffect } from "react";

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
    return localStorage.removeItem("token");
  };

  // JWT authentication- to get currently login user data like( "hello arshil ");

  const userAuthentication = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:3000/api/auth/user", {
        method: "GET",
        headers: {
          Authorization: authorizationtoken,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("userdata ", data.userData);
        setuser(data.userData);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("error fetching data", error);
    }
  };
  const getservice = async () => {
    const response = await fetch("http://localhost:3000/api/data/service", {
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
  }, []);

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
