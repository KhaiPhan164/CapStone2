import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { SectionTitle } from "../../components/Title/SectionTitle";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BMICalculator() {
  const [dob, setDob] = useState(null); // <-- fix kiểu dữ liệu thành Date
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [status, setStatus] = useState("");
  const [, setAge] = useState(null);

  const calculateBMI = (e) => {
    e.preventDefault();
  
    if (!dob || !gender || !weight || !height) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
  
    const heightInMeters = parseFloat(height) / 100;
    const bmiValue = (
      parseFloat(weight) /
      (heightInMeters * heightInMeters)
    ).toFixed(1);
    setBmi(bmiValue);
  
    let result = "";
    if (bmiValue < 18.5) result = "Underweight";
    else if (bmiValue < 24.9) result = "Normal";
    else if (bmiValue < 29.9) result = "Overweight";
    else result = "Obese";    
  
    setStatus(result);
  
    // Tính tuổi
    const today = new Date();
    let calculatedAge = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      calculatedAge--;
    }
    setAge(calculatedAge);
  };
  

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <SectionTitle title="BMI Calculator Tool" />
      </div>
      <div className="bg-white p-8 rounded-lg shadow-md border border-primary-500">
        <form onSubmit={calculateBMI}>
          <div className="grid grid-cols-2 gap-x-10 gap-y-5">
            <div>
              <label className="block text-primary-500 mb-2 font-medium">Date of birth</label>
              <DatePicker
                selected={dob}
                onChange={(date) => setDob(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/MM/yyyy"
                className="w-full p-2 border rounded bg-gray-100"
                maxDate={new Date()}
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
                wrapperClassName="w-full"
              />
            </div>
            <div>
              <label className="block text-primary-500 mb-2 font-medium">Gender</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Nam"
                    checked={gender === "Nam"}
                    onChange={(e) => setGender(e.target.value)}
                    className="mr-2"
                  />
                  <span>Male</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Nữ"
                    checked={gender === "Nữ"}
                    onChange={(e) => setGender(e.target.value)}
                    className="mr-2"
                  />
                  <span>Female</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-primary-500 mb-2 font-medium">
                Weight (kg)
              </label>
              <input
                type="number"
                placeholder="Input your weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-2 border rounded bg-gray-100"
                step="0.1"
                min="0"
              />
            </div>
            <div>
              <label className="block text-primary-500 mb-2 font-medium">
                Height (cm)
              </label>
              <input
                type="number"
                placeholder="Input your height (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full p-2 border rounded bg-gray-100"
                step="0.1"
                min="0"
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              type="submit"
              className="bg-primary-500 text-white py-2 px-4 rounded hover:bg-[#ffa865] transition"
            >
              Result
            </button>
          </div>
        </form>

        {bmi && (
          <div className="mt-6 text-center">
            <p className="text-xl font-semibold text-primary-500">
            My BMI: {bmi}
            </p>
            <p className="text-lg mt-1 text-gray-700">Status: {status}</p>
          </div>
        )}
      </div>
      <ToastContainer  autoClose={3000} />
    </div>
  );
}
