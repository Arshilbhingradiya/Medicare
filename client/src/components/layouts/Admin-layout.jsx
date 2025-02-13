import { Link, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../store/auth";
import "./layout.css";
// import Navbar from "../Navbar";
export default function Adminlayout() {
  const { user, IsLoading } = useAuth();

  if (IsLoading) {
    return <h1>loadin ...</h1>;
  }
  if (!user.isAdmin) {
    return <Navigate to="/" />;
  }
  return (
    <>
      <header>
        <ul>
          <li>
            <Link to="/admin/users">user</Link>
          </li>
          <li>
            <Link to="/admin/contacts">contact</Link>
          </li>
        </ul>
      </header>
      <Outlet />
    </>
  );
}
