import React, { useState } from 'react';
import { X, Star, MessageSquare, Send } from 'lucide-react';
import axios from 'axios';

export function FeedbackModal({ incident, onClose, onUpdated }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`/api/incidents/${incident.id}/feedback`, {
        rating,
        comment
      });
      if (res.data.success) {
        onUpdated(res.data.incident);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
      <div className="modal-box max-w-[440px]">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 id="feedback-modal-title" className="font-display text-xl font-bold text-slate-900 mb-0">
              Citizen Resolution Feedback
            </h3>
            <p className="mt-0.5 text-sm text-slate-600 mb-0">
              Rate the municipality work for Ticket #{incident.id}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 border-0 bg-transparent">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset className="m-0 border-0 p-0 text-center">
            <legend className="field-label mx-auto mb-3 text-center">Satisfaction Rating</legend>
            <div className="flex justify-center gap-1.5" role="radiogroup" aria-label="Satisfaction rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={star === rating}
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  onClick={() => setRating(star)}
                  className={`grid size-11 place-items-center rounded-lg border-0 bg-transparent transition-colors hover:bg-amber-50 ${star <= rating ? 'text-amber-500' : 'text-slate-400'}`}
                >
                  <Star size={32} fill={star <= rating ? '#f59e0b' : 'none'} />
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="fb-comment" className="field-label">Comments & Feedback</label>
            <textarea
              id="fb-comment"
              className="form-textarea"
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="e.g., Great response time! Road was completely repaired."
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading} aria-busy={loading}>
              <Send size={16} />
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
