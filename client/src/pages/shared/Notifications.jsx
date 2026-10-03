import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';
import { Bell, Megaphone, Calendar } from 'lucide-react';

export default function Notifications() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, [profile]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setNotices(data || []);
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
          <Bell size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
          <p className="text-gray-500 text-sm">Important announcements and updates</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading notices...</div>
      ) : notices.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Megaphone size={48} className="mb-4 text-gray-200" />
          <p className="text-lg font-medium text-gray-500">No notices at the moment</p>
          <p className="text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{notice.title}</h2>
                  <span className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    <Calendar size={12} className="mr-1" />
                    {new Date(notice.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="prose prose-sm max-w-none text-gray-600">
                  {notice.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 last:mb-0">{line}</p>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    Audience: {notice.target_audience === 'all' ? 'Everyone' : notice.target_audience.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
