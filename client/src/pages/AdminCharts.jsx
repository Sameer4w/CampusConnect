import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function AdminCharts({
  dashboard,
}) {
  const userData = [
    {
      name: "Students",
      value:
        dashboard?.users
          ?.students || 0,
    },
    {
      name: "Recruiters",
      value:
        dashboard?.users
          ?.recruiters || 0,
    },
    {
      name: "Admins",
      value:
        dashboard?.users
          ?.admins || 0,
    },
  ];

  const platformData = [
    {
      name: "Jobs",
      value:
        dashboard?.jobs
          ?.total || 0,
    },
    {
      name: "Opportunities",
      value:
        dashboard?.opportunities
          ?.total || 0,
    },
    {
      name: "Applications",
      value:
        dashboard?.applications
          ?.total || 0,
    },
    {
      name: "Events",
      value:
        dashboard?.events
          ?.total || 0,
    },
  ];

  return (
    <div
      className="admin-charts-grid"
    >
      <div
        className="admin-chart-card"
      >
        <h3>
          Users by Role
        </h3>

        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <BarChart
            data={userData}
          >
            <XAxis
              dataKey="name"
            />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="value"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        className="admin-chart-card"
      >
        <h3>
          Platform Activity
        </h3>

        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <PieChart>
            <Pie
              data={platformData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AdminCharts;