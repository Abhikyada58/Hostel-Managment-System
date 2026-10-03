import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Droplets } from 'lucide-react';

export default function LaundryWorkerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('laundry_requests')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching laundry:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('laundry_requests')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      setSelectedRequest(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Worker Dashboard - Laundry</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <Droplets size={48} className="text-gray-300 mb-4" />
            <p>No laundry requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-medium">Room</th>
                  <th className="p-4 font-medium">Student</th>
                  <th className="p-4 font-medium">Clothes</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-bold text-gray-900">{req.room_number}</td>
                    <td className="p-4 text-sm text-gray-600">{req.profiles?.name || 'Unknown'}</td>
                    <td className="p-4 text-sm text-gray-900">{req.clothes_count} items</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[req.status] || 'bg-gray-100'}`}>
                        {formatStatus(req.status)}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {req.status !== 'completed' && (
                        <button 
                          onClick={() => setSelectedRequest(req)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Manage
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

      {/* Action Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Manage Laundry Request</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
              <p><strong>Room:</strong> {selectedRequest.room_number}</p>
              <p><strong>Student:</strong> {selectedRequest.profiles?.name}</p>
              <p><strong>Clothes:</strong> {selectedRequest.clothes_count} pieces</p>
              {selectedRequest.notes && (
                <p className="mt-2"><strong>Notes:</strong> {selectedRequest.notes}</p>
              )}
            </div>

            <div className="pt-2 grid grid-cols-1 gap-3">
              {selectedRequest.status === 'pending_pickup' && (
                <button 
                  onClick={() => updateStatus(selectedRequest.id, 'washing')}
                  className="bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Confirm Pickup & Start Washing
                </button>
              )}
              {selectedRequest.status === 'washing' && (
                <button 
                  onClick={() => updateStatus(selectedRequest.id, 'ready_for_delivery')}
                  className="bg-purple-600 text-white font-medium py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Mark as Ready for Delivery
                </button>
              )}
              {selectedRequest.status === 'ready_for_delivery' && (
                <button 
                  onClick={() => updateStatus(selectedRequest.id, 'delivered')}
                  className="bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Mark as Delivered to Room
                </button>
              )}
              
              <button 
                onClick={() => setSelectedRequest(null)}
                className="border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
