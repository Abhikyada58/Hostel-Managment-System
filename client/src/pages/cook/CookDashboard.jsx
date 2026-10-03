import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Coffee, MessageSquare, Plus, CheckCircle, X } from 'lucide-react';

export default function CookDashboard() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'complaints'
  
  const [menus, setMenus] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Menu Modal State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [menuForm, setMenuForm] = useState({
    menu_date: new Date().toISOString().split('T')[0],
    breakfast: '',
    lunch: '',
    dinner: '',
    notes: ''
  });

  // Complaint Response Modal State
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseForm, setResponseForm] = useState({
    status: 'in_progress',
    cook_response: ''
  });

  useEffect(() => {
    if (activeTab === 'menu') fetchMenus();
    else fetchComplaints();
  }, [activeTab]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('food_menus')
        .select('*')
        .order('menu_date', { ascending: false });
        
      if (error) throw error;
      setMenus(data || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('food_complaints')
        .select('*, profiles(name, room_number)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('food_menus').upsert([{
        menu_date: menuForm.menu_date,
        breakfast: menuForm.breakfast,
        lunch: menuForm.lunch,
        dinner: menuForm.dinner,
        notes: menuForm.notes
      }], { onConflict: 'menu_date' });
      
      if (error) throw error;
      
      setIsMenuModalOpen(false);
      fetchMenus();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSaveResponse = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('food_complaints')
        .update({
          status: responseForm.status,
          cook_response: responseForm.cook_response
        })
        .eq('id', selectedComplaint.id);
        
      if (error) throw error;
      
      setIsResponseModalOpen(false);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      alert(error.message);
    }
  };

  const openResponseModal = (comp) => {
    setSelectedComplaint(comp);
    setResponseForm({
      status: comp.status,
      cook_response: comp.cook_response || ''
    });
    setIsResponseModalOpen(true);
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
        <h1 className="text-2xl font-bold text-gray-900">Cook Dashboard</h1>
        {activeTab === 'menu' && (
          <button 
            onClick={() => {
              setMenuForm({
                menu_date: new Date().toISOString().split('T')[0],
                breakfast: '', lunch: '', dinner: '', notes: ''
              });
              setIsMenuModalOpen(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            <span>Add / Update Menu</span>
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
            <span>Manage Menus</span>
          </div>
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'complaints' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('complaints')}
        >
          <div className="flex items-center space-x-2">
            <MessageSquare size={18} />
            <span>Student Feedback</span>
          </div>
        </button>
      </div>

      {/* Menu Content */}
      {activeTab === 'menu' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading menus...</div>
          ) : menus.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Coffee size={48} className="mx-auto text-gray-300 mb-4" />
              <p>No menus added yet. Click "Add / Update Menu" to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Breakfast</th>
                    <th className="p-4 font-medium">Lunch</th>
                    <th className="p-4 font-medium">Dinner</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {menus.map((menu) => (
                    <tr key={menu.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm font-medium text-gray-900">
                        {new Date(menu.menu_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm text-gray-600 max-w-[200px] truncate">{menu.breakfast}</td>
                      <td className="p-4 text-sm text-gray-600 max-w-[200px] truncate">{menu.lunch}</td>
                      <td className="p-4 text-sm text-gray-600 max-w-[200px] truncate">{menu.dinner}</td>
                      <td className="p-4 text-sm">
                        <button 
                          onClick={() => {
                            setMenuForm({
                              menu_date: menu.menu_date,
                              breakfast: menu.breakfast,
                              lunch: menu.lunch,
                              dinner: menu.dinner,
                              notes: menu.notes || ''
                            });
                            setIsMenuModalOpen(true);
                          }}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            <div className="p-12 text-center text-gray-500">
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
              <p>No queries or complaints from students yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {complaints.map((comp) => (
                <div key={comp.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs rounded uppercase tracking-wider font-semibold ${comp.type === 'complaint' ? 'bg-red-100 text-red-700' : comp.type === 'suggestion' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {comp.type}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {comp.profiles?.name || 'Student'} (Room: {comp.profiles?.room_number || 'TBD'})
                      </span>
                      <span className="text-sm text-gray-500">{new Date(comp.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full capitalize font-medium ${statusColors[comp.status] || 'bg-gray-100'}`}>
                      {formatText(comp.status)}
                    </span>
                  </div>
                  <p className="text-gray-900 mt-3 font-medium">{comp.message}</p>
                  
                  {comp.cook_response && (
                    <div className="mt-3 bg-white p-3 rounded border border-gray-200 text-sm text-gray-700">
                      <strong>Your Reply:</strong> {comp.cook_response}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => openResponseModal(comp)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {comp.cook_response ? 'Edit Response' : 'Reply & Update Status'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Menu Modal */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Manage Daily Menu</h2>
              <button onClick={() => setIsMenuModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveMenu} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={menuForm.menu_date}
                  onChange={(e) => setMenuForm({...menuForm, menu_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breakfast</label>
                <textarea 
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={menuForm.breakfast}
                  onChange={(e) => setMenuForm({...menuForm, breakfast: e.target.value})}
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lunch</label>
                <textarea 
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={menuForm.lunch}
                  onChange={(e) => setMenuForm({...menuForm, lunch: e.target.value})}
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dinner</label>
                <textarea 
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={menuForm.dinner}
                  onChange={(e) => setMenuForm({...menuForm, dinner: e.target.value})}
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Notes (Optional)</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={menuForm.notes}
                  onChange={(e) => setMenuForm({...menuForm, notes: e.target.value})}
                />
              </div>

              <div className="pt-4 shrink-0">
                <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition">
                  Save Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {isResponseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Respond to Student</h2>
              <button onClick={() => setIsResponseModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveResponse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={responseForm.status}
                  onChange={(e) => setResponseForm({...responseForm, status: e.target.value})}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Reply</label>
                <textarea 
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter response to the student..."
                  value={responseForm.cook_response}
                  onChange={(e) => setResponseForm({...responseForm, cook_response: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Save Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
