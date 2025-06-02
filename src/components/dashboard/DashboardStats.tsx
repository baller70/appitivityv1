import React from 'react'

export default function DashboardStats() {
  const stats = [
    {
      title: 'Total Bookmarks',
      value: '6',
      change: null,
      changeType: null
    },
    {
      title: 'This Month',
      value: '+12',
      change: null,
      changeType: 'positive'
    },
    {
      title: 'Total Visits',
      value: '210',
      change: null,
      changeType: null
    },
    {
      title: 'Favorites',
      value: '3',
      change: null,
      changeType: null
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">
                {stat.title}
              </p>
              <p className={`text-2xl font-bold ${
                stat.changeType === 'positive' ? 'text-green-400' : 'text-white'
              }`}>
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 