'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "../../../components/Card/Card";

const pieData = [
  { name: "Package A", value: 40 },
  { name: "Package B", value: 30 },
  { name: "Package C", value: 30 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

const barData = [
  { name: "Jan", value: 20 },
  { name: "Feb", value: 30 },
  { name: "Mar", value: 45 },
  { name: "Apr", value: 50 },
  { name: "May", value: 55 },
  { name: "Jul", value: 60 },
  { name: "Aug", value: 70 },
  { name: "Sep", value: 75 },
  { name: "Oct", value: 60 },
  { name: "Nov", value: 40 },
];

export default function Overview() {
  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">235</p>
            <p>Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">12</p>
            <p>Personal Trainers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">84</p>
            <p>Exercises</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">20</p>
            <p>Today's Schedules</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h2 className="font-semibold mb-2">Membership Package Ratio</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} label>
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="font-semibold mb-2">Monthly Customer Registrations</h2>
            <ResponsiveContainer width="100%" height={200} className="-ml-5">
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue */}
      <Card>
        <CardContent className="p-4 text-xl font-bold ">
          <div className="flex"> Revenue : <p className="text-green-600 ml-2">50,000,000$</p></div>
        </CardContent>
      </Card>
    </main>
  );
}
