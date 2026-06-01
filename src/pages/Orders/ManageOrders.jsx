import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Download, Truck, CheckCircle, Clock, Package, ShieldCheck, X, User, MapPin, Phone, Mail, Calendar, CreditCard, ReceiptText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://thrift-store-shopping-website-backe.vercel.app/orders/all');
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`https://thrift-store-shopping-website-backe.vercel.app/orders/status/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Order updated to ${newStatus}`, {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontSize: '10px',
            letterSpacing: '1px'
          },
        });
        fetchOrders();
      } else {
        toast.error(data.message || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Something went wrong');
    }
  };

  const calculateTotal = (products) => {
    return products.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  };

  const handleDownloadSlip = (order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('THRIFTSTORE', 20, 25);
    doc.setFontSize(10);
    doc.text('DELIVERY SLIP / INVOICE', 20, 32);

    // Order Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Order ID: #${order._id.toUpperCase()}`, 135, 55);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 135, 60);
    doc.text(`Status: ${order.status.toUpperCase()}`, 135, 65);

    // Customer Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SHIP TO:', 20, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(order.customer.name, 20, 62);
    doc.text(order.customer.address, 20, 67);
    doc.text(`${order.customer.city}, ${order.customer.zip}`, 20, 72);
    doc.text(`Phone: ${order.customer.phone}`, 20, 77);
    doc.text(`Email: ${order.customer.email}`, 20, 82);

    // Table
    const tableRows = order.products.map(p => [
      p.title,
      p.category,
      p.size,
      p.quantity,
      `Rs ${p.price.toFixed(2)}`,
      `Rs ${(p.price * p.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 95,
      head: [['Product', 'Category', 'Size', 'Qty', 'Price', 'Subtotal']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 60 },
        5: { halign: 'right' }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`GRAND TOTAL: Rs ${calculateTotal(order.products).toFixed(2)}`, pageWidth - 20, finalY, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for shopping with ThriftStore!', pageWidth / 2, 280, { align: 'center' });
    doc.text('This is a computer-generated delivery slip.', pageWidth / 2, 285, { align: 'center' });

    doc.save(`DeliverySlip_ORD_${order._id.slice(-6).toUpperCase()}.pdf`);
    toast.success('Delivery Slip Downloaded');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All Status' || order.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-black text-black dark:text-white tracking-tighter uppercase flex items-center gap-4"
          >
            Orders <span className="text-sm bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-full shadow-lg shadow-black/10">LIVE</span>
          </motion.h1>
          <p className="text-[#a1a1a1] text-[10px] mt-2 font-black uppercase tracking-[0.3em]">Operational Command Center / Customer Flow</p>
        </div>
      </div>



      <div className="bg-white dark:bg-[#050505] rounded-[2.5rem] border border-[#e2e2e2] dark:border-[#1a1a1a] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-[#e2e2e2] dark:border-[#1a1a1a] flex flex-wrap gap-6 justify-between items-center bg-[#fcfcfc] dark:bg-[#080808]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a1a1a1]" size={20} />
            <input
              type="text"
              placeholder="Filter by Name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl border border-[#e2e2e2] dark:border-[#1a1a1a] bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white transition-all text-sm font-bold shadow-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-6 py-4 rounded-2xl border border-[#e2e2e2] dark:border-[#1a1a1a] bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-xs font-black uppercase tracking-widest shadow-sm"
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f9f9f9] dark:bg-[#0a0a0a] text-[#a1a1a1] text-[10px] uppercase tracking-[0.25em]">
              <tr>
                <th className="p-8 font-black">Order ID</th>
                <th className="p-8 font-black">Customer</th>
                <th className="p-8 font-black">Finance</th>
                <th className="p-8 font-black">Workflow</th>
                <th className="p-8 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e2e2] dark:divide-[#1a1a1a]">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-32 text-center text-[#a1a1a1] font-black uppercase tracking-[0.3em] animate-pulse">Syncing with Server...</td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-32 text-center text-[#a1a1a1] font-black uppercase tracking-[0.3em]">No Transactions Found</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <motion.tr
                      key={order._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`hover:bg-[#fcfcfc] dark:hover:bg-[#080808] transition-all group ${order.status.toLowerCase() === 'cancelled' ? 'opacity-50 line-through decoration-red-500/50 decoration-2' : ''
                        }`}
                    >
                      <td className="p-8">
                        <div className="flex flex-col">
                          <span className="font-black text-black dark:text-white text-sm tracking-tighter uppercase">ORD-{order._id.slice(-6)}</span>
                          <span className="text-[10px] text-[#a1a1a1] font-black mt-1 uppercase tracking-widest">{order.products.length} Products</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-col">
                          <span className="text-black dark:text-white font-black text-sm uppercase tracking-tight">{order.customer.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-[#a1a1a1] font-bold lowercase">{order.customer.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-black dark:text-white text-xl tracking-tighter">Rs {calculateTotal(order.products).toFixed(2)}</span>
                          {order.status.toLowerCase() === 'delivered' && (
                            <motion.span
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter shadow-lg shadow-emerald-500/20"
                            >
                              <ShieldCheck size={12} /> PAID
                            </motion.span>
                          )}
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full shadow-lg ${order.status.toLowerCase() === 'delivered' ? 'bg-emerald-500 shadow-emerald-500/30' :
                              order.status.toLowerCase() === 'shipped' ? 'bg-blue-500 shadow-blue-500/30' :
                                order.status.toLowerCase() === 'processing' ? 'bg-amber-500 shadow-amber-500/30' :
                                  order.status.toLowerCase() === 'cancelled' ? 'bg-red-500 shadow-red-500/30' : 'bg-slate-400'
                            }`} />
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                            className={`text-[11px] font-black uppercase tracking-[0.1em] bg-transparent border-none focus:ring-0 cursor-pointer transition-colors ${order.status.toLowerCase() === 'delivered' ? 'text-emerald-500' :
                                order.status.toLowerCase() === 'shipped' ? 'text-blue-500' :
                                  order.status.toLowerCase() === 'processing' ? 'text-amber-500' :
                                    order.status.toLowerCase() === 'cancelled' ? 'text-red-500' : 'text-[#a1a1a1]'
                              }`}
                          >
                            <option value="pending">PENDING</option>
                            <option value="processing">PROCESSING</option>
                            <option value="shipped">SHIPPED</option>
                            <option value="delivered">DELIVERED</option>
                            <option value="cancelled">CANCELLED</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-100 translate-x-0 lg:opacity-0 lg:group-hover:opacity-100 lg:translate-x-4 lg:group-hover:translate-x-0 transition-all duration-500">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-4 bg-white dark:bg-[#111] border border-[#e2e2e2] dark:border-[#222] text-black dark:text-white rounded-2xl hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-xl shadow-black/5"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDownloadSlip(order)}
                            className="p-4 bg-white dark:bg-[#111] border border-[#e2e2e2] dark:border-[#222] text-black dark:text-white rounded-2xl hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-xl shadow-black/5"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-[#e2e2e2] dark:border-[#1a1a1a] text-[10px] font-black text-[#a1a1a1] flex justify-between items-center uppercase tracking-[0.2em] bg-[#fcfcfc] dark:bg-[#080808]">
          <span>Inventory Snapshot: {filteredOrders.length} active threads</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-slate-400 rounded-full" /> Pending</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full" /> Processing</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full" /> Shipped</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full" /> Delivered</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full" /> Cancelled</div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-5xl bg-white dark:bg-[#080808] rounded-[3rem] border border-[#e2e2e2] dark:border-[#1a1a1a] shadow-3xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Left Column: Products */}
              <div className="w-full md:w-3/5 p-8 overflow-y-auto border-r border-[#e2e2e2] dark:border-[#1a1a1a]">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter">Package Manifest</h2>
                    <p className="text-[10px] text-[#a1a1a1] font-black uppercase tracking-widest mt-1">Order Ref: {selectedOrder._id}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${selectedOrder.status === 'delivered' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                      selectedOrder.status === 'shipped' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                        selectedOrder.status === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                          'bg-slate-500/10 border-slate-500/20 text-slate-500'
                    }`}>
                    {selectedOrder.status}
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedOrder.products.map((item, idx) => (
                    <div key={idx} className="flex gap-6 p-4 rounded-3xl border border-[#e2e2e2] dark:border-[#1a1a1a] bg-[#f9f9f9] dark:bg-black/20 group hover:border-black dark:hover:border-white transition-all">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white dark:bg-black border border-[#e2e2e2] dark:border-[#1a1a1a]">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-black text-black dark:text-white uppercase text-sm tracking-tight">{item.title}</h4>
                            <p className="text-[10px] text-[#a1a1a1] font-black uppercase tracking-widest mt-1">{item.category} / Size {item.size}</p>
                          </div>
                          <span className="text-sm font-black text-black dark:text-white tracking-tighter">Rs {item.price}</span>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                          <span className="text-[10px] text-[#a1a1a1] font-black uppercase tracking-widest">Qty: {item.quantity}</span>
                          <span className="text-xs font-black text-black dark:text-white tracking-tight">Sub: Rs {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-[#e2e2e2] dark:border-[#1a1a1a]">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-[#a1a1a1] font-black uppercase tracking-[0.3em]">Total Transaction Value</span>
                    <span className="text-4xl font-black text-black dark:text-white tracking-tighter">Rs {calculateTotal(selectedOrder.products).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Customer Info */}
              <div className="flex-1 bg-[#fcfcfc] dark:bg-[#0a0a0a] p-8 flex flex-col">
                <div className="flex justify-end mb-8">
                  <button onClick={() => setSelectedOrder(null)} className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all">
                    <X size={24} className="text-black dark:text-white" />
                  </button>
                </div>

                <div className="space-y-8 flex-1">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[#a1a1a1]">
                      <User size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Client Profile</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">{selectedOrder.customer.name}</h3>
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center gap-2 text-[#a1a1a1] text-xs font-medium"><Mail size={12} /> {selectedOrder.customer.email}</div>
                        <div className="flex items-center gap-2 text-[#a1a1a1] text-xs font-medium"><Phone size={12} /> {selectedOrder.customer.phone}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[#a1a1a1]">
                      <MapPin size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Logistic Destination</span>
                    </div>
                    <div className="p-6 rounded-3xl bg-white dark:bg-black border border-[#e2e2e2] dark:border-[#1a1a1a] shadow-sm">
                      <p className="text-xs font-bold text-black dark:text-white leading-relaxed">{selectedOrder.customer.address}</p>
                      <p className="text-xs font-black text-black dark:text-white mt-2 uppercase tracking-tighter">{selectedOrder.customer.city}, {selectedOrder.customer.zip}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[#a1a1a1]">
                      <Calendar size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Chronology</span>
                    </div>
                    <div className="text-xs font-bold text-black dark:text-white uppercase tracking-widest">
                      Placed: {new Date(selectedOrder.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="pt-8 mt-auto flex flex-col gap-3">
                  <button
                    onClick={() => handleDownloadSlip(selectedOrder)}
                    className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-3xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <ReceiptText size={18} /> Print Delivery Slip
                  </button>
                  <button className="w-full py-5 bg-[#f5f5f5] dark:bg-[#111] text-black dark:text-white rounded-3xl text-xs font-black uppercase tracking-[0.2em] hover:opacity-80 transition-all flex items-center justify-center gap-3">
                    <CreditCard size={18} /> Transaction Logs
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageOrders;
