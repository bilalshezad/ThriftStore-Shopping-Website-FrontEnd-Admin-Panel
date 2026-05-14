import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Upload, Image as ImageIcon, Link as LinkIcon, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const fileInputRef = useRef(null);
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '',
    images: [], // Changed from image: '' to images: []
    gender: 'Unisex',
    subtitle: '',
    sizes: '' // Added sizes field
  });

  const [imageUrlInput, setImageUrlInput] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const shoesRes = await fetch('http://localhost:5000/products/getallshoes');
      const shoesData = await shoesRes.json();
      const accRes = await fetch('http://localhost:5000/getallaccessories');
      const accData = await accRes.json();

      const unifiedProducts = [
        ...(shoesData.shoes || []).map(s => ({ ...s, type: 'shoe', name: s.h1, image: s.img[0], allImages: s.img })),
        ...(accData || []).map(a => ({ ...a, type: 'accessory', name: a.name, image: Array.isArray(a.image) ? a.image[0] : a.image, allImages: Array.isArray(a.image) ? a.image : [a.image] }))
      ];

      setProducts(unifiedProducts);
      // Unique categories (case-insensitive deduplication)
      const uniqueCats = [];
      const seen = new Set();
      unifiedProducts.forEach(p => {
        const cat = p.category?.trim();
        if (cat && !seen.has(cat.toLowerCase())) {
          seen.add(cat.toLowerCase());
          uniqueCats.push(cat);
        }
      });
      setCategories(uniqueCats);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: product.price || '',
      category: product.category || '',
      description: product.description || '',
      stock: product.stock || 0,
      images: product.allImages || [],
      gender: product.Gender || 'Unisex',
      subtitle: product.subtitle || '',
      sizes: Array.isArray(product.Size) ? product.Size.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      category: '',
      description: '',
      stock: '',
      images: [],
      gender: 'Unisex',
      subtitle: '',
      sizes: ''
    });
    setIsModalOpen(true);
  };

  // Image Handling
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()]
    }));
    setImageUrlInput('');
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, e.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    const isShoe = ["sneakers", "urbanshoes", "jogers", "converse", "slides"].includes(formData.category.toLowerCase().trim());
    const sizeArray = formData.sizes.split(',').map(s => s.trim()).filter(s => s !== "");

    const url = editingProduct 
      ? `http://localhost:5000/admin/${editingProduct.type === 'shoe' ? 'shoes' : 'accessory'}/${editingProduct._id}`
      : `http://localhost:5000/admin/${isShoe ? 'addshoes' : 'addaccessory'}`;

    const method = editingProduct ? 'PUT' : 'POST';
    
    const payload = isShoe || (editingProduct && editingProduct.type === 'shoe')
      ? {
          h1: formData.name,
          price: Number(formData.price),
          category: formData.category.trim(),
          description: formData.description,
          img: formData.images,
          subtitle: formData.subtitle,
          Gender: formData.gender,
          stock: Number(formData.stock),
          Size: sizeArray.length > 0 ? sizeArray.map(s => isNaN(s) ? s : Number(s)) : [38, 39, 40, 41, 42, 43, 44]
        }
      : {
          name: formData.name,
          price: Number(formData.price),
          category: formData.category.trim(),
          image: formData.images,
          stock: Number(formData.stock),
          Size: sizeArray,
          Gender: formData.gender
        };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.shoes || data.accessory || data.success) {
        toast.success(editingProduct ? 'Product updated' : 'Product added');
        setIsModalOpen(false);
        fetchProducts();
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Error saving product');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || p.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase">Inventory</h1>
          <p className="text-[#a1a1a1] text-sm mt-1 font-bold uppercase tracking-widest">Global Product Control</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>



      <div className="bg-white dark:bg-[#050505] rounded-[2.5rem] border border-[#e2e2e2] dark:border-[#1a1a1a] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-[#e2e2e2] dark:border-[#1a1a1a] flex flex-wrap gap-6 justify-between items-center bg-[#fcfcfc] dark:bg-[#080808]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a1a1a1]" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl border border-[#e2e2e2] dark:border-[#1a1a1a] bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white transition-all text-sm font-bold shadow-sm"
            />
          </div>
          <div className="flex gap-3">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-6 py-4 rounded-2xl border border-[#e2e2e2] dark:border-[#1a1a1a] bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-xs font-black uppercase tracking-widest shadow-sm"
            >
              <option>All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f9f9f9] dark:bg-[#0a0a0a] text-[#a1a1a1] text-[10px] uppercase tracking-[0.25em]">
              <tr>
                <th className="p-8 font-black">Product</th>
                <th className="p-8 font-black">Category</th>
                <th className="p-8 font-black">Pricing</th>
                <th className="p-8 font-black">Inventory</th>
                <th className="p-8 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e2e2] dark:divide-[#1a1a1a]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-32 text-center text-[#a1a1a1] font-black uppercase tracking-[0.2em] animate-pulse">Initializing Data Stream...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-32 text-center text-[#a1a1a1] font-black uppercase tracking-[0.2em]">Void Detected</td>
                </tr>
              ) : filteredProducts.map((product) => (
                <motion.tr 
                  key={product._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-[#fcfcfc] dark:hover:bg-[#080808] transition-all group"
                >
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-3xl bg-[#f9f9f9] dark:bg-[#0a0a0a] border border-[#e2e2e2] dark:border-[#1a1a1a] overflow-hidden flex-shrink-0 group-hover:scale-105 group-hover:rotate-2 transition-all duration-500 shadow-lg shadow-black/5">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#a1a1a1]">
                            <ImageIcon size={28} />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="block font-black text-black dark:text-white uppercase text-base tracking-tight mb-1">{product.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#a1a1a1] font-black uppercase tracking-widest">{product.subtitle || 'Standard Edition'}</span>
                          <span className="w-1 h-1 rounded-full bg-[#e2e2e2] dark:bg-[#222]" />
                          <span className="text-[10px] text-[#a1a1a1] font-black uppercase tracking-widest">{product.allImages?.length || 1} IMAGES</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="px-4 py-2 bg-black/5 dark:bg-white/5 rounded-xl text-black dark:text-white font-black text-[10px] uppercase tracking-[0.15em] border border-black/10 dark:border-white/10">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-8">
                    <span className="text-black dark:text-white font-black text-xl tracking-tighter">Rs {product.price}</span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${product.stock > 10 ? 'bg-black dark:bg-white' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                      <span className="text-[#a1a1a1] font-black text-xs uppercase tracking-widest">{product.stock} UNITS</span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-4 bg-white dark:bg-black border border-[#e2e2e2] dark:border-[#1a1a1a] text-black dark:text-white rounded-2xl hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-xl shadow-black/5"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Erase this product from catalog?')) {
                            const type = product.type;
                            const id = product._id;
                            const endpoint = type === 'shoe' ? `admin/shoes/${id}` : `admin/accessory/${id}`;
                            fetch(`http://localhost:5000/${endpoint}`, { method: 'DELETE' })
                              .then(res => res.json())
                              .then(data => {
                                if (data.success) {
                                  toast.success('Product Erased');
                                  fetchProducts();
                                }
                              });
                          }
                        }}
                        className="p-4 bg-white dark:bg-black border border-[#e2e2e2] dark:border-[#1a1a1a] text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-black/5"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              className="relative w-full max-w-4xl bg-white dark:bg-[#080808] rounded-[3rem] border border-[#e2e2e2] dark:border-[#1a1a1a] shadow-3xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Image Column */}
              <div className="w-full md:w-2/5 bg-[#f9f9f9] dark:bg-[#0a0a0a] p-8 border-r border-[#e2e2e2] dark:border-[#1a1a1a] flex flex-col gap-6 overflow-y-auto">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">Product Images</h3>
                  <p className="text-[#a1a1a1] text-[10px] font-black uppercase tracking-widest">Visual Assets (Multi-Upload)</p>
                </div>

                {/* Dropzone */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative aspect-square rounded-[2rem] border-2 border-dashed border-[#e2e2e2] dark:border-[#222] flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-black dark:hover:border-white transition-all bg-white dark:bg-black overflow-hidden"
                >
                  {formData.images.length > 0 ? (
                    <img src={formData.images[formData.images.length - 1]} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" alt="Preview" />
                  ) : null}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera size={32} className="text-black dark:text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest mt-4 text-black dark:text-white">Drop or Click</span>
                  </div>
                  <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                </div>

                {/* Manual URL Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1a1]" />
                    <input 
                      type="text" 
                      placeholder="Paste Image URL" 
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-black border border-[#e2e2e2] dark:border-[#1a1a1a] text-xs font-bold text-black dark:text-white outline-none"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddImageUrl}
                    className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-80 transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Image List Preview */}
                <div className="grid grid-cols-3 gap-3">
                  {formData.images.map((img, idx) => (
                    <motion.div 
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={idx} 
                      className="relative aspect-square rounded-xl overflow-hidden border border-[#e2e2e2] dark:border-[#1a1a1a] group"
                    >
                      <img src={img} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" alt="Preview" />
                      <button 
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Form Column */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-8 border-b border-[#e2e2e2] dark:border-[#1a1a1a] flex justify-between items-center bg-[#fcfcfc] dark:bg-[#080808]">
                  <div>
                    <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight">
                      {editingProduct ? 'Update Item' : 'New Entry'}
                    </h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all">
                    <X size={24} className="text-black dark:text-white" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Core Identifier</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl border border-[#e2e2e2] dark:border-[#1a1a1a] bg-[#fcfcfc] dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold text-sm"
                        placeholder="Product Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Currency Value (Rs)</label>
                      <input 
                        type="number" 
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl border border-[#e2e2e2] dark:border-[#1a1a1a] bg-[#fcfcfc] dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-black text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Catalog Tag</label>
                      <input 
                        type="text" 
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl border border-[#e2e2e2] dark:border-[#1a1a1a] bg-[#fcfcfc] dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold text-sm"
                        placeholder="e.g. sneakers"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Inventory Count</label>
                      <input 
                        type="number" 
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl border border-[#e2e2e2] dark:border-[#1a1a1a] bg-[#fcfcfc] dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold text-sm"
                        placeholder="Units"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Descriptive Data</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="4"
                      className="w-full px-6 py-4 rounded-2xl border border-[#e2e2e2] dark:border-[#1a1a1a] bg-[#fcfcfc] dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-medium text-sm leading-relaxed"
                      placeholder="Enter comprehensive product specifications..."
                    />
                  </div>

                  {/* Optional Footwear Logic */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#e2e2e2] dark:border-[#1a1a1a]">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Secondary Label</label>
                      <input 
                        type="text" 
                        value={formData.subtitle}
                        onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl border border-[#e2e2e2] dark:border-[#1a1a1a] bg-[#fcfcfc] dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold text-sm"
                        placeholder="e.g. Limited Edition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Classification</label>
                      <select 
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl border border-[#e2e2e2] dark:border-[#1a1a1a] bg-[#fcfcfc] dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-black uppercase tracking-widest text-xs"
                      >
                        <option>Men</option>
                        <option>Women</option>
                        <option>Unisex</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-[#e2e2e2] dark:border-[#1a1a1a]">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">Available Sizes</label>
                    <input 
                      type="text" 
                      value={formData.sizes}
                      onChange={(e) => setFormData({...formData, sizes: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border border-[#e2e2e2] dark:border-[#1a1a1a] bg-[#fcfcfc] dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-bold text-sm"
                      placeholder="e.g. 40, 41, 42 or S, M, L (Comma separated)"
                    />
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-5 bg-[#f5f5f5] dark:bg-[#0a0a0a] text-black dark:text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] hover:opacity-80 transition-all"
                    >
                      Dismiss
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] py-5 bg-black dark:bg-white text-white dark:text-black rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-black/20"
                    >
                      {editingProduct ? 'Commit Changes' : 'Publish Entry'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageProducts;
