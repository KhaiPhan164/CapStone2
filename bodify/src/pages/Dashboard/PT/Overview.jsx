'use client';

import { useState, useEffect } from 'react';
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
  Legend
} from "recharts";
import { Card, CardContent } from "../../../components/Card/Card";
import { Spin } from 'antd';
import AuthService from '../../../services/auth.service';
import { getPaymentsByGym } from '../../../services/membershipService';
import ExerciseService from '../../../services/exercise.service';

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [customerCount, setCustomerCount] = useState(0);
  const [ptCount, setPTCount] = useState(0);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [membershipData, setMembershipData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser || !currentUser.id) {
        console.error('Unable to identify user information');
        setLoading(false);
        return;
      }

      // Fetch customer data and membership
      const fetchCustomerAndMembership = async () => {
        try {
          const response = await getPaymentsByGym(currentUser.id);
          
          if (response && response.status === 'success' && response.data) {
            const paymentsArray = response.data.data || [];
            
            // Filter successful payments (status_id = 2)
            const successfulPayments = paymentsArray.filter(payment => payment.status_id === 2);
            
            // 1. Calculate total unique customers
            const uniqueUsers = new Map();
            successfulPayments.forEach(payment => {
              const user = payment.user || {};
              const userId = user.id || user.user_id;
              
              if (!userId) return; // Skip if no userId
              
              if (!uniqueUsers.has(userId)) {
                uniqueUsers.set(userId, true);
              }
            });
            
            // Set total customer count
            setCustomerCount(uniqueUsers.size);
            
            // 2. Calculate total revenue
            const revenue = successfulPayments.reduce((total, payment) => {
              return total + (Number(payment.amount_paid) || 0);
            }, 0);
            setTotalRevenue(revenue);
            
            // 3. Process membership distribution chart data
            const mbs = {};
            
            successfulPayments.forEach(payment => {
              if (payment.membership) {
                const membershipName = payment.membership.membership_name || `Package ${payment.membership.membership_id}`;
                mbs[membershipName] = (mbs[membershipName] || 0) + 1;
              }
            });
            
            // Convert data for chart
            const chartData = Object.keys(mbs).map(name => ({
              name,
              value: mbs[name]
            }));
            
            setMembershipData(chartData);
            
            // 4. Process monthly customer registrations chart data
            const monthlyRegistrations = {};
            
            // Initialize 12 months with 0 values
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            monthNames.forEach(month => {
              monthlyRegistrations[month] = 0;
            });
            
            // Count registrations by month from payment data
            successfulPayments.forEach(payment => {
              const paymentDate = payment.payment_date ? new Date(payment.payment_date) : 
                                (payment.created_at ? new Date(payment.created_at) : null);
              
              if (paymentDate) {
                const monthIndex = paymentDate.getMonth();
                const monthName = monthNames[monthIndex];
                monthlyRegistrations[monthName] += 1;
              }
            });
            
            // Convert data for chart
            const monthlyChartData = monthNames.map(month => ({
              name: month,
              value: monthlyRegistrations[month]
            }));
            
            setMonthlyData(monthlyChartData);
          }
        } catch (error) {
          console.error('Error fetching customer and membership data:', error);
        }
      };

      // Fetch PT count
      const fetchPTCount = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:3000/users/gym/pts/filter?role_id=3&status_id=2`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const responseData = await response.json();
          let ptData = [];
          
          if (responseData && responseData.status === 'success' && Array.isArray(responseData.data)) {
            ptData = responseData.data;
          } else if (Array.isArray(responseData)) {
            ptData = responseData;
          }
          
          // Get current gym name and convert to lowercase for comparison
          const gymName = currentUser.name || '';
          const currentGymLower = (gymName || '').toLowerCase().trim();
          
          // Filter client-side to only get PTs belonging to current gym
          const filteredPTs = ptData.filter(pt => {
            const ptGymLower = (pt.gym || '').toLowerCase().trim();
            return ptGymLower === currentGymLower;
          });
          
          setPTCount(filteredPTs.length);
        } catch (error) {
          console.error('Error fetching PT data:', error);
        }
      };

      // Fetch Exercise count
      const fetchExerciseCount = async () => {
        try {
          const response = await ExerciseService.getAllExercisePosts();
          
          if (response && response.data) {
            // Get list of PTs belonging to current gym
            const token = localStorage.getItem('token');
            const ptResponse = await fetch(`http://localhost:3000/users/gym/pts/filter?role_id=3&status_id=2`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!ptResponse.ok) {
              throw new Error(`API error: ${ptResponse.status}`);
            }
            
            let ptData = [];
            const ptResponseData = await ptResponse.json();
            
            if (ptResponseData && ptResponseData.status === 'success' && Array.isArray(ptResponseData.data)) {
              ptData = ptResponseData.data;
            } else if (Array.isArray(ptResponseData)) {
              ptData = ptResponseData;
            }
            
            // Get current gym name and convert to lowercase for comparison
            const gymName = currentUser.name || '';
            const currentGymLower = (gymName || '').toLowerCase().trim();
            
            // Filter PTs belonging to current gym
            const gymPTs = ptData.filter(pt => {
              const ptGymLower = (pt.gym || '').toLowerCase().trim();
              return ptGymLower === currentGymLower;
            });
            
            // Get list of user_ids for PTs belonging to gym
            const ptUserIds = gymPTs.map(pt => pt.user_id || pt.id).filter(id => id);
            
            // Filter exercises that are approved (status_id = 2) AND created by PTs belonging to gym
            const approvedGymExercises = response.data.filter(exercise => {
              const exerciseUserId = exercise.user_id || (exercise.user && exercise.user.user_id);
              return exercise.status_id === 2 && ptUserIds.includes(exerciseUserId);
            });
            
            setExerciseCount(approvedGymExercises.length);
          }
        } catch (error) {
          console.error('Error fetching exercise data:', error);
        }
      };

      // Execute API requests in parallel
      await Promise.all([
        fetchCustomerAndMembership(),
        fetchPTCount(),
        fetchExerciseCount()
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      {/* Top stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{customerCount}</p>
            <p>Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{ptCount}</p>
            <p>Personal Trainers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{exerciseCount}</p>
            <p>Exercises</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h2 className="font-semibold mb-2">Number of Packages Sold by Type</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie 
                  data={membershipData} 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={60} 
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
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="font-semibold mb-2">Monthly Customer Registrations</h2>
            <ResponsiveContainer width="100%" height={200} className="-ml-5">
              <BarChart data={monthlyData}>
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
          <div className="flex"> Revenue : <p className="text-green-600 ml-2">{formatCurrency(totalRevenue)}</p></div>
        </CardContent>
      </Card>
    </main>
  );
}
