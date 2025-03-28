import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const FullCalendars = () => {
  const [events, setEvents] = useState([
    { title: "Sự kiện 1", start: "2025-03-28" },
    { title: "Sự kiện 2", start: "2025-03-30", end: "2025-03-31" },
  ]);

  const handleDateClick = (arg) => {
    const title = prompt("Nhập tiêu đề sự kiện:");
    if (title) {
      setEvents([...events, { title, start: arg.dateStr }]);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        dateClick={handleDateClick}
        editable={true}
        selectable={true}
      />
    </div>
  );
};

export default FullCalendars;
