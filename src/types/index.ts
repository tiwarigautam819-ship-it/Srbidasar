export interface VideoItem {
  id: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  title: string;
  thumbnailUrl: string;
  visible: boolean;
  createdAt: number;
  updatedAt?: number;
  createdBy?: string;
}

export interface RatingItem {
  id: string;
  rating: number; // 1 to 5
  createdAt: number;
  deviceId?: string;
}

export interface CommentItem {
  id: string;
  name: string;
  comment: string;
  videoId?: string;
  videoTitle?: string;
  visible: boolean;
  createdAt: number;
}

export interface SuggestionItem {
  id: string;
  songName: string;
  youtubeUrl?: string;
  suggestion: string;
  status: 'pending' | 'reviewed' | 'approved';
  createdAt: number;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  visible: boolean;
  order: number;
  createdAt: number;
}

export interface AppSettings {
  websiteName: string;
  logoUrl?: string;
  whatsappUrl: string;
  contactEmail: string;
  footerText: string;
  aboutText?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin';
  createdAt: number;
  createdBy?: string;
}
