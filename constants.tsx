
import { ServiceCategory, Provider, Product, Review } from './types';

const SAMPLE_REVIEWS: Review[] = [
  {
    id: 'rev1',
    userId: 'u2',
    userName: 'Jessica W.',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100',
    rating: 5,
    comment: 'Absolutely fantastic! Exceeded all expectations. Very professional.',
    date: new Date().toISOString(),
    isVerified: true,
    reportCount: 0
  },
  {
    id: 'rev2',
    userId: 'u3',
    userName: 'David K.',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
    rating: 4,
    comment: 'Great service, but arrived slightly late. Quality was still top notch.',
    date: new Date().toISOString(),
    isVerified: true,
    reportCount: 0
  }
];

export const CATEGORIES: ServiceCategory[] = [
  { id: 'cleaning', title: 'Cleaning', icon: '✨', description: 'Home & office', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'moving', title: 'Moving', icon: '📦', description: 'Heavy lifting', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'errands', title: 'Errands', icon: '🛒', description: 'Shopping help', color: 'bg-orange-100 text-orange-700' },
  { id: 'repairs', title: 'Repairs', icon: '🔧', description: 'Fix & build', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'delivery', title: 'Delivery', icon: '🚚', description: 'Fast transport', color: 'bg-rose-100 text-rose-700' },
  { id: 'electronics', title: 'Gadgets', icon: '💻', description: 'Tech & more', color: 'bg-blue-100 text-blue-700' },
  { id: 'digital', title: 'Assets', icon: '💾', description: 'Code & Design', color: 'bg-purple-100 text-purple-700' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prd1',
    sellerId: 'u1',
    name: 'Eco-Friendly Cleaning Kit',
    description: 'A complete set of organic cleaning supplies for your home.',
    price: 45.00,
    category: 'cleaning',
    tags: ['eco', 'home', 'essential'],
    type: 'physical',
    stock: 15,
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400'],
    variations: [{ id: 'v1', name: 'Scent', options: ['Lemon', 'Lavender'] }],
    createdAt: new Date().toISOString(),
    reviews: SAMPLE_REVIEWS,
    rating: 4.8
  },
  {
    id: 'prd2',
    sellerId: 'u1',
    name: 'Smart Home Setup Guide',
    description: 'A comprehensive digital guide to automating your living space.',
    price: 19.99,
    category: 'digital',
    tags: ['tech', 'guide', 'smart-home'],
    type: 'digital',
    stock: 999,
    images: ['https://images.unsplash.com/photo-1558002038-103390400379?auto=format&fit=crop&q=80&w=400'],
    variations: [],
    downloadUrl: 'https://example.com/download',
    createdAt: new Date().toISOString(),
    reviews: [],
    rating: 0
  }
];

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'p1',
    name: 'Alex Johnson',
    rating: 4.9,
    reviews: SAMPLE_REVIEWS,
    pricePerHour: 35,
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200',
    bio: 'Professional cleaner and organizer with 5 years of experience. I bring my own supplies!',
    completedTasks: 450,
    specialties: ['cleaning', 'errands'],
    status: 'online',
    serviceArea: 'Downtown',
    distance: 1.2
  },
  {
    id: 'p2',
    name: 'Sarah Miller',
    rating: 4.8,
    reviews: SAMPLE_REVIEWS,
    pricePerHour: 45,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    bio: 'Expert at furniture assembly and heavy lifting. Efficient and reliable.',
    completedTasks: 310,
    specialties: ['moving', 'repairs'],
    status: 'busy',
    serviceArea: 'West End',
    distance: 3.5
  },
  {
    id: 'p3',
    name: 'Marco Rossi',
    rating: 5.0,
    reviews: [],
    pricePerHour: 30,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    bio: 'Your friendly neighborhood errand runner. Fast delivery and smart shopping.',
    completedTasks: 180,
    specialties: ['errands', 'delivery'],
    status: 'online',
    serviceArea: 'Downtown',
    distance: 0.8
  }
];
