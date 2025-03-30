import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./FullCalendar.css";
const FullCalendars = () => {
  const [events, setEvents] = useState([
    { id: "1", title: "Sự kiện 1", start: "2025-03-28T10:00:00", end: "2025-03-28T12:00:00" }, 
    { id: "2", title: "Sự kiện 2", start: "2025-03-30T14:00:00", end: "2025-03-30T16:00:00" },
  ]);

  const handleSelect = (selectInfo) => {
    const title = prompt("Nhập tiêu đề sự kiện:");
    if (title) {
      setEvents([
        ...events,
        {
          id: String(new Date().getTime()), // Tạo ID duy nhất
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
        },
      ]);
    }
  };

  const handleEventClick = (clickInfo) => {
    const newTitle = prompt("Chỉnh sửa tiêu đề sự kiện:", clickInfo.event.title);
    
    if (newTitle === null) return; // Nếu bấm hủy, không làm gì cả
    
    if (newTitle === "") {
      if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
        setEvents(events.filter(event => event.id !== clickInfo.event.id));
      }
    } else {
      setEvents(events.map(event => 
        event.id === clickInfo.event.id ? { ...event, title: newTitle } : event
      ));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        buttonText={{
          today: "Today",
          month: "Month",
          week: "Week",
          day: "Day",
        }}
        events={events}
        editable={true}
        selectable={true} 
        selectMirror={true} 
        select={handleSelect} 
        eventClick={handleEventClick} // Xử lý khi click vào sự kiện
        slotDuration="01:00:00"
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
      />
    </div>
  );
};

export default FullCalendars;
