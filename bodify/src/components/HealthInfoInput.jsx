import React, { useState, useEffect } from 'react';

const HealthInfoInput = ({ onSubmit, initialData }) => {
  const [healthData, setHealthData] = useState({
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
    bmi: ''
  });

  useEffect(() => {
    if (initialData) {
      if (typeof initialData === 'string') {
        const parsedData = {};
        initialData.split(',').forEach(item => {
          const [key, value] = item.split(':');
          parsedData[key.toLowerCase().replace(/-/g, '_')] = value;
        });
        setHealthData(parsedData);
      } else {
        setHealthData(initialData);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (healthData.weight && healthData.height) {
      const weight = parseFloat(healthData.weight);
      const height = parseFloat(healthData.height);
      if (weight > 0 && height > 0) {
        const bmi = (weight / (height * height)).toFixed(1);
        setHealthData(prev => ({ ...prev, bmi }));
      }
    }
  }, [healthData.weight, healthData.height]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHealthData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = Object.entries(healthData)
      .map(([key, value]) => `${key.charAt(0).toUpperCase()}${key.slice(1).replace(/_/g, '_')}:${value}`)
      .join(',');
    
    onSubmit(formattedData);
  };

  const Section = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );

  const InputField = ({ label, name, type = "number", ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {type === "select" ? (
        <select
          name={name}
          value={healthData[name]}
          onChange={handleChange}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          {...props}
        >
          {props.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={healthData[name]}
          onChange={handleChange}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          {...props}
        />
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="bg-gray-50 p-6 rounded-xl">
        {/* Personal Information */}
        <Section title="Personal Information">
          <InputField
            label="Age"
            name="age"
            min="0"
            max="120"
          />
          <InputField
            label="Gender"
            name="gender"
            type="select"
            options={[
              { value: "", label: "Select Gender" },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other" }
            ]}
          />
        </Section>

        {/* Body Measurements */}
        <Section title="Body Measurements">
          <InputField
            label="Weight (kg)"
            name="weight"
            step="0.1"
            min="0"
          />
          <InputField
            label="Height (m)"
            name="height"
            step="0.01"
            min="0"
            max="3"
          />
          <InputField
            label="BMI (Calculated)"
            name="bmi"
            readOnly
            className="bg-gray-100"
          />
          <InputField
            label="Fat Percentage (%)"
            name="fat_percentage"
            step="0.1"
            min="0"
            max="100"
          />
        </Section>

        {/* Heart Rate Metrics */}
        <Section title="Heart Rate Information">
          <InputField
            label="Maximum Heart Rate (BPM)"
            name="max_bpm"
            min="0"
            max="250"
          />
          <InputField
            label="Average Heart Rate (BPM)"
            name="avg_bpm"
            min="0"
            max="250"
          />
          <InputField
            label="Resting Heart Rate (BPM)"
            name="resting_bpm"
            min="0"
            max="200"
          />
        </Section>

        {/* Workout Information */}
        <Section title="Workout Details">
          <InputField
            label="Experience Level"
            name="experience_level"
            type="select"
            options={[
              { value: "", label: "Select Level" },
              { value: "Beginner", label: "Beginner" },
              { value: "Intermediate", label: "Intermediate" },
              { value: "Advanced", label: "Advanced" }
            ]}
          />
          <InputField
            label="Workout Frequency (per week)"
            name="workout_frequency"
            min="0"
            max="7"
          />
          <InputField
            label="Session Duration (hours)"
            name="session_duration"
            step="0.1"
            min="0"
          />
          <InputField
            label="Calories Burned"
            name="calories_burned"
            min="0"
          />
        </Section>

        {/* Hydration */}
        <Section title="Hydration">
          <InputField
            label="Water Intake (L)"
            name="water_intake"
            step="0.1"
            min="0"
          />
        </Section>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Health Information
          </button>
        </div>
      </div>
    </form>
  );
};

export default HealthInfoInput; 