import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Mail, Shield, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://thrift-store-shopping-website-backe.vercel.app/user/all');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      const response = await fetch(`https://thrift-store-shopping-website-backe.vercel.app/user/delete/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('User Deleted');
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Could not delete user');
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000); 
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || user.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase flex items-center gap-3">
            Users Management <span className="text-sm bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full">{users.length}</span>
          </h1>
          <p className="text-[#a1a1a1] text-sm mt-1 font-bold uppercase tracking-widest">Global control of authorized personnel & customers.</p>
        </div>
      </div>



      <div className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-[#e2e2e2] dark:border-[#222222] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#e2e2e2] dark:border-[#222222] flex flex-wrap gap-4 justify-between items-center bg-[#fcfcfc] dark:bg-[#080808]">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1a1]" size={18} />
            <input 
              type="text" 
              placeholder="Search by Name or Email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 rounded-2xl border border-[#e2e2e2] dark:border-[#222222] bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white transition-all text-sm font-bold shadow-sm"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-auto px-6 py-3.5 rounded-2xl border border-[#e2e2e2] dark:border-[#222222] bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-xs font-black uppercase tracking-widest shadow-sm"
            >
              <option>All Roles</option>
              <option>Customer</option>
              <option>Admin</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f9f9f9] dark:bg-[#0a0a0a] text-[#a1a1a1] text-[10px] uppercase tracking-[0.25em]">
              <tr>
                <th className="p-6 font-black">Identity</th>
                <th className="p-6 font-black">Privileges</th>
                <th className="p-6 font-black">Registration Date</th>
                <th className="p-6 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e2e2] dark:divide-[#222222]">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-32 text-center text-[#a1a1a1] font-black uppercase tracking-[0.3em] animate-pulse">Establishing Data Stream...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-32 text-center text-[#a1a1a1] font-black uppercase tracking-[0.3em]">No Personnel Found</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <motion.tr 
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-[#fcfcfc] dark:hover:bg-[#080808] transition-all group"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-black text-sm shadow-lg shadow-black/10">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-black dark:text-white text-sm uppercase tracking-tight">{user.name}</p>
                            <p className="text-[10px] text-[#a1a1a1] uppercase font-bold tracking-widest mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          {user.role === 'admin' ? (
                            <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-black/10">
                              <Shield size={12} /> Root Admin
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border border-[#e2e2e2] dark:border-[#222222] text-black dark:text-white">
                              <User size={12} /> Customer
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-6 text-[#a1a1a1] font-black text-[10px] tracking-widest uppercase">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button className="p-3 bg-white dark:bg-black border border-[#e2e2e2] dark:border-[#222222] text-[#a1a1a1] hover:text-blue-500 rounded-xl transition-all shadow-xl shadow-black/5" title="Direct Message">
                            <Mail size={16} />
                          </button>
                          {user.role !== 'admin' && (
                            <>
                              <button 
                                onClick={() => handleDelete(user._id)}
                                className="p-3 bg-white dark:bg-black border border-[#e2e2e2] dark:border-[#222222] text-[#a1a1a1] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-xl shadow-black/5" 
                                title="Delete Profile"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-[#e2e2e2] dark:border-[#222222] text-[10px] font-black text-[#a1a1a1] flex justify-between items-center uppercase tracking-[0.2em] bg-[#fcfcfc] dark:bg-[#080808]">
          <span>Authenticated Nodes: {filteredUsers.length}</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-2"><Shield size={12} className="text-black dark:text-white" /> Admins</div>
            <div className="flex items-center gap-2"><User size={12} /> Customers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
