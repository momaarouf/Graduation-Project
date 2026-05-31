'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useNotificationSocket } from '@/src/lib/hooks/useNotificationSocket';
import { usePushNotifications } from '@/src/lib/hooks/usePushNotifications';
import { notificationsApi, NotificationResponse } from '@/src/lib/api/notifications';
import { useAuth } from '@/src/lib/contexts/AuthContext';

export function NotificationBell() {
 const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
 const [unreadCount, setUnreadCount] = useState(0);
 const [isOpen, setIsOpen] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);
 const router = useRouter();
 const { user } = useAuth();

 const { permission, requestPermission, showNotification } = usePushNotifications();

 // Broadcast change to layouts for sidebar badges
 useEffect(() => {
 // We now rely on the unreadCount and the specific categories state 
 // to sync the sidebar. 
 }, [unreadCount, notifications]);

 const handleRefresh = async () => {
 try {
 const count = await notificationsApi.getUnreadCount();
 setUnreadCount(count);
 
 const categoryCounts = await notificationsApi.getUnreadCountsByCategory();
 window.dispatchEvent(new CustomEvent('notification-sync', { 
 detail: { unreadCount: count, categories: categoryCounts } 
 }));

 const data = await notificationsApi.getNotifications(0, 10);
 setNotifications(data.content || []);
 } catch (err) {
 console.error('Failed to sync notifications', err);
 }
 };

 useEffect(() => {
 handleRefresh();
 }, []);

 useNotificationSocket((newNotif) => {
 setNotifications((prev) => [newNotif, ...prev]);
 setUnreadCount((prev) => prev + 1);

 // Show browser push if permitted
 if (permission === 'granted') {
 showNotification(newNotif.title, { body: newNotif.message });
 }

 // Refresh counts so the sidebar updates
 handleRefresh();
 });

 // Close when clicking outside
 useEffect(() => {
 function handleClickOutside(event: MouseEvent) {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
 setIsOpen(false);
 }
 }
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);



 // Listen for precision notification marking events
 useEffect(() => {
 const handleMarkRead = () => {
 // Added 200ms grace period to ensure DB commit is finished 
 // before we ask for the new honest counts.
 setTimeout(() => {
 handleRefresh();
 }, 200);
 };

 window.addEventListener('notification-mark-read', handleMarkRead);
 return () => window.removeEventListener('notification-mark-read', handleMarkRead);
 }, []);

 const getNotificationUrl = (notification: NotificationResponse) => {
 const role = user?.role?.toLowerCase() || 'traveler';
 
 switch (notification.type) {
 case 'NEW_MESSAGE':
 return `/dashboard/${role}/messages${notification.referenceId ? `?id=${notification.referenceId}` : ''}`;
 case 'BOOKING_CREATED':
 case 'BOOKING_CONFIRMED':
 case 'BOOKING_CANCELLED':
 return notification.referenceId 
 ? `/dashboard/${role}/bookings/${notification.referenceId}` 
 : `/dashboard/${role}/bookings`;
 case 'VERIFICATION_SUBMITTED':
 case 'VERIFICATION_APPROVED':
 case 'VERIFICATION_REJECTED':
 return `/dashboard/guide/verification`;
 case 'PAYMENT_SUCCESS':
 case 'PAYMENT_FAILED':
 return notification.referenceId 
 ? `/dashboard/${role}/bookings/${notification.referenceId}`
 : `/dashboard/${role}/bookings`;
 case 'ACCOUNT_CREATED':
 case 'EMAIL_VERIFIED':
 case 'PASSWORD_CHANGED':
 case 'ACCOUNT_SUSPENDED':
 case 'ACCOUNT_REACTIVATED':
 return `/dashboard/${role}/settings`;
 case 'PROFILE_COMPLETED':
 return `/dashboard/${role}/profile`;
 default:
 return null;
 }
 };

 const handleNotificationClick = async (notification: NotificationResponse) => {
 if (!notification.isRead) {
 try {
 // If it's a message or booking, mark the whole group (reference) as read
 if (notification.type === 'NEW_MESSAGE' && notification.referenceId) {
 await notificationsApi.markByReference('NEW_MESSAGE', notification.referenceId);
 
 // Surgical local state update
 setNotifications(prev => prev.map(n => 
 (n.type === 'NEW_MESSAGE' && n.referenceId && n.referenceId === notification.referenceId) 
 ? { ...n, isRead: true } 
 : n
 ));
 } 
 else if (notification.type.startsWith('BOOKING_') && notification.referenceId) {
 await notificationsApi.markByReference(notification.type, notification.referenceId);
 
 // Surgical local state update
 setNotifications(prev => prev.map(n => 
 (n.type.startsWith('BOOKING_') && n.referenceId && n.referenceId === notification.referenceId) 
 ? { ...n, isRead: true } 
 : n
 ));
 }
 else {
 await notificationsApi.markAsRead(notification.id);
 setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
 }
 } catch (err) {
 console.error('Failed to mark read', err);
 }
 }

 const url = getNotificationUrl(notification);
 if (url) {
 router.push(url);
 setIsOpen(false);
 }
 };

 const handleMarkAllRead = async () => {
 try {
 await notificationsApi.markAllAsRead();
 setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
 setUnreadCount(0);
 } catch (err) {
 console.error('Failed to mark all read', err);
 }
 };

 return (
 <div className="relative z-50 text-left" ref={dropdownRef}>
 {/* Bell Button */}
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="relative p-2 rounded-full hover:surface-section dark:hover:surface-card transition-colors focus:outline-none"
 >
 <Bell className="w-6 h-6 text-theme-secondary" />
 {unreadCount > 0 && (
 <motion.div 
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-theme "
 >
 {unreadCount > 9 ? '9+' : unreadCount}
 </motion.div>
 )}
 </button>
 
 {/* Dropdown Panel */}
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 transition={{ duration: 0.2 }}
 className="absolute right-0 mt-2 w-80 md:w-96 surface-card rounded-xl shadow-xl border border-theme overflow-hidden"
 >
 {/* Header */}
 <div className="px-4 py-3 border-b border-[#c8d8f8] dark:border-[#1a3566] flex justify-between items-center surface-section">
 <h3 className="font-semibold text-theme-primary">Notifications</h3>
 <div className="flex gap-2">
 {permission === 'default' && (
 <button 
 onClick={requestPermission}
 className="text-xs text-primary-light dark:text-primary-dark dark:text-primary-dark hover:text-blue-700 dark:hover:text-blue-300 font-medium px-2 py-1 bg-primary-light/10 rounded-md"
 >
 Enable Push
 </button>
 )}
 {unreadCount > 0 && (
 <button 
 onClick={handleMarkAllRead}
 className="text-xs text-theme-muted hover:text-theme-primary dark:hover:text-gray-200 flex items-center gap-1"
 >
 <CheckCheck className="w-3 h-3" />
 Mark all read
 </button>
 )}
 </div>
 </div>
 
 {/* List */}
 <div className="max-h-[400px] overflow-y-auto w-full">
 {notifications.length === 0 ? (
 <div className="p-8 text-center text-theme-muted flex flex-col items-center">
 <div className="w-12 h-12 rounded-full surface-section flex items-center justify-center mb-2">
 <Bell className="w-6 h-6 text-gray-300 " />
 </div>
 <p className="text-sm">You have no notifications yet.</p>
 </div>
 ) : (
 <ul className="divide-y divide-gray-50 dark:divide-gray-800">
 {notifications.map((n) => (
 <li 
 key={n.id} 
 className={`p-4 hover:surface-section dark:hover:surface-card transition-colors cursor-pointer flex gap-3 ${!n.isRead ? 'bg-primary-light/5 dark:bg-primary-dark/14' : ''}`}
 onClick={() => handleNotificationClick(n)}
 >
 <div className="flex-1 min-w-0 text-left">
 <div className="flex justify-between items-start mb-1">
 <p className={`text-sm font-medium truncate ${!n.isRead ? 'text-theme-primary' : 'text-theme-secondary'}`}>
 {n.title}
 </p>
 <span className="text-[10px] text-theme-muted whitespace-nowrap ml-2">
 {new Date(n.createdAtUtc).toLocaleDateString()}
 </span>
 </div>
 <p className="text-sm text-theme-secondary line-clamp-2 leading-snug">
 {n.message}
 </p>
 </div>
 {!n.isRead && (
 <div className="flex flex-col justify-center">
 <span className="w-2 h-2 rounded-full bg-primary-light shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
 </div>
 )}
 </li>
 ))}
 </ul>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}

