import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../hooks/useNotifications';
import Icon from '@mdi/react';
import {
  mdiViewDashboard, mdiDumbbell, mdiFood, mdiChartBar,
  mdiCalculator, mdiAccount, mdiCog, mdiLogout,
  mdiWeatherNight, mdiWeatherSunny, mdiMenu, mdiClose,
  mdiBell, mdiBellOutline, mdiTrashCan, mdiWater,
  mdiFoodOutline, mdiDumbbellOff, mdiInformation,
} from '@mdi/js';

const navLinks = [
  { label: 'Dashboard',   to: '/dashboard', icon: mdiViewDashboard },
  { label: 'Workouts',    to: '/workouts',  icon: mdiDumbbell      },
  { label: 'Nutrition',   to: '/nutrition', icon: mdiFood          },
  { label: 'Progress',    to: '/progress',  icon: mdiChartBar      },
  { label: 'BMI & Tools', to: '/tools',     icon: mdiCalculator    },
];

const bottomLinks = [
  { label: 'Profile',  to: '/profile',  icon: mdiAccount },
  { label: 'Settings', to: '/settings', icon: mdiCog     },
];

const typeColors = {
  meal:    '#f97316',
  water:   '#3b82f6',
  workout: '#22c55e',
  info:    '#a855f7',
};

const typeIcons = {
  meal:    mdiFood,
  water:   mdiWater,
  workout: mdiDumbbell,
  info:    mdiInformation,
};

// ── Notification Bell ─────────────────────────────────────────
function NotificationBell({ dm }) {
  const { notifications, unreadCount, permission, requestPermission, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(p => !p);
    if (!open) markAllRead();
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${dm ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
        <Icon path={unreadCount > 0 ? mdiBell : mdiBellOutline} size={0.75} color={dm ? '#9ca3af' : '#6b7280'} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 top-11 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden ${dm ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-100'}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: dm ? '#374151' : '#f3f4f6' }}>
            <p className={`font-black text-sm ${dm ? 'text-white' : 'text-gray-800'}`}>Notifications</p>
            <div className="flex items-center gap-2">
              {permission !== 'granted' && (
                <button onClick={requestPermission}
                  className="text-xs px-2 py-1 rounded-lg font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)' }}>
                  Enable
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-gray-400 hover:text-red-400 transition">
                  <Icon path={mdiTrashCan} size={0.65} />
                </button>
              )}
            </div>
          </div>

          {/* Permission prompt */}
          {permission === 'default' && (
            <div className="px-4 py-3" style={{ background: dm ? 'rgba(168,85,247,0.08)' : 'rgba(168,85,247,0.04)' }}>
              <p className={`text-xs mb-2 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
                Enable notifications to get meal, water and workout reminders!
              </p>
              <button onClick={requestPermission}
                className="px-4 py-2 rounded-xl text-xs font-black text-white w-full"
                style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)' }}>
                Enable Notifications
              </button>
            </div>
          )}

          {/* Notification list */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <Icon path={mdiBellOutline} size={1.5} color={dm ? '#4b5563' : '#d1d5db'} />
                <p className={`text-sm ${dm ? 'text-gray-500' : 'text-gray-400'}`}>No notifications yet</p>
              </div>
            ) : notifications.map(n => (
              <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b transition-all ${dm ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-50 hover:bg-gray-50'}`}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${typeColors[n.type] || '#a855f7'}22` }}>
                  <Icon path={typeIcons[n.type] || mdiInformation} size={0.65} color={typeColors[n.type] || '#a855f7'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-xs ${dm ? 'text-white' : 'text-gray-800'}`}>{n.title}</p>
                  <p className={`text-xs mt-0.5 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatTime(n.time)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarContent({ onClose = () => {} }) {
  const { state, toggleDarkMode } = useApp();
  const { darkMode: dm, profile } = state;
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    onClose();
    navigate('/');
  };

  const linkClass = (isActive) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
      isActive
        ? 'bg-blue-500 text-white shadow-md'
        : dm
          ? 'text-gray-400 hover:text-white hover:bg-gray-800'
          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
    }`;

  return (
    <div className={`flex flex-col h-full ${dm ? 'bg-gray-900' : 'bg-white'}`}>

      {/* Logo */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <img src="/fitandrise.jpeg" alt="FitandRise" className="w-9 h-9 rounded-xl object-cover" />
          <h1 className={`text-xl font-black ${dm ? 'text-white' : 'text-gray-800'}`}>FitandRise</h1>
        </div>
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
          <Icon path={mdiClose} size={0.9} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navLinks.map(({ label, to, icon }) => (
          <NavLink key={label} to={to} onClick={onClose}
            className={({ isActive }) => linkClass(isActive)}>
            <Icon path={icon} size={0.8} />
            {label}
          </NavLink>
        ))}

        <div className={`my-3 border-t ${dm ? 'border-gray-800' : 'border-gray-100'}`} />

        {bottomLinks.map(({ label, to, icon }) => (
          <NavLink key={label} to={to} onClick={onClose}
            className={({ isActive }) => linkClass(isActive)}>
            <Icon path={icon} size={0.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className={`px-4 pb-4 pt-3 border-t space-y-2 ${dm ? 'border-gray-800' : 'border-gray-100'}`}>
        <button onClick={toggleDarkMode}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
            dm ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}>
          <div className="flex items-center gap-2">
            <Icon path={dm ? mdiWeatherSunny : mdiWeatherNight} size={0.75} />
            <span className="font-medium text-sm">{dm ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-all ${dm ? 'bg-blue-500' : 'bg-gray-200'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-all ${dm ? 'left-5' : 'left-0.5'}`} />
          </div>
        </button>

        {/* User + logout */}
        <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${dm ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-black text-sm">
              {profile.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className={`text-xs font-bold ${dm ? 'text-white' : 'text-gray-800'}`}>{profile.name}</p>
              <p className={`text-xs ${dm ? 'text-gray-500' : 'text-gray-400'}`}>{profile.goal}</p>
            </div>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-red-500 transition" title="Logout">
            <Icon path={mdiLogout} size={0.75} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { state } = useApp();
  const { darkMode: dm } = state;
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile topbar */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 shadow-sm ${dm ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex items-center gap-2">
          <img src="/fitandrise.jpeg" alt="FitandRise" className="w-7 h-7 rounded-lg object-cover" />
          <span className={`font-black ${dm ? 'text-white' : 'text-gray-800'}`}>FitandRise</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell dm={dm} />
          <button onClick={() => setOpen(true)} className={dm ? 'text-white' : 'text-gray-700'}>
            <Icon path={mdiMenu} size={1} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 shadow-2xl overflow-hidden">
            <SidebarContent onClose={() => setOpen(false)} />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}