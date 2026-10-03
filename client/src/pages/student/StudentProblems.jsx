import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';
import { Plus, X, AlertCircle } from 'lucide-react';

export default function StudentProblems() {
  const { profile } = useAuth();
  const [problems, setProblems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    category: 'Electrical',
    priority: 'low',
    description: ''
  });

  useEffect(() => {
    fetchProblems();
  }, [profile]);

  const fetchProblems = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProblems(data || []);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('problems').insert([{
        student_id: profile.id,
        room_number: profile.room_number || 'Unassigned',
        category: formData.category,
        priority: formData.priority,
        description: formData.description
      }]);
      
      if (error) throw error;
      
      setIsModalOpen(false);
      setFormData({ category: 'Electrical', priority: 'low', description: '' });
      fetchProblems(); // Refresh the list
    } catch (error) {
      alert(error.message);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('problems')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      fetchProblems();
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
        <h1 className="text-2xl font-bold text-gray-900">My Problems</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          <span>Report Problem</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading your problems...</div>
        ) : problems.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <AlertCircle size={48} className="text-gray-300 mb-4" />
            <p>You haven't reported any problems yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Priority</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {problems.map((prob) => (
                  <tr key={prob.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(prob.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">{prob.category}</td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{prob.description}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                        prob.priority === 'emergency' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {prob.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusColors[prob.status] || 'bg-gray-100'}`}>
                        {prob.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {prob.status === 'solved' && (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => updateStatus(prob.id, 'closed')}
                            className="text-green-600 hover:underline font-medium"
                          >
                            Confirm Solved
                          </button>
                          <button 
                            onClick={() => updateStatus(prob.id, 'reopened')}
                            className="text-red-600 hover:underline font-medium"
                          >
                            Reopen
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for reporting problem */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Report a Problem</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {['Electrical', 'Plumbing', 'Fan', 'Light', 'AC', 'Furniture', 'Bathroom', 'Water', 'Internet', 'Other'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Submit Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
