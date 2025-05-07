'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "../../../components/Card/Card";

const membershipData = [
  { name: "Monthly Package", value: 45 },
  { name: "3-Month Package", value: 30 },
  { name: "Yearly Package", value: 25 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

export default function MembershipDashboard() {
  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">500</p>
            <p>Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">35</p>
            <p>New Members This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">75,000,000$</p>
            <p>Revenue from Membership Packages</p>
          </CardContent>
        </Card>
      </div>

      {/* Membership Package Ratio Chart */}
      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold mb-4">Membership Package Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={membershipData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {membershipData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </main>
  );
}
