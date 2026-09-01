import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext.jsx";

function AdminSidebar() {
  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  const handleLogout =
    async () => {
      await logout();

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    };

  const navItems = [
    {
      path: "/admin",
      icon: "📊",
      label: "Dashboard",
    },
    {
      path: "/admin/users",
      icon: "👥",
      label: "Users",
    },
    {
      path: "/admin/jobs",
      icon: "💼",
      label: "Jobs",
    },
    {
      path: "/admin/opportunities",
      icon: "📢",
      label: "Opportunities",
    },
    {
      path: "/admin/events",
      icon: "📅",
      label: "Events",
    },
    {
      path: "/admin/analytics",
      icon: "📈",
      label: "Analytics",
    },
  ];

  return (
    <aside
      className="admin-sidebar"
    >
      <div
        className="admin-sidebar-brand"
      >
        <h2>
          🎓 CampusConnect
        </h2>

        <span>
          Admin Panel
        </span>
      </div>

      <nav
        className="admin-sidebar-nav"
      >
        {navItems.map(
          (item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={
                item.path === "/admin"
              }
              className={({
                isActive,
              }) =>
                `admin-nav-link ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <span
                className="admin-nav-icon"
              >
                {item.icon}
              </span>

              {item.label}
            </NavLink>
          )
        )}
      </nav>

      <div
        className="admin-sidebar-footer"
      >
        <div
          className="admin-sidebar-user"
        >
          <strong>
            {user?.name}
          </strong>

          <span>
            Administrator
          </span>
        </div>

        <button
          type="button"
          className="admin-logout-btn"
          onClick={
            handleLogout
          }
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;