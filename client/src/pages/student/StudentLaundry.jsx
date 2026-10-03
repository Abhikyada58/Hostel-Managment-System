import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';
import { Plus, X, Droplets, CheckCircle } from 'lucide-react';

export default function StudentLaundry() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    clothes_count: 1,
    notes: ''
  });

  useEffect(() => {
    fetchRequests();
  }, [profile]);

  const fetchRequests = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('laundry_requests')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching laundry requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('laundry_requests').insert([{
        student_id: profile.id,
        room_number: profile.room_number || 'Unassigned',
        clothes_count: parseInt(formData.clothes_count),
        notes: formData.notes
      }]);
      
      if (error) throw error;
      
      setIsModalOpen(false);
      setFormData({ clothes_count: 1, notes: '' });
      fetchRequests();
    } catch (error) {
      alert(error.message);
    }
  };

  const confirmReceived = async (id) => {
    try {
      const { error } = await supabase
        .from('laundry_requests')
        .update({ status: 'completed' })
        .eq('id', id);
      if (error) throw error;
      fetchRequests();
    } catch (error) {
      alert(error.message);
    }
  };

  const statusColors = {
    'pending_pickup': 'bg-yellow-100 text-yellow-800',
    'washing': 'bg-blue-100 text-blue-800',
    'ready_for_delivery': 'bg-purple-100 text-purple-800',
    'delivered': 'bg-indigo-100 text-indigo-800',
    'completed': 'bg-green-100 text-green-800'
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Laundry Service</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          <span>Request Pickup</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading your requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <Droplets size={48} className="text-gray-300 mb-4" />
            <p>You haven't requested any laundry pickups yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Items of Clothing</th>
                  <th className="p-4 font-medium">Notes</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">{req.clothes_count} pieces</td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{req.notes || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[req.status] || 'bg-gray-100'}`}>
                        {formatStatus(req.status)}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {req.status === 'delivered' && (
                        <button 
                          onClick={() => confirmReceived(req.id)}
                          className="flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium"
                        >
                          <CheckCircle size={16} />
                          <span>Confirm Received</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for requesting pickup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Request Laundry Pickup</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Clothes</label>
                <input 
                  type="number"
                  min="1"
                  max="50"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.clothes_count}
                  onChange={(e) => setFormData({...formData, clothes_count: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
                <textarea 
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="E.g., Please wash white shirts separately"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Schedule Pickup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
