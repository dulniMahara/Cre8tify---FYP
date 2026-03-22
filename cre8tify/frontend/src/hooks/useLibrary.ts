import { useState, useEffect } from 'react';

const API_URL = "http://localhost:5000";

export interface LibraryItem {
    _id: string; // MongoDB uses _id
    url: string; // The server path (e.g., /uploads/library/asset.png)
    name: string;
    createdAt: string; 
}

export function useLibrary() {
    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(false);

    // 🟢 1. FETCH LIBRARY FROM BACKEND
    const fetchLibrary = async () => {
        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) return;
        const { token } = JSON.parse(storedUser);

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/library`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setLibraryItems(data);
            }
        } catch (err) {
            console.error("Failed to fetch library", err);
        } finally {
            setLoading(false);
        }
    };

    // Load on startup
    useEffect(() => {
        fetchLibrary();
    }, []);

    // 🟢 2. UPLOAD TO BACKEND (Replaces base64 logic)
    const addToLibrary = async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) return null;
        const { token } = JSON.parse(storedUser);

        try {
            const response = await fetch(`${API_URL}/api/library`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const newItem = await response.json();
            
            if (response.ok) {
                // Add new item to the state immediately
                setLibraryItems(prev => [newItem, ...prev]);
                return newItem;
            }
        } catch (err) {
            console.error("Upload failed", err);
        }
        return null;
    };

    // 🟢 3. REMOVE FROM BACKEND
    const removeFromLibrary = async (idToDelete: string) => {
        if (!window.confirm("Delete this image from your library permanently?")) return;

        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) return;
        const { token } = JSON.parse(storedUser);

        try {
            const response = await fetch(`${API_URL}/api/library/${idToDelete}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setLibraryItems(prev => prev.filter(item => item._id !== idToDelete));
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    return { libraryItems, addToLibrary, removeFromLibrary, loading, refreshLibrary: fetchLibrary };
}