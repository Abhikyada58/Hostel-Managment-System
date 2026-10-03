import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, AlertCircle, ShoppingBag, Droplets, 
  Coffee, MessageSquare, Zap, CreditCard, 
  FileText, Bell, User, LogOut, Menu, X, BarChart2
} from 'lucide-react';

const getStudentLinks = () => [
  { name: 'Dashboard', path: '/student/dashboard', icon: Home },
  { name: 'My Problems', path: '/student/problems', icon: AlertCircle },
  { name: 'Item Requests', path: '/student/items', icon: ShoppingBag },
  { name: 'Laundry', path: '/student/laundry', icon: Droplets },
  { name: 'Food & Mess', path: '/student/food', icon: Coffee },
  { name: 'Electricity Bill', path: '/student/electricity', icon: Zap },
  { name: 'Hostel Fees', path: '/student/fees', icon: CreditCard },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Profile', path: '/profile', icon: User },
];

const getAdminLinks = () => [
  { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
  { name: 'Reports & Logs', path: '/admin/reports', icon: BarChart2 },
  { name: 'Students', path: '/admin/students', icon: User },
  { name: 'Profile', path: '/profile', icon: User },
];

const getWorkerProblemLinks = () => [
  { name: 'Dashboard', path: '/worker/problems', icon: AlertCircle },
  { name: 'Profile', path: '/profile', icon: User },
];

const getWorkerLaundryLinks = () => [
  { name: 'Item Requests', path: '/worker/items', icon: ShoppingBag },
  { name: 'Laundry', path: '/worker/laundry', icon: Droplets },
  { name: 'Profile', path: '/profile', icon: User },
];

const getCookLinks = () => [
  { name: 'Cook Dashboard', path: '/cook/dashboard', icon: Coffee },
  { name: 'Profile', path: '/profile', icon: User },
];

const getAccountantLinks = () => [
  { name: 'Dashboard', path: '/accountant/dashboard', icon: CreditCard },
  { name: 'Profile', path: '/profile', icon: User },
];

export default function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  let links = [];
  if (profile?.role === 'student') links = getStudentLinks();
  else if (profile?.role === 'admin') links = getAdminLinks();
  else if (profile?.role === 'worker_problem') links = getWorkerProblemLinks();
  else if (profile?.role === 'worker_laundry') links = getWorkerLaundryLinks();
  else if (profile?.role === 'cook') links = getCookLinks();
  else if (profile?.role === 'accountant') links = getAccountantLinks();
  // Other roles will be added as we progress through the phases

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out z-30 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700 bg-slate-800">
          <span className="text-lg font-bold">Hostel Manager</span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-800">
          <p className="text-sm font-medium">{profile?.name || 'User'}</p>
          <p className="text-xs text-slate-400 capitalize">{profile?.role}</p>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{link.name}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors mt-4"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200 shadow-sm z-10">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 flex justify-end items-center space-x-4">
            <Link to="/notifications" className="text-gray-400 hover:text-gray-500 relative cursor-pointer">
              <Bell size={24} />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </Link>
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold overflow-hidden border-2 border-white shadow-sm">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile?.name?.charAt(0) || 'U'
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
