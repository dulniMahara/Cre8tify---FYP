import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    // 💾 Load from LocalStorage so data survives page refreshes
    const [cartItems, setCartItems] = useState<any[]>(() => {
        const saved = localStorage.getItem('cartItems');
        return  saved ? JSON.parse(saved) : [];
    });

    const [favorites, setFavorites] = useState<any[]>(() => {
        const saved = localStorage.getItem('cre8tify_favs');
        return saved ? JSON.parse(saved) : [];
    });

    // Auto-save to LocalStorage whenever cart or favs change
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem('cre8tify_favs', JSON.stringify(favorites));
    }, [favorites]);

   const addToCart = (product: any) => {
        setCartItems(prev => {
            let updatedCart;

            // 1. Clean the price (Strips "LKR" and commas so math works)
            const cleanPrice = typeof product.price === 'string' 
                ? parseFloat(product.price.replace(/[^\d.]/g, '')) 
                : product.price;

            // 2. 🕵️ Find if this ID is ALREADY in the cart (even if size/color are different)
            const existingItemIndex = prev.findIndex(item => String(item.id) === String(product.id));

            if (existingItemIndex > -1) {
                // 🔄 If it exists, we UPDATE it with the new choices
                updatedCart = prev.map((item, index) => 
                    index === existingItemIndex 
                        ? { 
                            ...item, 
                            ...product, 
                            price: cleanPrice, 
                            quantity: (item.size === product.size && item.color === product.color) 
                                ? item.quantity + 1 
                                : 1 
                        } 
                        : item
                );
            } else {
                // ✨ If it's totally new, add it
                updatedCart = [...prev, { ...product, price: cleanPrice, quantity: 1, selected: true }];
            }

            // 💾 Save to LocalStorage
            localStorage.setItem('cartItems', JSON.stringify(updatedCart));
            
            return updatedCart;
        });
    };

    const toggleFavorite = (product: any) => {
        setFavorites(prev => {
            const isFav = prev.some(fav => fav.id === product.id);
            if (isFav) return prev.filter(fav => fav.id !== product.id);
            return [...prev, product];
        });
    };

    const toggleSelect = (id: string) => {
        setCartItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
    };

    const toggleAll = (checked: boolean) => {
        setCartItems(prev => prev.map(item => ({ ...item, selected: checked })));
    };

    const updateQuantity = (id: string, delta: number) => {
        setCartItems(prev => prev.map(item => 
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
    };

    const removeItem = (id: any, size: string, color: string) => {
        setCartItems(prev => {
            // 🎯 Logic: "Keep everything EXCEPT the one where ID, Size, and Color all match"
            const updatedCart = prev.filter(item => 
                !(String(item.id) === String(id) && item.size === size && item.color === color)
            );

            // 💾 Sync with LocalStorage
            localStorage.setItem('cartItems', JSON.stringify(updatedCart));
            
            return updatedCart;
        });
    };

    return (
        <CartContext.Provider value={{ 
            cartItems, setCartItems, addToCart, toggleSelect, 
            toggleAll, updateQuantity, removeItem, 
            favorites, toggleFavorite 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);