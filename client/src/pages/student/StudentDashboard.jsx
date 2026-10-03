import { useAuth } from '../../context/AuthContext';
import { AlertCircle, ShoppingBag, Droplets, Zap, CreditCard, Coffee, ChevronRight, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, colorClass, linkTo }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <Link to={linkTo} className="text-gray-400 hover:text-blue-500">
        <ChevronRight size={20} />
      </Link>
    </div>
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
  </div>
);

export default function StudentDashboard() {
  const { profile } = useAuth();

  // Mock data for Phase 3 UI testing
  const stats = {
    pendingProblems: 1,
    laundryStatus: 'Washing',
    pendingItems: 0,
    electricityBill: '₹640',
    hostelFees: '₹14,000',
    todaysMenu: 'Paneer, Roti, Dal'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile?.name}!</h1>
          <p className="text-sm text-gray-500 mt-1">Room: {profile?.room_number || 'Unassigned'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Pending Problems" 
          value={stats.pendingProblems} 
          icon={AlertCircle} 
          colorClass="bg-red-500 text-red-500"
          linkTo="/student/problems" 
        />
        <StatCard 
          title="Laundry Status" 
          value={stats.laundryStatus} 
          icon={Droplets} 
          colorClass="bg-blue-500 text-blue-500"
          linkTo="/student/laundry" 
        />
        <StatCard 
          title="Item Requests" 
          value={stats.pendingItems} 
          icon={ShoppingBag} 
          colorClass="bg-purple-500 text-purple-500"
          linkTo="/student/items" 
        />
        <StatCard 
          title="Pending Fees" 
          value={stats.hostelFees} 
          icon={CreditCard} 
          colorClass="bg-orange-500 text-orange-500"
          linkTo="/student/fees" 
        />
        <StatCard 
          title="Electricity Bill" 
          value={stats.electricityBill} 
          icon={Zap} 
          colorClass="bg-yellow-500 text-yellow-500"
          linkTo="/student/electricity" 
        />
        <StatCard 
          title="Today's Dinner" 
          value={stats.todaysMenu} 
          icon={Coffee} 
          colorClass="bg-green-500 text-green-500"
          linkTo="/student/menu" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Notifications Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 text-blue-800 rounded-lg">
              <Bell size={20} className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">Electricity Bill Generated</p>
                <p className="text-xs mt-1 text-blue-600">Your bill for October is ready to pay.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/student/problems" className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Report Problem</span>
            </Link>
            <Link to="/student/fees" className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors flex flex-col items-center justify-center text-center">
              <CreditCard className="w-8 h-8 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Pay Fees</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
