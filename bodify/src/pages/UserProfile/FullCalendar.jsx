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
      console.error('Error fetching plans:', err);
      toast.error('Không thể tải danh sách kế hoạch');
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const schedules = await ScheduleService.getSchedules();
      console.log('Fetched schedules:', schedules);
      
      // Lọc bỏ các event null
      const formattedEvents = schedules.filter(event => event !== null);
      
      console.log('Formatted events:', formattedEvents);
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Không thể tải lịch tập');
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
      `Bạn có muốn xóa lịch tập này?\n\n` +
      `Kế hoạch: ${event.extendedProps.planName}\n` +
      `Ghi chú: ${event.extendedProps.note || 'Không có ghi chú'}\n` +
      `Ngày: ${event.extendedProps.startDate}\n` +
      `Thời gian: ${event.extendedProps.startTime} - ${event.extendedProps.endTime}`
    );

    if (confirmDelete) {
      handleDeleteSchedule(event.id);
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await ScheduleService.deleteSchedule(id);
      setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
      toast.success('Xóa lịch tập thành công');
    } catch (err) {
      console.error('Error deleting schedule:', err);
      toast.error('Không thể xóa lịch tập. Vui lòng thử lại.');
    }
  };

  const handleScheduleCreated = async () => {
    await fetchSchedules();
    setIsCreateModalOpen(false);
    setSelectedTime(null);
    toast.success('Tạo lịch thành công');
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setSelectedTime(null);
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div className="p-1">
        <div className="font-semibold">{eventInfo.event.title}</div>
        <div className="text-sm">{eventInfo.event.extendedProps.note || 'Không có ghi chú'}</div>
        <div className="text-xs mt-1">
          {new Date(eventInfo.event.start).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })} - {new Date(eventInfo.event.end).toLocaleTimeString('vi-VN', {
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
      // Format thời gian theo yêu cầu của server
      const formatTimeToISO = (date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const day = date.toISOString().split('T')[0];
        return `${day}T${hours}:${minutes}:00.000Z`;
      };

      // Cập nhật lịch với thời gian mới
      await ScheduleService.updateSchedule(event.id, {
        day: newStart.toISOString(),
        start_hour: formatTimeToISO(newStart),
        end_hour: formatTimeToISO(newEnd)
      });

      // Cập nhật state để hiển thị ngay lập tức
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

      toast.success('Cập nhật lịch thành công');
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Không thể cập nhật lịch. Vui lòng thử lại.');
      dropInfo.revert();
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Schedule</h2>
        <button
          onClick={() => {
            setSelectedTime(null);
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Create New Calendar
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
            locale="vi"
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
