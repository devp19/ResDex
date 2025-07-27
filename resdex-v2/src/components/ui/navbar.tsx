  "use client";
  import { cn } from "@/lib/utils";
  import { IconMenu2, IconX } from "@tabler/icons-react";
  import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
  } from "motion/react";

  import React, { useRef, useState, useEffect, useContext } from "react";
  import Image from "next/image";
  import { Bell } from "lucide-react";
  import { Mail } from "lucide-react";
  import { useAuth } from '../auth-provider';
  import { supabase } from '@/lib/supabaseClient';
  import { NotificationSidebarContext } from "./NotificationSidebarProvider";

  interface NavbarProps {
    children: React.ReactNode;
    className?: string;
  }

  interface NavBodyProps {
    children: React.ReactNode;
    className?: string;
    visible?: boolean;
    showNotifications?: boolean;
  }

  interface NavItemsProps {
    items: {
      name: string;
      link: string;
    }[];
    className?: string;
    onItemClick?: () => void;
  }

  interface MobileNavProps {
    children: React.ReactNode;
    className?: string;
    visible?: boolean;
  }

  interface MobileNavHeaderProps {
    children: React.ReactNode;
    className?: string;
  }

  interface MobileNavMenuProps {
    children: React.ReactNode;
    className?: string;
    isOpen: boolean;
    onClose: () => void;
  }

  export const Navbar = ({ children, className }: NavbarProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({
      target: ref,
      offset: ["start start", "end start"],
    });
    const [visible, setVisible] = useState<boolean>(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
      if (latest > 100) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    });

    return (
      <motion.div
        ref={ref}
        // IMPORTANT: Change this to class of `fixed` if you want the navbar to be fixed
        className={cn("sticky inset-x-0 top-7 z-40 w-full mt-4", className)}
      >
        <div className="flex items-center gap-10">
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(
                  child as React.ReactElement<{ visible?: boolean }>,
                  { visible },
                )
              : child,
          )}
        </div>
      </motion.div>
    );
  };

  export function NotificationBadge() {
    const { user, isLoading: authLoading } = useAuth();
    const [notificationCount, setNotificationCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const notificationSidebarCtx = useContext(NotificationSidebarContext);

    // Fetch notification count when user changes
    useEffect(() => {
      // Skip if auth is still loading
      if (authLoading) {
        console.log('Auth still loading, waiting...');
        return;
      }
      
      if (!user) {
        console.log('No authenticated user');
        setIsLoading(false);
        return;
      }
      
      console.log('User authenticated, fetching notifications for:', user.id);
      // fetchNotificationCount();
      
    }, [user, authLoading]);

    // const fetchNotificationCount = async () => {
    //   if (!user) return;
      
    //   try {
    //     console.log('Fetching notification count for user:', user.id);
    //     setIsLoading(true);
        
    //     const { data, error } = await supabase.rpc(
    //       'get_notifications_count_for_user',
    //       { user_id: user.id }
    //     );
        
    //     if (error) {
    //       console.error('Error fetching notification count:', error);
    //       return;
    //     }
        
    //     console.log('Notification count received:', data);
    //     setNotificationCount(data);
    //   } catch (err) {
    //     console.error('Unexpected error fetching notifications:', err);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // If we're still loading auth, show a loading indicator
    if (authLoading) {
      return (
        <div className="notification-icon ml-6 flex items-center gap-1">
          <Bell className="bell-icon w-6 h-6 text-neutral-700 dark:text-white opacity-50" />
        </div>
      );
    }

    // If there's no authenticated user, render the bell without a count
    if (!user) {
      return (
        <button type="button" onClick={() => notificationSidebarCtx?.openNotificationSidebar()} className="notification-icon ml-6 flex items-center gap-1 hover:opacity-80 transition">
          <Bell className="bell-icon w-6 h-6 text-neutral-700 dark:text-white" />
        </button>
      );
    }

    return (
      <button type="button" onClick={() => notificationSidebarCtx?.openNotificationSidebar()} className="notification-icon ml-6 flex items-center gap-1 hover:opacity-80 transition relative">
        <Bell className="bell-icon w-6 h-6 text-neutral-700 dark:text-white" />
        {isLoading ? (
          <span className="loading-indicator w-[18px] h-[18px] rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse absolute -top-2 -right-2"></span>
        ) : notificationCount > 0 && (
          <span className="notification-badge bg-[#ff4b4b] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[12px] font-bold px-2 ml-1 absolute -top-2 -right-2">
            {notificationCount}
          </span>
        )}
      </button>
    );
  }

  // MessageBadge: shows total unread message notifications for the current user
  export function MessageBadge() {
    const { user, isLoading: authLoading } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      if (authLoading) return;
      if (!user) {
        setIsLoading(false);
        return;
      }
      fetchUnreadCount();
    }, [user, authLoading]);

    const fetchUnreadCount = async () => {
      if (!user) return;
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('recipient_id', user.id)
        .eq('related_resource_type', 'conversation')
        .eq('type', 'message')
        .eq('read', false)
        .eq('dismissed', false);
      if (!error && data) {
        setUnreadCount(data.length);
      } else {
        setUnreadCount(0);
      }
      setIsLoading(false);
    };

    if (authLoading) {
      return (
        <div className="notification-icon ml-2 flex items-center gap-1">
          <Mail className="w-6 h-6 text-neutral-700 dark:text-white opacity-50" />
        </div>
      );
    }

    return (
      <a href="/messages" className="notification-icon ml-6 mr-3 flex items-center gap-1 hover:opacity-80 transition relative">
        <Mail className="w-6 h-6 text-neutral-700 dark:text-white" />
        {isLoading ? (
          <span className="loading-indicator w-[18px] h-[18px] rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"></span>
        ) : unreadCount > 0 && (
          <span className="notification-badge bg-[#ff4b4b] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[12px] font-bold px-2 ml-1 absolute -top-2 -right-2">
            {unreadCount}
          </span>
        )}
      </a>
    );
  }

  export const NavBody = ({ children, className, visible, showNotifications = false }: NavBodyProps) => {
    return (
      <motion.div
        animate={{
          backdropFilter: visible ? "blur(10px)" : "none",
          boxShadow: "none",
          width: visible ? "40%" : "100%",
          y: visible ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        style={{
          minWidth: "800px",
        }}
        className={cn(
          "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full px-4 py-2 lg:flex bg-[rgba(245,246,250,0.85)] dark:bg-[rgba(24,24,27,0.92)] backdrop-blur-md",
          className,
        )}
      >
        {children}
      </motion.div>
    );
  };

  export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
      <motion.div
        onMouseLeave={() => setHovered(null)}
        className={cn(
          "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2",
          className,
        )}
      >
        {items.map((item, idx) => (
          <a
            onMouseEnter={() => setHovered(idx)}
            onClick={onItemClick}
            className="relative px-4 py-2 text-neutral-600 dark:text-neutral-300"
            key={`link-${idx}`}
            href={item.link}
          >
            {hovered === idx && (
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 h-full w-full rounded-full bg-gray-300 dark:bg-neutral-800"
              />
            )}
            <span className="relative z-20">{item.name}</span>
          </a>
        ))}
      </motion.div>
    );
  };

  export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
    return (
      <motion.div
        animate={{
          backdropFilter: visible ? "blur(10px)" : "none",
          boxShadow: "none",
          width: visible ? "90%" : "100%",
          paddingRight: visible ? "12px" : "0px",
          paddingLeft: visible ? "12px" : "0px",
          borderRadius: visible ? "4px" : "2rem",
          y: visible ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        className={cn(
          "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between px-0 py-2 lg:hidden bg-[rgba(245,246,250,0.85)] dark:bg-[rgba(24,24,27,0.92)] backdrop-blur-md",
          className,
        )}
      >
        {children}
      </motion.div>
    );
  };

  export const MobileNavHeader = ({
    children,
    className,
  }: MobileNavHeaderProps) => {
    return (
      <div
        className={cn(
          "flex w-full flex-row items-center justify-between",
          className,
        )}
      >
        {children}
      </div>
    );
  };

  export const MobileNavMenu = ({
    children,
    className,
    isOpen,
    onClose,
  }: MobileNavMenuProps) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-white px-4 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] dark:bg-neutral-950",
              className,
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  export const MobileNavToggle = ({
    isOpen,
    onClick,
  }: {
    isOpen: boolean;
    onClick: () => void;
  }) => {
    return isOpen ? (
      <IconX className="text-black dark:text-white" onClick={onClick} />
    ) : (
      <IconMenu2 className="text-black dark:text-white" onClick={onClick} />
    );
  };

  export const NavbarLogo = () => {
    return (
      <a
        href="#"
        className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
      >
      
        <Image
          src="/beige-logo.png"
          alt="ResDex transparent logo"
          width={30}
          height={30}
          style={{ objectFit: 'contain', borderRadius: '10px' }}
        />
        <span className="text-xl font-semibold">ResDex</span>
      </a>
    );
  };

  export const NavbarButton = ({
    href,
    as: Tag = "a",
    children,
    className,
    variant = "primary",
    ...props
  }: {
    href?: string;
    as?: React.ElementType;
    children: React.ReactNode;
    className?: string;
    variant?: "primary" | "secondary" | "dark" | "gradient";
  } & (
    | React.ComponentPropsWithoutRef<"a">
    | React.ComponentPropsWithoutRef<"button">
  )) => {
    const baseStyles =
      "px-6 py-2 rounded-full bg-white text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

    const variantStyles = {
      primary: "",
      secondary: "bg-transparent shadow-none dark:text-white",
      dark: "bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
      gradient:
        "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
    };

    return (
      <Tag
        href={href || undefined}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...props}
      > 
        {children}
      </Tag>
    );
  }; 