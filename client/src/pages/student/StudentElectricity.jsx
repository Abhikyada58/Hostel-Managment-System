import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';
import { Zap, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

export default function StudentElectricity() {
  const { profile } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, [profile]);

  const fetchBills = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('electricity_bills')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (billId) => {
    alert("UPI Payment Gateway integration will be added in Phase 9! For now, please pay via cash at the Accountant's office.");
  };

  const statusStyles = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'paid': 'bg-green-100 text-green-800 border-green-200',
    'overdue': 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Electricity Bills</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading bills...</div>
        ) : bills.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <Zap size={48} className="text-gray-300 mb-4" />
            <p>You have no electricity bills pending.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-medium">Billing Month</th>
                  <th className="p-4 font-medium">Units Consumed</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Due Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-bold text-gray-900">{bill.billing_month}</td>
                    <td className="p-4 text-sm text-gray-600">{bill.units} units</td>
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
                      {bill.status !== 'paid' ? (
                        <button 
                          onClick={() => handlePayNow(bill.id)}
                          className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
                        >
                          <CreditCard size={16} />
                          <span>Pay Now</span>
                        </button>
                      ) : (
                        <span className="flex items-center space-x-1 text-green-600 font-medium">
                          <CheckCircle size={16} />
                          <span>Paid</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
