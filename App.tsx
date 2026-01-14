
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  User, 
  ArrowLeft, 
  Star, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Sparkles,
  Loader2,
  Bell,
  Navigation,
  MoreHorizontal,
  Send,
  X,
  Filter,
  ArrowUpDown,
  Wallet,
  Smartphone,
  CreditCard as CardIcon,
  AlertTriangle,
  Trash2,
  Wallet2,
  Receipt,
  Heart,
  Trophy,
  SlidersHorizontal,
  Check,
  Calendar,
  Map,
  Banknote,
  ChevronDown,
  Edit2,
  Camera,
  Mail,
  Home as HomeIcon,
  Briefcase,
  Plus,
  Lock,
  Phone,
  Eye,
  EyeOff,
  LogOut,
  RefreshCcw,
  ShieldAlert,
  FileText,
  UserCheck,
  Package,
  Layers,
  Tag,
  Info,
  ExternalLink,
  ShoppingBag,
  Image as ImageIcon,
  Compass,
  ShoppingCart,
  Minus,
  Truck,
  Percent,
  CircleDollarSign,
  ArrowRightLeft,
  History,
  ShieldEllipsis,
  ShieldHalf,
  Landmark,
  FileDown,
  CircleDot,
  Flag,
  ThumbsUp,
  Award,
  Paperclip,
  File as FileIcon,
  BarChart3,
  Settings,
  Store,
  TrendingUp,
  DollarSign,
  PlusCircle,
  Shield,
  Users,
  AlertCircle,
  FileSignature,
  PieChart,
  LifeBuoy,
  Key,
  Database,
  Fingerprint,
  Zap,
  Activity,
  Cpu,
  Globe,
  Server,
  Cloud,
  Scale,
  Handshake,
  ShieldQuestion,
  ArrowUpRight,
  TrendingDown,
  ShieldX,
  Ban,
  UserPlus,
  HardDrive,
  Network
} from 'lucide-react';
import { CATEGORIES, MOCK_PROVIDERS, MOCK_PRODUCTS } from './constants';
import { Category, Provider, Order, OrderStatus, SmartSuggestion, Message, PaymentMethod, PaymentType, ProviderStatus, UserProfile, DeliveryAddress, AddressType, UserRole, Product, ProductType, Variation, CartItem, PromoCode, WalletTransaction, EscrowStatus, Review, Attachment, MarketStats, SupportTicket, ReportReason, NodeHealth } from './types';
import { analyzeTask } from './services/geminiService';
import { GoogleGenAI } from "@google/genai";

type ViewMode = 'buyer' | 'seller' | 'admin';
type Screen = 'auth' | 'home' | 'service-form' | 'provider-selection' | 'order-summary' | 'tracking' | 'profile' | 'inventory' | 'cart' | 'checkout-success' | 'wallet' | 'transactions' | 'details' | 'chat' | 'seller-dashboard' | 'add-product' | 'admin-dashboard' | 'user-management' | 'seller-approvals' | 'product-moderation' | 'platform-settings' | 'security-settings' | 'two-factor-auth' | 'system-health' | 'legal';

type PolicyType = 'terms' | 'privacy' | 'refund' | 'agreement';

const PAYMENT_OPTIONS: PaymentMethod[] = [
  { id: 'p1', type: 'wallet', label: 'Virtual Wallet', icon: '💰' },
  { id: 'p2', type: 'gateway', gateway: 'stripe', label: 'Stripe Pay', icon: '💳' },
  { id: 'p3', type: 'gateway', gateway: 'paypal', label: 'PayPal', icon: '🅿️' },
  { id: 'p4', type: 'gateway', gateway: 'razorpay', label: 'Razorpay', icon: '🇮🇳' },
  { id: 'p5', type: 'cod', label: 'Cash on Delivery', icon: '💵' },
];

const INITIAL_NODES: NodeHealth[] = [
  { id: 'n1', name: 'Auth Cluster (Global)', status: 'healthy', load: 12, uptime: '99.9%' },
  { id: 'n2', name: 'Market Gateway (US-West)', status: 'healthy', load: 45, uptime: '100%' },
  { id: 'n3', name: 'Payment Engine (E2EE)', status: 'warning', load: 88, uptime: '98.4%' },
  { id: 'n4', name: 'Messaging Node (WS)', status: 'healthy', load: 5, uptime: '100%' },
  { id: 'n5', name: 'Gemini AI Proxy', status: 'healthy', load: 24, uptime: '99.9%' },
];

const INITIAL_ADMIN: UserProfile = {
  id: 'admin1',
  name: "Nexa Supervisor",
  email: "admin@nexai.market",
  phoneNumber: "+1 (800) ADMIN",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  memberSince: "Since Launch",
  membershipType: "System Admin",
  role: 'admin',
  isVerified: true,
  verificationStatus: 'verified',
  walletBalance: 99999.00,
  transactions: [],
  twoFactorEnabled: true,
  privacyConsentDate: new Date().toISOString()
};

const DEFAULT_USER: UserProfile = {
  id: 'u2',
  name: "Jessica W.",
  email: "jessica@example.com",
  phoneNumber: "+1 (555) 0123",
  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
  memberSince: "Dec 2023",
  membershipType: "Premium Member",
  role: 'buyer',
  isVerified: true,
  verificationStatus: 'verified',
  walletBalance: 240.00,
  transactions: [],
  twoFactorEnabled: false,
  sellerStats: {
    views: 1240,
    clicks: 450,
    salesCount: 24,
    revenue: 4200.00
  }
};

const INITIAL_MARKET_STATS: MarketStats = {
  totalRevenue: 452800.00,
  totalUsers: 1542,
  activeOrders: 124,
  platformCommission: 12,
  cdnStatus: 'active',
  rateLimit: 100,
  nodes: INITIAL_NODES
};

const TAX_RATE = 0.0825;
const SHIPPING_BASE = 5.99;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('buyer');
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [taskDescription, setTaskDescription] = useState('');
  const [address, setAddress] = useState('123 Market St, San Francisco, CA 94103');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<SmartSuggestion | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PAYMENT_OPTIONS[0]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [providers, setProviders] = useState<Provider[]>(MOCK_PROVIDERS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Order | null>(null);
  const [reviewModalOrder, setReviewModalOrder] = useState<Order | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{type: 'product' | 'provider', data: Product | Provider} | null>(null);
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [marketStats, setMarketStats] = useState<MarketStats>(INITIAL_MARKET_STATS);
  const [showGdpr, setShowGdpr] = useState(true);
  const [reportModalTarget, setReportModalTarget] = useState<any>(null);
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);

  const handleNavigate = (screen: Screen) => {
    setIsLoadingContent(true);
    setCurrentScreen(screen);
    setTimeout(() => setIsLoadingContent(false), 800);
  };

  useEffect(() => {
    const savedOrders = localStorage.getItem('nexai_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    const savedProfile = localStorage.getItem('nexai_profile');
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    const savedCart = localStorage.getItem('nexai_cart');
    if (savedCart) setCartItems(JSON.parse(savedCart));
    const gdprDismissed = localStorage.getItem('nexai_gdpr');
    if (gdprDismissed) setShowGdpr(false);
  }, []);

  useEffect(() => { localStorage.setItem('nexai_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('nexai_profile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('nexai_cart', JSON.stringify(cartItems)); }, [cartItems]);

  const handleLogout = () => { setIsLoggedIn(false); setViewMode('buyer'); handleNavigate('auth'); };
  const handleLogin = () => { 
    if (userProfile.twoFactorEnabled) {
      handleNavigate('two-factor-auth');
    } else {
      setIsLoggedIn(true); 
      handleNavigate('home'); 
    }
  };

  const handleSendMessage = async (text: string, attachment?: Attachment) => {
    if (!activeChatOrder) return;
    const userMessage: Message = { id: Math.random().toString(36).substr(2, 9), senderId: userProfile.id, senderName: userProfile.name, text, timestamp: new Date().toISOString(), attachment };
    const updatedOrder = { ...activeChatOrder, messages: [...activeChatOrder.messages, userMessage] };
    setOrders(prev => prev.map(o => o.id === activeChatOrder.id ? updatedOrder : o));
    setActiveChatOrder(updatedOrder);

    if (text || attachment) {
      setIsAiTyping(true);
      try {
        const provider = providers.find(p => p.id === activeChatOrder.providerId) || providers[0];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `You are ${provider.name}, professional on NexaAi. Buyer sent: "${text || 'Attachment'}". Order: ${activeChatOrder.category}. Reply professionally.`,
        });
        const aiMessage: Message = { id: Math.random().toString(36).substr(2, 9), senderId: provider.id, senderName: provider.name, text: response.text || "Working on it.", timestamp: new Date().toISOString(), isProvider: true };
        setTimeout(() => {
          setOrders(prev => prev.map(o => {
            if (o.id === activeChatOrder.id) {
              const newer = { ...o, messages: [...o.messages, aiMessage] };
              if (activeChatOrder?.id === o.id) setActiveChatOrder(newer);
              return newer;
            }
            return o;
          }));
          setIsAiTyping(false);
        }, 1200);
      } catch (err) { setIsAiTyping(false); }
    }
  };

  const goHome = () => { 
    setSelectedCategory(null); setTaskDescription(''); setSuggestion(null); setSelectedEntity(null); setActiveChatOrder(null); 
    if (viewMode === 'buyer') handleNavigate('home');
    else if (viewMode === 'seller') handleNavigate('seller-dashboard');
    else handleNavigate('admin-dashboard');
  };

  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o));
    alert(`Order #${orderId} marked as ${newStatus}`);
  };

  const handleAddProduct = (name: string, price: number, stock: number) => {
    const newProduct: Product = {
      id: `prd-${Date.now()}`,
      sellerId: userProfile.id,
      name,
      price,
      stock,
      description: 'Newly added professional tool.',
      category: 'other',
      tags: ['new'],
      type: 'physical',
      images: ['https://picsum.photos/seed/newproduct/400'],
      variations: [],
      createdAt: new Date().toISOString(),
      reviews: [],
      rating: 0
    };
    setProducts([newProduct, ...products]);
    handleNavigate('inventory');
  };

  if (!isLoggedIn && currentScreen !== 'two-factor-auth' && currentScreen !== 'auth') return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="max-w-md mx-auto bg-[#F2F2F2] min-h-screen shadow-xl relative overflow-hidden flex flex-col font-sans text-gray-900">
      {showGdpr && <GdprBanner onDismiss={() => { setShowGdpr(false); localStorage.setItem('nexai_gdpr', 'true'); }} />}
      
      <header className={`sticky top-0 z-30 transition-all ${currentScreen === 'home' || currentScreen === 'seller-dashboard' || currentScreen === 'admin-dashboard' ? 'bg-[#ffc244] py-6' : 'bg-white py-4 border-b border-gray-100'}`}>
        <div className="px-6 flex items-center justify-between">
          {currentScreen === 'home' || currentScreen === 'seller-dashboard' || currentScreen === 'admin-dashboard' ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-black/60">
                <ShieldCheck className="w-3 h-3 text-black/80" /> {viewMode === 'buyer' ? 'Edge Optimized' : viewMode === 'seller' ? 'Cluster Node' : 'Root Control'}
              </div>
              <button className="flex items-center gap-1 font-bold text-black text-sm">
                {viewMode === 'buyer' ? '123 Market St, SF' : viewMode === 'seller' ? 'Partner Interface' : 'Infrastructure Master'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => goHome()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <div className="flex items-center gap-3">
            {viewMode === 'buyer' && (
              <button onClick={() => handleNavigate('wallet')} className="bg-black/10 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 transition-transform active:scale-95">
                 <Wallet className="w-4 h-4" />
                 <span className="text-[10px] font-black">${userProfile.walletBalance.toFixed(0)}</span>
              </button>
            )}
            <button onClick={() => handleNavigate('cart')} className="relative p-2 bg-white rounded-xl shadow-sm border border-gray-100 transition-transform active:scale-95">
              <ShoppingCart className="w-5 h-5 text-gray-900" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</span>}
            </button>
            <button onClick={() => handleNavigate('profile')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
              <img src={userProfile.avatar} className="w-full h-full object-cover" alt="Profile" />
            </button>
          </div>
        </div>
      </header>

      <main className={`flex-1 overflow-y-auto pb-32 ${currentScreen === 'home' || currentScreen === 'seller-dashboard' || currentScreen === 'admin-dashboard' ? '-mt-4 rounded-t-[2.5rem] bg-[#F2F2F2] pt-8' : (currentScreen === 'chat' ? 'pt-0' : 'pt-4')}`}>
        <div className={currentScreen === 'chat' ? '' : 'px-6'}>
          {currentScreen === 'home' && (
            <HomeScreen 
              onSelect={(cat: Category) => { setSelectedCategory(cat); handleNavigate('service-form'); }} 
              onSeeEntity={(type: 'product' | 'provider', data: Product | Provider) => { setSelectedEntity({type, data}); handleNavigate('details'); }} 
              providers={providers} 
              products={products} 
              isLoading={isLoadingContent}
              onAddToCart={(id: string) => {
                setCartItems(prev => {
                  const existing = prev.find(item => item.productId === id);
                  if (existing) return prev.map(item => item.productId === id ? { ...item, quantity: item.quantity + 1 } : item);
                  return [...prev, { productId: id, quantity: 1 }];
                });
              }} 
            />
          )}

          {currentScreen === 'two-factor-auth' && <TwoFactorScreen onVerify={() => { setIsLoggedIn(true); handleNavigate('home'); }} />}
          {currentScreen === 'security-settings' && <SecuritySettingsScreen userProfile={userProfile} onUpdateProfile={(p: any) => setUserProfile({ ...userProfile, ...p })} onBack={() => handleNavigate('profile')} />}
          
          {currentScreen === 'seller-dashboard' && (
            <SellerDashboardScreen 
              stats={userProfile.sellerStats!} 
              onInventory={() => handleNavigate('inventory')} 
              onEarnings={() => handleNavigate('wallet')} 
              onSeeOrders={() => handleNavigate('tracking')} 
            />
          )}
          
          {currentScreen === 'admin-dashboard' && (
            <AdminDashboardScreen 
              marketStats={marketStats} 
              onUserManagement={() => handleNavigate('user-management')}
              onSellerApprovals={() => handleNavigate('seller-approvals')}
              onProductModeration={() => handleNavigate('product-moderation')}
              onPlatformSettings={() => handleNavigate('platform-settings')}
              onSystemHealth={() => handleNavigate('system-health')}
            />
          )}

          {currentScreen === 'system-health' && <SystemHealthScreen stats={marketStats} onBack={() => handleNavigate('admin-dashboard')} />}
          {currentScreen === 'user-management' && <UserManagementScreen onBack={() => handleNavigate('admin-dashboard')} />}
          {currentScreen === 'seller-approvals' && <SellerApprovalsScreen onBack={() => handleNavigate('admin-dashboard')} />}
          {currentScreen === 'product-moderation' && <ProductModerationScreen products={products} onFlag={(id: string) => setProducts(prev => prev.map(p => p.id === id ? { ...p, isFlagged: true } : p))} onDelete={(id: string) => setProducts(prev => prev.filter(p => p.id !== id))} onBack={() => handleNavigate('admin-dashboard')} />}
          {currentScreen === 'platform-settings' && <PlatformSettingsScreen stats={marketStats} onUpdate={(s: MarketStats) => setMarketStats(s)} onBack={() => handleNavigate('admin-dashboard')} />}

          {currentScreen === 'inventory' && <InventoryScreen products={products.filter(p => p.sellerId === userProfile.id)} onAdd={() => handleNavigate('add-product')} onUpdateStock={(id: string, stock: number) => setProducts(prev => prev.map(p => p.id === id ? { ...p, stock } : p))} />}
          {currentScreen === 'add-product' && <AddProductScreen onSubmit={handleAddProduct} />}

          {currentScreen === 'details' && selectedEntity && (
            <EntityDetailsScreen entity={selectedEntity} onReport={(target: any) => setReportModalTarget(target)} onAddToCart={(id: string) => {
              setCartItems(prev => {
                const existing = prev.find(item => item.productId === id);
                if (existing) return prev.map(item => item.productId === id ? { ...item, quantity: item.quantity + 1 } : item);
                return [...prev, { productId: id, quantity: 1 }];
              });
              alert("Added to cart!");
            }} onBookProvider={(p: Provider) => {
              setSelectedCategory(p.specialties[0]);
              handleNavigate('service-form');
            }} />
          )}

          {currentScreen === 'tracking' && <TrackingScreen orders={orders} onChat={(o: Order) => { setActiveChatOrder(o); handleNavigate('chat'); }} onUpdateStatus={handleUpdateOrderStatus} viewMode={viewMode} products={products} />}
          {currentScreen === 'chat' && activeChatOrder && <ChatScreen order={activeChatOrder} provider={providers.find(p => p.id === (viewMode === 'buyer' ? activeChatOrder.providerId : userProfile.id)) || providers[0]} onSendMessage={handleSendMessage} isTyping={isAiTyping} />}
          {currentScreen === 'wallet' && <WalletScreen balance={userProfile.walletBalance} onTopup={() => {}} onSeeTransactions={() => handleNavigate('transactions')} />}
          {currentScreen === 'cart' && <CartScreen items={cartItems} products={products} onCheckout={() => handleNavigate('order-summary')} promo={appliedPromo} onApplyPromo={setAppliedPromo} />}
          
          {currentScreen === 'order-summary' && <CheckoutScreen items={cartItems} products={products} paymentMethod={selectedPaymentMethod} onSelectPayment={setSelectedPaymentMethod} walletBalance={userProfile.walletBalance} onPlaceOrder={(total: number) => {
             const now = new Date().toISOString();
             const newO: Order = { id: Math.random().toString(36).substr(2, 6).toUpperCase(), category: selectedCategory || 'product_order', description: taskDescription || 'New Order', buyerId: userProfile.id, buyerName: userProfile.name, status: OrderStatus.PENDING, escrowStatus: 'held', createdAt: now, updatedAt: now, price: total, address: '123 Market St, SF', messages: [], paymentMethod: selectedPaymentMethod, items: cartItems.length > 0 ? [...cartItems] : undefined };
             setOrders([newO, ...orders]);
             setCartItems([]);
             handleNavigate('checkout-success');
          }} />}

          {currentScreen === 'checkout-success' && <div className="py-20 text-center space-y-6"><div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-12 h-12 text-emerald-600" /></div><h2 className="text-3xl font-black uppercase tracking-tighter">Success!</h2><p className="text-gray-500 uppercase text-[10px] font-black tracking-widest">Secured in Nexa Escrow.</p><button onClick={() => handleNavigate('tracking')} className="bg-black text-[#ffc244] px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em]">Track Order</button></div>}
          {currentScreen === 'profile' && <ProfileScreen userProfile={userProfile} viewMode={viewMode} setViewMode={(v: ViewMode) => { setViewMode(v); handleNavigate(v === 'buyer' ? 'home' : v === 'seller' ? 'seller-dashboard' : 'admin-dashboard'); }} onLogout={handleLogout} onSeeOrders={() => handleNavigate('tracking')} onSeeWallet={() => handleNavigate('wallet')} onSeeSecurity={() => handleNavigate('security-settings')} onSeePolicy={setActivePolicy} />}
          {currentScreen === 'service-form' && <ServiceForm category={selectedCategory!} description={taskDescription} setDescription={setTaskDescription} onAnalyze={async () => { setIsAnalyzing(true); setSuggestion(await analyzeTask(taskDescription, selectedCategory || 'other')); setIsAnalyzing(false); }} isAnalyzing={isAnalyzing} suggestion={suggestion} onNext={() => handleNavigate('provider-selection')} />}
          {currentScreen === 'provider-selection' && <ProviderSelection providers={providers} onSelect={() => handleNavigate('order-summary')} />}
        </div>
      </main>

      {currentScreen !== 'chat' && currentScreen !== 'auth' && currentScreen !== 'two-factor-auth' && (
        <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-gray-100 px-10 py-4 flex justify-between items-center z-40 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <NavButton active={currentScreen === 'home' || currentScreen === 'seller-dashboard' || currentScreen === 'admin-dashboard'} onClick={goHome} icon={viewMode === 'buyer' ? <Search /> : viewMode === 'seller' ? <BarChart3 /> : <Shield />} label={viewMode === 'buyer' ? 'Explore' : viewMode === 'seller' ? 'Panel' : 'Admin'} />
          <NavButton active={currentScreen === 'tracking'} onClick={() => handleNavigate('tracking')} icon={<Clock />} label="Orders" />
          <NavButton active={currentScreen === 'profile'} onClick={() => handleNavigate('profile')} icon={<User />} label="Profile" />
        </nav>
      )}

      {viewingInvoice && <InvoiceOverlay order={viewingInvoice} onClose={() => setViewingInvoice(null)} products={products} />}
      {reviewModalOrder && <ReviewModal onClose={() => setReviewModalOrder(null)} onSubmit={() => {}} title="Leave Feedback" />}
      {reportModalTarget && <ReportModal target={reportModalTarget} onClose={() => setReportModalTarget(null)} onSubmit={() => { alert("Report submitted for review."); setReportModalTarget(null); }} />}
      {activePolicy && <PolicyOverlay type={activePolicy} onClose={() => setActivePolicy(null)} />}
    </div>
  );
}

// UI & Analytics Components

// Fix: Added missing AuthScreen component
const AuthScreen = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center space-y-10">
    <div className="w-24 h-24 bg-black rounded-[2.5rem] flex items-center justify-center shadow-2xl animate-bounce">
      <Zap className="w-12 h-12 text-[#ffc244]" />
    </div>
    <div className="space-y-4">
      <h1 className="text-5xl font-black tracking-tighter uppercase">NexaAi.</h1>
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em]">Next-Gen Resource Exchange</p>
    </div>
    <div className="w-full space-y-4">
      <button onClick={onLogin} className="w-full bg-black text-[#ffc244] py-8 rounded-[3rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl active:scale-95 transition-all">Establish Session</button>
      <button className="w-full bg-gray-50 text-gray-400 py-6 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest">Guest Terminal</button>
    </div>
  </div>
);

// Fix: Added missing GdprBanner component
const GdprBanner = ({ onDismiss }: { onDismiss: () => void }) => (
  <div className="fixed bottom-24 left-6 right-6 z-[100] bg-black text-white p-6 rounded-[2.5rem] shadow-2xl border border-white/10 flex items-center gap-6 animate-in slide-in-from-bottom duration-500">
    <div className="flex-1 space-y-1">
      <p className="text-[9px] font-black uppercase tracking-widest text-[#ffc244]">Compliance Sync</p>
      <p className="text-[10px] font-bold uppercase leading-tight">We use cookies to optimize your terminal experience and ensure E2EE integrity.</p>
    </div>
    <button onClick={onDismiss} className="bg-[#ffc244] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Acknowledge</button>
  </div>
);

// Fix: Added missing HomeScreen component
const HomeScreen = ({ onSelect, onSeeEntity, providers, products, isLoading, onAddToCart }: any) => {
  if (isLoading) return <div className="flex items-center justify-center py-40"><Loader2 className="w-10 h-10 text-black animate-spin" /></div>;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex bg-white p-2 rounded-[2.5rem] shadow-sm border border-gray-100">
        <Search className="w-5 h-5 ml-4 text-gray-400" />
        <input placeholder="Search assets..." className="flex-1 bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 px-4" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-xs font-black uppercase text-gray-400 tracking-[0.3em]">Sector Directory</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => onSelect(cat.id)} className="flex flex-col items-center gap-2 group">
              <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-2xl shadow-sm border border-black/5 group-active:scale-90 transition-all ${cat.color}`}>{cat.icon}</div>
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{cat.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end px-2">
           <h2 className="text-xs font-black uppercase text-gray-400 tracking-[0.3em]">Elite Nodes</h2>
           <button className="text-[8px] font-black uppercase text-[#ffc244] bg-black px-3 py-1 rounded-full">Explore All</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
          {providers.map((p: any) => (
            <div key={p.id} onClick={() => onSeeEntity('provider', p)} className="min-w-[200px] bg-white p-5 rounded-[3rem] border border-gray-100 shadow-sm space-y-4 active:scale-95 transition-transform cursor-pointer">
              <img src={p.avatar} className="w-full h-32 rounded-[2.5rem] object-cover" />
              <div className="space-y-1">
                <h4 className="font-black text-xs uppercase tracking-tight">{p.name}</h4>
                <div className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase tracking-widest">
                  <Star className="w-2 h-2 fill-current" /> {p.rating} • {p.completedTasks} Tasks
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end px-2">
           <h2 className="text-xs font-black uppercase text-gray-400 tracking-[0.3em]">Featured Assets</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {products.map((p: any) => (
            <div key={p.id} onClick={() => onSeeEntity('product', p)} className="bg-white p-5 rounded-[3rem] border border-gray-100 shadow-sm space-y-4 active:scale-95 transition-transform cursor-pointer">
               <img src={p.images[0]} className="w-full h-32 rounded-[2.5rem] object-cover bg-gray-50" />
               <div className="space-y-1">
                  <h4 className="font-black text-[10px] uppercase truncate tracking-tight">{p.name}</h4>
                  <p className="text-lg font-black tracking-tighter">${p.price}</p>
               </div>
               <button onClick={(e) => { e.stopPropagation(); onAddToCart(p.id); }} className="w-full bg-gray-50 text-black py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors">Acquire</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Fix: Added missing TwoFactorScreen component
const TwoFactorScreen = ({ onVerify }: { onVerify: () => void }) => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center space-y-10 animate-in slide-in-from-right duration-500">
     <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center"><Fingerprint className="w-10 h-10 text-blue-500" /></div>
     <div className="space-y-4">
        <h2 className="text-3xl font-black uppercase tracking-tighter">Identity Confirmation</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scan biometric or enter cluster token</p>
     </div>
     <div className="flex gap-3 justify-center">
        {[1, 2, 3, 4].map(i => <div key={i} className="w-14 h-16 bg-gray-50 rounded-2xl border-2 border-gray-100 flex items-center justify-center text-2xl font-black">•</div>)}
     </div>
     <button onClick={onVerify} className="w-full bg-black text-[#ffc244] py-8 rounded-[3rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl">Validate Node</button>
  </div>
);

// Fix: Added missing SecuritySettingsScreen component
const SecuritySettingsScreen = ({ userProfile, onUpdateProfile, onBack }: any) => (
  <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
    <div className="flex items-center gap-4">
       <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
       <h2 className="text-3xl font-black uppercase tracking-tighter">Security</h2>
    </div>

    <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
       <div className="p-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
             <div className="p-4 bg-blue-50 text-blue-600 rounded-[2rem]"><Fingerprint className="w-6 h-6" /></div>
             <div>
                <h4 className="text-sm font-black uppercase tracking-tight">Two-Factor (2FA)</h4>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Biometric Node Protection</p>
             </div>
          </div>
          <button onClick={() => onUpdateProfile({ twoFactorEnabled: !userProfile.twoFactorEnabled })} className={`w-14 h-8 rounded-full transition-colors relative ${userProfile.twoFactorEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}>
             <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${userProfile.twoFactorEnabled ? 'left-7' : 'left-1'}`} />
          </button>
       </div>
       <div className="p-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
             <div className="p-4 bg-purple-50 text-purple-600 rounded-[2rem]"><ShieldCheck className="w-6 h-6" /></div>
             <div>
                <h4 className="text-sm font-black uppercase tracking-tight">Identity Vault</h4>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Encrypted Document Storage</p>
             </div>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-200" />
       </div>
       <div className="p-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
             <div className="p-4 bg-amber-50 text-amber-600 rounded-[2rem]"><Database className="w-6 h-6" /></div>
             <div>
                <h4 className="text-sm font-black uppercase tracking-tight">Audit Log</h4>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Global Access History</p>
             </div>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-200" />
       </div>
    </div>
  </div>
);

// Fix: Added missing ServiceForm component
const ServiceForm = ({ category, description, setDescription, onAnalyze, isAnalyzing, suggestion, onNext }: any) => {
  const cat = CATEGORIES.find(c => c.id === category);
  return (
    <div className="space-y-10 animate-in slide-in-from-bottom duration-500 pb-20">
      <div className="flex flex-col items-center gap-4 py-6">
        <div className={`w-24 h-24 rounded-[3rem] flex items-center justify-center text-4xl shadow-2xl ${cat?.color}`}>{cat?.icon}</div>
        <h2 className="text-4xl font-black tracking-tighter uppercase">{cat?.title} Mission</h2>
      </div>

      <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100 space-y-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Mission Brief</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Describe the objective..." 
            className="w-full bg-gray-50 border-none rounded-[2.5rem] p-8 text-sm font-bold h-40 focus:ring-4 focus:ring-[#ffc244]/20 transition-all uppercase leading-relaxed" 
          />
        </div>

        <button 
          onClick={onAnalyze} 
          disabled={!description || isAnalyzing}
          className="w-full bg-black text-[#ffc244] py-8 rounded-[3rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
        >
          {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} 
          AI Protocol Optimization
        </button>

        {suggestion && (
          <div className="p-10 bg-emerald-50 rounded-[3rem] border border-emerald-100 space-y-6 animate-in zoom-in duration-300">
             <div className="flex items-center gap-3 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Refined Parameters</span>
             </div>
             <p className="text-sm font-bold text-emerald-900 uppercase leading-relaxed">{suggestion.refinedDescription}</p>
             <div className="flex justify-between items-center pt-4 border-t border-emerald-100">
                <span className="text-[9px] font-black uppercase text-emerald-600">Estimated Duration</span>
                <span className="text-xl font-black text-emerald-900">{suggestion.estimatedHours} HOURS</span>
             </div>
          </div>
        )}

        <button onClick={onNext} disabled={!description} className="w-full bg-black text-white py-8 rounded-[3rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl active:scale-95 transition-all disabled:opacity-30">Deploy Parameters</button>
      </div>
    </div>
  );
};

// Fix: Added missing ProviderSelection component
const ProviderSelection = ({ providers, onSelect }: any) => (
  <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
    <h2 className="text-3xl font-black px-2 tracking-tight uppercase leading-none">Elite Operators</h2>
    <div className="space-y-4">
      {providers.map((p: Provider) => (
        <div key={p.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 space-y-6 relative overflow-hidden group">
           <div className="flex items-center gap-6">
              <img src={p.avatar} className="w-20 h-20 rounded-[2.5rem] object-cover border-4 border-gray-50" />
              <div className="flex-1">
                 <h4 className="text-xl font-black uppercase tracking-tighter leading-none">{p.name}</h4>
                 <div className="flex items-center gap-2 mt-2">
                    <span className="text-[8px] font-black bg-[#ffc244] text-black px-2 py-0.5 rounded-full uppercase tracking-widest">Lvl {Math.floor(p.completedTasks/100)}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${p.pricePerHour}/HR</span>
                 </div>
              </div>
              <div className="text-right">
                 <div className="flex items-center gap-1 text-amber-500 text-lg font-black">
                    <Star className="w-5 h-5 fill-current" /> {p.rating}
                 </div>
                 <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">{p.completedTasks} Missions</p>
              </div>
           </div>
           <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed line-clamp-2">{p.bio}</p>
           <button onClick={() => onSelect(p)} className="w-full bg-black text-[#ffc244] py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-xl group-hover:bg-emerald-500 group-hover:text-white">Initialize Signal</button>
        </div>
      ))}
    </div>
  </div>
);

/**
 * SellerDashboardScreen: Optimized Analytics Command Center
 */
const SellerDashboardScreen = ({ stats, onInventory, onEarnings, onSeeOrders }: any) => {
  const volumeData = [12, 18, 15, 22, 30, 25, 38, 45, 42, 58];
  
  return (
    <div className="space-y-10 animate-in slide-in-from-bottom duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter uppercase">Nexus Stats.</h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Business Intelligence Node</p>
      </div>

      <div className="bg-black p-10 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
          <TrendingUp className="w-32 h-32 text-white" />
        </div>
        <div className="space-y-2 relative z-10">
          <p className="text-[10px] font-black uppercase text-[#ffc244] tracking-[0.4em]">Operational Revenue</p>
          <div className="flex items-end gap-3">
            <h2 className="text-6xl font-black text-white tracking-tighter">${stats.revenue.toLocaleString()}</h2>
            <div className="bg-[#ffc244] text-black px-3 py-1 rounded-full text-[9px] font-black uppercase mb-3 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +14%
            </div>
          </div>
        </div>
        <div className="flex gap-3 relative z-10">
          <div className="flex-1 bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10">
            <p className="text-[8px] font-black uppercase text-white/40 tracking-widest mb-1">In Escrow</p>
            <p className="text-lg font-black text-white">$1,240.50</p>
          </div>
          <div className="flex-1 bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10">
            <p className="text-[8px] font-black uppercase text-white/40 tracking-widest mb-1">Available</p>
            <p className="text-lg font-black text-[#ffc244]">$2,959.50</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Order Volume</h3>
            <p className="text-2xl font-black tracking-tight">Growth Trend</p>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">Bullish</span>
          </div>
        </div>
        <div className="h-24 w-full relative">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffc244" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ffc244" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path 
              d={`M 0,100 ${volumeData.map((d, i) => `L ${(i / (volumeData.length - 1)) * 100},${100 - (d / Math.max(...volumeData)) * 80}`).join(' ')} L 100,100 Z`} 
              fill="url(#chartGradient)"
            />
            <path 
              d={`M 0,${100 - (volumeData[0] / Math.max(...volumeData)) * 80} ${volumeData.map((d, i) => `L ${(i / (volumeData.length - 1)) * 100},${100 - (d / Math.max(...volumeData)) * 80}`).join(' ')}`} 
              fill="none" 
              stroke="#ffc244" 
              strokeWidth="4" 
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="flex justify-between text-[8px] font-black uppercase text-gray-300 tracking-widest pt-2">
          <span>Day 01</span>
          <span>Day 30</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.3em] px-2">Performance Matrix</h3>
        <div className="grid grid-cols-2 gap-4">
          <StatCard icon={<MessageSquare className="text-blue-500" />} label="Response" value="98%" color="bg-blue-50" trend="+2%" isUp={true} />
          <StatCard icon={<CheckCircle2 className="text-emerald-500" />} label="Completion" value="100%" color="bg-emerald-50" trend="0%" isUp={null} />
          <StatCard icon={<Star className="text-amber-500" />} label="Rating" value="4.9" color="bg-amber-50" trend="-0.1" isUp={false} />
          <StatCard icon={<Clock className="text-purple-500" />} label="Lead Time" value="2.4h" color="bg-purple-50" trend="-15m" isUp={true} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 pt-4">
        <DashboardAction icon={<Layers className="w-5 h-5" />} label="Inventory" onClick={onInventory} />
        <DashboardAction icon={<Wallet2 className="w-5 h-5" />} label="Wallet" onClick={onEarnings} />
        <DashboardAction icon={<ShoppingCart className="w-5 h-5" />} label="Orders" onClick={onSeeOrders} />
        <DashboardAction icon={<Settings className="w-5 h-5" />} label="Settings" onClick={() => {}} />
      </div>
    </div>
  );
};

/**
 * AdminDashboardScreen: High-level System Command Center
 */
const AdminDashboardScreen = ({ marketStats, onUserManagement, onSellerApprovals, onProductModeration, onPlatformSettings, onSystemHealth }: any) => (
  <div className="space-y-10 animate-in slide-in-from-bottom duration-500 pb-20">
    <div className="flex flex-col gap-2">
      <h1 className="text-4xl font-black tracking-tighter uppercase">Root.</h1>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Global Infrastructure Control</p>
    </div>

    <div className="grid grid-cols-1 gap-4">
      <div className="bg-black text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
           <Landmark className="w-48 h-48" />
        </div>
        <p className="text-[10px] font-black uppercase text-[#ffc244] tracking-[0.4em] mb-2">Network Gross Volume</p>
        <h2 className="text-5xl font-black tracking-tighter">${marketStats.totalRevenue.toLocaleString()}</h2>
        <div className="mt-8 flex gap-6 items-center">
           <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black uppercase">{marketStats.totalUsers} Nodes</span>
           </div>
           <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black uppercase">{marketStats.activeOrders} Missions</span>
           </div>
        </div>
      </div>
    </div>

    <div className="space-y-4">
       <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.3em] px-2">Management Protocols</h3>
       <div className="grid grid-cols-2 gap-4">
          <DashboardNavCard icon={<Users className="text-blue-500" />} label="Directory" desc="User & Node Auth" onClick={onUserManagement} color="bg-blue-50" />
          <DashboardNavCard icon={<UserCheck className="text-emerald-500" />} label="Onboarding" desc="Seller Verification" onClick={onSellerApprovals} color="bg-emerald-50" />
          <DashboardNavCard icon={<ShieldAlert className="text-rose-500" />} label="Moderation" desc="Audit Marketplace" onClick={onProductModeration} color="bg-rose-50" />
          <DashboardNavCard icon={<Activity className="text-[#ffc244]" />} label="System Health" desc="Cluster Performance" onClick={onSystemHealth} color="bg-yellow-50" />
       </div>
    </div>

    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex items-center justify-between group active:scale-95 transition-all cursor-pointer" onClick={onPlatformSettings}>
       <div className="flex items-center gap-6">
          <div className="p-4 bg-gray-900 text-[#ffc244] rounded-[2rem]"><Settings className="w-6 h-6" /></div>
          <div>
             <h4 className="text-sm font-black uppercase tracking-tight">Platform Protocols</h4>
             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Commission & Global Limits</p>
          </div>
       </div>
       <ChevronRight className="w-6 h-6 text-gray-200 group-hover:text-black transition-colors" />
    </div>
  </div>
);

const DashboardNavCard = ({ icon, label, desc, onClick, color }: any) => (
  <button onClick={onClick} className={`p-8 rounded-[3rem] ${color} text-left space-y-4 border border-black/5 shadow-sm active:scale-95 transition-all group`}>
     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
     <div>
        <h4 className="text-sm font-black uppercase tracking-tight leading-none">{label}</h4>
        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">{desc}</p>
     </div>
  </button>
);

const SystemHealthScreen = ({ stats, onBack }: any) => (
  <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
    <div className="flex items-center gap-4">
       <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
       <h2 className="text-3xl font-black uppercase tracking-tighter">Diagnostic</h2>
    </div>

    <div className="grid grid-cols-2 gap-4">
       <div className="bg-black p-8 rounded-[2.5rem] text-white space-y-2">
          <p className="text-[8px] font-black uppercase text-[#ffc244] tracking-widest">Global Uptime</p>
          <h4 className="text-2xl font-black">99.98%</h4>
       </div>
       <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-2">
          <p className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">Edge-CDN</p>
          <h4 className="text-2xl font-black">Active</h4>
       </div>
    </div>

    <div className="bg-white p-8 rounded-[4rem] border border-gray-100 shadow-sm space-y-8">
       <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Microservices Cluster</h3>
       <div className="space-y-4">
          {stats.nodes.map((node: any) => (
            <div key={node.id} className="p-6 bg-gray-50 rounded-[2.5rem] flex items-center justify-between border border-transparent hover:border-gray-200 transition-colors">
               <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${node.status === 'healthy' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                     {node.status === 'healthy' ? <Server className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                  </div>
                  <div>
                     <p className="text-xs font-black uppercase tracking-tight">{node.name}</p>
                     <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Load: {node.load}% • {node.uptime}</p>
                  </div>
               </div>
               <div className={`w-3 h-3 rounded-full ${node.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </div>
          ))}
       </div>
    </div>
  </div>
);

const UserManagementScreen = ({ onBack }: any) => (
  <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
    <div className="flex items-center gap-4">
       <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
       <h2 className="text-3xl font-black uppercase tracking-tighter">Directory</h2>
    </div>

    <div className="flex bg-white p-2 rounded-[2.5rem] shadow-sm">
       <button className="flex-1 py-4 bg-black text-[#ffc244] rounded-[2rem] text-[10px] font-black uppercase tracking-widest">All Nodes</button>
       <button className="flex-1 py-4 text-gray-400 rounded-[2rem] text-[10px] font-black uppercase tracking-widest">Suspended</button>
    </div>

    <div className="space-y-4">
       {[1, 2, 3, 4, 5].map(i => (
         <div key={i} className="bg-white p-6 rounded-[3rem] border border-gray-100 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-4">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} className="w-12 h-12 rounded-[1.5rem] bg-gray-50 border border-gray-100" />
               <div>
                  <h4 className="text-sm font-black uppercase tracking-tight leading-none">Node_{1042 + i}</h4>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Verified Member • Role: Buyer</p>
               </div>
            </div>
            <div className="flex gap-2">
               <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all"><Ban className="w-4 h-4" /></button>
               <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-black hover:text-[#ffc244] transition-all"><Edit2 className="w-4 h-4" /></button>
            </div>
         </div>
       ))}
    </div>
  </div>
);

const SellerApprovalsScreen = ({ onBack }: any) => (
  <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
    <div className="flex items-center gap-4">
       <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
       <h2 className="text-3xl font-black uppercase tracking-tighter">Queue</h2>
    </div>

    <div className="bg-amber-50 border border-amber-200 p-8 rounded-[3rem] space-y-4">
       <div className="flex items-center gap-3 text-amber-700">
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Pending Verification</span>
       </div>
       <p className="text-xs font-bold text-amber-900 uppercase">12 Providers are awaiting root authorization to list assets in the marketplace.</p>
    </div>

    <div className="space-y-4">
       {[1, 2].map(i => (
         <div key={i} className="bg-white p-8 rounded-[4rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=seller${i}`} className="w-16 h-16 rounded-[2rem] bg-gray-50" />
               <div className="flex-1">
                  <h4 className="text-lg font-black uppercase tracking-tight leading-none">Pro_Node_{500 + i}</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">Specialty: repairs, cleaning</p>
               </div>
            </div>
            <div className="flex gap-3">
               <button className="flex-1 bg-black text-[#ffc244] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Authorize</button>
               <button className="flex-1 bg-gray-50 text-gray-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">Reject</button>
            </div>
         </div>
       ))}
    </div>
  </div>
);

const ProductModerationScreen = ({ products, onFlag, onDelete, onBack }: any) => (
  <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
    <div className="flex items-center gap-4">
       <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
       <h2 className="text-3xl font-black uppercase tracking-tighter">Audit</h2>
    </div>

    <div className="space-y-4">
       {products.map((p: any) => (
         <div key={p.id} className={`bg-white p-6 rounded-[3rem] border flex items-center justify-between shadow-sm ${p.isFlagged ? 'border-rose-200 bg-rose-50/20' : 'border-gray-100'}`}>
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                  <img src={p.images[0]} className="w-full h-full object-cover" />
               </div>
               <div>
                  <h4 className="text-sm font-black uppercase tracking-tight leading-none line-clamp-1 max-w-[150px]">{p.name}</h4>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-2">Owner: {p.sellerId}</p>
               </div>
            </div>
            <div className="flex gap-2">
               {!p.isFlagged ? (
                  <button onClick={() => onFlag(p.id)} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-amber-50 hover:text-amber-500 transition-all"><Flag className="w-5 h-5" /></button>
               ) : (
                  <button className="p-4 bg-rose-50 text-rose-500 rounded-2xl"><ShieldAlert className="w-5 h-5" /></button>
               )}
               <button onClick={() => onDelete(p.id)} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
            </div>
         </div>
       ))}
    </div>
  </div>
);

const PlatformSettingsScreen = ({ stats, onUpdate, onBack }: any) => {
  const [commission, setCommission] = useState(stats.platformCommission);
  const [rateLimit, setRateLimit] = useState(stats.rateLimit);
  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
      <div className="flex items-center gap-4">
         <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
         <h2 className="text-3xl font-black uppercase tracking-tighter">Protocols</h2>
      </div>

      <div className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-sm space-y-10">
         <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
               <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Platform Fee (%)</label>
               <span className="text-xl font-black text-black">{commission}%</span>
            </div>
            <input type="range" min="0" max="30" value={commission} onChange={e => setCommission(parseInt(e.target.value))} className="w-full accent-black h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
         </div>

         <div className="space-y-4 pt-6 border-t border-gray-50">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] px-2">API Rate Threshold (Req/Sec)</label>
            <input type="number" value={rateLimit} onChange={e => setRateLimit(parseInt(e.target.value))} className="w-full bg-gray-50 border-none rounded-2xl p-6 text-xl font-black focus:ring-4 focus:ring-[#ffc244]/20 transition-all" />
         </div>

         <div className="flex items-center justify-between p-8 bg-gray-50 rounded-[3rem]">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Network className="w-6 h-6" /></div>
               <div>
                  <span className="text-[10px] font-black uppercase tracking-widest block">Edge-CDN Sync</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase">Global Asset Mirroring</span>
               </div>
            </div>
            <button onClick={() => onUpdate({...stats, cdnStatus: stats.cdnStatus === 'active' ? 'inactive' : 'active'})} className={`w-14 h-8 rounded-full transition-colors relative ${stats.cdnStatus === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`}>
               <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${stats.cdnStatus === 'active' ? 'left-7' : 'left-1'}`} />
            </button>
         </div>

         <button onClick={() => onUpdate({ ...stats, platformCommission: commission, rateLimit: rateLimit })} className="w-full bg-black text-[#ffc244] py-8 rounded-[3rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-3">
            <RefreshCcw className="w-4 h-4" /> Deploy Root Updates
         </button>
      </div>
    </div>
  );
};

const InventoryScreen = ({ products, onAdd, onUpdateStock }: any) => (
  <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
    <div className="flex items-center justify-between gap-4">
       <h2 className="text-3xl font-black uppercase tracking-tighter">Assets</h2>
       <button onClick={onAdd} className="p-3 bg-black text-[#ffc244] rounded-2xl shadow-lg active:scale-95 transition-all"><Plus className="w-6 h-6" /></button>
    </div>
    <div className="space-y-4">
       {products.map((p: any) => (
         <div key={p.id} className="bg-white p-6 rounded-[3rem] border border-gray-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50">
                  <img src={p.images[0]} className="w-full h-full object-cover" />
               </div>
               <div>
                  <h4 className="text-sm font-black uppercase tracking-tight leading-none">{p.name}</h4>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Available: {p.stock} units</p>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <button onClick={() => onUpdateStock(p.id, Math.max(0, p.stock - 1))} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-black hover:text-white transition-all"><Minus className="w-5 h-5" /></button>
               <button onClick={() => onUpdateStock(p.id, p.stock + 1)} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-black hover:text-white transition-all"><Plus className="w-5 h-5" /></button>
            </div>
         </div>
       ))}
    </div>
  </div>
);

const AddProductScreen = ({ onSubmit }: any) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500 pb-20">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Initialize Asset</h2>
      <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100 space-y-8">
         <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Descriptor Identity</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Master Toolkit" className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-bold uppercase" />
         </div>
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Base Cost ($)</label>
               <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-bold uppercase" />
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Unit Count</label>
               <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-bold uppercase" />
            </div>
         </div>
         <button onClick={() => onSubmit(name, parseFloat(price), parseInt(stock))} className="w-full bg-black text-[#ffc244] py-8 rounded-[3rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl active:scale-95 transition-all">Establish Protocol</button>
      </div>
    </div>
  );
};

const EntityDetailsScreen = ({ entity, onReport, onAddToCart, onBookProvider }: any) => {
  const isProduct = entity.type === 'product';
  const data = entity.data;
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500 pb-20">
       <div className="h-96 -mx-6 relative overflow-hidden bg-gray-900">
          <img src={isProduct ? data.images[0] : data.avatar} loading="eager" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
             <div className="space-y-2">
                <p className="text-[10px] font-black text-[#ffc244] uppercase tracking-[0.4em]">Edge Asset</p>
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{data.name}</h1>
             </div>
             {isProduct && <div className="bg-[#ffc244] text-black px-6 py-2 rounded-2xl text-xl font-black shadow-2xl">${data.price}</div>}
          </div>
       </div>
       <div className="space-y-10">
          <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100 space-y-6">
             <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Optimized Global Delivery</span>
             </div>
             <p className="text-base font-bold text-gray-700 leading-relaxed uppercase">{isProduct ? data.description : data.bio}</p>
          </div>
          <ReviewSection reviews={data.reviews} averageRating={data.rating} />
          <div className="flex gap-4">
             <button onClick={() => onReport(data)} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] text-rose-500 shadow-sm active:scale-95 transition-all"><Flag className="w-6 h-6" /></button>
             {isProduct ? (
               <button onClick={() => onAddToCart(data.id)} className="flex-1 bg-black text-[#ffc244] py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl active:scale-95 transition-all">Secure Asset</button>
             ) : (
               <button onClick={() => onBookProvider(data)} className="flex-1 bg-black text-[#ffc244] py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl active:scale-95 transition-all">Initialize Mission</button>
             )}
          </div>
       </div>
    </div>
  );
};

const ChatScreen = ({ order, provider, onSendMessage, isTyping }: any) => {
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [order.messages, isTyping]);

  const simulateAttachment = (type: 'image' | 'file') => {
    const att: Attachment = {
      type,
      url: type === 'image' ? 'https://picsum.photos/seed/chat/400' : '#',
      name: type === 'image' ? 'evidence-01.jpg' : 'agreement.pdf'
    };
    onSendMessage('', att);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-gray-50 animate-in slide-in-from-bottom duration-500 rounded-t-[3rem] overflow-hidden border-t border-gray-100 shadow-2xl">
      <div className="bg-white px-8 py-6 flex items-center gap-4 border-b border-gray-100">
        <img src={provider.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-[#ffc244]" />
        <div>
          <h4 className="font-black text-sm uppercase tracking-tight">{provider.name}</h4>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">E2EE Terminal Active</p>
        </div>
        <button className="ml-auto p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"><Lock className="w-5 h-5 text-gray-400" /></button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="flex items-center justify-center gap-2 pb-6 opacity-30">
           <ShieldCheck className="w-3 h-3" />
           <span className="text-[7px] font-black uppercase tracking-[0.5em]">AES-256 Secured Session</span>
        </div>
        {order.messages.map((m: any) => (
          <div key={m.id} className={`flex ${m.senderId === INITIAL_ADMIN.id || m.senderId === DEFAULT_USER.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-[2.5rem] text-sm font-bold uppercase leading-relaxed ${m.senderId === INITIAL_ADMIN.id || m.senderId === DEFAULT_USER.id ? 'bg-black text-[#ffc244] rounded-tr-none shadow-xl' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'}`}>
              {m.text}
              {m.attachment && (
                <div className="mt-4 p-4 bg-black/10 rounded-2xl border border-black/10">
                   {m.attachment.type === 'image' ? (
                     <img src={m.attachment.url} className="rounded-xl w-full" loading="lazy" />
                   ) : (
                     <div className="flex items-center gap-3">
                        <FileIcon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase">{m.attachment.name}</span>
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-5 rounded-[2rem] rounded-tl-none border border-gray-100 flex gap-2 shadow-sm">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>
      <div className="p-8 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3 bg-gray-50 p-2 pl-4 rounded-[2.5rem]">
          <button onClick={() => simulateAttachment('image')} className="p-2 text-gray-400 hover:text-black transition-colors"><ImageIcon className="w-5 h-5" /></button>
          <button onClick={() => simulateAttachment('file')} className="p-2 text-gray-400 hover:text-black transition-colors"><Paperclip className="w-5 h-5" /></button>
          <input 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder="Secure message..." 
            className="flex-1 bg-transparent border-none text-xs font-black uppercase tracking-widest placeholder:text-gray-300 focus:ring-0" 
            onKeyPress={e => e.key === 'Enter' && text.trim() && (onSendMessage(text), setText(''))} 
          />
          <button 
            onClick={() => { if(text.trim()) { onSendMessage(text); setText(''); } }} 
            className="bg-black text-[#ffc244] p-5 rounded-full shadow-2xl active:scale-95 transition-transform"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

const WalletScreen = ({ balance, onTopup, onSeeTransactions }: any) => (
  <div className="space-y-8 animate-in slide-in-from-bottom duration-500 pb-20">
    <div className="bg-black text-[#ffc244] p-12 rounded-[4rem] shadow-2xl space-y-8 relative overflow-hidden">
       <div className="absolute -right-10 -bottom-10 text-white/5 text-[15rem] rotate-12"><Wallet2 /></div>
       <div className="space-y-2 relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Available Balance</p>
          <h2 className="text-6xl font-black tracking-tighter">${balance.toFixed(2)}</h2>
       </div>
       <div className="flex gap-4 relative z-10">
          <button onClick={onTopup} className="flex-1 bg-[#ffc244] text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Inject Funds</button>
          <button onClick={onSeeTransactions} className="flex-1 bg-white/10 backdrop-blur-md text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Audit Log</button>
       </div>
    </div>
    <div className="space-y-6">
       <h3 className="font-black text-sm uppercase text-gray-400 tracking-widest px-2">Security Features</h3>
       <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex flex-col gap-2">
             <ShieldCheck className="w-5 h-5 text-emerald-500" />
             <p className="text-[9px] font-black uppercase tracking-widest">Escrow Protected</p>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex flex-col gap-2">
             <Lock className="w-5 h-5 text-blue-500" />
             <p className="text-[9px] font-black uppercase tracking-widest">Multi-Sig Ready</p>
          </div>
       </div>
    </div>
  </div>
);

const CartScreen = ({ items, products, onCheckout, promo, onApplyPromo }: any) => {
  const subtotal = useMemo(() => items.reduce((acc: number, item: any) => acc + (products.find((p: any) => p.id === item.productId)?.price || 0) * item.quantity, 0), [items, products]);
  return (
    <div className="space-y-8 pb-20 animate-in slide-in-from-right duration-500">
      <div className="flex items-center justify-between px-2"><h2 className="text-3xl font-black tracking-tight uppercase">Staging</h2><span className="bg-black text-[#ffc244] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{items.length} Units</span></div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="py-20 text-center opacity-30"><ShoppingCart className="w-16 h-16 mx-auto mb-4" /><p className="font-black uppercase text-xs">Staging Empty</p></div>
        ) : (
          items.map((item: any) => {
            const product = products.find((p: any) => p.id === item.productId);
            return (
              <div key={item.productId} className="bg-white p-5 rounded-[2.5rem] flex items-center gap-5 border border-gray-50 shadow-sm active:scale-98 transition-transform">
                 <img src={product?.images[0]} loading="lazy" className="w-16 h-16 rounded-2xl object-cover bg-gray-100" />
                 <div className="flex-1">
                    <h4 className="font-black text-[11px] uppercase truncate tracking-tight">{product?.name}</h4>
                    <p className="text-lg font-black tracking-tighter">${product?.price}</p>
                 </div>
              </div>
            );
          })
        )}
      </div>
      {items.length > 0 && (
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
           <div className="flex justify-between text-4xl font-black pt-6 border-t border-gray-50 tracking-tighter uppercase"><span>Commit</span><span>${subtotal.toFixed(2)}</span></div>
           <button onClick={onCheckout} className="w-full bg-black text-[#ffc244] py-8 rounded-[3rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl active:scale-95 transition-all">Establish Escrow</button>
        </div>
      )}
    </div>
  );
};

const CheckoutScreen = ({ items, products, paymentMethod, onSelectPayment, walletBalance, onPlaceOrder }: any) => {
  const subtotal = useMemo(() => items.reduce((acc: number, item: any) => acc + (products.find((p: any) => p.id === item.productId)?.price || 0) * item.quantity, 0), [items, products]);
  const tax = subtotal * TAX_RATE;
  const shipping = items.length > 0 ? SHIPPING_BASE : 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="space-y-8 pb-20 animate-in slide-in-from-right duration-500">
      <h2 className="text-3xl font-black tracking-tight uppercase">Checkout</h2>
      
      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
         <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Payment Protocol</h3>
         <div className="space-y-3">
            {PAYMENT_OPTIONS.map((method) => (
               <button 
                  key={method.id} 
                  onClick={() => onSelectPayment(method)}
                  className={`w-full p-6 rounded-3xl flex items-center justify-between border-2 transition-all ${paymentMethod.id === method.id ? 'border-black bg-black text-[#ffc244]' : 'border-gray-50 bg-gray-50 text-gray-500'}`}
               >
                  <div className="flex items-center gap-4">
                     <span className="text-2xl">{method.icon}</span>
                     <span className="text-[10px] font-black uppercase tracking-widest">{method.label}</span>
                  </div>
                  {paymentMethod.id === method.id && <Check className="w-5 h-5" />}
               </button>
            ))}
         </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
         <div className="flex justify-between text-gray-400 text-[10px] font-black uppercase tracking-widest">
            <span>Operational Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
         </div>
         <div className="flex justify-between text-gray-400 text-[10px] font-black uppercase tracking-widest">
            <span>Protocol Fees (Tax)</span>
            <span>${tax.toFixed(2)}</span>
         </div>
         <div className="flex justify-between text-gray-400 text-[10px] font-black uppercase tracking-widest">
            <span>Asset Transit</span>
            <span>${shipping.toFixed(2)}</span>
         </div>
         <div className="flex justify-between text-2xl font-black pt-6 border-t border-gray-50 tracking-tighter uppercase">
            <span>Total Commitment</span>
            <span>${total.toFixed(2)}</span>
         </div>
         <button 
            onClick={() => onPlaceOrder(total)}
            disabled={paymentMethod.type === 'wallet' && walletBalance < total}
            className="w-full bg-black text-[#ffc244] py-8 rounded-[3rem] font-black uppercase text-xs tracking-[0.4em] shadow-2xl active:scale-95 transition-all disabled:opacity-30"
         >
            {paymentMethod.type === 'wallet' && walletBalance < total ? 'Insufficient Vault Balance' : 'Confirm & Deploy'}
         </button>
      </div>
    </div>
  );
};

const TrackingScreen = ({ orders, onChat, onUpdateStatus, viewMode, products }: any) => {
  const filteredOrders = useMemo(() => viewMode === 'seller' ? orders : orders.filter(o => o.buyerId === DEFAULT_USER.id || o.buyerId === INITIAL_ADMIN.id), [orders, viewMode]);
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500 pb-20">
      <h2 className="text-3xl font-black px-2 tracking-tight uppercase leading-none">{viewMode === 'seller' ? 'Cluster' : 'Missions'}</h2>
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center opacity-40 text-center space-y-4">
            <Package className="w-16 h-16" />
            <p className="font-black uppercase text-xs tracking-widest">No Active Signals</p>
          </div>
        ) : (
          filteredOrders.map((order: Order) => (
            <div key={order.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 space-y-8 overflow-hidden relative">
              <div className="flex justify-between items-start">
                 <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-[0.4em]">ID: {order.id}</p>
                    <h3 className="text-xl font-black uppercase tracking-tighter leading-none">{order.category}</h3>
                 </div>
                 <div className="text-right">
                    <p className="text-2xl font-black tracking-tighter leading-none">${order.price.toFixed(2)}</p>
                    <div className="inline-block bg-emerald-50 px-3 py-1 rounded-full text-[8px] font-black uppercase text-emerald-600 tracking-widest mt-2">{order.status}</div>
                 </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-50">
                 <button onClick={() => onChat(order)} className="flex-1 flex items-center justify-center gap-2 bg-black text-[#ffc244] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"><MessageSquare className="w-4 h-4" /> Signal</button>
                 {viewMode === 'seller' && order.status === OrderStatus.PENDING && (
                   <button onClick={() => onUpdateStatus(order.id, OrderStatus.ACCEPTED)} className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl">Accept</button>
                 )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ProfileScreen = ({ userProfile, viewMode, setViewMode, onLogout, onSeeOrders, onSeeWallet, onSeeSecurity, onSeePolicy }: any) => (
  <div className="space-y-10 animate-in slide-in-from-bottom duration-500 pb-20">
    <div className="flex flex-col items-center gap-8 py-10">
       <div className="relative">
          <img src={userProfile.avatar} className="w-32 h-32 rounded-[3.5rem] object-cover border-4 border-white shadow-2xl" />
          {userProfile.isVerified && <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-white"><ShieldCheck className="w-5 h-5 text-white" /></div>}
       </div>
       <div className="text-center space-y-2">
          <h2 className="text-4xl font-black tracking-tighter uppercase">{userProfile.name}</h2>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em]">{userProfile.membershipType}</p>
       </div>
    </div>

    <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
       <ProfileOption icon={<Wallet2 className="text-emerald-500" />} label="Vault" onClick={onSeeWallet} />
       <ProfileOption icon={<Clock className="text-blue-500" />} label="Mission Log" onClick={onSeeOrders} />
       <ProfileOption icon={<Lock className="text-purple-500" />} label="Security" onClick={onSeeSecurity} />
       
       <div className="p-10 space-y-6">
          <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em]">Compliance & Legal</p>
          <div className="grid grid-cols-2 gap-4">
             <button onClick={() => onSeePolicy('terms')} className="p-6 bg-gray-50 rounded-3xl flex flex-col gap-2 items-center text-center active:scale-95 transition-all group hover:bg-black hover:text-white">
                <Scale className="w-6 h-6 text-gray-400 group-hover:text-[#ffc244]" />
                <span className="text-[9px] font-black uppercase tracking-widest">Terms</span>
             </button>
             <button onClick={() => onSeePolicy('privacy')} className="p-6 bg-gray-50 rounded-3xl flex flex-col gap-2 items-center text-center active:scale-95 transition-all group hover:bg-black hover:text-white">
                <ShieldQuestion className="w-6 h-6 text-gray-400 group-hover:text-[#ffc244]" />
                <span className="text-[9px] font-black uppercase tracking-widest">Privacy</span>
             </button>
             <button onClick={() => onSeePolicy('refund')} className="p-6 bg-gray-50 rounded-3xl flex flex-col gap-2 items-center text-center active:scale-95 transition-all group hover:bg-black hover:text-white">
                <Banknote className="w-6 h-6 text-gray-400 group-hover:text-[#ffc244]" />
                <span className="text-[9px] font-black uppercase tracking-widest">Refunds</span>
             </button>
             <button onClick={() => onSeePolicy('agreement')} className="p-6 bg-gray-50 rounded-3xl flex flex-col gap-2 items-center text-center active:scale-95 transition-all group hover:bg-black hover:text-white">
                <Handshake className="w-6 h-6 text-gray-400 group-hover:text-[#ffc244]" />
                <span className="text-[9px] font-black uppercase tracking-widest">Seller T&C</span>
             </button>
          </div>
       </div>

       <div className="p-10 space-y-6">
          <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em]">System Node Role</p>
          <div className="flex bg-gray-50 p-2 rounded-[2.5rem]">
             {(['buyer', 'seller', 'admin'] as UserRole[]).map(role => (
               <button key={role} onClick={() => setViewMode(role)} className={`flex-1 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === role ? 'bg-black text-[#ffc244] shadow-lg' : 'text-gray-400'}`}>{role}</button>
             ))}
          </div>
       </div>
       
       <button onClick={onLogout} className="w-full flex items-center justify-between p-10 hover:bg-rose-50 transition-all text-rose-500 group">
          <div className="flex items-center gap-6">
             <div className="p-4 bg-rose-50 rounded-[2rem] group-hover:bg-rose-500 group-hover:text-white transition-all"><LogOut className="w-6 h-6" /></div>
             <span className="text-sm font-black uppercase tracking-[0.2em]">Terminate Session</span>
          </div>
          <ChevronRight className="w-6 h-6 opacity-20" />
       </button>
    </div>
  </div>
);

const ReportModal = ({ target, onClose, onSubmit }: any) => {
  const [reason, setReason] = useState<ReportReason>('other');
  const [desc, setDesc] = useState('');
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
       <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
       <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl relative z-10 space-y-8">
          <div className="flex justify-between items-start">
             <h2 className="text-2xl font-black uppercase tracking-tighter leading-none text-rose-500">Violation Report</h2>
             <button onClick={onClose} className="p-2 bg-gray-50 rounded-full"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Reason Category</label>
             <select value={reason} onChange={e => setReason(e.target.value as ReportReason)} className="w-full bg-gray-50 border-none rounded-2xl p-6 text-xs font-black uppercase">
                <option value="fraud">Fraudulent Activity</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="spam">Spam / Bot Behavior</option>
                <option value="other">Other Violation</option>
             </select>
          </div>
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Evidence Brief</label>
             <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the protocol breach..." className="w-full bg-gray-50 border-none rounded-[2rem] p-6 text-sm font-bold h-32 uppercase" />
          </div>
          <button onClick={() => onSubmit({ target, reason, description: desc })} className="w-full bg-rose-500 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform">File Report</button>
       </div>
    </div>
  );
};

const PolicyOverlay = ({ type, onClose }: { type: PolicyType, onClose: () => void }) => {
  const content = {
    terms: {
      title: "Terms & Conditions",
      text: "Welcome to NexaAi Marketplace. By accessing our nodes, you agree to established operational protocols. User actions are logged for security. Dispute resolution follows the standardized Nexa Arbitration Framework. System abuse results in immediate session termination. Unauthorized scraping or API flooding is strictly prohibited."
    },
    privacy: {
      title: "Privacy Policy",
      text: "Nexa adheres to high-encryption standards. Your biometric and transactional data is processed via zero-knowledge proof protocols where applicable. We do not sell user data to external clusters. Cookies are only used for persistent session maintenance. You retain the right to request a full data wipe through the system settings."
    },
    refund: {
      title: "Refund Policy",
      text: "Escrow funds are protected until successful mission completion. Refunds can be initiated within the 24-hour verification window if the asset delivered does not match mission parameters. Service cancellations incur a protocol fee based on the provider's current availability status."
    },
    agreement: {
      title: "Seller Agreement",
      text: "Pro Nodes must maintain a trust rating of 4.0 or higher. Commission nodes are established at 12% per successful mission. Payouts are delivered to the linked vault after a 3-day holding period for security auditing. Sellers are responsible for local compliance and tax reporting within their operational jurisdiction."
    }
  }[type];

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 animate-in fade-in duration-300">
       <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>
       <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl relative z-10 flex flex-col gap-8 max-h-[80vh]">
          <div className="flex justify-between items-start">
             <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">{content.title}</h2>
             <button onClick={onClose} className="p-2 bg-gray-50 rounded-full"><X className="w-4 h-4" /></button>
          </div>
          <div className="overflow-y-auto pr-2 space-y-6">
             <p className="text-sm font-bold text-gray-600 leading-relaxed uppercase">{content.text}</p>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Version: 2024.1.B • Last Synchronized: Today</p>
          </div>
          <button onClick={onClose} className="w-full bg-black text-[#ffc244] py-6 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl">Close Policy</button>
       </div>
    </div>
  );
};

const NavButton = ({ active, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${active ? 'text-[#ffc244]' : 'text-gray-400 hover:text-gray-600'}`}>
    {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}<span className="text-[10px] font-bold tracking-tight uppercase">{label}</span>
  </button>
);

const StatCard = ({ icon, label, value, color, trend, isUp }: any) => (
  <div className={`p-6 rounded-[2.5rem] ${color} flex flex-col gap-2 border border-black/5 shadow-sm active:scale-95 transition-transform`}>
     <div className="flex justify-between items-start">
        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">{icon}</div>
        {trend && (
           <div className={`flex items-center gap-0.5 text-[8px] font-black ${isUp === true ? 'text-emerald-500' : isUp === false ? 'text-rose-500' : 'text-gray-400'}`}>
              {isUp === true && <ArrowUpRight className="w-2 h-2" />}
              {isUp === false && <TrendingDown className="w-2 h-2" />}
              {trend}
           </div>
        )}
     </div>
     <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mt-2">{label}</p>
     <p className="text-2xl font-black tracking-tighter leading-none">{value}</p>
  </div>
);

const DashboardAction = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 bg-white p-4 rounded-3xl border border-gray-50 shadow-sm active:scale-95 transition-all hover:border-[#ffc244]">
     <div className="text-black">{icon}</div>
     <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{label}</span>
  </button>
);

const ProfileOption = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-10 hover:bg-gray-50 transition-all text-gray-900 group active:bg-gray-100">
    <div className="flex items-center gap-6">
       <div className="p-4 bg-gray-50 rounded-[2rem] group-hover:bg-black group-hover:text-white transition-all">{icon}</div>
       <span className="text-sm font-black uppercase tracking-[0.2em]">{label}</span>
    </div>
    <ChevronRight className="w-6 h-6 text-gray-200" />
  </button>
);

const ReviewSection = ({ reviews, averageRating }: { reviews: Review[], averageRating: number }) => (
  <div className="space-y-8">
     <div className="flex items-center justify-between border-t border-gray-100 pt-8">
        <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest">Feedback History</h3>
        {averageRating > 0 && <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Award className="w-3 h-3" /> Elite Status</div>}
     </div>
     {reviews.length === 0 ? (
       <div className="py-10 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Empty Ledger</p>
       </div>
     ) : (
       <div className="space-y-6">
          {reviews.map(review => (
            <div key={review.id} className="bg-gray-50 p-6 rounded-[2rem] space-y-4 border border-gray-100">
               <div className="flex items-center gap-4">
                  <img src={review.userAvatar} className="w-10 h-10 rounded-2xl object-cover" />
                  <div className="flex-1"><h4 className="text-[11px] font-black uppercase tracking-tight">{review.userName}</h4></div>
                  <span className="text-[9px] font-bold text-gray-300 uppercase">{new Date(review.date).toLocaleDateString()}</span>
               </div>
               <p className="text-xs font-medium text-gray-500 leading-relaxed pr-6 uppercase">{review.comment}</p>
            </div>
          ))}
       </div>
     )}
  </div>
);

const ReviewModal = ({ onClose, onSubmit, title }: any) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
     <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
     <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl relative z-10 space-y-8">
        <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">{title}</h2>
        <textarea placeholder="Log report..." className="w-full bg-gray-50 border-none rounded-[2rem] p-6 text-sm font-bold h-32 uppercase" />
        <button onClick={onClose} className="w-full bg-black text-[#ffc244] py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform">Commit Ledger</button>
     </div>
  </div>
);

const InvoiceOverlay = ({ order, onClose, products }: any) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
     <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>
     <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl relative z-10 flex flex-col gap-8">
        <h2 className="text-xl font-black uppercase tracking-tighter leading-none">Security Ledger</h2>
        <div className="border-t border-gray-100 pt-6 space-y-4">
           <div className="flex justify-between"><span className="text-xs font-black uppercase text-gray-400 tracking-widest">Transaction ID</span><span className="text-xs font-black">{order.id}</span></div>
           <div className="flex justify-between text-2xl font-black uppercase tracking-tighter"><span>Validated Total</span><span>${order.price.toFixed(2)}</span></div>
        </div>
        <button onClick={onClose} className="w-full bg-black text-[#ffc244] py-6 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">Dismiss Ledger</button>
     </div>
  </div>
);
