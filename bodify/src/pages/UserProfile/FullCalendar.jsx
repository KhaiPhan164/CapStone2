import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import CreateScheduleModal from "../../components/CreateScheduleModal";
import ScheduleService from "../../services/scheduleService";
import PlanService from "../../services/plan.service";
import { toast } from 'react-hot-toast';
import "./FullCalendar.css";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetchSchedules();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await PlanService.getUserPlans();
      setPlans(response);
    } catch (err) {
      toast.error('Unable to load plan list');
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const schedules = await ScheduleService.getSchedules();
      
      // Filter out null events
      const formattedEvents = schedules.filter(event => event !== null);
      
      setEvents(formattedEvents);
    } catch (error) {
      toast.error('Unable to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (selectInfo) => {
    setSelectedTime({
      start: selectInfo.start,
      end: selectInfo.end
    });
    setIsCreateModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const confirmDelete = window.confirm(
      `Do you want to delete this schedule?\n\n` +
      `Plan: ${event.extendedProps.planName}\n` +
      `Note: ${event.extendedProps.note || 'No notes'}\n` +
      `Date: ${event.extendedProps.startDate}\n` +
      `Time: ${event.extendedProps.startTime} - ${event.extendedProps.endTime}`
    );

    if (confirmDelete) {
      handleDeleteSchedule(event.id);
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await ScheduleService.deleteSchedule(id);
      setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
      toast.success('Schedule deleted successfully');
    } catch (err) {
      toast.error('Unable to delete schedule. Please try again.');
    }
  };

  const handleScheduleCreated = async () => {
    await fetchSchedules();
    setIsCreateModalOpen(false);
    setSelectedTime(null);
    toast.success('Schedule created successfully');
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setSelectedTime(null);
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div className="p-1">
        <div className="font-semibold">{eventInfo.event.title}</div>
        <div className="text-sm">{eventInfo.event.extendedProps.note || 'No notes'}</div>
        <div className="text-xs mt-1">
          {new Date(eventInfo.event.start).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })} - {new Date(eventInfo.event.end).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })}
        </div>
      </div>
    );
  };

  const handleEventDrop = async (dropInfo) => {
    const event = dropInfo.event;
    const newStart = event.start;
    const newEnd = event.end;

    try {
      // Format time according to server requirements
      const formatTimeToISO = (date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const day = date.toISOString().split('T')[0];
        return `${day}T${hours}:${minutes}:00.000Z`;
      };

      // Update schedule with new time
      await ScheduleService.updateSchedule(event.id, {
        day: newStart.toISOString(),
        start_hour: formatTimeToISO(newStart),
        end_hour: formatTimeToISO(newEnd)
      });

      // Update state to display immediately
      setEvents(prevEvents => {
        return prevEvents.map(e => {
          if (e.id === event.id) {
            return {
              ...e,
              start: newStart,
              end: newEnd
            };
          }
          return e;
        });
      });

      toast.success('Schedule updated successfully');
    } catch (error) {
      toast.error('Unable to update schedule. Please try again.');
      dropInfo.revert();
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Workout Schedule</h2>
        <button
          onClick={() => {
            setSelectedTime(null);
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Create New Schedule
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            timeZone="local"
            displayEventTime={true}
            displayEventEnd={true}
            events={events}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            select={handleSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            height="auto"
            locale="en"
            slotMinTime="05:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            slotDuration="00:30:00"
            expandRows={true}
            stickyHeaderDates={true}
            nowIndicator={true}
            editable={true}
            eventDrop={handleEventDrop}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
              startTime: '05:00',
              endTime: '22:00',
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              meridiem: false
            }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              meridiem: false
            }}
          />
        </div>
      )}

      {isCreateModalOpen && (
        <CreateScheduleModal
          isOpen={isCreateModalOpen}
          onClose={handleModalClose}
          onScheduleCreated={handleScheduleCreated}
          selectedTime={selectedTime}
          plans={plans}
        />
      )}
    </div>
  );
};

export default Calendar;
