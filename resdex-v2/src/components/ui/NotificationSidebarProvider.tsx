"use client";
import React, { useState, createContext, useContext } from "react";
import NotificationSidebar from "./NotificationSidebar";

export const NotificationSidebarContext = createContext<{
  openNotificationSidebar: () => void;
} | undefined>(undefined);

export const useNotificationSidebar = () => {
  const ctx = useContext(NotificationSidebarContext);
  if (!ctx) throw new Error("useNotificationSidebar must be used within NotificationSidebarProvider");
  return ctx;
};

export default function NotificationSidebarProvider({ children }: { children: React.ReactNode }) {
  const [notificationSidebarOpen, setNotificationSidebarOpen] = useState(false);

  return (
    <NotificationSidebarContext.Provider value={{ openNotificationSidebar: () => setNotificationSidebarOpen(true) }}>
      {children}
      <NotificationSidebar open={notificationSidebarOpen} onClose={() => setNotificationSidebarOpen(false)} />
    </NotificationSidebarContext.Provider>
  );
} 