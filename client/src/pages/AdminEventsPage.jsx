import {
  useEffect,
  useState,
} from "react";

import {
  getAllEvents,
  deleteEvent,
} from "../api/adminApi.js";

function AdminEventsPage() {

  const [
    events,
    setEvents,
  ] = useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("");

  const [
    deletingId,
    setDeletingId,
  ] = useState("");

  // =============================
  // FETCH EVENTS
  // =============================

  const fetchEvents =
    async () => {

      try {

        setIsLoading(true);
        setError("");

        const params = {
          page: 1,
          limit: 100,
        };

        if (status) {

          params.status =
            status;

        }

        const data =
          await getAllEvents(
            params
          );

        setEvents(
          data.events || []
        );

      } catch (error) {

        setError(
          error.response?.data?.message ||
          "Failed to load events."
        );

      } finally {

        setIsLoading(false);

      }

    };

  useEffect(() => {

    fetchEvents();

  }, []);

  // =============================
  // DELETE EVENT
  // =============================

  const handleDelete =
    async (
      eventId,
      title
    ) => {

      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${title}"?`
        );

      if (!confirmed) {
        return;
      }

      try {

        setDeletingId(
          eventId
        );

        await deleteEvent(
          eventId
        );

        setEvents(
          (previous) =>
            previous.filter(
              (event) =>
                event._id !==
                eventId
            )
        );

      } catch (error) {

        alert(
          error.response?.data?.message ||
          "Failed to delete event."
        );

      } finally {

        setDeletingId("");

      }

    };

  if (isLoading) {

    return (

      <div className="page-container">

        <h1>
          Manage Events
        </h1>

        <p>
          Loading events...
        </p>

      </div>

    );

  }

  return (

    <div className="page-container">

      <div className="page-header">

        <div>

          <h1>
            Manage Events
          </h1>

          <p>
            View and manage all
            CampusConnect events.
          </p>

        </div>

      </div>

      {error && (

        <div
          className="alert alert-error"
        >
          {error}
        </div>

      )}

      <div className="filter-bar">

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

          <option value="published">
            Published
          </option>

          <option value="draft">
            Draft
          </option>

          <option value="cancelled">
            Cancelled
          </option>

        </select>

        <button
          type="button"
          className="btn-primary"
          onClick={
            fetchEvents
          }
        >
          Filter
        </button>

      </div>

      <p>
        Total events:{" "}

        <strong>
          {events.length}
        </strong>
      </p>

      {events.length === 0 ? (

        <div className="empty-state">

          <h3>
            No events found
          </h3>

        </div>

      ) : (

        <div className="admin-list">

          {events.map(
            (event) => (

              <div
                key={event._id}
                className="admin-item-card"
              >

                <div>

                  <h3>
                    {event.title ||
                      "Untitled Event"}
                  </h3>

                  <p>
                    Status:{" "}

                    <strong>
                      {event.status ||
                        "Unknown"}
                    </strong>
                  </p>

                  {event.startDate && (

                    <p>
                      Start Date:{" "}

                      {
                        new Date(
                          event.startDate
                        ).toLocaleDateString()
                      }
                    </p>

                  )}

                  {event.location && (

                    <p>
                      Location:{" "}

                      {event.location}
                    </p>

                  )}

                  {event.organizer && (

                    <p>
                      Organizer:{" "}

                      <strong>
                        {
                          event.organizer
                            .name
                        }
                      </strong>
                    </p>

                  )}

                </div>

                <div
                  className="admin-user-actions"
                >

                  <button
                    type="button"
                    className="btn-danger"
                    disabled={
                      deletingId ===
                      event._id
                    }
                    onClick={() =>
                      handleDelete(
                        event._id,
                        event.title ||
                          "this event"
                      )
                    }
                  >

                    {deletingId ===
                    event._id
                      ? "Deleting..."
                      : "Delete"}

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

export default AdminEventsPage;