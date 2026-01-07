import React, { useState, useRef } from 'react';
import { useStore } from '../services/store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Package, Truck, DollarSign, Users, CheckCircle, XCircle, Printer, AlertTriangle, FileText, Search, PlusCircle, Trash2, Settings, Save, ShoppingBag, TrendingUp, TrendingDown, ClipboardList, CreditCard, Download } from 'lucide-react';
import { Product, Order, User, CartItem, Role, InvoiceSettings, PurchaseOrder, PurchaseItem, PaymentSettings } from '../types';

// --- UTILS ---
const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) {
      alert("No data to export");
      return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => {
        const value = row[fieldName];
        // Handle strings that might contain commas
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : JSON.stringify(value, (key, value) => value === null ? '' : value);
      }).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
};

// --- INVOICE COMPONENT ---
const InvoiceTemplate = ({ order, onClose }: { order: Order; onClose: () => void }) => {
  const { invoiceSettings } = useStore();
  
  const handlePrint = () => {
    const printContent = document.getElementById('invoice-content');
    if (printContent) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to restore React app state
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl my-8">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Tax Invoice</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
              <Printer size={16} /> Print
            </button>
            <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
              Close
            </button>
          </div>
        </div>
        
        <div id="invoice-content" className="p-8 bg-white text-black">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 border-b-2 border-tea-dark pb-4">
            <div>
               <h1 className="text-3xl font-bold text-tea-dark uppercase">{invoiceSettings.companyName}</h1>
               <p className="text-sm">{invoiceSettings.addressLine1}</p>
               <p className="text-sm">{invoiceSettings.addressLine2}</p>
               <p className="text-sm">GSTIN: {invoiceSettings.gstin}</p>
               <p className="text-sm">Phone: {invoiceSettings.phone}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-600">INVOICE</h2>
              <p className="font-bold">#{order.invoiceNumber || order.id}</p>
              <p>Date: {order.date}</p>
              <div className={`mt-2 border-2 px-2 py-1 inline-block font-bold rounded ${order.paymentStatus === 'Paid' ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}`}>
                {order.paymentStatus.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-600 border-b mb-2">BILL TO</h3>
            <p className="font-bold text-lg">{order.userName}</p>
            <p className="text-gray-700 w-1/2">{order.userAddress || 'Address not provided'}</p>
            <p className="text-gray-700">Role: {order.type}</p>
            {order.userGst && <p className="text-gray-700">GST: {order.userGst}</p>}
          </div>

          {/* Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-black">
                <th className="text-left p-2">Item</th>
                <th className="text-center p-2">HSN</th>
                <th className="text-center p-2">Qty</th>
                <th className="text-right p-2">Price</th>
                <th className="text-right p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => {
                const price = order.type === 'WHOLESALE' ? item.distributorPrice : item.mrp;
                return (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <div className="font-bold">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.weight}</div>
                    </td>
                    <td className="text-center p-2">0902</td>
                    <td className="text-center p-2">{item.quantity}</td>
                    <td className="text-right p-2">₹{price}</td>
                    <td className="text-right p-2">₹{price * item.quantity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-1/2">
              <div className="flex justify-between py-1 border-b">
                <span>Subtotal:</span>
                <span>₹{(order.totalAmount - order.taxAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>CGST (2.5%):</span>
                <span>₹{(order.taxAmount / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>SGST (2.5%):</span>
                <span>₹{(order.taxAmount / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b-2 border-black font-bold text-xl mt-2">
                <span>Grand Total:</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-xs text-gray-500">
            <p>This is a computer generated invoice.</p>
            <p>{invoiceSettings.footerNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ADD USER FORM ---
const AddUserForm = ({ onClose, onSubmit }: { onClose: () => void, onSubmit: (user: User) => void }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    mobile: '',
    role: 'CUSTOMER',
    address: '',
    gstNumber: '',
    territory: '',
    approved: true,
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) return alert("Name and Mobile are required");
    
    const newUser: User = {
      id: Date.now().toString(),
      name: formData.name,
      mobile: formData.mobile,
      role: formData.role as Role,
      approved: true, // Admin created users are auto-approved
      address: formData.address,
      gstNumber: formData.gstNumber,
      territory: formData.territory,
      password: formData.password || '123456' // Default if not provided by admin
    };
    onSubmit(newUser);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">Add New User</h2>
          <button onClick={onClose}><XCircle /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Full Name</label>
            <input 
              required
              className="w-full border p-2 rounded" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Mobile Number</label>
            <input 
              required
              type="tel"
              maxLength={10}
              className="w-full border p-2 rounded" 
              value={formData.mobile} 
              onChange={e => setFormData({...formData, mobile: e.target.value})} 
            />
          </div>
           <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Password</label>
            <input 
              type="text"
              className="w-full border p-2 rounded" 
              placeholder="Default: 123456"
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Role</label>
            <select 
              className="w-full border p-2 rounded"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value as Role})}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
          </div>
          
          {formData.role === 'DISTRIBUTOR' && (
             <div>
               <label className="block text-sm font-bold text-gray-600 mb-1">Territory</label>
               <input 
                 className="w-full border p-2 rounded" 
                 value={formData.territory} 
                 onChange={e => setFormData({...formData, territory: e.target.value})} 
               />
             </div>
          )}

          <div>
             <label className="block text-sm font-bold text-gray-600 mb-1">Address</label>
             <textarea 
               className="w-full border p-2 rounded" 
               rows={2}
               value={formData.address} 
               onChange={e => setFormData({...formData, address: e.target.value})} 
             ></textarea>
          </div>
           <div>
             <label className="block text-sm font-bold text-gray-600 mb-1">GST Number (Optional)</label>
             <input 
               className="w-full border p-2 rounded uppercase" 
               value={formData.gstNumber} 
               onChange={e => setFormData({...formData, gstNumber: e.target.value})} 
             />
          </div>

          <button type="submit" className="w-full bg-tea-dark text-white font-bold py-3 rounded hover:bg-black mt-4">
            Create User
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MANUAL ORDER FORM ---
const ManualOrderForm = ({ products, users, onClose, onSubmit }: { products: Product[], users: User[], onClose: () => void, onSubmit: (order: Order) => void }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid'>('Pending');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI'>('Cash');

  const selectedUser = users.find(u => u.id === selectedUserId);

  const addItem = () => {
    if (!selectedProduct || qty < 1) return;
    const prod = products.find(p => p.id === selectedProduct);
    if (prod) {
      if (prod.stock < qty) {
        alert("Insufficient stock");
        return;
      }
      const existing = items.find(i => i.id === prod.id);
      if (existing) {
        setItems(items.map(i => i.id === prod.id ? {...i, quantity: i.quantity + qty} : i));
      } else {
        setItems([...items, {...prod, quantity: qty}]);
      }
    }
  };

  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const total = items.reduce((acc, item) => {
    const price = selectedUser?.role === 'DISTRIBUTOR' ? item.distributorPrice : item.mrp;
    return acc + (price * item.quantity);
  }, 0);

  const handleSubmit = () => {
    if (!selectedUser || items.length === 0) return;
    
    const tax = total * 0.05;
    const order: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      userId: selectedUser.id,
      userName: selectedUser.name,
      userAddress: selectedUser.address || 'Counter Sale',
      userGst: selectedUser.gstNumber,
      items,
      totalAmount: Math.round(total + tax),
      taxAmount: Math.round(tax),
      status: 'Delivered',
      paymentMethod,
      paymentStatus,
      date: new Date().toISOString().split('T')[0],
      type: selectedUser.role === 'DISTRIBUTOR' ? 'WHOLESALE' : 'RETAIL'
    };
    onSubmit(order);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">Create New Order</h2>
          <button onClick={onClose}><XCircle /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Select Customer/Distributor</label>
            <select className="w-full border p-2 rounded" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
              <option value="">-- Select User --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role}) - {u.mobile}</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded border">
            <h4 className="font-bold text-sm mb-2">Add Items</h4>
            <div className="flex gap-2 mb-2">
              <select className="flex-1 border p-2 rounded text-sm" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                <option value="">-- Select Product --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
              </select>
              <input type="number" className="w-20 border p-2 rounded text-sm" value={qty} min="1" onChange={e => setQty(parseInt(e.target.value))} />
              <button onClick={addItem} className="bg-tea-green text-white px-4 rounded font-bold">+</button>
            </div>
            
            {items.length > 0 && (
              <div className="mt-4 space-y-2">
                {items.map(item => {
                   const price = selectedUser?.role === 'DISTRIBUTOR' ? item.distributorPrice : item.mrp;
                   return (
                    <div key={item.id} className="flex justify-between items-center bg-white p-2 border rounded text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">₹{price * item.quantity}</span>
                        <button onClick={() => removeItem(item.id)} className="text-red-500"><Trash2 size={16}/></button>
                      </div>
                    </div>
                   );
                })}
                <div className="text-right font-bold pt-2 border-t">
                   Total (with 5% GST): ₹{Math.round(total * 1.05)}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-bold mb-1">Payment Method</label>
               <select className="w-full border p-2 rounded" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)}>
                 <option value="Cash">Cash</option>
                 <option value="UPI">UPI</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-bold mb-1">Payment Status</label>
               <select className="w-full border p-2 rounded" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as any)}>
                 <option value="Pending">Pending</option>
                 <option value="Paid">Paid</option>
               </select>
             </div>
          </div>
          
          <button 
            disabled={!selectedUser || items.length === 0}
            onClick={handleSubmit} 
            className="w-full bg-tea-dark text-white font-bold py-3 rounded hover:bg-black disabled:opacity-50"
          >
            Generate Order & Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

// --- PURCHASE ORDER FORM ---
const PurchaseOrderForm = ({ products, onClose, onSubmit }: { products: Product[], onClose: () => void, onSubmit: (po: PurchaseOrder) => void }) => {
  const [supplierName, setSupplierName] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState(1);
  const [unitCost, setUnitCost] = useState(0);

  const addItem = () => {
    if (!selectedProduct || qty < 1 || unitCost < 0) return;
    const prod = products.find(p => p.id === selectedProduct);
    if (prod) {
      setItems([...items, { 
        productId: prod.id, 
        productName: prod.name, 
        quantity: qty, 
        unitCost: unitCost, 
        totalCost: qty * unitCost 
      }]);
      // Reset selection
      setSelectedProduct('');
      setQty(1);
      setUnitCost(0);
    }
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0);

  const handleSubmit = () => {
    if (!supplierName || items.length === 0) return;
    const po: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      poNumber: `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      supplierName,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      items,
      totalAmount
    };
    onSubmit(po);
  };

  const handleProductSelect = (id: string) => {
    setSelectedProduct(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setUnitCost(prod.costPrice || 0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">New Purchase Order</h2>
          <button onClick={onClose}><XCircle /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Supplier Name</label>
            <input 
              className="w-full border p-2 rounded" 
              value={supplierName} 
              onChange={e => setSupplierName(e.target.value)} 
              placeholder="Enter Supplier Name"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded border">
            <h4 className="font-bold text-sm mb-2">Add Items</h4>
            <div className="flex flex-wrap gap-2 mb-2 items-end">
              <div className="flex-1 min-w-[200px]">
                 <label className="text-xs text-gray-500">Product</label>
                 <select className="w-full border p-2 rounded text-sm" value={selectedProduct} onChange={e => handleProductSelect(e.target.value)}>
                    <option value="">-- Select Product --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
              </div>
              <div className="w-20">
                <label className="text-xs text-gray-500">Qty</label>
                <input type="number" className="w-full border p-2 rounded text-sm" value={qty} min="1" onChange={e => setQty(parseInt(e.target.value))} />
              </div>
              <div className="w-24">
                <label className="text-xs text-gray-500">Cost/Unit</label>
                <input type="number" className="w-full border p-2 rounded text-sm" value={unitCost} onChange={e => setUnitCost(parseFloat(e.target.value))} />
              </div>
              <button onClick={addItem} className="bg-tea-dark text-white px-4 py-2 rounded font-bold h-[38px]">+</button>
            </div>
            
            {items.length > 0 && (
              <div className="mt-4 space-y-2">
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-2 border rounded text-sm">
                      <span>{item.productName} ({item.quantity} x ₹{item.unitCost})</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">₹{item.totalCost}</span>
                        <button onClick={() => removeItem(idx)} className="text-red-500"><Trash2 size={16}/></button>
                      </div>
                    </div>
                ))}
                <div className="text-right font-bold pt-2 border-t">
                   Total PO Value: ₹{totalAmount}
                </div>
              </div>
            )}
          </div>
          
          <button 
            disabled={!supplierName || items.length === 0}
            onClick={handleSubmit} 
            className="w-full bg-tea-green text-white font-bold py-3 rounded hover:bg-tea-dark disabled:opacity-50"
          >
            Create Purchase Order
          </button>
        </div>
      </div>
    </div>
  );
};


// --- INVENTORY COMPONENT ---
const InventoryManager = ({ products, onUpdateStock }: { products: Product[], onUpdateStock: (id: string, qty: number) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Package className="text-tea-dark" /> Inventory Status
        </h3>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:ring-2 focus:ring-tea-green outline-none" 
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-center">Stock Level</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const isLow = p.stock <= p.lowStockThreshold;
              return (
                <tr key={p.id} className={`border-b hover:bg-gray-50 ${isLow ? 'bg-red-50' : ''}`}>
                  <td className="p-4 flex items-center gap-3 min-w-[200px]">
                    <img src={p.image} className="w-10 h-10 rounded object-cover border" alt={p.name} />
                    <div>
                      <div className="font-bold text-sm text-gray-800">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.weight}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{p.category}</td>
                  <td className="p-4 text-center">
                    {editingId === p.id ? (
                      <input 
                        type="number" 
                        autoFocus
                        className="w-20 border p-1 rounded text-center"
                        value={editQty}
                        onChange={e => setEditQty(parseInt(e.target.value) || 0)}
                      />
                    ) : (
                      <span className="font-mono font-bold">{p.stock}</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                     {isLow ? (
                       <span className="inline-flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-bold">
                         <AlertTriangle size={12} /> Low Stock
                       </span>
                     ) : (
                       <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold">In Stock</span>
                     )}
                  </td>
                  <td className="p-4 text-right">
                    {editingId === p.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { onUpdateStock(p.id, editQty); setEditingId(null); }} className="text-green-600 font-bold text-sm">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-500 text-sm">Cancel</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setEditingId(p.id); setEditQty(p.stock); }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Update Stock
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { 
    user, orders, products, users, invoiceSettings, purchaseOrders, paymentSettings,
    updateInvoiceSettings, addUser, addOrder, addPurchaseOrder, receivePurchaseOrder,
    updatePaymentStatus, approveDistributor, updateOrderStatus, deleteOrder, deletePurchaseOrder,
    addProduct, deleteProduct, updateProduct, updateStock, updatePaymentSettings
  } = useStore();
  
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Order | null>(null);
  const [showManualOrder, setShowManualOrder] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showPOForm, setShowPOForm] = useState(false);

  // Settings state
  const [settingsForm, setSettingsForm] = useState<InvoiceSettings>(invoiceSettings);
  const [paymentForm, setPaymentForm] = useState<PaymentSettings>(paymentSettings);

  if (!user) return <div className="p-8 text-center text-red-600">Please login to view dashboard</div>;

  // --- ADMIN VIEW ---
  if (user.role === 'ADMIN') {
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = orders.length;
    const chartData = products.map(p => ({
      name: p.name.split('-')[1]?.trim() || p.name,
      sales: orders.flatMap(o => o.items).filter(i => i.id === p.id).reduce((sum, i) => sum + (i.quantity * i.mrp), 0)
    }));

    // PROFIT & LOSS CALCULATIONS
    const deliveredOrders = orders.filter(o => o.status === 'Delivered');
    
    let totalRevenue = 0;
    let totalCOGS = 0;

    deliveredOrders.forEach(order => {
        order.items.forEach(item => {
           const product = products.find(p => p.id === item.id);
           const cost = product ? product.costPrice : 0;
           const sellingPrice = order.type === 'WHOLESALE' ? item.distributorPrice : item.mrp;
           
           totalRevenue += (sellingPrice * item.quantity);
           totalCOGS += (cost * item.quantity);
        });
    });

    const grossProfit = totalRevenue - totalCOGS;
    const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

    // RAZORPAY / PAYMENT STATS
    const onlineOrders = orders.filter(o => o.paymentMethod !== 'COD' && o.paymentStatus === 'Paid');
    const totalOnlineRevenue = onlineOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalCOD = orders.filter(o => o.paymentMethod === 'COD').reduce((acc, curr) => acc + curr.totalAmount, 0);
    const paymentVolumeData = [
       { name: 'Razorpay (Online)', value: totalOnlineRevenue, color: '#0052cc' }, // Razorpay Blue
       { name: 'Cash on Delivery', value: totalCOD, color: '#eab308' } // Tea Gold
    ];

    const TABS = ['OVERVIEW', 'REPORTS', 'PAYMENTS', 'ORDERS', 'PURCHASE', 'INVENTORY', 'PRODUCTS', 'USERS', 'SETTINGS'];

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-tea-dark mb-8 flex items-center justify-between">
          <span>Admin Dashboard</span>
          <span className="text-sm font-normal text-gray-500 hidden md:block">Manage your business</span>
        </h1>
        
        {/* Mobile Tabs */}
        <div className="flex overflow-x-auto pb-4 gap-2 md:hidden mb-4 no-scrollbar">
          {TABS.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${activeTab === tab ? 'bg-tea-green text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`pb-2 px-4 transition whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-tea-green font-bold text-tea-green' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'OVERVIEW' && (
          <div className="space-y-8 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-tea-green">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Total Revenue</p>
                    <h3 className="text-2xl font-bold">₹{totalSales.toLocaleString()}</h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="text-tea-green" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Total Orders</p>
                    <h3 className="text-2xl font-bold">{orderCount}</h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Package className="text-blue-500" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-tea-gold">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Low Stock Items</p>
                    <h3 className="text-2xl font-bold text-red-600">
                      {products.filter(p => p.stock <= p.lowStockThreshold).length}
                    </h3>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <AlertTriangle className="text-tea-gold" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Distributors</p>
                    <h3 className="text-2xl font-bold">{users.filter(u => u.role === 'DISTRIBUTOR').length}</h3>
                  </div>
                   <div className="bg-purple-100 p-3 rounded-full">
                    <Users className="text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">Sales Trends</h3>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#1a4d2e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* --- RAZORPAY DASHBOARD TAB --- */}
        {activeTab === 'PAYMENTS' && (
           <div className="animate-fade-in space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <CreditCard className="text-blue-600" /> Razorpay Payment Dashboard
                 </h3>
                 <div className="flex gap-2">
                     <button 
                        onClick={() => {
                            const data = onlineOrders.map(o => ({
                                Date: o.date,
                                PaymentID: o.transactionId || 'N/A',
                                OrderID: o.id,
                                Method: o.paymentMethod,
                                Amount: o.totalAmount,
                                Status: 'Captured'
                            }));
                            exportToCSV(data, 'payments_export.csv');
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold flex items-center gap-1 hover:bg-green-700"
                     >
                        <Download size={14} /> Export Excel
                     </button>
                     <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                        Live Mode (Mock)
                     </span>
                 </div>
              </div>

              {/* Payment Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-600">
                      <p className="text-gray-500 text-sm font-bold uppercase">Total Captured</p>
                      <h2 className="text-3xl font-bold text-blue-700 mt-2">₹{totalOnlineRevenue.toLocaleString()}</h2>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={12}/> Settlements Enabled</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-500">
                      <p className="text-gray-500 text-sm font-bold uppercase">Pending Settlement</p>
                      <h2 className="text-3xl font-bold text-gray-800 mt-2">₹{(totalOnlineRevenue * 0.98).toLocaleString()}</h2>
                      <p className="text-xs text-gray-400 mt-1">Expected by tomorrow (T+2)</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-600">
                      <p className="text-gray-500 text-sm font-bold uppercase">Success Rate</p>
                      <h2 className="text-3xl font-bold text-green-700 mt-2">98.5%</h2>
                      <p className="text-xs text-gray-400 mt-1">Based on last 30 days</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Transaction Volume Chart */}
                 <div className="bg-white p-6 rounded-lg shadow md:col-span-1">
                     <h4 className="font-bold text-gray-700 mb-4">Payment Volume Mix</h4>
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={paymentVolumeData} 
                                    cx="50%" cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {paymentVolumeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="flex justify-center gap-4 text-xs">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#0052cc] rounded-full"></div>Razorpay</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#eab308] rounded-full"></div>COD</div>
                     </div>
                 </div>

                 {/* Transactions Table */}
                 <div className="bg-white shadow rounded-lg overflow-hidden md:col-span-2 flex flex-col">
                     <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                        <h4 className="font-bold text-gray-700">Recent Online Transactions</h4>
                        <button className="text-blue-600 text-sm font-bold hover:underline">View All in Razorpay</button>
                     </div>
                     <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Payment ID</th>
                                    <th className="p-3">Order ID</th>
                                    <th className="p-3">Method</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {onlineOrders.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">No online transactions yet.</td></tr>
                                ) : (
                                    onlineOrders.map(order => (
                                        <tr key={order.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 text-gray-500">{order.date}</td>
                                            <td className="p-3 font-mono font-bold text-blue-600">{order.transactionId || 'N/A'}</td>
                                            <td className="p-3">{order.id}</td>
                                            <td className="p-3">{order.paymentMethod}</td>
                                            <td className="p-3 font-bold">₹{order.totalAmount}</td>
                                            <td className="p-3"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Captured</span></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                     </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'REPORTS' && (
          <div className="space-y-6 animate-fade-in">
             <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-tea-dark">
                  <TrendingUp /> Profit & Loss Statement
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                     <p className="text-sm text-gray-500 font-bold uppercase">Total Sales Revenue</p>
                     <h2 className="text-3xl font-bold text-green-700">₹{totalRevenue.toLocaleString()}</h2>
                     <p className="text-xs text-gray-400 mt-2">From delivered orders</p>
                  </div>
                  <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                     <p className="text-sm text-gray-500 font-bold uppercase">Cost of Goods Sold (COGS)</p>
                     <h2 className="text-3xl font-bold text-red-700">₹{totalCOGS.toLocaleString()}</h2>
                     <p className="text-xs text-gray-400 mt-2">Based on product cost price</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                     <p className="text-sm text-gray-500 font-bold uppercase">Gross Profit</p>
                     <h2 className="text-3xl font-bold text-blue-700">₹{grossProfit.toLocaleString()}</h2>
                     <p className="text-xs text-gray-400 mt-2">Margin: {profitMargin}%</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                   <h4 className="font-bold text-gray-600 mb-4">Profit By Product</h4>
                   <table className="w-full text-left text-sm">
                     <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="p-3">Product</th>
                          <th className="p-3 text-right">Sold Qty</th>
                          <th className="p-3 text-right">Revenue</th>
                          <th className="p-3 text-right">Cost</th>
                          <th className="p-3 text-right">Profit</th>
                        </tr>
                     </thead>
                     <tbody>
                        {products.map(p => {
                           let pRev = 0;
                           let pCost = 0;
                           let pQty = 0;
                           deliveredOrders.forEach(o => {
                             o.items.forEach(i => {
                               if (i.id === p.id) {
                                 const sp = o.type === 'WHOLESALE' ? i.distributorPrice : i.mrp;
                                 pRev += (sp * i.quantity);
                                 pCost += (p.costPrice * i.quantity);
                                 pQty += i.quantity;
                               }
                             })
                           });
                           if (pQty === 0) return null;
                           return (
                             <tr key={p.id} className="border-b">
                               <td className="p-3 font-medium">{p.name}</td>
                               <td className="p-3 text-right">{pQty}</td>
                               <td className="p-3 text-right">₹{pRev}</td>
                               <td className="p-3 text-right">₹{pCost}</td>
                               <td className="p-3 text-right font-bold text-green-600">₹{pRev - pCost}</td>
                             </tr>
                           )
                        })}
                     </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'PURCHASE' && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-gray-700">Purchase Orders</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={() => {
                            const data = purchaseOrders.map(p => ({
                                PONumber: p.poNumber,
                                Date: p.date,
                                Supplier: p.supplierName,
                                TotalAmount: p.totalAmount,
                                Status: p.status,
                                Items: p.items.map(i => `${i.quantity}x ${i.productName}`).join('; ')
                            }));
                            exportToCSV(data, 'purchase_orders.csv');
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded font-bold shadow flex items-center gap-2 hover:bg-green-700"
                    >
                        <Download size={20} /> Export
                    </button>
                    <button 
                    onClick={() => setShowPOForm(true)}
                    className="bg-tea-dark text-white px-4 py-2 rounded font-bold shadow flex items-center gap-2 hover:bg-black"
                    >
                    <PlusCircle size={20} /> New PO
                    </button>
                </div>
             </div>

             <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                      <tr>
                        <th className="p-4">PO Number</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Supplier</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Items</th>
                        <th className="p-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseOrders.map(po => (
                        <tr key={po.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="p-4 font-mono font-bold text-xs">{po.poNumber}</td>
                          <td className="p-4 text-sm">{po.date}</td>
                          <td className="p-4 font-bold text-gray-700">{po.supplierName}</td>
                          <td className="p-4 font-bold">₹{po.totalAmount.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              po.status === 'Received' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {po.status}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-gray-500">
                             {po.items.map(i => <div key={i.productId}>{i.quantity} x {i.productName}</div>)}
                          </td>
                          <td className="p-4 flex gap-2">
                            {po.status === 'Pending' && (
                              <button 
                                onClick={() => receivePurchaseOrder(po.id)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                              >
                                <ClipboardList size={14} /> Receive
                              </button>
                            )}
                            <button 
                                onClick={() => {
                                    if(window.confirm('Are you sure you want to delete this Purchase Order?')) {
                                        deletePurchaseOrder(po.id);
                                    }
                                }}
                                className="bg-red-100 text-red-600 p-1.5 rounded hover:bg-red-200"
                                title="Delete PO"
                            >
                                <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'ORDERS' && (
          <div className="animate-fade-in">
             <div className="flex justify-end mb-4 gap-2">
                <button 
                    onClick={() => {
                        const data = orders.map(o => ({
                            InvoiceNo: o.invoiceNumber || '',
                            OrderID: o.id,
                            Date: o.date,
                            Customer: o.userName,
                            Type: o.type,
                            Amount: o.totalAmount,
                            PaymentStatus: o.paymentStatus,
                            OrderStatus: o.status
                        }));
                        exportToCSV(data, 'orders_export.csv');
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded font-bold shadow flex items-center gap-2 hover:bg-green-700"
                >
                    <Download size={20} /> Export
                </button>
                <button 
                  onClick={() => setShowManualOrder(true)}
                  className="bg-tea-dark text-white px-4 py-2 rounded font-bold shadow flex items-center gap-2 hover:bg-black"
                >
                  <PlusCircle size={20} /> Create New Order
                </button>
             </div>

             <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                      <tr>
                        <th className="p-4">Invoice #</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Pay Status</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="p-4 font-mono text-xs">{order.invoiceNumber || order.id}</td>
                          <td className="p-4">
                            <div className="font-bold">{order.userName}</div>
                            <div className="text-xs text-gray-500">{order.date}</div>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded border ${order.type === 'WHOLESALE' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                              {order.type}
                            </span>
                          </td>
                          <td className="p-4 font-bold">₹{order.totalAmount}</td>
                          <td className="p-4">
                             <select 
                              value={order.paymentStatus}
                              onChange={(e) => updatePaymentStatus(order.id, e.target.value as any)}
                              className={`text-xs font-bold border rounded p-1 ${order.paymentStatus === 'Paid' ? 'text-green-600 border-green-200' : 'text-red-500 border-red-200'}`}
                             >
                               <option value="Pending">Pending</option>
                               <option value="Paid">Paid</option>
                             </select>
                          </td>
                          <td className="p-4">
                            <select 
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                              className={`text-xs font-bold border rounded p-2 ${
                                order.status === 'Delivered' ? 'text-green-700 border-green-200 bg-green-50' : 
                                order.status === 'Processing' ? 'text-blue-700 border-blue-200 bg-blue-50' :
                                'text-gray-700'
                              }`}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-4 flex gap-2">
                            <button onClick={() => setViewInvoice(order)} className="text-tea-dark hover:text-tea-gold" title="View Invoice">
                              <FileText size={20} />
                            </button>
                            <button 
                                onClick={() => {
                                    if(window.confirm('Are you sure you want to delete this Order? This action cannot be undone.')) {
                                        deleteOrder(order.id);
                                    }
                                }}
                                className="text-red-500 hover:text-red-700"
                                title="Delete Order"
                            >
                                <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'INVENTORY' && (
          <InventoryManager products={products} onUpdateStock={updateStock} />
        )}

        {activeTab === 'PRODUCTS' && (
          <div className="animate-fade-in">
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setEditingProduct({ id: 'new', name: '', description: '', image: 'https://picsum.photos/seed/tea_new/400/400', weight: '', mrp: 0, distributorPrice: 0, costPrice: 0, stock: 0, lowStockThreshold: 50, category: 'Pouch', hsnCode: '0902' })}
                className="bg-tea-gold text-tea-dark font-bold px-4 py-2 rounded shadow hover:bg-yellow-400 transition flex items-center gap-2"
              >
                <PlusIcon /> Add Product
              </button>
            </div>
            
            {editingProduct && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200 shadow-inner">
                <h4 className="font-bold mb-4 text-lg border-b pb-2">{editingProduct.id === 'new' ? 'Add New Product' : 'Edit Product'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Product Name</label>
                    <input className="w-full p-2 border rounded" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                  </div>
                   <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Weight</label>
                    <input className="w-full p-2 border rounded" value={editingProduct.weight} onChange={e => setEditingProduct({...editingProduct, weight: e.target.value})} />
                  </div>
                   <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500">Description</label>
                    <input className="w-full p-2 border rounded" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                  </div>
                  
                  {/* SECTION FOR IMAGE URL */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500">Product Image URL</label>
                    <div className="flex gap-4 items-start">
                        <input 
                            className="flex-1 p-2 border rounded" 
                            value={editingProduct.image} 
                            onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                            placeholder="https://example.com/image.jpg"
                        />
                        <div className="w-16 h-16 bg-white border rounded flex items-center justify-center overflow-hidden shrink-0">
                            {editingProduct.image ? (
                                <img 
                                    src={editingProduct.image} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/100?text=Error')} 
                                />
                            ) : (
                                <span className="text-xs text-gray-400">No Img</span>
                            )}
                        </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Category</label>
                    <select className="w-full p-2 border rounded" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})}>
                        <option value="Sachet">Sachet</option>
                        <option value="Pouch">Pouch</option>
                        <option value="Bulk">Bulk</option>
                    </select>
                  </div>
                   <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500">Stock</label>
                    <input className="w-full p-2 border rounded" type="number" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1/3 space-y-1">
                        <label className="text-xs font-bold text-gray-500">Cost Price</label>
                        <input className="w-full p-2 border border-red-200 bg-red-50 rounded" type="number" value={editingProduct.costPrice} onChange={e => setEditingProduct({...editingProduct, costPrice: parseFloat(e.target.value)})} />
                    </div>
                    <div className="w-1/3 space-y-1">
                        <label className="text-xs font-bold text-gray-500">MRP</label>
                        <input className="w-full p-2 border rounded" type="number" value={editingProduct.mrp} onChange={e => setEditingProduct({...editingProduct, mrp: parseFloat(e.target.value)})} />
                    </div>
                    <div className="w-1/3 space-y-1">
                        <label className="text-xs font-bold text-gray-500">Dist. Price</label>
                        <input className="w-full p-2 border rounded" type="number" value={editingProduct.distributorPrice} onChange={e => setEditingProduct({...editingProduct, distributorPrice: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-2 justify-end">
                   <button onClick={() => setEditingProduct(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                   <button 
                    onClick={() => {
                       if (editingProduct.id === 'new') {
                         addProduct({ ...editingProduct, id: `p${Date.now()}` });
                       } else {
                         updateProduct(editingProduct);
                       }
                       setEditingProduct(null);
                    }}
                    className="bg-tea-green text-white px-6 py-2 rounded hover:bg-tea-dark font-bold"
                  >
                    Save Product
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white border rounded-lg p-4 flex gap-4 shadow-sm hover:shadow-md transition relative">
                  <img src={p.image} className="w-24 h-24 object-cover rounded bg-gray-100" />
                  <div className="flex-1">
                    <h4 className="font-bold text-lg leading-tight mb-1">{p.name}</h4>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{p.category}</span>
                    <div className="mt-2 text-sm space-y-1">
                        <p className="flex justify-between"><span>Stock:</span> <span className={`font-bold ${p.stock < p.lowStockThreshold ? 'text-red-600' : 'text-green-600'}`}>{p.stock}</span></p>
                        <p className="flex justify-between"><span>Cost:</span> <span className="text-red-600">₹{p.costPrice}</span></p>
                        <p className="flex justify-between"><span>MRP:</span> <span>₹{p.mrp}</span></p>
                        <p className="flex justify-between"><span>Dist Price:</span> <span className="text-tea-green font-bold">₹{p.distributorPrice}</span></p>
                    </div>
                  </div>
                   <div className="absolute top-2 right-2 flex flex-col gap-2">
                       <button onClick={() => setEditingProduct(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><FileText size={16} /></button>
                       <button onClick={() => deleteProduct(p.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><XCircle size={16} /></button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="bg-white p-6 rounded-lg shadow max-w-2xl animate-fade-in">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-tea-dark">
               <Settings size={24} /> Settings
             </h3>
             <div className="space-y-4">
                <h4 className="font-bold text-lg text-gray-600 border-b pb-2">Invoice Details</h4>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Company Name</label>
                  <input 
                    className="w-full border p-3 rounded" 
                    value={settingsForm.companyName}
                    onChange={e => setSettingsForm({...settingsForm, companyName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Address Line 1</label>
                  <input 
                    className="w-full border p-3 rounded" 
                    value={settingsForm.addressLine1}
                    onChange={e => setSettingsForm({...settingsForm, addressLine1: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Address Line 2</label>
                  <input 
                    className="w-full border p-3 rounded" 
                    value={settingsForm.addressLine2}
                    onChange={e => setSettingsForm({...settingsForm, addressLine2: e.target.value})}
                  />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-1">GSTIN</label>
                      <input 
                        className="w-full border p-3 rounded" 
                        value={settingsForm.gstin}
                        onChange={e => setSettingsForm({...settingsForm, gstin: e.target.value})}
                      />
                    </div>
                     <div>
                      <label className="block text-sm font-bold text-gray-600 mb-1">Phone</label>
                      <input 
                        className="w-full border p-3 rounded" 
                        value={settingsForm.phone}
                        onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})}
                      />
                    </div>
                 </div>
                 <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Footer Note</label>
                  <textarea 
                    className="w-full border p-3 rounded" 
                    rows={3}
                    value={settingsForm.footerNote}
                    onChange={e => setSettingsForm({...settingsForm, footerNote: e.target.value})}
                  />
                </div>
                
                {/* PAYMENT SETTINGS SECTION */}
                <div className="mt-8 border-t pt-6">
                   <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-600 border-b pb-2">
                     <CreditCard size={20} /> Payment Gateway Settings
                   </h4>
                   <div>
                      <label className="block text-sm font-bold text-gray-600 mb-1">Razorpay Key ID (Public Key)</label>
                      <input 
                        className="w-full border p-3 rounded font-mono text-sm bg-gray-50" 
                        value={paymentForm.razorpayKeyId}
                        onChange={e => setPaymentForm({...paymentForm, razorpayKeyId: e.target.value})}
                        placeholder="rzp_test_..."
                      />
                      <p className="text-xs text-gray-500 mt-1">This key is used to initiate payments on the checkout page.</p>
                   </div>
                </div>

                <div className="pt-4 flex justify-end">
                   <button 
                    onClick={() => {
                       updateInvoiceSettings(settingsForm);
                       updatePaymentSettings(paymentForm);
                       alert("Settings saved successfully!");
                    }}
                    className="bg-tea-green text-white font-bold py-3 px-8 rounded hover:bg-tea-dark flex items-center gap-2"
                   >
                     <Save size={20} /> Save All Settings
                   </button>
                </div>
             </div>
          </div>
        )}
        
        {/* Manual Order Modal */}
        {showManualOrder && (
          <ManualOrderForm 
            products={products} 
            users={users} 
            onClose={() => setShowManualOrder(false)} 
            onSubmit={(order) => {
              addOrder(order);
              setShowManualOrder(false);
              setViewInvoice(order); // Show invoice immediately after creation
            }} 
          />
        )}

        {/* Purchase Order Modal */}
        {showPOForm && (
          <PurchaseOrderForm 
            products={products}
            onClose={() => setShowPOForm(false)}
            onSubmit={(po) => {
              addPurchaseOrder(po);
              setShowPOForm(false);
            }}
          />
        )}

        {/* Add User Modal */}
        {showAddUser && (
          <AddUserForm 
            onClose={() => setShowAddUser(false)}
            onSubmit={(u) => {
              addUser(u);
              setShowAddUser(false);
            }}
          />
        )}

        {/* Invoice Modal - ADDED */}
        {viewInvoice && (
          <InvoiceTemplate order={viewInvoice} onClose={() => setViewInvoice(null)} />
        )}
      </div>
    );
  }

  // --- DISTRIBUTOR & CUSTOMER VIEW ---
  const myOrders = orders.filter(o => o.userId === user.id);
  const isDistributor = user.role === 'DISTRIBUTOR';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hello Header */}
      <div className="bg-gradient-to-r from-tea-dark to-tea-green text-white p-6 md:p-10 rounded-2xl shadow-lg mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Hello, {user.name}</h1>
          <p className="opacity-90">
             {isDistributor ? `Distributor Panel | Territory: ${user.territory || 'Unassigned'}` : 'Welcome to Amrit Assam Tea Store'}
          </p>
          {isDistributor && (
            <div className="mt-4 inline-block bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 text-sm font-bold text-tea-gold">
               Wholesale Pricing Enabled
            </div>
          )}
        </div>
         <Package className="absolute right-[-20px] bottom-[-40px] text-white/10 w-64 h-64" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Orders */}
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4 text-tea-dark flex items-center gap-2">
            <FileText size={20} /> Order History
          </h2>
          
          {myOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-lg border-2 border-dashed border-gray-300 text-center text-gray-500">
              <Package size={48} className="mx-auto mb-4 opacity-20" />
              <p>You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map(order => (
                <div key={order.id} className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-wrap justify-between items-start mb-4 border-b pb-3 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{order.id}</span>
                        {order.invoiceNumber && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">Inv: {order.invoiceNumber}</span>}
                      </div>
                      <span className="text-gray-500 text-xs">{order.date}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                      <span className={`text-xs font-bold ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-500'}`}>
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm items-center">
                        <div className="flex items-center gap-2">
                           <div className="bg-gray-100 w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-gray-500">{item.quantity}x</div>
                           <span className="text-gray-700">{item.name} <span className="text-xs text-gray-400">({item.weight})</span></span>
                        </div>
                        <span className="font-medium">₹{((isDistributor ? item.distributorPrice : item.mrp) * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 -mx-5 -mb-5 p-4 rounded-b-lg flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                    <div className="text-sm text-gray-500">
                       Method: <span className="font-bold text-gray-700">{order.paymentMethod}</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-xl font-bold text-tea-dark">Total: ₹{order.totalAmount}</span>
                       <button 
                        onClick={() => setViewInvoice(order)}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 shadow-sm"
                       >
                         <Printer size={14} /> Invoice
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Right: Info Panel (Desktop only usually, but stacked on mobile) */}
        {isDistributor && (
            <div className="lg:w-80 space-y-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded text-center">
                            <div className="text-2xl font-bold text-tea-green">{myOrders.length}</div>
                            <div className="text-xs text-gray-500">Total Orders</div>
                        </div>
                         <div className="bg-gray-50 p-3 rounded text-center">
                            <div className="text-2xl font-bold text-tea-green">₹{myOrders.reduce((a,b) => a + b.totalAmount, 0).toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Total Spend</div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-tea-gold/10 p-6 rounded-lg border border-tea-gold/30">
                  <h3 className="font-bold text-tea-dark mb-2">Need Stock Urgently?</h3>
                  <p className="text-sm text-gray-600 mb-4">Call the priority distributor line for bulk dispatch.</p>
                  <button className="w-full bg-tea-dark text-white font-bold py-2 rounded shadow hover:bg-black transition">
                      Call +91 93242 70409
                  </button>
                </div>
            </div>
        )}
      </div>

      {/* Invoice Modal */}
      {viewInvoice && (
        <InvoiceTemplate order={viewInvoice} onClose={() => setViewInvoice(null)} />
      )}
    </div>
  );
};

// Helper Icon
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);