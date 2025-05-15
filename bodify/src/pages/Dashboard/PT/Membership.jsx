'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent } from "../../../components/Card/Card";
import { getPaymentsByGym } from '../../../services/membershipService';
import AuthService from '../../../services/auth.service';
import { Spin } from 'antd';

export default function MembershipDashboard() {
  const [loading, setLoading] = useState(true);
  const [totalMembers, setTotalMembers] = useState(0);
  const [newMembers, setNewMembers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [membershipData, setMembershipData] = useState([]);

  // Colors for chart
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  useEffect(() => {
    fetchMembershipData();
  }, []);

  const fetchMembershipData = async () => {
    try {
      setLoading(true);
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser || !currentUser.id) {
        console.error('Unable to identify gym owner information');
        setLoading(false);
        return;
      }

      const response = await getPaymentsByGym(currentUser.id);
      
      if (response && response.status === 'success' && response.data) {
        const paymentsArray = response.data.data || [];
        
        // Only filter payments with status_id = 2 as required
        const successfulPayments = paymentsArray.filter(payment => payment.status_id === 2);
        
        // 1. Calculate total members (unique users)
        const uniqueUsers = new Map();
        successfulPayments.forEach(payment => {
          const user = payment.user || {};
          const userId = user.id || user.user_id;
          
          if (!userId) return; // Skip if no userId
          
          // Use payment_date instead of created_at
          const paymentDate = payment.payment_date ? new Date(payment.payment_date) : 
                             (payment.created_at ? new Date(payment.created_at) : new Date());
          
          if (!uniqueUsers.has(userId)) {
            // Store first payment of each user
            uniqueUsers.set(userId, {
              userId: userId,
              userName: user.name || 'No information',
              payment: payment,
              firstPaymentDate: paymentDate
            });
          } else {
            // Update if found an earlier payment
            const existingData = uniqueUsers.get(userId);
            if (paymentDate < existingData.firstPaymentDate) {
              uniqueUsers.set(userId, {
                ...existingData,
                payment: payment,
                firstPaymentDate: paymentDate
              });
            }
          }
        });
        
        // Set total members
        setTotalMembers(uniqueUsers.size);
        
        // 2. Calculate new members this month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        let newMembersCount = 0;
        uniqueUsers.forEach(userData => {
          const joinDate = userData.firstPaymentDate;
          
          if (joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear) {
            newMembersCount++;
          }
        });
        setNewMembers(newMembersCount);
        
        // 3. Calculate total revenue
        const revenue = successfulPayments.reduce((total, payment) => {
          return total + (Number(payment.amount_paid) || 0);
        }, 0);
        setTotalRevenue(revenue);
        
        // 4. Process membership distribution data
        // Create map to store count of each membership type
        const mbs = {};
        
        successfulPayments.forEach(payment => {
          // Only consider payments with status_id = 2 (filtered above)
          // Check directly if payment has membership
          if (payment.membership) {
            // Get membership name from payment.membership
            const membershipName = payment.membership.membership_name || `Package ${payment.membership.membership_id}`;
            mbs[membershipName] = (mbs[membershipName] || 0) + 1;
          }
        });
        
        // Convert data for chart
        const chartData = Object.keys(mbs).map(name => ({
          name,
          value: mbs[name]
        }));
        
        // Save data for chart
        setMembershipData(chartData);
      }
    } catch (error) {
      console.error('Error fetching membership data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading data..." />
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalMembers}</p>
            <p>Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{newMembers}</p>
            <p>New Members This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            <p>Revenue from Membership Packages</p>
          </CardContent>
        </Card>
      </div>

      {/* Membership Package Ratio Chart */}
      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold mb-4">Membership Packages Sold by Type</h2>
          <div className="h-[250px] w-full">
            {membershipData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={membershipData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value}`}
                  >
                    {membershipData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} packages sold`, 'Quantity']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-10 text-gray-500">No data to display</p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
