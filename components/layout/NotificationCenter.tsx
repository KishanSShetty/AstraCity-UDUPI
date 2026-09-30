"use client";

import React, { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Bell, CheckCheck, Trash2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";

type NotificationType = "CRITICAL" | "ALERT" | "WARNING" | "INFO" | string;

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time?: string;
  timestamp?: string;
  read: boolean;
  link?: string;
}

const INITIAL_MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n-1",
    type: "CRITICAL",
    title: "Indrali Methane Spike (+185%)",
    message: "Subsurface IoT telemetry detected 480 ppm methane concentration along Indrali Pit 3.",
    time: "10 mins ago",
    read: false,
    link: "/alerts"
  },
  {
    id: "n-2",
    type: "WARNING",
    title: "Malpe Beach Waste Hotspot",
    message: "Coastal commercial fish waste dumping flagged along Malpe beach intertidal sector.",
    time: "42 mins ago",
    read: false,
    link: "/cases"
  },
  {
    id: "n-3",
    type: "INFO",
    title: "Weighbridge Manifests Ingested",
    message: "Successfully synchronized 45 weighbridge vehicle logs and calibrated GPS telemetry.",
    time: "2 hours ago",
    read: true,
    link: "/data-ingestion"
  }
];

export function NotificationCenter() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "CRITICAL":
      case "ALERT":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "WARNING":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "INFO":
      default:
        return <Info className="w-5 h-5 text-emerald-600" />;
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    if (notification.link) {
      setIsOpen(false);
      router.push(notification.link);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="relative p-2 rounded-lg hover:bg-slate-100 focus-visible:outline-none transition-colors cursor-pointer text-slate-500 hover:text-slate-800">
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white shadow-xs">
          </span>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-[380px] sm:w-[420px] p-0 flex flex-col bg-white">
        <SheetHeader className="p-5 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-sm font-bold text-slate-900">
              Live SWM Telemetry Alerts
              {unreadCount > 0 && (
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {unreadCount} New
                </Badge>
              )}
            </SheetTitle>
            <div className="flex gap-1.5">
              <Button variant="ghost" size="icon" onClick={markAllAsRead} title="Mark all read" className="h-7 w-7 text-slate-500 hover:text-slate-800">
                <CheckCheck className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={clearAll} title="Clear all" className="h-7 w-7 text-slate-400 hover:text-rose-600">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
              <Bell className="w-10 h-10 mb-3 text-slate-300" />
              <p className="text-xs font-semibold text-slate-700">No new notifications</p>
              <p className="text-[11px] text-slate-400 mt-1">All Udupi CMC sensor feeds normal.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex gap-3.5 p-4 hover:bg-slate-50 transition-colors cursor-pointer relative",
                    !notification.read && "bg-emerald-50/30"
                  )}
                >
                  {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-r-full" />
                  )}
                  <div className="mt-0.5 shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className={cn("text-xs font-bold text-slate-800", !notification.read && "text-slate-900")}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium pt-0.5">
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
