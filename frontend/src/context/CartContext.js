import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addItem = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i._id === item._id);
      if (exists) return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i._id !== id));

  const updateQty = (id, qty) => {
    if (qty < 1) { removeItem(id); return; }
    setCart(prev => prev.map(i => i._id === id ? { ...i, qty } : i));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
