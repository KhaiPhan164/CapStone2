import React, { useState } from 'react';
import PTProfile from './PTProfile';
import PersonalTrainerSchedule from './PersonalTrainerSchedule';


const PersonalTrainer = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <PTProfile />;
      case 'schedule':
        return <PersonalTrainerSchedule />;
      case 'ExerciseManagement':
        return <ExerciseManagement/>;
      case 'statistics':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Statistics</h2>
            <p className="mb-4">View performance overview and progress.</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Student Performance Reports</h3>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Workout Progress</li>
                  <li>Results Achieved</li>
                  <li>Student Feedback</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Exercise Completion Rate</h3>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Completed Sessions</li>
                  <li>Cancelled Sessions</li>
                  <li>Pending Sessions</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Class Metrics</h3>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Number of Participants</li>
                  <li>Attendance Rate</li>
                  <li>Class Ratings</li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return <PTProfile />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-screen bg-gray-100 p-4">
      <div className="w-full md:w-1/4 lg:w-1/5 p-4 bg-white shadow-lg rounded-lg mb-4 md:mb-0">
        <h2 className="text-xl font-bold mb-4 text-center">PT Menu</h2>
        <button
          className={`w-full py-2 mb-2 rounded-lg ${
            activeTab === 'profile' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700'
          } transition-all`}
          onClick={() => setActiveTab('profile')}
        >
          Personal Information
        </button>
        <button
          className={`w-full py-2 mb-2 rounded-lg ${
            activeTab === 'schedule' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700'
          } transition-all`}
          onClick={() => setActiveTab('schedule')}
        >
          Exercise Management
        </button>
        <button
          className={`w-full py-2 mb-2 rounded-lg ${
            activeTab === 'statistics' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700'
          } transition-all`}
          onClick={() => setActiveTab('statistics')}
        >
          Statistics
        </button>
      </div>

      <div className="w-full md:w-3/4 lg:w-4/5 p-4 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-semibold text-center mb-4">PT Dashboard</h1>
        <div className="pt-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PersonalTrainer; 