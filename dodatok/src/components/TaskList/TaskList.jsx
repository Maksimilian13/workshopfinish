import React, { useState, useEffect } from 'react';
import './TaskList.scss';

function TaskList({ selectedDate, tasks, setTasks }) {
  const [editTask, setEditTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [moveToNewDate, setMoveToNewDate] = useState(false);
  const [newDate, setNewDate] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    if (editTask) {
      setEditTitle(editTask.title);
    } else {
      setEditTitle('');
    }
  }, [editTask]);

  const handleCompleteTask = (taskId) => {
    // Перевірка, чи існує завдання з вказаним taskId
    const taskToComplete = tasks.find((task) => task.id === taskId);
  
    if (!taskToComplete) {
      console.error(`Завдання з id ${taskId} не знайдено.`);
      return; // Зупинити виконання функції, якщо завдання не знайдено
    }
  
    // Оновлення стану завдання completed
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
  
    setTasks(updatedTasks);
  
    // Оновлення Firebase
    const dateKey = selectedDate.toISOString().split('T')[0];
    const apiUrlPut = `https://rd-api-2c05e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${dateKey}/${taskId}.json`;

    fetch(apiUrlPut, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...taskToComplete, completed: !taskToComplete.completed }), // Оновлюємо всі поля, включаючи "completed"
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Помилка при оновленні завдання');
        }
        return response.json();
      })
      .then(() => {
        console.log('Завдання оновлено успішно в базі даних Firebase.');
      })
      .catch((error) => {
        console.error('Помилка при оновленні завдання в Firebase:', error);
      });
  };
  
  
  const handleEditTask = (task) => {
    console.log('Функція handleEditTask викликана з параметром:', task);
    setEditTask(task);
    setSelectedAction('edit');
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);

    const dateKey = selectedDate.toISOString().split('T')[0];
    const apiUrl = `https://rd-api-2c05e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${dateKey}/${taskId}.json`;

    fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      console.log(response);
      if (!response.ok) {
        throw new Error('Помилка при видаленні завдання');
      }
      return response.json();
    })
    .then(() => {
      console.log('Завдання видалено успішно із бази даних.');
    })
    .catch((error) => {
      console.error('Помилка при видаленні завдання з Firebase:', error);
    });
  };

  const handleSaveTask = () => {
    console.log('Виклик функції handleSaveTask');
    if (editTask) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === editTask.id) {
          return { ...task, title: editTitle };
        }
        return task;
      });
      
      setTasks(updatedTasks);

      const dateKey = selectedDate.toISOString().split('T')[0];
      const apiUrlPut = `https://rd-api-2c05e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${dateKey}/${editTask.id}.json`;

      fetch(apiUrlPut, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editTask.id,
          title: editTitle,
          date: editTask.date,
          completed: editTask.completed,
        }),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Помилка при оновленні завдання');
        }
        return response.json();
      })
      .then(() => {
        console.log('Завдання оновлено успішно в базі даних Firebase.');
        setEditTask(null);
        setSelectedAction(null);
      })
      .catch((error) => {
        console.error('Помилка при оновленні завдання в Firebase:', error);
      });
    }
  };

  const handleMoveToNewDate = (task) => {
    console.log('Виклик функції handleMoveToNewDate');
    setMoveToNewDate(true);
    setEditTask(task);
    setSelectedAction('move');
  };
  
  const handleConfirmMove = () => {
    console.log('editTask:', editTask);
    console.log('newDate:', newDate);
  
    if (editTask && newDate) {
      const newDateKey = newDate.toISOString().split('T')[0];
      const apiUrlPut = `https://rd-api-2c05e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${newDateKey}/${editTask.id}.json`;
      const updatedTask = { ...editTask, date: newDate.toISOString().split('T')[0] };
  
      console.log('apiUrlPut:', apiUrlPut);
  
      fetch(apiUrlPut, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Помилка при оновленні завдання');
          }
          return response.json();
        })
        .then(() => {
          console.log('Завдання оновлено успішно в базі даних Firebase.');
  
          const dateKey = selectedDate.toISOString().split('T')[0];
          const apiUrlDelete = `https://rd-api-2c05e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${dateKey}/${editTask.id}.json`;
  
          console.log('apiUrlDelete:', apiUrlDelete);
  
          return fetch(apiUrlDelete, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Помилка при видаленні старого запису завдання');
          }
          return response.json();
        })
        .then(() => {
          console.log('Завдання видалено успішно із бази даних.');
          const updatedTasks = tasks.filter((task) => task.id !== editTask.id);

          setTasks(updatedTasks);
          setEditTask(null);
          setMoveToNewDate(false);
          setSelectedAction(null);
        })
        .catch((error) => {
          console.error('Помилка при операціях з Firebase:', error);
        });
    }
  };
  
  return (
    <div className="task-list">
      <h2>Завдання на {selectedDate.toISOString().split('T')[0]}</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleCompleteTask(task.id)}
            />
            <span
              className={`task-title ${task.completed ? 'completed' : ''}`}
              onClick={() => handleEditTask(task)}
            >
              {task.title}
            </span>
            <button type="button" className="btn btn-danger task-list-buttom" onClick={() => handleDeleteTask(task.id)}>Видалити</button>
            <button type="button" className="btn btn-primary task-list-buttom" onClick={() => handleEditTask(task)}>Редагувати</button>
            <button type="button" className="btn btn-warning task-list-buttom" onClick={() => handleMoveToNewDate(task)}>Перенести</button>
          </li>
        ))}
      </ul>
      {selectedAction === 'edit' && editTask && (
        <div className="edit-task">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <button type="button" className="btn btn-success" onClick={handleSaveTask}>Зберегти</button>
          <button type="button" className="btn btn-secondary" onClick={() => { setEditTask(null); setSelectedAction(null); }}>Скасувати</button>
        </div>
      )}
      {selectedAction === 'move' && (
        <div className="move-task">
          <p>Виберіть нову дату для завдання:</p>
          <input
            type="date"
            onChange={(e) => setNewDate(new Date(e.target.value))}
          />
          <button type="button" className="btn btn-info" onClick={handleConfirmMove}>Підтвердити</button>
          <button type="button" className="btn btn-secondary" onClick={() => { setEditTask(null); setSelectedAction(null); }}>Скасувати</button>
        </div>
      )}
    </div>
  );
}

export default TaskList;
