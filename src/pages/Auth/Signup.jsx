import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    secretKey: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://thrift-store-shopping-website-backe.vercel.app/user/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Admin Account Created! Please Login.');
        navigate('/login');
      } else {
        toast.error(data.message || 'Signup failed');
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 bg-white dark:bg-[#0a0a0a] p-10 rounded-[2.5rem] border border-[#e2e2e2] dark:border-[#1a1a1a] shadow-2xl"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase">Admin Registry</h1>
          <p className="text-[#a1a1a1] text-[10px] font-black uppercase tracking-[0.2em]">Secure Node Authorization Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1a1]" size={18} />
              <input 
                type="text" 
                required
                placeholder="Full Name"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#e2e2e2] dark:border-[#1a1a1a] bg-[#f9f9f9] dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm font-bold"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1a1]" size={18} />
              <input 
                type="email" 
                required
                placeholder="Email Address"
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
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
              <input 
                type="password" 
                required
                placeholder="Admin Secret Key"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-500/5 text-black dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-bold"
                value={formData.secretKey}
                onChange={(e) => setFormData({...formData, secretKey: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : 'Initialize Account'}
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-center text-[10px] text-[#a1a1a1] font-black uppercase tracking-widest">
          Already authorized? <Link to="/login" className="text-black dark:text-white underline">Login Here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
