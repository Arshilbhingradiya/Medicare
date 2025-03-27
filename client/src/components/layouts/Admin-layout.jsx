import { Link, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { LogOut, Users, Mail } from "lucide-react"; // Icons for sidebar
import "./layout.css"; // Optional custom CSS if not using Tailwind

export default function AdminLayout() {
  const { user, IsLoading, logout } = useAuth(); // Assuming logout exists

  if (IsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl font-semibold">Loading...</h1>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">Admin Panel</div>
        <nav>
          <Link to="/admin/users" className="nav-link">
            <Users size={18} /> Users
          </Link>
          <Link to="/admin/contacts" className="nav-link">
            <Mail size={18} /> Contacts
          </Link>
          <Link to="/admin/doctorstatus" className="nav-link">
            <Mail size={18} /> Verification
          </Link>
        </nav>
        <button onClick={logout} className="logout-btn">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main content */}
      <div className="main-content">
        <header className="header">
          <h1>Welcome, {user.name}</h1>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
