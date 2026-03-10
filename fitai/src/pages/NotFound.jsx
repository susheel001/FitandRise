import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
      <p className="text-8xl font-black text-blue-500 mb-4">404</p>
      <p className="text-2xl font-bold mb-2">Page Not Found</p>
      <p className="text-gray-400 mb-8">This page doesn't exist.</p>
      <Link to="/" className="px-6 py-3 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition">
        Back to Dashboard
      </Link>
    </div>
  );
}