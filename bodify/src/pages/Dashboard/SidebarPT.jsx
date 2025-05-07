import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Overview from "./PT/Overview";
import MembershipDashboard from "./PT/Membership";
import MembershipTable from "./PT/MembershipTable";
import GuestTable from "./PT/GuestTable";
import Header from "../../layout/Header";

const COLORS = ["#3b82f6", "#06b6d4", "#fbbf24"];

export default function Dashboard() {
  const [selectedMenu, setSelectedMenu] = useState("overview");

  const renderContent = () => {
    switch (selectedMenu) {
      case "overview":
        return (
          <div>
            <Overview />
          </div>
        );
      case "customers":
        return (
          <div className="p-6">
            <GuestTable />
          </div>
        );
      case "membership":
        return (
          <div>
            <MembershipDashboard />
            <MembershipTable />
          </div>
        );
      case "workouts":
        return <div className="p-6">🏋️‍♂️ Workout List</div>;
      case "schedules":
        return <div className="p-6">📆 Training Schedule</div>;
      case "packages":
        return <div className="p-6">📦 Membership Packages</div>;
      case "analytics":
        return <div className="p-6">📊 Analytics</div>;
      case "settings":
        return <div className="p-6">⚙️ Settings</div>;
      default:
        return <div className="p-6">Please select an item from the menu.</div>;
    }
  };

  return (
    <div>
      <Header />
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 text-white p-4 space-y-4">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          <nav className="space-y-2">
            {[
              { label: "Overview", key: "overview" },
              { label: "Membership", key: "membership" },
              { label: "Customers", key: "customers" },
              // { label: "Workouts", key: "workouts" },
              // { label: "Schedules", key: "schedules" },
              // { label: "Packages", key: "packages" },
              // { label: "Analytics", key: "analytics" },
              // { label: "Settings", key: "settings" },
            ].map((item) => (
              <div
                key={item.key}
                className={`p-2 rounded cursor-pointer hover:bg-gray-700 ${
                  selectedMenu === item.key ? "bg-gray-700 font-bold" : ""
                }`}
                onClick={() => setSelectedMenu(item.key)}
              >
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1">{renderContent()}</div>
      </div>
    </div>
  );
}
