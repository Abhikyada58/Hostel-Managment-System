import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Zap, Plus, X, CreditCard, FileText } from 'lucide-react';

export default function AccountantDashboard() {
  const [activeTab, setActiveTab] = useState('electricity'); // 'electricity', 'fees', 'history'
  
  const [bills, setBills] = useState([]);
  const [fees, setFees] = useState([]);
  const [history, setHistory] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const [billForm, setBillForm] = useState({ student_id: '', room_number: '', billing_month: '', units: '', amount: '', due_date: '' });
  const [feeForm, setFeeForm] = useState({ student_id: '', total_fees: '', due_date: '' });
  const [paymentForm, setPaymentForm] = useState({ student_id: '', type: 'hostel_fee', amount: '', method: 'cash', reference_id: null });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch students for dropdowns
      const { data: studentsData } = await supabase.from('profiles').select('id, name, room_number').eq('role', 'student').order('name');
      setStudents(studentsData || []);

      if (activeTab === 'electricity') {
        const { data } = await supabase.from('electricity_bills').select('*, profiles(name)').order('created_at', { ascending: false });
        setBills(data || []);
      } 
      else if (activeTab === 'fees') {
        const { data } = await supabase.from('hostel_fees').select('*, profiles(name, room_number)').order('updated_at', { ascending: false });
        setFees(data || []);
      }
      else if (activeTab === 'history') {
        const { data } = await supabase.from('payment_history').select('*, profiles(name, room_number)').order('created_at', { ascending: false });
        setHistory(data || []);
      }
    } catch (error) {
      console.error("Error fetching accountant data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for Electricity Bills ---
  const handleBillSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('electricity_bills').insert([{
        student_id: billForm.student_id,
        room_number: billForm.room_number || 'Unassigned',
        billing_month: billForm.billing_month,
        units: parseInt(billForm.units),
        amount: parseFloat(billForm.amount),
        due_date: billForm.due_date,
        status: 'pending'
      }]);
      if (error) throw error;
      setIsBillModalOpen(false);
      setBillForm({ student_id: '', room_number: '', billing_month: '', units: '', amount: '', due_date: '' });
      fetchData();
    } catch (error) { alert(error.message); }
  };

  // --- Handlers for Hostel Fees ---
  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('hostel_fees').upsert([{
        student_id: feeForm.student_id,
        total_fees: parseFloat(feeForm.total_fees),
        amount_paid: 0,
        due_date: feeForm.due_date,
        status: 'pending'
      }], { onConflict: 'student_id' });
      
      if (error) throw error;
      setIsFeeModalOpen(false);
      fetchData();
    } catch (error) { alert(error.message); }
  };

  // --- Handlers for Recording Payments ---
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const payAmount = parseFloat(paymentForm.amount);
      
      // 1. Record History
      const { error: histError } = await supabase.from('payment_history').insert([{
        student_id: paymentForm.student_id,
        type: paymentForm.type,
        amount: payAmount,
        method: paymentForm.method
      }]);
      if (histError) throw histError;

      // 2. Update parent table
      if (paymentForm.type === 'hostel_fee') {
        const feeRecord = fees.find(f => f.student_id === paymentForm.student_id);
        if (feeRecord) {
          const newPaid = parseFloat(feeRecord.amount_paid) + payAmount;
          let newStatus = 'partially_paid';
          if (newPaid >= parseFloat(feeRecord.total_fees)) newStatus = 'paid';
          await supabase.from('hostel_fees').update({ amount_paid: newPaid, status: newStatus }).eq('id', feeRecord.id);
        }
      } else if (paymentForm.type === 'electricity' && paymentForm.reference_id) {
        await supabase.from('electricity_bills').update({ status: 'paid' }).eq('id', paymentForm.reference_id);
      }

      setIsPaymentModalOpen(false);
      setPaymentForm({ student_id: '', type: 'hostel_fee', amount: '', method: 'cash', reference_id: null });
      fetchData();
      alert("Payment recorded successfully!");
    } catch (error) { alert(error.message); }
  };

  const statusStyles = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'partially_paid': 'bg-blue-100 text-blue-800',
    'paid': 'bg-green-100 text-green-800',
    'overdue': 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Accountant Dashboard</h1>
        <div className="flex space-x-3">
          <button onClick={() => setIsFeeModalOpen(true)} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
            Set Student Fee
          </button>
          <button onClick={() => setIsBillModalOpen(true)} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
            Generate Bill
          </button>
          <button onClick={() => setIsPaymentModalOpen(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <Plus size={20} />
            <span>Record Cash Payment</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'electricity' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('electricity')}
        ><Zap size={18} className="inline mr-2" />Electricity Bills</button>
        <button
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'fees' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('fees')}
        ><CreditCard size={18} className="inline mr-2" />Hostel Fees</button>
        <button
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('history')}
        ><FileText size={18} className="inline mr-2" />Payment History</button>
      </div>

      {/* Electricity Tab */}
      {activeTab === 'electricity' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : bills.length === 0 ? <div className="p-12 text-center text-gray-500">No bills generated.</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase">
                    <th className="p-4 font-medium">Student</th>
                    <th className="p-4 font-medium">Month</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bills.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm font-medium text-gray-900">{b.profiles?.name} (Rm {b.room_number})</td>
                      <td className="p-4 text-sm text-gray-900">{b.billing_month}</td>
                      <td className="p-4 text-sm font-bold text-gray-900">₹{b.amount}</td>
                      <td className="p-4"><span className={`px-2 py-1 text-xs rounded-full uppercase ${statusStyles[b.status]}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Fees Tab */}
      {activeTab === 'fees' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : fees.length === 0 ? <div className="p-12 text-center text-gray-500">No fee structures set.</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase">
                    <th className="p-4 font-medium">Student</th>
                    <th className="p-4 font-medium">Total Fees</th>
                    <th className="p-4 font-medium">Paid</th>
                    <th className="p-4 font-medium">Balance</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {fees.map(f => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm font-medium text-gray-900">{f.profiles?.name} (Rm {f.profiles?.room_number})</td>
                      <td className="p-4 text-sm text-gray-900">₹{f.total_fees}</td>
                      <td className="p-4 text-sm text-green-600 font-medium">₹{f.amount_paid}</td>
                      <td className="p-4 text-sm text-red-600 font-medium">₹{(f.total_fees - f.amount_paid).toFixed(2)}</td>
                      <td className="p-4"><span className={`px-2 py-1 text-xs rounded-full uppercase ${statusStyles[f.status]}`}>{f.status.replace('_', ' ')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : history.length === 0 ? <div className="p-12 text-center text-gray-500">No payments recorded.</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Student</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Method</th>
                    <th className="p-4 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map(h => (
                    <tr key={h.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm text-gray-500">{new Date(h.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-sm font-medium text-gray-900">{h.profiles?.name}</td>
                      <td className="p-4 text-sm text-gray-600 capitalize">{h.type.replace('_', ' ')}</td>
                      <td className="p-4 text-sm text-gray-600 uppercase">{h.method}</td>
                      <td className="p-4 text-sm font-bold text-gray-900">₹{h.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Record Payment</h2>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2" value={paymentForm.student_id} onChange={e => setPaymentForm({...paymentForm, student_id: e.target.value})} required>
                  <option value="">Select Student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} (Room {s.room_number})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2" value={paymentForm.type} onChange={e => setPaymentForm({...paymentForm, type: e.target.value})}>
                    <option value="hostel_fee">Hostel Fee</option>
                    <option value="electricity">Electricity Bill</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2" value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value})}>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI (Manual Verify)</option>
                  </select>
                </div>
              </div>
              {paymentForm.type === 'electricity' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill Reference ID (Optional)</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="UUID of the bill" value={paymentForm.reference_id || ''} onChange={e => setPaymentForm({...paymentForm, reference_id: e.target.value})} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹)</label>
                <input type="number" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} required />
              </div>
              <div className="pt-4 shrink-0"><button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700">Record Payment</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Bill & Fee Modals (Simplified versions for brevity) */}
      {/* ... Add Set Fee Modal and Generate Bill Modal ... */}
      {(isBillModalOpen || isFeeModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">{isBillModalOpen ? 'Generate Bill' : 'Set Fee Structure'}</h2>
            <p className="text-gray-500 mb-4 text-sm">Please select a student and configure the settings.</p>
            <form onSubmit={isBillModalOpen ? handleBillSubmit : handleFeeSubmit} className="space-y-4">
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2" required value={isBillModalOpen ? billForm.student_id : feeForm.student_id} onChange={e => {
                const sid = e.target.value;
                const stu = students.find(s => s.id === sid);
                if (isBillModalOpen) setBillForm({...billForm, student_id: sid, room_number: stu?.room_number});
                else setFeeForm({...feeForm, student_id: sid});
              }}>
                <option value="">Select Student...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              {isBillModalOpen ? (
                <>
                  <input type="text" placeholder="Billing Month (e.g. Oct 2026)" className="w-full border p-2 rounded" required value={billForm.billing_month} onChange={e => setBillForm({...billForm, billing_month: e.target.value})} />
                  <input type="number" placeholder="Units" className="w-full border p-2 rounded" required value={billForm.units} onChange={e => setBillForm({...billForm, units: e.target.value})} />
                  <input type="number" placeholder="Amount (₹)" className="w-full border p-2 rounded" required value={billForm.amount} onChange={e => setBillForm({...billForm, amount: e.target.value})} />
                  <input type="date" className="w-full border p-2 rounded" required value={billForm.due_date} onChange={e => setBillForm({...billForm, due_date: e.target.value})} />
                </>
              ) : (
                <>
                  <input type="number" placeholder="Total Yearly Fees (₹)" className="w-full border p-2 rounded" required value={feeForm.total_fees} onChange={e => setFeeForm({...feeForm, total_fees: e.target.value})} />
                  <input type="date" className="w-full border p-2 rounded" required value={feeForm.due_date} onChange={e => setFeeForm({...feeForm, due_date: e.target.value})} />
                </>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => isBillModalOpen ? setIsBillModalOpen(false) : setIsFeeModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
