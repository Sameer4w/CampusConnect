import {
  useEffect,
  useState,
} from "react";

import {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
} from "../api/adminApi.js";

function AdminUsersPage() {
  const [users, setUsers] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [role, setRole] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState("");

  // =====================================================
  // FETCH USERS
  // =====================================================

  const fetchUsers =
    async () => {
      try {
        setIsLoading(true);
        setError("");

        const params = {
          page: 1,
          limit: 100,
        };

        if (search.trim()) {
          params.search =
            search.trim();
        }

        if (role) {
          params.role =
            role;
        }

        if (status !== "") {
          params.isActive =
            status;
        }

        const data =
          await getAllUsers(
            params
          );

        setUsers(
          data.users || []
        );
      } catch (
        error
      ) {
        setError(
          error.response?.data?.message ||
            "Failed to load users."
        );
      } finally {
        setIsLoading(false);
      }
    };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchUsers();
  }, []);

  // =====================================================
  // FILTER USERS
  // =====================================================

  const handleFilter =
    () => {
      fetchUsers();
    };

  // =====================================================
  // ACTIVATE / DEACTIVATE USER
  // =====================================================

  const handleStatusChange =
    async (
      userId,
      currentStatus
    ) => {
      const newStatus =
        !currentStatus;

      const action =
        newStatus
          ? "activate"
          : "deactivate";

      const confirmed =
        window.confirm(
          `Are you sure you want to ${action} this user?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setUpdatingId(
          userId
        );

        await updateUserStatus(
          userId,
          newStatus
        );

        setUsers(
          (previousUsers) =>
            previousUsers.map(
              (user) =>
                user._id ===
                userId
                  ? {
                      ...user,
                      isActive:
                        newStatus,
                    }
                  : user
            )
        );
      } catch (
        error
      ) {
        alert(
          error.response?.data?.message ||
            "Failed to update user status."
        );
      } finally {
        setUpdatingId("");
      }
    };

  // =====================================================
  // CHANGE USER ROLE
  // =====================================================

  const handleRoleChange =
    async (
      userId,
      newRole
    ) => {
      const confirmed =
        window.confirm(
          `Change this user's role to ${newRole}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setUpdatingId(
          userId
        );

        await updateUserRole(
          userId,
          newRole
        );

        setUsers(
          (previousUsers) =>
            previousUsers.map(
              (user) =>
                user._id ===
                userId
                  ? {
                      ...user,
                      role:
                        newRole,
                    }
                  : user
            )
        );
      } catch (
        error
      ) {
        alert(
          error.response?.data?.message ||
            "Failed to update user role."
        );
      } finally {
        setUpdatingId("");
      }
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (isLoading) {
    return (
      <div className="page-container">

        <h1>
          Manage Users
        </h1>

        <p>
          Loading users...
        </p>

      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="page-container">

      <div className="page-header">

        <div>

          <h1>
            Manage Users
          </h1>

          <p>
            View and manage
            CampusConnect user accounts.
          </p>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div
          className="alert alert-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* FILTERS */}

      <div className="filter-bar">

        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />

        <select
          value={role}
          onChange={(event) =>
            setRole(
              event.target.value
            )
          }
        >
          <option value="">
            All Roles
          </option>

          <option value="student">
            Students
          </option>

          <option value="recruiter">
            Recruiters
          </option>

          <option value="admin">
            Administrators
          </option>

        </select>

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
        >
          <option value="">
            All Statuses
          </option>

          <option value="true">
            Active
          </option>

          <option value="false">
            Inactive
          </option>

        </select>

        <button
          type="button"
          className="btn-primary"
          onClick={
            handleFilter
          }
        >
          Search
        </button>

      </div>

      {/* USER COUNT */}

      <p>
        Total users shown:{" "}
        <strong>
          {users.length}
        </strong>
      </p>

      {/* USERS */}

      {users.length === 0 ? (
        <div className="empty-state">

          <h3>
            No users found
          </h3>

          <p>
            Try changing your
            search or filters.
          </p>

        </div>
      ) : (
        <div className="admin-users-list">

          {users.map(
            (user) => (
              <div
                key={
                  user._id
                }
                className="admin-user-card"
              >

                {/* USER INFO */}

                <div>

                  <h3>
                    {user.name}
                  </h3>

                  <p>
                    {user.email}
                  </p>

                  <p>
                    Role:{" "}

                    <strong>
                      {user.role}
                    </strong>
                  </p>

                  <p>
                    Status:{" "}

                    <strong>
                      {user.isActive
                        ? "Active"
                        : "Inactive"}
                    </strong>
                  </p>

                </div>

                {/* USER ACTIONS */}

                <div className="admin-user-actions">

                  <select
                    value={
                      user.role
                    }
                    disabled={
                      updatingId ===
                      user._id
                    }
                    onChange={(
                      event
                    ) =>
                      handleRoleChange(
                        user._id,
                        event.target
                          .value
                      )
                    }
                  >

                    <option value="student">
                      Student
                    </option>

                    <option value="recruiter">
                      Recruiter
                    </option>

                    <option value="admin">
                      Admin
                    </option>

                  </select>

                  <button
                    type="button"
                    className={
                      user.isActive
                        ? "btn-danger"
                        : "btn-primary"
                    }
                    disabled={
                      updatingId ===
                      user._id
                    }
                    onClick={() =>
                      handleStatusChange(
                        user._id,
                        user.isActive
                      )
                    }
                  >
                    {updatingId ===
                    user._id
                      ? "Updating..."
                      : user.isActive
                        ? "Deactivate"
                        : "Activate"}
                  </button>

                </div>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}

export default AdminUsersPage;