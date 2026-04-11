import { useState, useEffect } from 'react';

type PermissionState = 'default' | 'granted' | 'denied';

export function usePushNotifications() {
  const [permission, setPermission] = useState<PermissionState>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission as PermissionState);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return;
    }

    try {
      const p = await Notification.requestPermission();
      setPermission(p as PermissionState);
      return p;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!('Notification' in window)) {
      return;
    }
    
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico', // Default icon, can be overridden by options
        ...options
      });
      
      return notification;
    }
  };

  return { permission, requestPermission, showNotification };
}
