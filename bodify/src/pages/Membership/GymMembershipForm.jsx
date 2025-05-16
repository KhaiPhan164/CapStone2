import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function CreateMembership() {
  const [formData, setFormData] = useState({
    membership_name: "",
    description: "",
    price: "",
    duration: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log("Submitted data:", formData); // You can replace this with an actual API call
    }, 2000);
  };

  // const isFormComplete = Object.values(formData).every((v) => v.trim() !== "");

  return (
    <div className="font-sans">
      <div className="flex items-start justify-center bg-gray-100 min-h-screen p-4">
        <div className="w-full bg-gray-100 border-2 border-orange-400 p-6 rounded-md shadow-lg relative font-sans">
          <h2 className="text-2xl font-bold mb-6 text-center text-orange-600 border-b-2 pb-2 border-orange-400">
            Create Membership
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-orange-600">
                Membership Name
              </label>
              <input
                name="membership_name"
                value={formData.membership_name}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-orange-600">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="flex space-x-4">
              {/* Price */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-orange-600">
                  Price ($)
                </label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Duration */}
              <div className="w-1/2">
                <label className="block text-sm font-medium text-orange-600">
                  Duration (days)
                </label>
                <input
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            {/* {isFormComplete && (
          <div className="mt-6 border-t-2 pt-4 border-white">
            <h3 className="text-lg font-semibold mb-2 text-orange-600">
              Review and Submit
            </h3>
            <table className="w-full text-sm table-fixed">
              <tbody>
                <tr>
                  <td className="font-medium w-1/4">Name:</td>
                  <td className="w-3/4 break-words">
                    {formData.membership_name}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium align-top">Description:</td>
                  <td className="break-words whitespace-pre-wrap align-top">
                    {formData.description}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium">Price:</td>
                  <td>${parseFloat(formData.price).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="font-medium">Duration:</td>
                  <td>{formData.duration} days</td>
                </tr>
              </tbody>
            </table>
          </div>
        )} */}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 text-white rounded-md flex items-center justify-center ${
                  loading
                    ? "bg-orange-400 cursor-not-allowed"
                    : "bg-orange-400 hover:bg-primary-500"
                }`}
              >
                {loading && (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="mr-2 animate-spin"
                  />
                )}
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
