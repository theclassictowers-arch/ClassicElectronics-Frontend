'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  slug: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'processing' | 'in-transit' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  shippingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  estimatedDelivery: string | null;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrders: () => Order[];
  getOrderById: (id: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders from local storage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (error) {
        console.error('Failed to parse orders from local storage', error);
      }
    }
  }, []);

  // Save orders to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order: Order) => {
    setOrders((prevOrders) => [order, ...prevOrders]);
  };

  const getOrders = () => {
    return orders;
  };

  const getOrderById = (id: string) => {
    return orders.find((order) => order.id === id);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        getOrders,
        getOrderById,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
