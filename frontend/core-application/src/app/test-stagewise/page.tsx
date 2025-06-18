'use client';

import { useState } from 'react';

export default function TestStagewisePage() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Stagewise Test Page</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Interactive Elements</h2>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={() => setCount(count + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Click Count: {count}
              </button>
            </div>
            
            <div>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type something..."
                className="px-4 py-2 border rounded w-full"
              />
              <p className="mt-2 text-gray-600">You typed: {message}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Stagewise Status</h2>
          <p className="text-gray-600">
            If Stagewise is working, you should see a toolbar when hovering over elements.
          </p>
          <p className="text-gray-600 mt-2">
            Try hovering over the button, input field, or any text element.
          </p>
        </div>
      </div>
    </div>
  );
} 