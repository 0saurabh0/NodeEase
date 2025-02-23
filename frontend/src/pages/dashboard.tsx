// src/pages/Dashboard.tsx
import React from 'react';
import { Terminal, Server, Settings, Activity,  Database, Shield, Bell } from 'lucide-react';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#111827]/70 backdrop-blur-xl border-r border-[#1E2D4A]">
        <div className="p-6 flex items-center gap-3">
          <img src="/logo.svg" alt="NodeEase" className="w-8 h-8" />
          <span className="text-xl font-semibold text-white">NodeEase</span>
        </div>
        
        <nav className="mt-6 px-3">
          {[
            { icon: Terminal, label: 'Overview', active: true },
            { icon: Server, label: 'Nodes' },
            { icon: Database, label: 'Resources' },
            { icon: Activity, label: 'Monitoring' },
            { icon: Shield, label: 'Security' },
            { icon: Settings, label: 'Settings' },
          ].map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 
                ${item.active 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                } transition-all duration-300`}
            >
              {React.createElement(item.icon, { className: "h-5 w-5" })}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8 min-h-screen bg-black/30 backdrop-blur-xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Active Nodes', value: '12', change: '+2' },
            { label: 'Total RPC Calls', value: '1.2M', change: '+15%' },
            { label: 'Uptime', value: '99.99%', change: '0%' },
            { label: 'Resources Used', value: '75%', change: '+5%' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1E2D4A] hover:bg-[#111827]/70 transition-all duration-300">
              <h3 className="text-gray-400 font-medium mb-2">{stat.label}</h3>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span className="text-blue-400 text-sm font-medium">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((node) => (
            <div key={node} className="bg-[#111827]/50 backdrop-blur-xl rounded-2xl p-6 border border-[#1E2D4A] hover:bg-[#111827]/70 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Node {node}</h3>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400">
                  Active
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Region</span>
                  <span className="text-white">US-East</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Provider</span>
                  <span className="text-white">AWS</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Performance</span>
                  <span className="text-white">98%</span>
                </div>
              </div>
              <button className="w-full mt-4 py-2 rounded-xl bg-[#1E2D4A]/50 text-white hover:bg-[#1E2D4A] transition-colors">
                Manage
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;