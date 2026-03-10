import Sidebar from './Sidebar';
import { useApp } from '../context/useApp';

export default function DashboardLayout({ children }) {
  const { state } = useApp();
  const { darkMode: dm } = state;
  return (
    <div className={`flex h-screen overflow-hidden ${dm ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <Sidebar />
      <main className={`flex-1 overflow-auto ${dm ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="p-3 sm:p-5 lg:p-6 mt-14 lg:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}