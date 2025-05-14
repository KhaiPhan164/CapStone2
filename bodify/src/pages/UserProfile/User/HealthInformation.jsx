import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SectionTitle } from '../../../components/Title/SectionTitle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeartPulse, 
  faCalendar, 
  faPencilAlt, 
  faCheck, 
  faTimes,
  faUser,
  faDumbbell,
  faDroplet,
  faWeightScale,
  faRuler,
  faHeart,
  faClock,
  faFire,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import UserService from '../../../services/user.service';

const HealthInformation = () => {
  const [healthData, setHealthData] = useState({
    bmiHistory: [],
    loading: true,
    error: null
  });

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    maxHeartRate: '',
    avgHeartRate: '',
    restingHeartRate: '',
    sessionDuration: '',
    caloriesBurned: '',
    experienceLevel: '',
    fatPercentage: '',
    waterIntake: '',
    workoutFrequency: '',
    bmi: '',
    illness: ''
  });

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchUserData();
  }, []);

  const parseHealthInfo = (healthInfo) => {
    if (!healthInfo) return {};
    
    try {
      const data = {};
    const lines = healthInfo.split('\n');
    
    lines.forEach(line => {
        const [key, value] = line.split(':').map(str => str.trim());
        if (key && value) {
          data[key.toLowerCase().replace(/\s+/g, '')] = value;
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error parsing health info:', error);
      return {};
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await UserService.getUserProfile(user.user_id);
      const parsedHealthInfo = parseHealthInfo(response.data.Health_information);
      
      setFormData({
        age: parsedHealthInfo.age || '',
        gender: parsedHealthInfo.gender || '',
        weight: parsedHealthInfo.weight || '',
        height: parsedHealthInfo.height || '',
        maxHeartRate: parsedHealthInfo.maxheartrate || '',
        avgHeartRate: parsedHealthInfo.avgheartrate || '',
        restingHeartRate: parsedHealthInfo.restingheartrate || '',
        sessionDuration: parsedHealthInfo.sessionduration || '',
        caloriesBurned: parsedHealthInfo.caloriesburned || '',
        experienceLevel: parsedHealthInfo.experiencelevel || '',
        fatPercentage: parsedHealthInfo.fatpercentage || '',
        waterIntake: parsedHealthInfo.waterintake || '',
        workoutFrequency: parsedHealthInfo.workoutfrequency || '',
        bmi: parsedHealthInfo.bmi || '',
        illness: response.data.illness || ''
      });

      setHealthData({
        bmiHistory: [],
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

  const handleSubmit = async () => {
    try {
      // Calculate BMI
        const height = parseFloat(formData.height);
        const weight = parseFloat(formData.weight);
      const bmi = height && weight ? (weight / ((height / 100) * (height / 100))).toFixed(1) : '';

      // Format health information string
      const healthInfo = `
Age: ${formData.age}
Gender: ${formData.gender}
Weight: ${formData.weight} kg
Height: ${formData.height} cm
Max Heart Rate: ${formData.maxHeartRate} BPM
Average Heart Rate: ${formData.avgHeartRate} BPM
Resting Heart Rate: ${formData.restingHeartRate} BPM
Session Duration: ${formData.sessionDuration} hours
Calories Burned: ${formData.caloriesBurned}
Experience Level: ${formData.experienceLevel}
Fat Percentage: ${formData.fatPercentage}%
Water Intake: ${formData.waterIntake} L
Workout Frequency: ${formData.workoutFrequency}
BMI: ${bmi}`.trim();

      const updateData = {
        Health_information: healthInfo,
        illness: formData.illness
      };

      await UserService.updateHealthInfo(user.user_id, updateData);

      const updatedUser = { ...user, ...updateData };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setIsEditing(false);
      fetchUserData();
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

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <SectionTitle>Health Information</SectionTitle>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors duration-200 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={isEditing ? faTimes : faPencilAlt} />
          {isEditing ? 'Cancel' : 'Edit Information'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faUser} className="text-orange-500 text-xl" />
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="mt-1 pl-3 block w-full rounded border-gray-400 border shadow-sm  focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full  shadow-sm rounded border-gray-400 border focus:ring-orange-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faWeightScale} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    step="0.1"
                    className="mt-1 block w-full shadow-sm rounded border-gray-400 border focus:ring-orange-500 pl-10"
                  />
                </div>
              </div>
                <div>
                <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faRuler} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm rounded border-gray-400 border focus:ring-orange-500 pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Heart Rate Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faHeart} className="text-orange-500 text-xl" />
              <h3 className="text-lg font-semibold">Heart Rate Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Maximum Heart Rate (BPM)</label>
                <input
                  type="number"
                  name="maxHeartRate"
                  value={formData.maxHeartRate}
                  onChange={handleChange}
                  className="mt-1 pl-3 block w-full shadow-sm rounded border-gray-400 border focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Average Heart Rate (BPM)</label>
                <input
                  type="number"
                  name="avgHeartRate"
                  value={formData.avgHeartRate}
                  onChange={handleChange}
                  className="mt-1 pl-3 block w-full shadow-sm rounded border-gray-400 border focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Resting Heart Rate (BPM)</label>
                <input
                  type="number"
                  name="restingHeartRate"
                  value={formData.restingHeartRate}
                  onChange={handleChange}
                  className="mt-1 pl-3 block w-full shadow-sm rounded border-gray-400 border focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Workout Information Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faDumbbell} className="text-orange-500 text-xl" />
              <h3 className="text-lg font-semibold">Workout Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Session Duration (hours)</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faClock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="sessionDuration"
                    value={formData.sessionDuration}
                    onChange={handleChange}
                    step="0.1"
                    className="mt-1 block w-full shadow-sm rounded border-gray-400 border focus:ring-orange-500 pl-10"
                  />
                </div>
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700">Calories Burned</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faFire} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="caloriesBurned"
                    value={formData.caloriesBurned}
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm rounded border-gray-400 border focus:ring-orange-500 pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="mt-1 block w-full shadow-sm rounded border-gray-400 border focus:ring-orange-500"
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Workout Frequency (per week)</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faChartLine} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="workoutFrequency"
                    value={formData.workoutFrequency}
                    onChange={handleChange}
                    className="mt-1 block w-full shadow-sm rounded border-gray-400 border focus:ring-orange-500 pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Body Composition Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faDroplet} className="text-orange-500 text-xl" />
              <h3 className="text-lg font-semibold">Body Composition</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fat Percentage (%)</label>
                <input
                  type="number"
                  name="fatPercentage"
                  value={formData.fatPercentage}
                  onChange={handleChange}
                  step="0.1"
                  className="mt-1 block pl-3 w-full shadow-sm rounded border-gray-400 border focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Water Intake (L)</label>
                <input
                  type="number"
                  name="waterIntake"
                  value={formData.waterIntake}
                  onChange={handleChange}
                  step="0.1"
                  className="mt-1 block pl-3 w-full shadow-sm rounded border-gray-400 border focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                <textarea
                  name="illness"
                  value={formData.illness}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block pl-3 w-full shadow-sm rounded border-gray-400 border focus:ring-orange-500"
                  placeholder="Enter any medical conditions..."
                />
              </div>
        </div>
      </div>

          <div className="col-span-2 flex justify-end space-x-4 mt-6">
                  <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors duration-200"
                  >
              Cancel
                  </button>
                  <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-orange-400 text-white hover:bg-primary-500 transition-colors duration-200"
                  >
              Save Changes
                  </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information Display Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faUser} className="text-orange-500 text-xl" />
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>
            <div className="space-y-3">
              <p className="flex items-center gap-2">
                <span className="font-medium min-w-[120px]">Age:</span>
                <span className="text-gray-600">{formData.age}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium min-w-[120px]">Gender:</span>
                <span className="text-gray-600">{formData.gender}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium min-w-[120px]">Weight:</span>
                <span className="text-gray-600">{formData.weight} kg</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium min-w-[120px]">Height:</span>
                <span className="text-gray-600">{formData.height} cm</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium min-w-[120px]">BMI:</span>
                <span className="text-gray-600">{formData.bmi}</span>
              </p>
            </div>
          </div>

          {/* Heart Rate Display Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faHeart} className="text-orange-500 text-xl" />
              <h3 className="text-lg font-semibold">Heart Rate Information</h3>
            </div>
            <div className="space-y-3">
              <p className="flex items-center gap-2">
                <span className="font-medium min-w-[160px]">Maximum Heart Rate:</span>
                <span className="text-gray-600">{formData.maxHeartRate} BPM</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium min-w-[160px]">Average Heart Rate:</span>
                <span className="text-gray-600">{formData.avgHeartRate} BPM</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium min-w-[160px]">Resting Heart Rate:</span>
                <span className="text-gray-600">{formData.restingHeartRate} BPM</span>
              </p>
            </div>
          </div>

          {/* Workout Information Display Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faDumbbell} className="text-orange-500 text-xl" />
              <h3 className="text-lg font-semibold">Workout Information</h3>
            </div>
            <div className="space-y-3">
              <p className="flex items-center gap-2">
                <span className="font-medium min-w-[160px]">Session Duration:</span>
                <span className="text-gray-600">{formData.sessionDuration} hours</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium min-w-[160px]">Calories Burned:</span>
                <span className="text-gray-600">{formData.caloriesBurned}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium min-w-[160px]">Experience Level:</span>
                <span className="text-gray-600">{formData.experienceLevel}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium min-w-[160px]">Workout Frequency:</span>
                <span className="text-gray-600">{formData.workoutFrequency} times per week</span>
              </p>
        </div>
      </div>

          {/* Body Composition Display Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faDroplet} className="text-orange-500 text-xl" />
              <h3 className="text-lg font-semibold">Body Composition</h3>
            </div>
            <div className="space-y-3">
              <p className="flex items-center gap-2">
                <span className="font-medium min-w-[120px]">Fat Percentage:</span>
                <span className="text-gray-600">{formData.fatPercentage}%</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium min-w-[120px]">Water Intake:</span>
                <span className="text-gray-600">{formData.waterIntake} L</span>
              </p>
              <div className="mt-4">
                <p className="font-medium mb-2">Medical Conditions:</p>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {formData.illness || 'No medical conditions reported'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthInformation; 