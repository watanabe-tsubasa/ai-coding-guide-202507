'use client';

import { useEffect, useState } from 'react';

interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const API_URL = 'http://localhost:3000/api';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_URL}/todos`);
      const data = await response.json();
      setTodos(data.data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: description || undefined,
        }),
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        await fetchTodos();
      }
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTodos();
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const response = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !todo.completed,
        }),
      });

      if (response.ok) {
        await fetchTodos();
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Todo Dashboard</h1>

        {/* Add Todo Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Todo</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter todo title"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter todo description (optional)"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Todo
            </button>
          </form>
        </div>

        {/* Todo List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Todo List ({todos.length})</h2>
          </div>
          {todos.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No todos yet. Create one above!
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {todos.map((todo) => (
                <li key={todo.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleComplete(todo)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className={`mt-1 text-sm ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                          {todo.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        Created: {new Date(todo.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="flex-shrink-0 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}