import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import PlanService from '../services/plan.service';
import ScheduleService from '../services/scheduleService';

const CreateScheduleModal = ({ isOpen, onClose, onScheduleCreated, selectedTime }) => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    note: '',
    startHour: '',
    endHour: '',
    startDate: '',
    endDate: '',
    selectedDays: [],
    plan_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const weekDays = [
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
    { id: 0, name: 'Sunday' }
  ];

  useEffect(() => {
    fetchPlans();
    if (selectedTime) {
      // Automatically fill the form with selected time
      const startDate = new Date(selectedTime.startStr);
      const endDate = new Date(selectedTime.endStr);
      
      // Format date for input type="date"
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Format time for input type="time"
      const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      };
      
      setFormData(prev => ({
        ...prev,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        startHour: formatTime(startDate),
        endHour: formatTime(endDate)
      }));
    }
  }, [selectedTime]);

  const fetchPlans = async () => {
    try {
      const response = await PlanService.getUserPlans();
      if (Array.isArray(response)) {
        const formattedPlans = response.map(plan => ({
          ...plan,
          id: plan.plan_id, // Ensure using plan_id from response
          plan_name: plan.plan_name
        }));
        setPlans(formattedPlans);
        if (formattedPlans.length > 0) {
          setSelectedPlan(formattedPlans[0].id);
        }
      }
    } catch (err) {
      setError('Unable to load plan list');
    }
  };

  const handleDayToggle = (dayId) => {
    setFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayId)
        ? prev.selectedDays.filter(id => id !== dayId)
        : [...prev.selectedDays, dayId]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.selectedDays.length === 0) {
      setError('Please select at least one day of the week');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Please select start and end dates');
      return;
    }

    if (!formData.startHour || !formData.endHour) {
      setError('Please select start and end times');
      return;
    }

    if (!formData.plan_id) {
      setError('Please select a plan');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const schedules = [];

      // Create schedules for each selected day in the date range
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay();
        if (formData.selectedDays.includes(dayOfWeek)) {
          const scheduleDate = date.toISOString().split('T')[0];
          
          // Process time
          const [startHour, startMinute] = formData.startHour.split(':');
          const [endHour, endMinute] = formData.endHour.split(':');
          
          const startDateTime = new Date(scheduleDate);
          startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0);
          
          const endDateTime = new Date(scheduleDate);
          endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0);

          const scheduleData = {
            note: formData.note || '',
            plan_id: parseInt(formData.plan_id),
            day: scheduleDate,
            start_hour: startDateTime.toISOString(),
            end_hour: endDateTime.toISOString()
          };

          const schedule = await ScheduleService.createSchedule(scheduleData);
          schedules.push(schedule);
        }
      }

      onScheduleCreated(schedules);
      onClose();
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Unable to create schedule. Please try again.');
      } else {
        setError('Unable to create schedule. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Create New Schedule
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Plan Selection */}
                  <div className="mb-4">
                    <label className="block text-text mb-2">Plan</label>
                    <div className="relative">
                      <select
                        name="plan_id"
                        value={formData.plan_id}
                        onChange={handleInputChange}
                        className="w-full pl-6 px-3 py-2 border border-gray-300 rounded"
                        required
                      >
                        <option value="">Select a plan</option>
                        {plans && plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.plan_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Note
                    </label>
                    <input
                      type="text"
                      value={formData.note}
                      onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Enter note for the schedule"
                    />
                  </div>

                  {/* Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={formData.startHour}
                        onChange={(e) => setFormData(prev => ({ ...prev, startHour: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={formData.endHour}
                        onChange={(e) => setFormData(prev => ({ ...prev, endHour: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* Start and End Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* Select days of the week */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select days of the week
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {weekDays.map(day => (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => handleDayToggle(day.id)}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            formData.selectedDays.includes(day.id)
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm mt-2">
                      {error}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Schedule'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateScheduleModal; 