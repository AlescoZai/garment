import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import { FaUsers, FaCube, FaChartLine, FaRegClock, FaTrophy, FaMedal, FaBars } from 'react-icons/fa';

const stats = [
  {
    title: 'Total User',
    value: '40,689',
    icon: <FaUsers className="w-7 h-7 text-purple-400" />,
    iconBg: 'bg-purple-100',
    trend: '+8.5%',
    trendDesc: 'Up from yesterday',
    trendColor: 'text-green-500',
    arrow: 'up',
  },
  {
    title: 'Total Order',
    value: '10,293',
    icon: <FaCube className="w-7 h-7 text-yellow-400" />,
    iconBg: 'bg-yellow-100',
    trend: '+1.3%',
    trendDesc: 'Up from past week',
    trendColor: 'text-green-500',
    arrow: 'up',
  },
  {
    title: 'Total Sales',
    value: '$89,000',
    icon: <FaChartLine className="w-7 h-7 text-green-400" />,
    iconBg: 'bg-green-100',
    trend: '-4.3%',
    trendDesc: 'Down from yesterday',
    trendColor: 'text-red-500',
    arrow: 'down',
  },
  {
    title: 'Total Pending',
    value: '2,040',
    icon: <FaRegClock className="w-7 h-7 text-orange-400" />,
    iconBg: 'bg-orange-100',
    trend: '+1.8%',
    trendDesc: 'Up from yesterday',
    trendColor: 'text-green-500',
    arrow: 'up',
  },
];

const topClients = [
  {
    name: 'Google',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    order: 22,
    type: 'medal',
  },
  {
    name: 'Facebook',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png',
    order: 24,
    type: 'trophy',
  },
  {
    name: 'Apple',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    order: 21,
    type: 'medal',
  },
];

const topClientsTable = [
  { rank: 4, name: 'Microsoft', order: 20 },
  { rank: 5, name: 'Amazon', order: 19 },
  { rank: 6, name: 'Netflix', order: 16 },
  { rank: 7, name: 'Tesla', order: 12 },
  { rank: 8, name: 'Samsung', order: 8 },
  { rank: 9, name: 'Sony', order: 5 },
  { rank: 10, name: 'Coca-Cola', order: 3 },
];

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300`}>
        {/* Top Navbar */}
        <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />
        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6"
          style={{
            backgroundImage: "url('/src/assets/background-image/logobg-zumar.png')",
            backgroundRepeat: 'repeat',
            backgroundSize: '1000px auto',
            backgroundPosition: 'center',
            opacity: 1
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Selamat datang di panel admin Zumar Garment</p>
            </div>
            {/* Stats Cards Section (replace old stats) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-gray-100 rounded-xl shadow p-5 flex flex-col gap-3">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full ${stat.iconBg}`}>{stat.icon}</div>
                  <div className="text-sm text-gray-400 font-medium">{stat.title}</div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {stat.arrow === 'up' ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                    )}
                    <span className={stat.trendColor}>{stat.trend}</span>
                    <span className="text-gray-400 ml-1">{stat.trendDesc}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Top Klien Section */}
            <div className="bg-gray-100 rounded-xl shadow p-6 mb-8">
              <h2 className="text-2xl font-bold text-green-900 text-center mb-2 tracking-wide">TOP KLIEN</h2>
              <p className="text-gray-500 text-center mb-8">Lorem ipsum dolor sit amet consectetur. Eleifend morbi eget lectus orci sed enim lectus tincidunt.</p>
              <div className="flex flex-col lg:flex-row gap-8 items-end justify-center w-full mb-8">
                {/* 3 Top Clients */}
                <div className="flex flex-1 justify-center gap-4 md:gap-8 lg:w-2/3 items-end">
                  {/* Card Kiri */}
                  <div className="flex flex-col items-center flex-1 max-w-xs">
                    <img src={topClients[0].logo} alt={topClients[0].name} className="object-contain h-16 md:h-20 mb-2" />
                    <div className="font-semibold text-xs md:text-base text-center bg-blue-900 text-white rounded-lg px-2 py-1 mb-2 shadow">{topClients[0].name}</div>
                    <div className="bg-yellow-200 rounded-xl shadow flex flex-col items-center justify-center px-8 py-6 md:py-8 min-w-[110px]" style={{height: '150px'}}>
                      <FaMedal className="w-8 h-8 text-white mb-2" />
                      <span className="text-3xl font-bold text-white">{topClients[0].order}</span>
                      <span className="text-lg font-semibold text-white">Order</span>
                    </div>
                  </div>
                  {/* Card Tengah (Juara 1) */}
                  <div className="flex flex-col items-center flex-1 max-w-xs z-10">
                    <img src={topClients[1].logo} alt={topClients[1].name} className="object-contain h-20 md:h-24 mb-2" />
                    <div className="font-semibold text-xs md:text-base text-center bg-blue-900 text-white rounded-lg px-2 py-1 mb-2 shadow">{topClients[1].name}</div>
                    <div className="bg-yellow-300 rounded-xl shadow flex flex-col items-center justify-center px-10 py-10 md:py-14 min-w-[120px]" style={{height: '220px'}}>
                      <FaTrophy className="w-10 h-10 text-white mb-2" />
                      <span className="text-4xl font-bold text-white">{topClients[1].order}</span>
                      <span className="text-xl font-semibold text-white">Order</span>
                    </div>
                  </div>
                  {/* Card Kanan */}
                  <div className="flex flex-col items-center flex-1 max-w-xs">
                    <img src={topClients[2].logo} alt={topClients[2].name} className="object-contain h-16 md:h-20 mb-2" />
                    <div className="font-semibold text-xs md:text-base text-center bg-blue-900 text-white rounded-lg px-2 py-1 mb-2 shadow">{topClients[2].name}</div>
                    <div className="bg-yellow-200 rounded-xl shadow flex flex-col items-center justify-center px-8 py-6 md:py-8 min-w-[110px]" style={{height: '150px'}}>
                      <FaMedal className="w-8 h-8 text-white mb-2" />
                      <span className="text-3xl font-bold text-white">{topClients[2].order}</span>
                      <span className="text-lg font-semibold text-white">Order</span>
                    </div>
                  </div>
                </div>
                {/* Table 4-10 */}
                <div className="w-full max-w-lg lg:w-1/3">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-left">
                        <th className="py-2 px-4">Rank</th>
                        <th className="py-2 px-4">Nama Klien</th>
                        <th className="py-2 px-4">Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topClientsTable.map((row) => (
                        <tr key={row.rank} className="border-t">
                          <td className="py-2 px-4 font-semibold text-gray-700">{row.rank}</td>
                          <td className="py-2 px-4 text-gray-700">{row.name}</td>
                          <td className="py-2 px-4 font-bold text-green-700">{row.order}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 