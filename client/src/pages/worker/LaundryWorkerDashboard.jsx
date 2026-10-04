import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabase';
import { Droplets, Plus, X, Upload } from 'lucide-react';

export default function LaundryWorkerDashboard() {
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [formData, setFormData] = useState({
    student_id: '',
    clothes_count: '',
    image: null
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      alert("Could not access camera: " + err.message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
          setFormData({ ...formData, image: file });
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  // Close camera when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      stopCamera();
    }
  }, [isModalOpen]);

  useEffect(() => {
    fetchRequests();
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, room_number')
        .eq('role', 'student')
        .order('room_number', { ascending: true });
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

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
      fetchRequests();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCollectSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_id || !formData.clothes_count || !formData.image) {
      alert("Please fill all fields and upload a photo.");
      return;
    }

    try {
      setSubmitting(true);
      const student = students.find(s => s.id === formData.student_id);
      
      // Upload image
      const fileExt = formData.image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `laundry/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images') // Reusing profile-images bucket to avoid RLS issues for now
        .upload(filePath, formData.image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Insert Request
      const { error: insertError } = await supabase
        .from('laundry_requests')
        .insert([{
          student_id: student.id,
          room_number: student.room_number || 'Unassigned',
          clothes_count: parseInt(formData.clothes_count),
          image_url: publicUrl,
          status: 'washing'
        }]);

      if (insertError) throw insertError;

      setIsModalOpen(false);
      setFormData({ student_id: '', clothes_count: '', image: null });
      fetchRequests();
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'washing':             return 'badge badge-progress';
      case 'ready_for_delivery':  return 'badge badge-accent';
      case 'delivered':           return 'badge badge-accent';
      case 'completed':           return 'badge badge-done';
      case 'disputed':            return 'badge badge-error';
      default:                    return 'badge badge-pending';
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Worker Dashboard</h1>
          <p className="page-subtitle">Manage laundry collection & delivery</p>
        </div>
        <button
          className="accent-btn"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} />
          Collect Clothes
        </button>
      </div>

      {/* Table Card */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Droplets size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p>No active laundry collections.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Student</th>
                  <th>Clothes</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{req.room_number}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{req.profiles?.name || 'Unknown'}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{req.clothes_count} items</td>
                    <td>
                      <span className={getStatusBadgeClass(req.status)}>
                        {formatStatus(req.status)}
                      </span>
                      {req.status === 'disputed' && req.dispute_reason && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--error-color)', marginTop: '4px' }}>
                          "{req.dispute_reason}"
                        </div>
                      )}
                    </td>
                    <td>
                      {req.status === 'washing' && (
                        <button
                          onClick={() => updateStatus(req.id, 'delivered')}
                          className="accent-btn"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                        >
                          Mark as Delivered
                        </button>
                      )}
                      {req.status === 'disputed' && (
                        <button
                          onClick={() => updateStatus(req.id, 'completed')}
                          className="accent-btn"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'var(--success-color)', borderColor: 'var(--success-color)' }}
                        >
                          Resolve Dispute
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

      {/* Collect Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Collect Clothes
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="glass-label">Select Student / Room</label>
                <select
                  className="glass-input"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  required
                >
                  <option value="">Select a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      Room {s.room_number || 'N/A'} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="glass-label">Number of Clothes</label>
                <input
                  type="number" min="1" max="100" required
                  className="glass-input"
                  value={formData.clothes_count}
                  onChange={(e) => setFormData({ ...formData, clothes_count: e.target.value })}
                />
              </div>

              <div>
                <label className="glass-label">Photo of Clothes</label>
                <div style={{
                  border: '1.5px dashed var(--input-border)', borderRadius: '12px',
                  padding: formData.image || isCameraActive ? '0' : '1.5rem', 
                  textAlign: 'center', position: 'relative', overflow: 'hidden',
                  background: 'var(--input-bg)', minHeight: '150px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                  {formData.image ? (
                    <>
                      <img src={URL.createObjectURL(formData.image)} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                      <button type="button" onClick={() => setFormData({...formData, image: null})} style={{
                        position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', 
                        border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <X size={16} />
                      </button>
                    </>
                  ) : isCameraActive ? (
                    <div style={{ width: '100%', position: 'relative' }}>
                      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block' }}></video>
                      <button type="button" onClick={capturePhoto} className="accent-btn" style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', padding: '0.4rem 1rem' }}>
                        Take Photo
                      </button>
                      <button type="button" onClick={stopCamera} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer' }}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button type="button" onClick={startCamera} className="neo-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                        📷 Open Camera
                      </button>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR</div>
                      <div style={{ position: 'relative' }}>
                        <button type="button" className="neo-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', pointerEvents: 'none' }}>
                          <Upload size={16} style={{ display: 'inline', marginRight: '5px' }} /> Upload File
                        </button>
                        <input
                          type="file" accept="image/*"
                          onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  )}
                  <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="accent-btn" style={{ width: '100%', justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Uploading...' : 'Confirm Collection'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
