
export type Category = 'cleaning' | 'moving' | 'errands' | 'repairs' | 'delivery' | 'other' | 'electronics' | 'fashion' | 'digital';

export type PaymentType = 'credit_card' | 'debit_card' | 'digital_wallet' | 'wallet' | 'cod' | 'gateway';

export type ProviderStatus = 'online' | 'busy' | 'offline';

export type AddressType = 'Home' | 'Work' | 'Other';

export type UserRole = 'buyer' | 'seller' | 'admin';

export type ProductType = 'physical' | 'digital';

export type EscrowStatus = 'none' | 'held' | 'released' | 'refunded';

export type ReportReason = 'fraud' | 'inappropriate' | 'spam' | 'other';

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'product' | 'provider' | 'user';
  reason: ReportReason;
  description: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'action_taken';
}

export interface Attachment {
  type: 'image' | 'file';
  url: string;
  name: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  isVerified: boolean;
  reportCount: number;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'topup' | 'payment' | 'refund' | 'withdrawal';
  timestamp: string;
  description: string;
}

export interface Variation {
  id: string;
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  tags: string[];
  type: ProductType;
  stock: number;
  images: string[];
  variations: Variation[];
  downloadUrl?: string;
  createdAt: string;
  reviews: Review[];
  rating: number;
  isFlagged?: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedVariations?: Record<string, string>;
}

export interface PromoCode {
  code: string;
  discount: number;
}

export interface SellerStats {
  views: number;
  clicks: number;
  salesCount: number;
  revenue: number;
}

export interface NodeHealth {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  load: number;
  uptime: string;
}

export interface MarketStats {
  totalRevenue: number;
  totalUsers: number;
  activeOrders: number;
  platformCommission: number;
  cdnStatus: 'active' | 'inactive';
  rateLimit: number;
  nodes: NodeHealth[];
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  status: 'open' | 'resolved' | 'closed';
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phoneNumber?: string;
  memberSince: string;
  membershipType: string;
  role: UserRole;
  isVerified: boolean;
  verificationStatus: 'none' | 'pending' | 'verified';
  walletBalance: number;
  transactions: WalletTransaction[];
  sellerStats?: SellerStats;
  isSuspended?: boolean;
  twoFactorEnabled?: boolean;
  privacyConsentDate?: string;
}

export interface DeliveryAddress {
  id: string;
  type: AddressType;
  fullAddress: string;
  isDefault: boolean;
  label?: string;
}

export interface PaymentMethod {
  id: string;
  type: PaymentType;
  label: string;
  last4?: string;
  icon: string;
  gateway?: 'stripe' | 'paypal' | 'razorpay';
}

export interface ServiceCategory {
  id: Category;
  title: string;
  icon: string;
  description: string;
  color: string;
}

export interface Provider {
  id: string;
  name: string;
  rating: number;
  reviews: Review[];
  pricePerHour: number;
  avatar: string;
  bio: string;
  completedTasks: number;
  specialties: Category[];
  status: ProviderStatus;
  serviceArea: string;
  distance: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  SHIPPED = 'shipped',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  attachment?: Attachment;
  isProvider?: boolean;
}

export interface Order {
  id: string;
  category: Category | 'product_order';
  description: string;
  providerId?: string;
  buyerId: string;
  buyerName: string;
  status: OrderStatus;
  escrowStatus: EscrowStatus;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  price: number;
  address: string;
  messages: Message[];
  paymentMethod: PaymentMethod;
  items?: CartItem[];
  hasBeenReviewed?: boolean;
}

export interface SmartSuggestion {
  refinedDescription: string;
  estimatedHours: number;
  suggestedTools: string[];
}
