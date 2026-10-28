import React, { useState } from 'react';
import { Truck, CheckCircle2, Upload, MapPin, Camera, FileText } from 'lucide-react';
import axios from 'axios';
import { getSeverityBadgeColor, getStatusBadgeColor } from '@civicai/shared';

export function WorkerPortal({ incidents, currentUser, onIncidentUpdated }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [workerNotes, setWorkerNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter tasks assigned to worker or worker's department
  const assignedTasks = incidents.filter(i => 
    i.status !== 'Resolved' && (
      i.assignedDepartment === currentUser?.department || 
      i.responderUnit?.includes(currentUser?.name) || 
      i.responderUnit === 'Unassigned'
    )
  );

  const handleProofImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    setLoading(true);
    try {
      const res = await axios.post(`/api/incidents/${selectedTask.id}/resolve`, {
        resolutionProofUrl: proofImage || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=500',
        workerNotes: workerNotes || 'Field team repaired site and verified resolution photo.'
      });
      if (res.data.success) {
        onIncidentUpdated(res.data.incident);
        setSelectedTask(null);
        setProofImage(null);
        setWorkerNotes('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', marginTop: '1rem' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Truck color="var(--accent-purple)" size={24} />
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>
              Field Response Queue ({assignedTasks.length})
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Department: <strong>{currentUser?.department || 'Road Maintenance'}</strong>
            </p>
          </div>
        </div>

        {assignedTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={40} color="var(--accent-emerald)" style={{ marginBottom: '0.5rem' }} />
            <div>No active pending dispatches for your team sector!</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {assignedTasks.map(task => (
              <div
                key={task.id}
                className="incident-card"
                style={{
                  borderColor: selectedTask?.id === task.id ? 'var(--accent-purple)' : undefined,
                  background: selectedTask?.id === task.id ? 'rgba(139, 92, 246, 0.12)' : undefined,
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedTask(task)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span className="badge" style={{ background: getSeverityBadgeColor(task.severity) }}>
                    {task.severity}
                  </span>
                  <span className="badge" style={{ background: getStatusBadgeColor(task.status) }}>
                    {task.status}
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.3rem' }}>{task.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{task.description}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>📍 {task.address}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolution Proof Upload Panel */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Camera size={18} color="var(--accent-emerald)" />
          Resolution Verification
        </h3>

        {selectedTask ? (
          <form onSubmit={handleResolve}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Task #{selectedTask.id}</div>
              <div style={{ color: 'var(--text-muted)' }}>{selectedTask.title}</div>
            </div>

            {/* Photo Proof Upload Box */}
            <div className="form-group">
              <label className="form-label">Upload Completion Photo Evidence</label>
              <div style={{
                border: '2px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                position: 'relative'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofImageChange}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
                />
                {proofImage ? (
                  <div>
                    <img src={proofImage} alt="Proof" style={{ maxHeight: '140px', borderRadius: '8px', marginBottom: '0.4rem', objectFit: 'cover' }} />
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>✓ Resolution photo ready</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
                    <Upload size={22} color="var(--accent-emerald)" />
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Upload photo proof</div>
                    <div style={{ fontSize: '0.75rem' }}>Click or drop photo here</div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Field Notes / Work Summary</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={workerNotes}
                onChange={e => setWorkerNotes(e.target.value)}
                placeholder="Describe repair actions taken by field crew..."
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan))' }} disabled={loading}>
              <CheckCircle2 size={16} />
              {loading ? 'Submitting Resolution...' : 'Mark Resolved & Upload Evidence'}
            </button>
          </form>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
            Select an assigned dispatch task from the queue to upload completion evidence photo.
          </div>
        )}
      </div>
    </div>
  );
}
