import React, { useState, useEffect } from 'react';

const HealthInformationForm = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight: '',
      height: '',
    max_bpm: '',
    avg_bpm: '',
    resting_bpm: '',
    session_duration: '',
    calories_burned: '',
    experience_level: '',
    fat_percentage: '',
    water_intake: '',
    workout_frequency: '',
    bmi: '',
    medicalHistory: []
  });

  // Tự động tính BMI khi weight hoặc height thay đổi
  useEffect(() => {
    if (formData.weight && formData.height) {
      const heightInMeters = Number(formData.height);
      const weightInKg = Number(formData.weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
        setFormData(prev => ({ ...prev, bmi }));
      }
    }
  }, [formData.weight, formData.height]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: checked
          ? [...prevData[name], value]
          : prevData[name].filter((item) => item !== value),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tạo chuỗi health_info từ formData
    const healthInfo = Object.entries(formData)
      .filter(([key]) => key !== 'medicalHistory')
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, '_')}:${value}`)
      .join(',');
    
    console.log({ health_info: healthInfo, medical_history: formData.medicalHistory });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-6">
      <h2 className="text-2xl font-bold mb-4">Health Information Form</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
              max="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Height (m)</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="0.01"
              min="0"
              max="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="0.1"
              min="0"
              max="300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">BMI (Calculated)</label>
            <input
              type="number"
              name="bmi"
              value={formData.bmi}
              className="w-full p-2 border rounded bg-gray-100"
              readOnly
            />
          </div>
        </div>

        {/* Heart Rate & Exercise Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum Heart Rate (BPM)</label>
            <input
              type="number"
              name="max_bpm"
              value={formData.max_bpm}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
              max="250"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Average Heart Rate (BPM)</label>
            <input
              type="number"
              name="avg_bpm"
              value={formData.avg_bpm}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
              max="250"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Resting Heart Rate (BPM)</label>
            <input
              type="number"
              name="resting_bpm"
              value={formData.resting_bpm}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
              max="200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Session Duration (hours)</label>
            <input
              type="number"
              name="session_duration"
              value={formData.session_duration}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              step="0.1"
              min="0"
              max="24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Calories Burned</label>
            <input
              type="number"
              name="calories_burned"
              value={formData.calories_burned}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Additional Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Experience Level</label>
          <select
            name="experience_level"
            value={formData.experience_level}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Fat Percentage (%)</label>
          <input
            type="number"
            name="fat_percentage"
            value={formData.fat_percentage}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            step="0.1"
            min="0"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Water Intake (L)</label>
          <input
            type="number"
            name="water_intake"
            value={formData.water_intake}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            step="0.1"
            min="0"
            max="10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Workout Frequency (per week)</label>
          <input
            type="number"
            name="workout_frequency"
            value={formData.workout_frequency}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            min="0"
            max="7"
          />
        </div>
      </div>

      {/* Medical History Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Medical History</h2>
      <div className="space-y-2">
        <label className="flex items-center">
          <input type="checkbox" name="medicalHistory" value="High Blood Pressure" onChange={handleChange} className="mr-2" /> High Blood Pressure
        </label>
        <label className="flex items-center">
          <input type="checkbox" name="medicalHistory" value="Cardiovascular Diseases" onChange={handleChange} className="mr-2" /> Cardiovascular Diseases
        </label>
        <label className="flex items-center">
          <input type="checkbox" name="medicalHistory" value="Diabetes" onChange={handleChange} className="mr-2" /> Diabetes
        </label>
        <label className="flex items-center">
          <input type="checkbox" name="medicalHistory" value="Respiratory Issues" onChange={handleChange} className="mr-2" /> Respiratory Issues
        </label>
        <label className="flex items-center">
            <input type="checkbox" name="medicalHistory" value="Joint Problems" onChange={handleChange} className="mr-2" /> Joint Problems
        </label>
          <input type="text" name="other_conditions" placeholder="Other conditions" onChange={handleChange} className="w-full p-2 border rounded" />
      </div>
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        Submit Health Information
      </button>
    </form>
  );
};

export default HealthInformationForm; 