import { create } from 'zustand';
import { useInfographicStore } from './useInfographicStore';

export interface ShareLink {
  id: string;
  createdAt: Date;
  expiresAt: Date | null; // null = never expires
  viewCount: number;
  isActive: boolean;
}

interface ShareState {
  shareLinks: ShareLink[];
  currentShareLink: string | null;
  isViewOnlyMode: boolean;
  viewOnlyData: string | null; // JSON string of infographic data
  
  // Actions
  generateShareLink: (expiration: '1day' | '1week' | 'never') => string;
  revokeShareLink: (id: string) => void;
  loadFromShareLink: (encodedData: string) => boolean;
  setViewOnlyMode: (mode: boolean) => void;
  setViewOnlyData: (data: string | null) => void;
  incrementViewCount: (id: string) => void;
  cleanupExpiredLinks: () => void;
}

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 10);

// Encode data for URL
export function encodeShareData(data: unknown): string {
  const json = JSON.stringify(data);
  // Use base64 encoding with URL-safe characters
  return btoa(encodeURIComponent(json));
}

// Decode data from URL
export function decodeShareData(encoded: string): unknown | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const useShareStore = create<ShareState>((set) => ({
  shareLinks: [],
  currentShareLink: null,
  isViewOnlyMode: false,
  viewOnlyData: null,

  generateShareLink: (expiration) => {
    const id = generateId();
    const now = new Date();
    
    let expiresAt: Date | null = null;
    if (expiration === '1day') {
      expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (expiration === '1week') {
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    // Get current infographic data
    const infographicData = useShareStore.getState().viewOnlyData;
    if (!infographicData) {
      // If no view-only data set, get from main store
      const mainData = useInfographicStore.getState();
      const dataToEncode = {
        titleBar: mainData.titleBar,
        roles: mainData.roles,
        phases: mainData.phases,
        layout: mainData.layout,
        backgroundColor: mainData.backgroundColor,
        connectors: mainData.connectors,
      };
      const encoded = encodeShareData(dataToEncode);
      const shareLink = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
      
      set((state) => ({
        shareLinks: [...state.shareLinks, {
          id,
          createdAt: now,
          expiresAt,
          viewCount: 0,
          isActive: true,
        }],
        currentShareLink: shareLink,
      }));
      
      return shareLink;
    }

    const encoded = encodeShareData(JSON.parse(infographicData));
    const shareLink = `${window.location.origin}${window.location.pathname}?share=${encoded}`;

    set((state) => ({
      shareLinks: [...state.shareLinks, {
        id,
        createdAt: now,
        expiresAt,
        viewCount: 0,
        isActive: true,
      }],
      currentShareLink: shareLink,
    }));

    return shareLink;
  },

  revokeShareLink: (id) => {
    set((state) => ({
      shareLinks: state.shareLinks.map(link =>
        link.id === id ? { ...link, isActive: false } : link
      ),
    }));
  },

  loadFromShareLink: (encodedData) => {
    const data = decodeShareData(encodedData);
    if (!data) return false;

    set({
      isViewOnlyMode: true,
      viewOnlyData: JSON.stringify(data),
    });

    return true;
  },

  setViewOnlyMode: (mode) => {
    set({ isViewOnlyMode: mode });
  },

  setViewOnlyData: (data) => {
    set({ viewOnlyData: data });
  },

  incrementViewCount: (id) => {
    set((state) => ({
      shareLinks: state.shareLinks.map(link =>
        link.id === id ? { ...link, viewCount: link.viewCount + 1 } : link
      ),
    }));
  },

  cleanupExpiredLinks: () => {
    const now = new Date();
    set((state) => ({
      shareLinks: state.shareLinks.filter(link =>
        link.expiresAt === null || new Date(link.expiresAt) > now
      ),
    }));
  },
}));