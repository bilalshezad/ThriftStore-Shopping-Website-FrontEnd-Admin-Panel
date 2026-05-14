import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Bell, Search, Command } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <Sidebar />
      
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-[#e2e2e2] dark:border-[#222222] flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1a1]" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-12 py-1.5 bg-[#f9f9f9] dark:bg-[#111111] border border-[#e2e2e2] dark:border-[#222222] rounded-md text-sm focus:ring-1 focus:ring-black dark:focus:ring-white transition-all w-64"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-white dark:bg-black border border-[#e2e2e2] dark:border-[#222222] rounded text-[10px] text-[#a1a1a1]">
                <Command size={10} /> K
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-md hover:bg-[#f9f9f9] dark:hover:bg-[#111111] transition-colors">
              <Bell size={18} className="text-black dark:text-white" />
            </button>
            
            <div className="h-8 w-px bg-[#e2e2e2] dark:bg-[#222222] mx-2" />
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-black text-black dark:text-white uppercase tracking-tighter">
                  {localStorage.getItem('adminName') || 'Admin User'}
                </p>
                <p className="text-[10px] text-[#a1a1a1] font-bold uppercase tracking-widest">Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center border border-[#e2e2e2] dark:border-[#222222] transition-all group overflow-hidden">
                <span className="text-[10px] font-black text-white dark:text-black">
                  {(localStorage.getItem('adminName') || 'Admin User').split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;


