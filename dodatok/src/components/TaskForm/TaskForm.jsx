import React, { useState } from 'react';
import './TaskForm.scss';

function TaskForm({ selectedDate, tasks, setTasks, onDateChange }) {
  const [newTask, setNewTask] = useState('');

  const handleAddTask = async () => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    
    const newTaskData = {
      title: newTask,
      date: dateKey,
      completed: false,
    };

    try {
      const response = await fetch(
        `https://rd-api-2c05e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${dateKey}.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTaskData),
        }
      );

      if (!response.ok) {
        throw new Error('Помилка під час додавання завдання до Firebase Realtime Database');
      }

      const data = await response.json();
      if (data && data.name) {
        newTaskData.id = data.name;
      }

      setTasks([...tasks, newTaskData]);

      onDateChange(selectedDate);

      setNewTask('');
    } catch (error) {
      console.error('Помилка під час додавання завдання до Firebase:', error);
    }
  };

  return (
    <div className="task-form">
      <h2>Додати завдання</h2>
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
      />
      <button type="button" className="btn btn-success" onClick={handleAddTask}>Додати Завдання</button>
    </div>
  );
}

export default TaskForm;
