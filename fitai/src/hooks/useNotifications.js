import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'fitandrise-notifications';
const PREFS_KEY   = 'fitandrise-notif-prefs';

const defaultPrefs = {
  enabled:  false,
  meals:    true,
  water:    true,
  workout:  true,
};

export function useNotifications() {
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });

  const [prefs, setPrefs] = useState(() => {
    try { return { ...defaultPrefs, ...JSON.parse(localStorage.getItem(PREFS_KEY)) }; }
    catch { return defaultPrefs; }
  });

  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const addNotification = useCallback((title, body, type = 'info') => {
    const notif = {
      id:   Date.now(),
      title,
      body,
      type,
      read: false,
      time: new Date().toISOString(),
    };
    setNotifications(prev => [notif, ...prev]);
    return notif;
  }, []);

  const showBrowserNotif = useCallback((title, body, tag) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon:  '/fitandrise.jpeg',
        badge: '/fitandrise.jpeg',
        tag,
      });
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      setPrefs(p => ({ ...p, enabled: true }));
      showBrowserNotif('Notifications enabled!', 'You will now get reminders from FitandRise.', 'welcome');
      addNotification('Notifications enabled!', 'You will now get reminders from FitandRise.', 'info');
    }
    return result === 'granted';
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const updatePrefs = useCallback((patch) => {
    setPrefs(prev => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    if (!prefs.enabled || permission !== 'granted') return;

    const schedules = [
      prefs.meals   && { h: 8,  m: 0,  title: 'Breakfast time!',   body: 'Log your breakfast to start the day right.', type: 'meal',    tag: 'breakfast' },
      prefs.meals   && { h: 13, m: 0,  title: 'Lunch reminder!',   body: 'Do not forget to log your lunch.',           type: 'meal',    tag: 'lunch'     },
      prefs.meals   && { h: 19, m: 0,  title: 'Dinner time!',      body: 'Time to log your dinner.',                   type: 'meal',    tag: 'dinner'    },
      prefs.water   && { h: 10, m: 0,  title: 'Water reminder!',   body: 'Have you had enough water today?',           type: 'water',   tag: 'water-10'  },
      prefs.water   && { h: 12, m: 0,  title: 'Stay hydrated!',    body: 'Time for a glass of water!',                 type: 'water',   tag: 'water-12'  },
      prefs.water   && { h: 14, m: 0,  title: 'Water break!',      body: 'Drink up — hydration is key!',               type: 'water',   tag: 'water-14'  },
      prefs.water   && { h: 16, m: 0,  title: 'Hydration check!',  body: 'Do not forget your water intake.',           type: 'water',   tag: 'water-16'  },
      prefs.water   && { h: 20, m: 0,  title: 'Evening water!',    body: 'Have a glass of water before bed.',          type: 'water',   tag: 'water-20'  },
      prefs.workout && { h: 18, m: 0,  title: 'Workout time!',     body: 'Time to hit your workout goals!',            type: 'workout', tag: 'workout'   },
    ].filter(Boolean);

    const intervals = schedules.map(({ h, m, title, body, type, tag }) => {
      const now    = new Date();
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const delay = target - now;
      const timeout = setTimeout(() => {
        showBrowserNotif(title, body, tag);
        addNotification(title, body, type);
      }, delay);
      return timeout;
    });

    return () => intervals.forEach(clearTimeout);
  }, [prefs, permission]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    prefs,
    permission,
    addNotification,
    showBrowserNotif,
    requestPermission,
    markAllRead,
    clearAll,
    updatePrefs,
  };
}