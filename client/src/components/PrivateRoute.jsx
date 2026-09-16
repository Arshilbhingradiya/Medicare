import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, IsLoading, user } = useAuth();
  const location = useLocation();

  if (IsLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = user?.isAdmin ? "admin" : (user?.role || "").toLowerCase();
  if (allowedRoles?.length && !allowedRoles.map((item) => item.toLowerCase()).includes(role)) {
    return <Navigate to={role === "admin" ? "/Admin" : "/"} replace />;
  }

  return children;
};

export default PrivateRoute;
