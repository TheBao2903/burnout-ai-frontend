// ==========================================
// Sidebar - Navigation menu (full height)
// ==========================================

import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Heart,
  MessageSquare,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar - full height */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            {user?.role === "admin" ? "Admin Portal" : "Burnout AI"}
          </span>
        </div>

        {/* User info - clickable to profile */}
        <Link
          to="/profile"
          onClick={onClose}
          className="block px-4 py-3.5 border-b border-gray-800 hover:bg-gray-800/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user?.full_name || user?.username || "User"}
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-700"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                  user?.role === "admin"
                    ? "bg-purple-600 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {(user?.full_name || user?.username || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate text-white">
                  {user?.full_name || user?.username || 'User'}
                </p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wide whitespace-nowrap shrink-0 leading-tight ${
                    user?.role === "admin"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  }`}
                >
                  {user?.role === "admin" ? "Admin" : "Thành viên"}
                </span>
              </div>
              <p className="text-xs text-gray-400 truncate mt-0.5" title={user?.email}>
                {user?.email}
              </p>
            </div>
          </div>
        </Link>

        {/* Navigation - at top */}
        <nav className="flex-1 flex flex-col justify-start px-3 py-6 space-y-1 overflow-y-auto">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3.5 rounded-xl
              transition-colors duration-200
              ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-300 hover:bg-gray-800'}
            `}
          >
            <LayoutDashboard size={20} />
            <span className="text-sm font-medium">
              {user?.role === "admin" ? "Dashboard Quản trị" : "Sức khỏe tinh thần"}
            </span>
          </NavLink>

          <NavLink
            to="/emotion-test"
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3.5 rounded-xl
              transition-colors duration-200
              ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-300 hover:bg-gray-800'}
            `}
          >
            <Heart size={20} />
            <span className="text-sm font-medium">Đo cảm xúc AI</span>
          </NavLink>

          <NavLink
            to="/survey-test"
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3.5 rounded-xl
              transition-colors duration-200
              ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-300 hover:bg-gray-800'}
            `}
          >
            <ClipboardList size={20} />
            <span className="text-sm font-medium">Khảo sát trạng thái</span>
          </NavLink>

          <NavLink
            to="/chat"
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3.5 rounded-xl
              transition-colors duration-200
              ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-300 hover:bg-gray-800'}
            `}
          >
            <MessageSquare size={20} />
            <span className="text-sm font-medium">Chat cảm xúc</span>
          </NavLink>

          {/* CHỈ HIỂN THỊ CÁC MỤC ADMIN NẾU ROLE LÀ ADMIN */}
          {user?.role === "admin" && (
            <>
              <div className="pt-4 pb-1 px-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Hệ thống Quản trị
                </span>
              </div>

              <NavLink
                to="/users"
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-colors duration-200
                  ${isActive ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-gray-300 hover:bg-gray-800'}
                `}
              >
                <Users size={20} />
                <span className="text-sm font-medium">Quản lý Users</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-lg
              text-gray-300 hover:bg-red-600 hover:text-white
              transition-colors duration-200"
          >
            <LogOut size={22} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
