import { Resource, CourseStats, Comment, ResourceType, User } from '../types';

// Always call the API on a relative path: Vite proxies /api to the backend in
// dev (vite.config.ts) and vercel.json rewrites it in production. This makes the
// app work identically on localhost, a LAN address, or a deployed domain.
// Set VITE_API_URL to point at a different origin.
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

export const api = {
    // Resources
    getResources: async (params?: { type?: string; slot?: string; search?: string; course?: string }): Promise<Resource[]> => {
        const query = new URLSearchParams();
        if (params?.type && params.type !== 'ALL') query.append('type', params.type);
        if (params?.slot && params.slot !== 'ALL') query.append('slot', params.slot);
        if (params?.search) query.append('search', params.search);
        if (params?.course) query.append('course', params.course);

        const res = await fetch(`${API_URL}/resources?${query.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch resources');
        return res.json();
    },

    getResourceById: async (id: string): Promise<Resource> => {
        const res = await fetch(`${API_URL}/resources/${id}`);
        if (!res.ok) throw new Error('Failed to fetch resource');
        return res.json();
    },

    uploadResource: async (formData: FormData): Promise<Resource> => {
        // Note: formData should contain 'file' and 'data' (JSON string)
        const res = await fetch(`${API_URL}/resources`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Upload failed: ${res.status} ${res.statusText} - ${errorText}`);
        }
        return res.json();
    },

    updateInteraction: async (id: string, action: 'view' | 'download' | 'upvote'): Promise<any> => {
        const res = await fetch(`${API_URL}/resources/${id}/${action}`, {
            method: 'POST',
        });
        return res.json();
    },

    addComment: async (id: string, comment: { text: string; author: string }): Promise<Comment> => {
        const res = await fetch(`${API_URL}/resources/${id}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(comment),
        });
        if (!res.ok) throw new Error('Failed to post comment');
        return res.json();
    },

    // Stats
    getStats: async (): Promise<{ courseStats: CourseStats[]; topSlots: any[] }> => {
        const res = await fetch(`${API_URL}/stats`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
    },

    // Auth
    sendOtp: async (email: string): Promise<{ message: string }> => {
        const res = await fetch(`${API_URL}/auth/otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to send OTP');
        }
        return res.json();
    },

    verifyOtp: async (email: string, otp: string): Promise<{ success: boolean; message: string; user?: User }> => {
        const res = await fetch(`${API_URL}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Verification failed');
        }
        return res.json();
    },

    // AI Assistant
    askAI: async (query: string): Promise<string> => {
        const res = await fetch(`${API_URL}/ai/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`AI Request Failed: ${res.status} ${res.statusText} - ${errorText}`);
        }
        const data = await res.json();
        return data.answer;
    }
};
