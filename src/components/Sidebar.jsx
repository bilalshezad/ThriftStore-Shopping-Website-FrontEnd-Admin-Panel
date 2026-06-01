import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, ChevronRight, LogOut, Store, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Products', path: '/products', icon: <Package size={18} /> },
    { name: 'Orders', path: '/orders', icon: <ShoppingCart size={18} /> },
    { name: 'Users', path: '/users', icon: <Users size={18} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    window.location.href = '/login';
  };

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>
      <aside
        className={`w-64 h-screen fixed top-0 left-0 bg-white dark:bg-black z-50 flex flex-col border-r border-[#e2e2e2] dark:border-[#222222] transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#e2e2e2] dark:border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-md flex items-center justify-center">
              <Store size={18} className="text-white dark:text-black" />
            </div>
            <span className="font-black text-xl tracking-tighter text-black dark:text-white uppercase">ThriftAdmin</span>
          </div>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} className="text-black dark:text-white" />
          </button>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-[#a1a1a1] uppercase tracking-widest mb-4">Management</p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 group ${isActive
                  ? 'bg-black dark:bg-white text-white dark:text-black font-black'
                  : 'text-black dark:text-white hover:bg-[#f9f9f9] dark:hover:bg-[#111111] font-medium'
                }`
              }
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm">{item.name}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-[#e2e2e2] dark:border-[#222222]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-black dark:text-white hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-all text-sm font-bold"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
