import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';
import { CreditCard, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function StudentFees() {
  const { profile } = useAuth();
  const [feeRecord, setFeeRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      // Fetch current fee record
      const { data: feeData, error: feeError } = await supabase
        .from('hostel_fees')
        .select('*')
        .eq('student_id', profile.id)
        .single();
        
      if (feeError && feeError.code !== 'PGRST116') throw feeError;
      setFeeRecord(feeData);

      // Fetch payment history
      const { data: historyData, error: historyError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;
      setHistory(historyData || []);
    } catch (error) {
      console.error("Error fetching fee data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = () => {
    alert("UPI Payment Gateway integration will be added in the final phase! For now, please pay via cash at the Accountant's office.");
  };

  const statusStyles = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'partially_paid': 'bg-blue-100 text-blue-800',
    'paid': 'bg-green-100 text-green-800',
    'overdue': 'bg-red-100 text-red-800'
  };

  const formatText = (text) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hostel Fees & Payments</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Fee Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center mb-6">
              <CreditCard className="mr-2 text-blue-600" size={20} />
              Current Academic Year Fees
            </h2>

            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading fee details...</div>
            ) : !feeRecord ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                <AlertCircle size={48} className="text-gray-300 mb-4" />
                <p>Your fee structure has not been assigned yet.</p>
                <p className="text-sm mt-2">Please contact the Accountant.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">Total Fees</p>
                    <p className="text-2xl font-bold text-gray-900">₹{feeRecord.total_fees}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <p className="text-sm text-green-600 font-medium mb-1">Amount Paid</p>
                    <p className="text-2xl font-bold text-green-700">₹{feeRecord.amount_paid}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <p className="text-sm text-red-600 font-medium mb-1">Pending Balance</p>
                    <p className="text-2xl font-bold text-red-700">
                      ₹{(parseFloat(feeRecord.total_fees) - parseFloat(feeRecord.amount_paid)).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`px-2 py-0.5 text-xs rounded uppercase font-bold tracking-wide ${statusStyles[feeRecord.status]}`}>
                        {formatText(feeRecord.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Clock size={14} className="mr-1" />
                      Due Date: <strong className="ml-1 text-gray-900">{new Date(feeRecord.due_date).toLocaleDateString()}</strong>
                    </p>
                  </div>
                  
                  {feeRecord.status !== 'paid' && (
                    <button 
                      onClick={handlePayNow}
                      className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow hover:bg-blue-700 transition"
                    >
                      Pay Pending Balance
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <FileText className="mr-2 text-gray-500" size={20} />
                Payment History
              </h2>
            </div>
            
            <div className="p-0">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading history...</div>
              ) : history.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p>No past payments found.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {history.map((record) => (
                    <li key={record.id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-900">₹{record.amount}</span>
                        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">
                          {record.method}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{formatText(record.type)}</span>
                        <span className="text-gray-400 text-xs">
                          {new Date(record.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
