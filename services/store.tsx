import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Product, CartItem, Order, Role, InvoiceSettings, PurchaseOrder, PaymentSettings, Review, BrandAssets } from '../types';
import { PRODUCTS, MOCK_USERS, MOCK_ORDERS, MOCK_PURCHASE_ORDERS, MOCK_REVIEWS } from '../constants';

interface StoreContextType {
  user: User | null;
  products: Product[];
  orders: Order[];
  purchaseOrders: PurchaseOrder[];
  cart: CartItem[];
  users: User[]; 
  reviews: Review[];
  invoiceSettings: InvoiceSettings;
  paymentSettings: PaymentSettings;
  brandAssets: BrandAssets;
  login: (mobile: string, password: string, role: Role) => boolean;
  logout: () => void;
  register: (name: string, mobile: string, password: string, role: Role, territory?: string) => void;
  addUser: (user: User) => void; 
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (paymentMethod: 'UPI' | 'Card' | 'COD', address: string, paymentStatus?: 'Pending' | 'Paid', transactionId?: string) => void;
  deleteOrder: (orderId: string) => void;
  addOrder: (order: Order) => void; 
  addPurchaseOrder: (po: PurchaseOrder) => void;
  deletePurchaseOrder: (poId: string) => void;
  receivePurchaseOrder: (poId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updatePaymentStatus: (orderId: string, status: Order['paymentStatus']) => void;
  approveDistributor: (userId: string) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addProduct: (product: Product) => void;
  updateStock: (productId: string, newStock: number) => void;
  updateInvoiceSettings: (settings: InvoiceSettings) => void;
  updatePaymentSettings: (settings: PaymentSettings) => void;
  updateBrandAssets: (assets: BrandAssets) => void;
  addReview: (review: Review) => void;
  clearOnlineOrders: () => void;
  updateUserPassword: (userId: string, newPassword: string) => void; // Added
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  companyName: 'Amrit Assam Gold Tea',
  email: 'support@amritassam.com',
  addressLine1: 'Office No. 45, Grain Market, APMC Vashi',
  addressLine2: 'Navi Mumbai - 400705',
  gstin: '27AAAAA0000A1Z5',
  phone: '', 
  footerNote: 'Thank you for choosing Amrit Assam Gold Tea. Goods once sold will not be taken back.'
};

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  razorpayKeyId: 'rzp_test_1DP5mmOlF5G5ag'
};

const DEFAULT_BRAND_ASSETS: BrandAssets = {
  logo: null, // Null means use default Icon
  heroImage: 'https://picsum.photos/seed/teafield/1600/900',
  featureImage: 'https://picsum.photos/seed/teamaking/600/400'
};

export const StoreProvider = ({ children }: React.PropsWithChildren<{}>) => {
  // Use sessionStorage for user to clear on browser close
  const [user, setUser] = useState<User | null>(() => {
    const s = sessionStorage.getItem('amrit_user');
    return s ? JSON.parse(s) : null;
  });
  
  const [products, setProducts] = useState<Product[]>(() => {
    const s = localStorage.getItem('amrit_products');
    return s ? JSON.parse(s) : PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const s = localStorage.getItem('amrit_orders');
    return s ? JSON.parse(s) : MOCK_ORDERS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const s = localStorage.getItem('amrit_purchase_orders');
    return s ? JSON.parse(s) : MOCK_PURCHASE_ORDERS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const s = localStorage.getItem('amrit_users_db');
    return s ? JSON.parse(s) : MOCK_USERS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const s = localStorage.getItem('amrit_reviews');
    return s ? JSON.parse(s) : MOCK_REVIEWS;
  });

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(() => {
    const s = localStorage.getItem('amrit_invoice_settings');
    return s ? JSON.parse(s) : DEFAULT_INVOICE_SETTINGS;
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
    const s = localStorage.getItem('amrit_payment_settings');
    return s ? JSON.parse(s) : DEFAULT_PAYMENT_SETTINGS;
  });

  const [brandAssets, setBrandAssets] = useState<BrandAssets>(() => {
    const s = localStorage.getItem('amrit_brand_assets');
    return s ? JSON.parse(s) : DEFAULT_BRAND_ASSETS;
  });

  const [cart, setCart] = useState<CartItem[]>([]);

  // LocalStorage persistance for Database items
  useEffect(() => localStorage.setItem('amrit_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('amrit_orders', JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem('amrit_purchase_orders', JSON.stringify(purchaseOrders)), [purchaseOrders]);
  useEffect(() => localStorage.setItem('amrit_users_db', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('amrit_reviews', JSON.stringify(reviews)), [reviews]);
  useEffect(() => localStorage.setItem('amrit_invoice_settings', JSON.stringify(invoiceSettings)), [invoiceSettings]);
  useEffect(() => localStorage.setItem('amrit_payment_settings', JSON.stringify(paymentSettings)), [paymentSettings]);
  useEffect(() => localStorage.setItem('amrit_brand_assets', JSON.stringify(brandAssets)), [brandAssets]);

  // SessionStorage for User Session
  useEffect(() => {
    if (user) sessionStorage.setItem('amrit_user', JSON.stringify(user));
    else sessionStorage.removeItem('amrit_user');
  }, [user]);

  // Inactivity Timer (5 Minutes)
  useEffect(() => {
    if (!user) return;

    let inactivityTimer: any;
    const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 Minutes

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        logout();
        alert("Session expired due to inactivity.");
      }, TIMEOUT_DURATION);
    };

    // Listeners for activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    // Initial start
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [user]);

  const login = (mobile: string, password: string, role: Role): boolean => {
    const foundUser = users.find(u => u.mobile === mobile && u.role === role);
    if (foundUser) {
      if (foundUser.password !== password) {
        alert("Incorrect password.");
        return false;
      }
      if (role === 'DISTRIBUTOR' && !foundUser.approved) {
        alert("Your distributor account is pending approval.");
        return false;
      }
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    sessionStorage.removeItem('amrit_user');
  };

  const register = (name: string, mobile: string, password: string, role: Role, territory?: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      mobile,
      password,
      role,
      approved: role !== 'DISTRIBUTOR',
      territory,
      address: '',
      gstNumber: ''
    };
    setUsers([...users, newUser]);
    if (newUser.approved) {
      setUser(newUser);
    } else {
      alert("Registration successful! Please wait for Admin approval.");
    }
  };

  const addUser = (newUser: User) => {
    if (users.some(u => u.mobile === newUser.mobile)) {
        alert("User with this mobile number already exists!");
        return;
    }
    if (!newUser.password) newUser.password = '123456';
    setUsers([...users, newUser]);
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const placeOrder = (paymentMethod: 'UPI' | 'Card' | 'COD', address: string, paymentStatus: 'Pending' | 'Paid' = 'Pending', transactionId?: string) => {
    if (!user) return;

    for (const item of cart) {
      const product = products.find(p => p.id === item.id);
      if (product && product.stock < item.quantity) {
        alert(`Insufficient stock for ${item.name}. Available: ${product.stock}`);
        return;
      }
    }
    
    const subTotal = cart.reduce((sum, item) => {
      const price = user.role === 'DISTRIBUTOR' ? item.distributorPrice : item.mrp;
      return sum + (price * item.quantity);
    }, 0);
    
    const taxRate = 0.05; 
    const taxAmount = subTotal * taxRate;
    const totalAmount = subTotal + taxAmount;

    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      userId: user.id,
      userName: user.name,
      userAddress: address,
      items: [...cart],
      totalAmount: Math.round(totalAmount),
      taxAmount: Math.round(taxAmount),
      status: 'Processing',
      paymentMethod,
      paymentStatus: paymentStatus,
      transactionId: transactionId,
      date: new Date().toISOString().split('T')[0],
      type: user.role === 'DISTRIBUTOR' ? 'WHOLESALE' : 'RETAIL',
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
    };

    const updatedProducts = products.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });

    setProducts(updatedProducts);
    setOrders([newOrder, ...orders]);
    clearCart();
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
  };

  const addOrder = (order: Order) => {
    const updatedProducts = products.map(p => {
      const item = order.items.find(i => i.id === p.id);
      if (item) {
        return { ...p, stock: p.stock - item.quantity };
      }
      return p;
    });
    setProducts(updatedProducts);
    setOrders([order, ...orders]);
  };

  const addPurchaseOrder = (po: PurchaseOrder) => {
    setPurchaseOrders([po, ...purchaseOrders]);
  };

  const deletePurchaseOrder = (poId: string) => {
    setPurchaseOrders(prevPOs => prevPOs.filter(p => p.id !== poId));
  };

  const receivePurchaseOrder = (poId: string) => {
    const poIndex = purchaseOrders.findIndex(p => p.id === poId);
    if (poIndex === -1) return;
    
    const po = purchaseOrders[poIndex];
    if (po.status === 'Received') return;

    const updatedPO = { ...po, status: 'Received' as const };
    const updatedPOs = [...purchaseOrders];
    updatedPOs[poIndex] = updatedPO;
    setPurchaseOrders(updatedPOs);

    // Update Stocks
    const updatedProducts = [...products];
    po.items.forEach(item => {
      const prodIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (prodIndex > -1) {
        updatedProducts[prodIndex] = {
           ...updatedProducts[prodIndex],
           stock: updatedProducts[prodIndex].stock + item.quantity
        };
      }
    });
    setProducts(updatedProducts);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const updatePaymentStatus = (orderId: string, status: Order['paymentStatus']) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: status } : o));
  };

  const approveDistributor = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, approved: true } : u));
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const addProduct = (newProduct: Product) => {
    setProducts([...products, newProduct]);
  };

  const updateStock = (productId: string, newStock: number) => {
    setProducts(products.map(p => p.id === productId ? { ...p, stock: newStock } : p));
  };

  const updateInvoiceSettings = (settings: InvoiceSettings) => {
    setInvoiceSettings(settings);
  };
  
  const updatePaymentSettings = (settings: PaymentSettings) => {
    setPaymentSettings(settings);
  };

  const updateBrandAssets = (assets: BrandAssets) => {
    setBrandAssets(assets);
  }

  const addReview = (review: Review) => {
    setReviews([review, ...reviews]);
  };

  const clearOnlineOrders = () => {
    // Delete all orders where paymentMethod is NOT 'COD'
    setOrders(prevOrders => prevOrders.filter(o => o.paymentMethod === 'COD'));
  };

  const updateUserPassword = (userId: string, newPassword: string) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, password: newPassword } : u));
    if (user && user.id === userId) {
        setUser({ ...user, password: newPassword });
    }
  };

  return (
    <StoreContext.Provider value={{
      user, products, orders, purchaseOrders, cart, users, reviews, invoiceSettings, paymentSettings, brandAssets,
      login, logout, register, addUser, addToCart, removeFromCart, clearCart,
      placeOrder, deleteOrder, addOrder, addPurchaseOrder, deletePurchaseOrder, receivePurchaseOrder,
      updateOrderStatus, updatePaymentStatus, approveDistributor, 
      updateProduct, deleteProduct, addProduct, updateStock, updateInvoiceSettings, updatePaymentSettings, updateBrandAssets,
      addReview, clearOnlineOrders, updateUserPassword
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};