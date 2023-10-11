import React from 'react';
import './Calendar.scss';

function Calendar({ selectedDate, setSelectedDate }) {
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  return (
    <div className="calendar">
      <label>
        Виберіть дату:
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={handleDateChange}
        />
      </label>
    </div>
  );
}

export default Calendar;