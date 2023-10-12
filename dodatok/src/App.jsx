import React, { useState, useEffect } from 'react';
import './App.scss';
import Calendar from './components/Calendar/Calendar';
import TaskList from './components/TaskList/TaskList';
import TaskForm from './components/TaskForm/TaskForm';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);

  const loadTasksForDate = async (date) => {
    try {
      const response = await fetch(
        `https://rd-api-2c05e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${date}.json`
      );
      if (!response.ok) {
        throw new Error('Помилка запиту до Firebase Realtime Database');
      }
      const data = await response.json();
      if (data) {
        const tasksWithIds = Object.entries(data).map(([id, task]) => ({ id, ...task }));
        return tasksWithIds;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Помилка при отриманні завдань:', error);
      return [];
    }
  };

  useEffect(() => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    
    loadTasksForDate(dateKey).then((loadedTasks) => {
      setTasks(loadedTasks);
    });
  }, [selectedDate]);

  const handleDateChange = async (newDate) => {
    setSelectedDate(newDate);
    const loadedTasks = await loadTasksForDate(newDate.toISOString().split('T')[0]);
    setTasks(loadedTasks);
  };

  return (
    <div className="app">
      <h1>Додаток-планувальник</h1>
      <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <TaskForm
        selectedDate={selectedDate}
        tasks={tasks}
        setTasks={setTasks}
        onDateChange={handleDateChange}
      />
      <TaskList selectedDate={selectedDate} tasks={tasks} setTasks={setTasks}  />
    </div>
  );
}

export default App;
