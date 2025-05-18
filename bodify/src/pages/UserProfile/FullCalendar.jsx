import React, { useState, useEffect, useRef } from "react";
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
  const [forceUpdate, setForceUpdate] = useState(0);
  const calendarRef = useRef(null);

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
    console.log('Event clicked:', event);
    console.log('Extended props:', event.extendedProps);
    
    // Get plan name from extendedProps.planName first as it's been pre-processed in formatScheduleForCalendar
    let planName = event.extendedProps.planName;
    
    // If planName is 'Unknown Plan' but we have plan object, try to extract from there
    if ((planName === 'Unknown Plan' || !planName) && event.extendedProps.plan) {
      if (event.extendedProps.plan.name) {
        planName = event.extendedProps.plan.name;
      } else if (event.extendedProps.plan.plan_name) {
        planName = event.extendedProps.plan.plan_name;
      }
    }
    
    console.log('Final plan name to display:', planName);
    
    // Get note
    const note = event.extendedProps.note || 'No notes';
    
    // Get date and time information
    const startDate = event.extendedProps.startDate || 
                     new Date(event.start).toLocaleDateString('en-US', {
                       weekday: 'long',
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric'
                     });
    
    const startTime = event.extendedProps.startTime || 
                     new Date(event.start).toLocaleTimeString('en-US', {
                       hour: '2-digit',
                       minute: '2-digit',
                       hour12: false
                     });
                     
    const endTime = event.extendedProps.endTime || 
                   new Date(event.end).toLocaleTimeString('en-US', {
                     hour: '2-digit',
                     minute: '2-digit',
                     hour12: false
                   });
    
    const confirmDelete = window.confirm(
      `Do you want to delete this schedule?\n\n` +
      `Plan: ${planName}\n` +
      `Note: ${note}\n` +
      `Date: ${startDate}\n` +
      `Time: ${startTime} - ${endTime}`
    );

    if (confirmDelete) {
      handleDeleteSchedule(event.id);
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      // Cách đơn giản nhất: Xóa sự kiện trực tiếp bằng FullCalendar API
      if (calendarRef.current && calendarRef.current.getApi) {
        const calendarApi = calendarRef.current.getApi();
        // Tìm và xóa sự kiện theo ID
        const eventToRemove = calendarApi.getEventById(id);
        if (eventToRemove) {
          console.log('Removing event from UI:', eventToRemove);
          eventToRemove.remove(); // Xóa trực tiếp khỏi giao diện
        }
      }
      
      // Cập nhật state sau khi đã xóa khỏi UI
      setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
      
      toast.success('Schedule deleted successfully');
      
      // Gọi API để xóa trong backend
      await ScheduleService.deleteSchedule(id);
    } catch (err) {
      // Nếu có lỗi, lấy lại dữ liệu từ server để đảm bảo UI đồng bộ với backend
      toast.error('Unable to delete schedule. Please try again.');
      fetchSchedules();
    }
  };

  const handleScheduleCreated = async (newSchedules) => {
    if (Array.isArray(newSchedules) && newSchedules.length > 0) {
      // Thêm lịch trình mới vào state
      setEvents(prevEvents => [...prevEvents, ...newSchedules]);
      
      // Force calendar to update
      if (calendarRef.current && calendarRef.current.getApi) {
        const calendarApi = calendarRef.current.getApi();
        newSchedules.forEach(schedule => {
          calendarApi.addEvent(schedule);
        });
      }
      
      // Force re-render
      setForceUpdate(prev => prev + 1);
    } else {
      // Fallback to fetch if no schedules provided
      await fetchSchedules();
    }
    
    setIsCreateModalOpen(false);
    setSelectedTime(null);
    toast.success('Schedule created successfully');
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setSelectedTime(null);
  };

  const renderEventContent = (eventInfo) => {
    // Lấy tên plan từ title hoặc extendedProps.planName
    const planName = eventInfo.event.title || eventInfo.event.extendedProps.planName || 'Workout';
    
    return (
      <div className="p-1">
        <div className="font-semibold">{planName}</div>
        {eventInfo.event.extendedProps.note && (
          <div className="text-sm italic">{eventInfo.event.extendedProps.note}</div>
        )}
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

  // Xử lý sự kiện kéo giãn lịch trình
  const handleEventResize = async (resizeInfo) => {
    const event = resizeInfo.event;
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

      toast.success('Schedule duration updated successfully');
    } catch (error) {
      toast.error('Unable to update schedule duration. Please try again.');
      resizeInfo.revert();
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
            ref={calendarRef}
            key={`calendar-${forceUpdate}`}
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
            eventResize={handleEventResize}
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