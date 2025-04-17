import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SectionTitle } from '../../../components/Title/SectionTitle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartPulse, faCalendar, faPencilAlt, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import UserService from '../../../services/user.service';

const HealthInformation = () => {
  const [healthData, setHealthData] = useState({
    bmiHistory: [],
    loading: true,
    error: null
  });

  const [isEditing, setIsEditing] = useState({
    health: false,
    illness: false,
    bmi: false
  });

  const [formData, setFormData] = useState({
    Health_information: '',
    illness: '',
    height: '',
    weight: ''
  });

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchUserData();
  }, []);

  // Function to parse BMI history from Health_information string
  const parseBMIHistory = (healthInfo) => {
    if (!healthInfo) return [];
    
    const lines = healthInfo.split('\n');
    const bmiEntries = [];
    
    lines.forEach(line => {
      // Check for formatted BMI entries
      if (line.startsWith('BMI:')) {
        const match = line.match(/BMI: (\d+\.?\d*) \((.*?)\) - Height: (\d+)cm, Weight: (\d+)kg - Status: (.*?) -/);
        if (match) {
          try {
            const dateStr = match[2];
            const date = new Date(dateStr);
            
            if (!isNaN(date.getTime())) {
              bmiEntries.push({
                bmi: parseFloat(match[1]),
                date: date.toISOString(),
                height: parseInt(match[3]),
                weight: parseInt(match[4]),
                status: match[5],
                healthTags: line.split('Health Tags: ')[1]?.split(', ') || []
              });
            }
          } catch (error) {
            console.warn('Could not parse date:', match[2]);
          }
        }
      } else {
        // Check for standalone numbers that might be BMI values
        const words = line.split(/\s+/);
        words.forEach(word => {
          const number = parseFloat(word);
          if (!isNaN(number) && number > 10 && number < 50) { // Reasonable BMI range
            const now = new Date();
            bmiEntries.push({
              bmi: number,
              date: now.toISOString(),
              status: calculateBMIStatus(number).status,
              healthTags: getBMIHealthTags(number)
            });
          }
        });
      }
    });
    
    return bmiEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const fetchUserData = async () => {
    try {
      const response = await UserService.getUserProfile(user.user_id);
      
      // Parse BMI history from Health_information
      const bmiHistory = parseBMIHistory(response.data.Health_information);
      
      // Update form data
      setFormData({
        Health_information: response.data.Health_information || '',
        illness: response.data.illness || '',
        height: '',
        weight: ''
      });

      setHealthData({
        bmiHistory,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setHealthData(prev => ({
        ...prev,
        loading: false,
        error: 'Could not load information. Please try again later.'
      }));
    }
  };

  const calculateBMIStatus = (bmi) => {
    if (!bmi || isNaN(bmi)) return { status: 'No data', color: 'text-gray-500' };
    if (bmi < 18.5) return { status: 'Underweight', color: 'text-blue-500' };
    if (bmi < 24.9) return { status: 'Normal weight', color: 'text-green-500' };
    if (bmi < 29.9) return { status: 'Overweight', color: 'text-yellow-500' };
    return { status: 'Obese', color: 'text-red-500' };
  };

  const getBMIHealthTags = (bmi) => {
    if (!bmi || isNaN(bmi)) return [];
    
    let tags = [];
    if (bmi < 18.5) {
      tags.push('Weight Gain', 'Muscle Gain', 'Overall Health');
    } else if (bmi < 24.9) {
      tags.push('Fitness', 'Overall Health', 'Muscle Gain');
    } else if (bmi < 29.9) {
      tags.push('Weight Loss', 'Fitness', 'Overall Health');
    } else {
      tags.push('Weight Loss', 'Overall Health', 'Fitness');
    }
    return tags;
  };

  const handleSubmit = async (field) => {
    try {
      let updateData = {};
      
      if (field === 'bmi') {
        const height = parseFloat(formData.height);
        const weight = parseFloat(formData.weight);
        if (!height || !weight) {
          alert('Please enter both height and weight');
          return;
        }
        const bmi = (weight / ((height / 100) * (height / 100))).toFixed(1);
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US'); // Format: MM/DD/YYYY
        const bmiStatus = calculateBMIStatus(parseFloat(bmi)).status;
        const healthTags = getBMIHealthTags(parseFloat(bmi));
        
        // Only save the new BMI information
        const bmiInfo = `BMI: ${bmi} (${dateStr}) - Height: ${height}cm, Weight: ${weight}kg - Status: ${bmiStatus} - Health Tags: ${healthTags.join(', ')}`;
        
        updateData = {
          Health_information: bmiInfo,
          illness: formData.illness || ''
        };
      } else {
        // For other fields, don't process BMI values from text
        updateData = {
          Health_information: formData[field] || '',
          illness: formData.illness || ''
        };
      }

      // Update user health info using UserService
      await UserService.updateHealthInfo(user.user_id, updateData);

      // Update local storage user data
      const updatedUser = { ...user, ...updateData };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setIsEditing(prev => ({
        ...prev,
        [field === 'bmi' ? 'health' : field]: false
      }));
      
      // Clear BMI inputs after submission
      if (field === 'bmi') {
        setFormData(prev => ({
          ...prev,
          height: '',
          weight: ''
        }));
      }
      
      fetchUserData(); // Refresh data after update
    } catch (error) {
      console.error('Error updating data:', error);
      alert('Could not update information. Please try again later.');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No data';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  };

  if (healthData.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (healthData.error) {
    return (
      <div className="text-red-500 text-center py-4">
        {healthData.error}
      </div>
    );
  }

  const latestBMI = healthData.bmiHistory[0] || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <SectionTitle>Health Information</SectionTitle>
      </div>

      {/* Latest Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faHeartPulse} className="text-primary-500 text-xl mr-2" />
              <h3 className="text-lg font-semibold">BMI Calculator</h3>
            </div>
            <button
              onClick={() => setIsEditing(prev => ({ ...prev, bmi: !prev.bmi }))}
              className="text-primary-500 hover:text-primary-600"
            >
              <FontAwesomeIcon icon={isEditing.bmi ? faTimes : faPencilAlt} />
            </button>
          </div>
          {isEditing.bmi ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g., 170"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g., 65"
                  />
                </div>
              </div>
              <button
                onClick={() => handleSubmit('bmi')}
                className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Calculate BMI
              </button>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-800">{latestBMI.bmi ? latestBMI.bmi.toFixed(1) : 'N/A'}</p>
              <p className={`text-sm font-medium ${calculateBMIStatus(latestBMI.bmi).color}`}>
                {calculateBMIStatus(latestBMI.bmi).status}
              </p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <FontAwesomeIcon icon={faCalendar} className="text-primary-500 text-xl mr-2" />
            <h3 className="text-lg font-semibold">Last Updated</h3>
          </div>
          <p className="text-2xl font-bold text-gray-800">{formatDate(latestBMI.date)}</p>
        </div>
      </div>

      {/* Health Info and Illness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Health Information</h3>
            <div className="flex items-center space-x-2">
              {isEditing.health ? (
                <>
                  <button
                    onClick={() => handleSubmit('Health_information')}
                    className="text-green-500 hover:text-green-600"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  <button
                    onClick={() => setIsEditing(prev => ({ ...prev, health: false }))}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(prev => ({ ...prev, health: true }))}
                  className="text-primary-500 hover:text-primary-600"
                >
                  <FontAwesomeIcon icon={faPencilAlt} />
                </button>
              )}
            </div>
          </div>
          {isEditing.health ? (
            <textarea
              name="Health_information"
              value={formData.Health_information || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              rows="4"
              placeholder="Enter your health information..."
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-line">
              {formData.Health_information || 'No health information available'}
            </p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Medical Conditions</h3>
            <div className="flex items-center space-x-2">
              {isEditing.illness ? (
                <>
                  <button
                    onClick={() => handleSubmit('illness')}
                    className="text-green-500 hover:text-green-600"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  <button
                    onClick={() => setIsEditing(prev => ({ ...prev, illness: false }))}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(prev => ({ ...prev, illness: true }))}
                  className="text-primary-500 hover:text-primary-600"
                >
                  <FontAwesomeIcon icon={faPencilAlt} />
                </button>
              )}
            </div>
          </div>
          {isEditing.illness ? (
            <textarea
              name="illness"
              value={formData.illness || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              rows="4"
              placeholder="Enter any medical conditions..."
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-line">
              {formData.illness || 'No medical conditions'}
            </p>
          )}
        </div>
      </div>

      {/* BMI Details */}
      {healthData.bmiHistory.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Current BMI Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BMI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recommended Focus
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {healthData.bmiHistory.slice(0, 1).map((record, index) => (
                    <tr key={index} className="bg-white">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.bmi ? record.bmi.toFixed(1) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${calculateBMIStatus(record.bmi).color}`}>
                          {record.status || calculateBMIStatus(record.bmi).status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.healthTags?.join(', ') || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No BMI data available
        </div>
      )}
    </div>
  );
};

export default HealthInformation; 