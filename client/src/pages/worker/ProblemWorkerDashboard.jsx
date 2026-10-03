import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function ProblemWorkerDashboard() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [workerNote, setWorkerNote] = useState('');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      // We join with profiles to get the student's name
      const { data, error } = await supabase
        .from('problems')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProblems(data || []);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('problems')
        .update({ status: newStatus, worker_note: workerNote || null })
        .eq('id', id);
        
      if (error) throw error;
      
      setSelectedProblem(null);
      setWorkerNote('');
      fetchProblems(); // Refresh the list
    } catch (error) {
      alert(error.message);
    }
  };

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'accepted': 'bg-blue-100 text-blue-800',
    'in progress': 'bg-purple-100 text-purple-800',
    'solved': 'bg-green-100 text-green-800',
    'closed': 'bg-gray-100 text-gray-800',
    'reopened': 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Worker Dashboard - Problems</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading problems...</div>
        ) : problems.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <AlertCircle size={48} className="text-gray-300 mb-4" />
            <p>No problems assigned to you.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-medium">Room</th>
                  <th className="p-4 font-medium">Student</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {problems.map((prob) => (
                  <tr key={prob.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-bold text-gray-900">{prob.room_number}</td>
                    <td className="p-4 text-sm text-gray-600">{prob.profiles?.name || 'Unknown'}</td>
                    <td className="p-4 text-sm font-medium text-gray-900">{prob.category}</td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{prob.description}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusColors[prob.status] || 'bg-gray-100'}`}>
                        {prob.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {prob.status !== 'closed' && (
                        <button 
                          onClick={() => setSelectedProblem(prob)}
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
      {selectedProblem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Manage Problem</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
              <p><strong>Room:</strong> {selectedProblem.room_number}</p>
              <p><strong>Category:</strong> {selectedProblem.category}</p>
              <p className="mt-2 text-gray-900">{selectedProblem.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Add Worker Note (Optional)</label>
              <textarea 
                rows="2"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E.g., Need to buy a new wire..."
                value={workerNote}
                onChange={(e) => setWorkerNote(e.target.value)}
              ></textarea>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-3">
              {['pending', 'reopened'].includes(selectedProblem.status) && (
                <button 
                  onClick={() => updateStatus(selectedProblem.id, 'accepted')}
                  className="bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Accept Task
                </button>
              )}
              {selectedProblem.status === 'accepted' && (
                <button 
                  onClick={() => updateStatus(selectedProblem.id, 'in progress')}
                  className="bg-purple-600 text-white font-medium py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Start Work (In Progress)
                </button>
              )}
              {selectedProblem.status === 'in progress' && (
                <button 
                  onClick={() => updateStatus(selectedProblem.id, 'solved')}
                  className="bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Mark as Solved
                </button>
              )}
              
              <button 
                onClick={() => setSelectedProblem(null)}
                className="col-span-full border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition"
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
