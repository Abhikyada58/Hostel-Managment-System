import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Zap, Plus, X, Search } from 'lucide-react';

export default function AccountantDashboard() {
  const [bills, setBills] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    student_id: '',
    room_number: '',
    billing_month: '',
    units: '',
    amount: '',
    due_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch bills
      const { data: billsData, error: billsError } = await supabase
        .from('electricity_bills')
        .select('*, profiles(name)')
        .order('created_at', { ascending: false });
        
      if (billsError) throw billsError;
      setBills(billsData || []);

      // Fetch students for dropdown
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id, name, room_number')
        .eq('role', 'student')
        .order('name');

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);
      
    } catch (error) {
      console.error("Error fetching accountant data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (studentId) => {
    const student = students.find(s => s.id === studentId);
    setFormData({
      ...formData,
      student_id: studentId,
      room_number: student?.room_number || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('electricity_bills').insert([{
        student_id: formData.student_id,
        room_number: formData.room_number || 'Unassigned',
        billing_month: formData.billing_month,
        units: parseInt(formData.units),
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        status: 'pending'
      }]);
      
      if (error) throw error;
      
      setIsModalOpen(false);
      setFormData({ student_id: '', room_number: '', billing_month: '', units: '', amount: '', due_date: '' });
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const markAsPaid = async (id) => {
    if (!window.confirm("Mark this bill as paid (Cash)?")) return;
    try {
      const { error } = await supabase
        .from('electricity_bills')
        .update({ status: 'paid' })
        .eq('id', id);
        
      if (error) throw error;
      fetchData();
    } catch (error) {
      alert(error.message);
    }
  };

  const statusStyles = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'paid': 'bg-green-100 text-green-800 border-green-200',
    'overdue': 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Accountant Dashboard</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          <span>Generate Bill</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 font-medium text-gray-700">
          Electricity Bills Management
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading bills...</div>
        ) : bills.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Zap size={48} className="mx-auto text-gray-300 mb-4" />
            <p>No electricity bills generated yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-medium">Student</th>
                  <th className="p-4 font-medium">Room</th>
                  <th className="p-4 font-medium">Month</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Due Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-medium text-gray-900">{bill.profiles?.name || 'Unknown'}</td>
                    <td className="p-4 text-sm text-gray-600">{bill.room_number}</td>
                    <td className="p-4 text-sm text-gray-900">{bill.billing_month}</td>
                    <td className="p-4 text-sm font-bold text-gray-900">₹{bill.amount}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(bill.due_date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full border capitalize font-medium ${statusStyles[bill.status]}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {bill.status !== 'paid' && (
                        <button 
                          onClick={() => markAsPaid(bill.id)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Mark Paid (Cash)
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

      {/* Generate Bill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Generate Electricity Bill</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.student_id}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  required
                >
                  <option value="">Select a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Room {s.room_number || 'TBD'})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Month</label>
                <input 
                  type="text"
                  placeholder="e.g. October 2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.billing_month}
                  onChange={(e) => setFormData({...formData, billing_month: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Units Consumed</label>
                  <input 
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    value={formData.units}
                    onChange={(e) => setFormData({...formData, units: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input 
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  required
                />
              </div>

              <div className="pt-4 shrink-0">
                <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition">
                  Create Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
