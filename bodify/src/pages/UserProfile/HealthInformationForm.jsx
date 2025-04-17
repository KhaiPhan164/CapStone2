import React, { useState } from 'react';

const HealthInformationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    email: '',
    occupation: '',
    trainingGoals: [],
    medicalHistory: [],
    medication: '',
    currentCondition: {
      height: '',
      weight: '',
      bodyFat: '',
      sessionsPerWeek: '',
      sessionDuration: '',
    },
    currentDiet: '',
    allergies: '',
    signature: '',
    date: '',
  });

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
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-6">
      <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
      <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} className="w-full p-2 border rounded" />
      <input type="date" name="dateOfBirth" onChange={handleChange} className="w-full p-2 border rounded" />
      <div className="flex space-x-4">
        <label className="flex items-center">
          <input type="radio" name="gender" value="Male" onChange={handleChange} className="mr-2" /> Male
        </label>
        <label className="flex items-center">
          <input type="radio" name="gender" value="Female" onChange={handleChange} className="mr-2" /> Female
        </label>
        <label className="flex items-center">
          <input type="radio" name="gender" value="Other" onChange={handleChange} className="mr-2" /> Other
        </label>
      </div>
      <input type="tel" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} className="w-full p-2 border rounded" />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded" />
      <input type="text" name="occupation" placeholder="Occupation" onChange={handleChange} className="w-full p-2 border rounded" />

      <h2 className="text-2xl font-bold mb-4">Training Goals</h2>
      <div className="space-y-2">
        <label className="flex items-center">
          <input type="checkbox" name="trainingGoals" value="Weight Loss" onChange={handleChange} className="mr-2" /> Weight Loss
        </label>
        <label className="flex items-center">
          <input type="checkbox" name="trainingGoals" value="Muscle Gain" onChange={handleChange} className="mr-2" /> Muscle Gain
        </label>
        <label className="flex items-center">
          <input type="checkbox" name="trainingGoals" value="Fitness/Maintaining Shape" onChange={handleChange} className="mr-2" /> Fitness/Maintaining Shape
        </label>
        <label className="flex items-center">
          <input type="checkbox" name="trainingGoals" value="Overall Health" onChange={handleChange} className="mr-2" /> Overall Health
        </label>
        <label className="flex items-center">
          <input type="checkbox" name="trainingGoals" value="Competition Preparation" onChange={handleChange} className="mr-2" /> Competition Preparation
        </label>
        <input type="text" name="trainingGoals" placeholder="Other" onChange={handleChange} className="w-full p-2 border rounded" />
      </div>

      <h2 className="text-2xl font-bold mb-4">Medical History</h2>
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
          <input type="checkbox" name="medicalHistory" value="Herniated Disc" onChange={handleChange} className="mr-2" /> Herniated Disc
        </label>
        <label className="flex items-center">
          <input type="checkbox" name="medicalHistory" value="Joint Injuries" onChange={handleChange} className="mr-2" /> Joint Injuries
        </label>
        <label className="flex items-center">
          <input type="checkbox" name="medicalHistory" value="Respiratory Issues" onChange={handleChange} className="mr-2" /> Respiratory Issues
        </label>
        <input type="text" name="medicalHistory" placeholder="Other" onChange={handleChange} className="w-full p-2 border rounded" />
      </div>

      <h2 className="text-2xl font-bold mb-4">Medication</h2>
      <div className="flex space-x-4">
        <label className="flex items-center">
          <input type="radio" name="medication" value="Yes" onChange={handleChange} className="mr-2" /> Yes
        </label>
        <label className="flex items-center">
          <input type="radio" name="medication" value="No" onChange={handleChange} className="mr-2" /> No
        </label>
      </div>
      <input type="text" name="medicationDetails" placeholder="If yes, please specify" onChange={handleChange} className="w-full p-2 border rounded" />

      <h2 className="text-2xl font-bold mb-4">Current Condition</h2>
      <input type="number" name="height" placeholder="Height (cm)" onChange={handleChange} className="w-full p-2 border rounded" />
      <input type="number" name="weight" placeholder="Weight (kg)" onChange={handleChange} className="w-full p-2 border rounded" />
      <input type="number" name="bodyFat" placeholder="Body Fat Percentage (%)" onChange={handleChange} className="w-full p-2 border rounded" />
      <input type="number" name="sessionsPerWeek" placeholder="Desired training sessions per week" onChange={handleChange} className="w-full p-2 border rounded" />
      <input type="number" name="sessionDuration" placeholder="Duration of each session (minutes)" onChange={handleChange} className="w-full p-2 border rounded" />

      <h2 className="text-2xl font-bold mb-4">Current Diet</h2>
      <div className="space-y-2">
        <label className="flex items-center">
          <input type="checkbox" name="currentDiet" value="Regular Diet" onChange={handleChange} className="mr-2" /> Regular Diet
        </label>
        <label className="flex items-center">
          <input type="checkbox" name="currentDiet" value="Vegetarian" onChange={handleChange} className="mr-2" /> Vegetarian
        </label>
        <input type="text" name="currentDiet" placeholder="Specific Diet" onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="text" name="allergies" placeholder="Allergies/foods to avoid" onChange={handleChange} className="w-full p-2 border rounded" />
      </div>

      <h2 className="text-2xl font-bold mb-4">Commitment</h2>
      <p className="text-gray-700">I confirm that all the information provided above is accurate. I take full responsibility for any risks associated with training due to inaccurate declarations.</p>
      <input type="text" name="signature" placeholder="Signature of the respondent" onChange={handleChange} className="w-full p-2 border rounded" />
      <input type="date" name="date" onChange={handleChange} className="w-full p-2 border rounded" />

      <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Submit</button>
    </form>
  );
};

export default HealthInformationForm; 