import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Users, Activity, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const data = [
  { name: 'Mon', sales: 4000, revenue: 2400 },
  { name: 'Tue', sales: 3000, revenue: 1398 },
  { name: 'Wed', sales: 2000, revenue: 9800 },
  { name: 'Thu', sales: 2780, revenue: 3908 },
  { name: 'Fri', sales: 1890, revenue: 4800 },
  { name: 'Sat', sales: 2390, revenue: 3800 },
  { name: 'Sun', sales: 3490, revenue: 4300 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendType }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="p-6 bg-white dark:bg-[#0a0a0a] rounded-xl border border-[#e2e2e2] dark:border-[#222222] transition-all shadow-sm hover:shadow-md"
  >
    <div className="flex justify-between items-start">
      <div className="p-2 bg-[#f9f9f9] dark:bg-[#111111] rounded-lg border border-[#e2e2e2] dark:border-[#222222]">
        <Icon size={18} className="text-black dark:text-white" />
      </div>
      <button className="text-[#a1a1a1] hover:text-black dark:hover:text-white transition-colors">
        <MoreHorizontal size={18} />
      </button>
    </div>
    <div className="mt-4">
      <p className="text-[10px] font-bold text-[#a1a1a1] uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-bold mt-1 text-black dark:text-white tracking-tight">{value}</h3>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <div className={`flex items-center text-xs font-bold ${trendType === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {trendType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trend}%
      </div>
      <span className="text-[10px] text-[#a1a1a1] font-medium uppercase">vs last month</span>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [orderCount, setOrderCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  const fetchStats = async () => {
    try {
      const orderRes = await fetch('http://localhost:5000/orders/count');
      const orderData = await orderRes.json();
      if (orderData.success) setOrderCount(orderData.count);

      const userRes = await fetch('http://localhost:5000/user/count');
      const userData = await userRes.json();
      if (userData.success) setUserCount(userData.count);

      const revRes = await fetch('http://localhost:5000/orders/revenue');
      const revData = await revRes.json();
      if (revData.success) setRevenue(revData.totalRevenue);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter">Dashboard</h1>
          <p className="text-[#a1a1a1] text-sm mt-1 font-medium">Real-time performance metrics and store overview.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-black border border-[#e2e2e2] dark:border-[#222222] text-black dark:text-white rounded-md text-sm font-bold hover:bg-[#f9f9f9] dark:hover:bg-[#111111] transition-all shadow-sm">
            Settings
          </button>
          <button className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md text-sm font-black hover:opacity-90 transition-all shadow-lg shadow-black/10 dark:shadow-white/5">
            Download Report
          </button>
        </div>
      </div>



      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`Rs ${revenue.toFixed(2)}`} icon={DollarSign} trend={12.5} trendType="up" />
        <StatCard title="Orders" value={orderCount} icon={ShoppingBag} trend={8.2} trendType="up" />
        <StatCard title="Total Users" value={userCount} icon={Users} trend={2.4} trendType="down" />
        <StatCard title="Visitors" value={Math.floor(userCount * 0.15) + 5} icon={Activity} trend={18.2} trendType="up" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-black dark:border-white shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-black dark:text-white tracking-tight">Revenue Analytics</h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-black dark:bg-white rounded-full" />
              <span className="text-[10px] text-black dark:text-white font-bold uppercase tracking-widest">Gross Volume</span>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="currentColor" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="currentColor" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <YAxis stroke="#a1a1a1" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="currentColor" className="text-black dark:text-white" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 bg-[#f5f5f5] dark:bg-[#1f1f1f] rounded-2xl border border-[#e5e5e5] dark:border-[#333333]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-[#111111] dark:text-white tracking-tight">Popularity</h3>
            <button className="text-[#a1a1a1] hover:text-[#111111] dark:hover:text-white">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#a1a1a1" opacity={0.1} />
                <XAxis dataKey="name" stroke="#a1a1a1" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'currentColor', opacity: 0.05}}
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                />
                <Bar dataKey="sales" fill="currentColor" className="text-black dark:text-white" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

