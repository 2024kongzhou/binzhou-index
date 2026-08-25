export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "user";
  isActive: boolean;
  createdAt: Date;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status: "draft" | "pending" | "published" | "archived";
  aiGenerated: boolean;
  authorId?: number;
  publishedAt?: Date;
  createdAt: Date;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  images?: string;
  stock: number;
  status: "active" | "inactive";
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  isSoftAd: boolean;
  createdAt: Date;
}

export interface Chronicle {
  id: number;
  title: string;
  content: string;
  category?: string;
  era?: string;
  tags?: string;
  status: string;
  createdAt: Date;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: Date;
}
