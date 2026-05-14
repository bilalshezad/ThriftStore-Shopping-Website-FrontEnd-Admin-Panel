import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/user/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminName', data.username);
        toast.success(`Welcome Back, ${data.username}`);
        navigate('/');
        window.location.reload(); // Refresh to update app state
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      toast.error('Connection Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#050505] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 bg-white dark:bg-[#0a0a0a] p-10 rounded-[2.5rem] border border-[#e2e2e2] dark:border-[#1a1a1a] shadow-2xl"
      >
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-black dark:bg-white rounded-3xl">
              <Shield className="text-white dark:text-black" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase">Admin Portal</h1>
          <p className="text-[#a1a1a1] text-[10px] font-black uppercase tracking-[0.2em]">Authorized Access Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1a1]" size={18} />
              <input 
                type="email" 
                required
                placeholder="Admin Email"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#e2e2e2] dark:border-[#1a1a1a] bg-[#f9f9f9] dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm font-bold"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1a1]" size={18} />
              <input 
                type="password" 
                required
                placeholder="Password"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#e2e2e2] dark:border-[#1a1a1a] bg-[#f9f9f9] dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm font-bold"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Access Terminal'}
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-center text-[10px] text-[#a1a1a1] font-black uppercase tracking-widest">
          New Admin? <Link to="/signup" className="text-black dark:text-white underline">Apply for Access</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
