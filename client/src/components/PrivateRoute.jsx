import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";

const PrivateRoute = ({ children }) => {
  const { isLoggedIn, IsLoading } = useAuth();
  const location = useLocation();

  if (IsLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;
