import {
  Outlet,
} from "react-router-dom";

import AdminSidebar from
  "./AdminSidebar.jsx";

function AdminLayout() {
  return (
    <div
      className="admin-layout"
    >
      <AdminSidebar />

      <main
        className="admin-main-content"
      >
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;