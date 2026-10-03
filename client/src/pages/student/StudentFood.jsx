import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';
import { Coffee, MessageSquare, Plus, CheckCircle, Clock } from 'lucide-react';

export default function StudentFood() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'complaints'
  
  const [menus, setMenus] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'query',
    message: ''
  });

  useEffect(() => {
    if (activeTab === 'menu') fetchMenus();
    else fetchComplaints();
  }, [activeTab, profile]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('food_menus')
        .select('*')
        .order('menu_date', { ascending: false })
        .limit(7);
        
      if (error) throw error;
      setMenus(data || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('food_complaints')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('food_complaints').insert([{
        student_id: profile.id,
        type: formData.type,
        message: formData.message
      }]);
      
      if (error) throw error;
      
      setIsModalOpen(false);
      setFormData({ type: 'query', message: '' });
      fetchComplaints();
    } catch (error) {
      alert(error.message);
    }
  };

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'resolved': 'bg-green-100 text-green-800',
    'closed': 'bg-gray-100 text-gray-800'
  };

  const formatText = (text) => {
    return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Food & Mess</h1>
        {activeTab === 'complaints' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            <span>New Complaint/Query</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'menu' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('menu')}
        >
          <div className="flex items-center space-x-2">
            <Coffee size={18} />
            <span>Weekly Menu</span>
          </div>
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'complaints' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('complaints')}
        >
          <div className="flex items-center space-x-2">
            <MessageSquare size={18} />
            <span>My Complaints</span>
          </div>
        </button>
      </div>

      {/* Menu Content */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading menu...</div>
          ) : menus.length === 0 ? (
            <div className="bg-white p-12 text-center text-gray-500 rounded-xl shadow-sm border border-gray-100">
              <Coffee size={48} className="mx-auto text-gray-300 mb-4" />
              <p>The cook hasn't posted the menu yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menus.map((menu, index) => (
                <div key={menu.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${index === 0 ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100'}`}>
                  <div className={`p-4 border-b ${index === 0 ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                    <h3 className="font-bold text-gray-900">
                      {new Date(menu.menu_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    {index === 0 && <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Today's Menu</span>}
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Breakfast</h4>
                      <p className="text-gray-800">{menu.breakfast}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Lunch</h4>
                      <p className="text-gray-800">{menu.lunch}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dinner</h4>
                      <p className="text-gray-800">{menu.dinner}</p>
                    </div>
                    {menu.notes && (
                      <div className="pt-2 mt-2 border-t border-dashed border-gray-200">
                        <p className="text-sm text-gray-500 italic">"{menu.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Complaints Content */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading complaints...</div>
          ) : complaints.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
              <MessageSquare size={48} className="text-gray-300 mb-4" />
              <p>You haven't submitted any queries or complaints.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {complaints.map((comp) => (
                <div key={comp.id} className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs rounded uppercase tracking-wider font-semibold ${comp.type === 'complaint' ? 'bg-red-100 text-red-700' : comp.type === 'suggestion' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {comp.type}
                      </span>
                      <span className="text-sm text-gray-500">{new Date(comp.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full capitalize font-medium ${statusColors[comp.status] || 'bg-gray-100'}`}>
                      {formatText(comp.status)}
                    </span>
                  </div>
                  <p className="text-gray-900 mt-2 font-medium">{comp.message}</p>
                  
                  {comp.cook_response && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                        <CheckCircle size={14} className="mr-1" /> Cook's Response
                      </h4>
                      <p className="text-gray-700 text-sm">{comp.cook_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal for New Complaint */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Submit Query/Complaint</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitComplaint} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="query">General Query</option>
                  <option value="complaint">Complaint</option>
                  <option value="suggestion">Suggestion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea 
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your issue or suggestion..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
