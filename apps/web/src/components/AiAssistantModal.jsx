import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User } from 'lucide-react';

export function AiAssistantModal({ isOpen, onClose, incidents = [] }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your CivicAI Intelligent Assistant. Ask me anything about reporting issues, municipal status timelines, or current city statistics.'
    }
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newMsgs = [...messages, { sender: 'user', text: userText }];
    setMessages(newMsgs);
    setInput('');

    // Compute live statistics from MongoDB incident array
    const total = incidents.length;
    const resolved = incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED' || i.status === 'Resolved').length;
    const active = total - resolved;
    const potholes = incidents.filter(i => i.category === 'Pothole & Road Damage' || i.category === 'pothole').length;
    const waste = incidents.filter(i => i.category === 'Municipal/Sanitation' || i.category === 'garbage' || i.category === 'Sanitation & Waste Overflow').length;

    let reply = '';
    const q = userText.toLowerCase();

    if (q.includes('how to report') || q.includes('report issue')) {
      reply = 'To report a civic problem: Click "+ Report an Issue" in the top bar. Upload a photo or video of the issue, select your location on the map, provide details, and submit!';
    } else if (q.includes('status') || q.includes('timeline') || q.includes('progress')) {
      reply = `Complaint progress goes through 9 clear stages: Complaint Submitted → AI Analysis Completed → Complaint Verified → Department Assigned → Work Started → Work In Progress → Work Completed → Issue Resolved → Complaint Closed.`;
    } else if (q.includes('stat') || q.includes('count') || q.includes('total') || q.includes('how many')) {
      reply = `Current CivicAI Live Database Statistics: Total Complaints: ${total} | Active Work: ${active} | Resolved/Closed: ${resolved} | Pothole Reports: ${potholes} | Waste Reports: ${waste}.`;
    } else if (q.includes('pothole')) {
      reply = `There are currently ${potholes} pothole reports in the system auto-routed to the Road Maintenance department.`;
    } else if (q.includes('waste') || q.includes('garbage')) {
      reply = `There are currently ${waste} waste overflow reports in the system assigned to the Municipal/Sanitation department.`;
    } else {
      reply = `CivicAI automatically routes reports using Vision Computer Vision. Currently tracking ${total} total city complaints (${active} active work tickets). How else can I assist you?`;
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 400);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="ai-modal-title">
      <div className="modal-box flex h-[80vh] max-w-[650px] flex-col">
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <Sparkles size={22} className="text-blue-600" aria-hidden="true" />
            <h3 id="ai-modal-title" className="font-display text-xl font-bold text-slate-900 mb-0">
              CivicAI Intelligent Assistant
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 border-0 bg-transparent">
            <X size={20} />
          </button>
        </div>

        {/* Chat History Box */}
        <div className="mb-4 flex flex-1 flex-col gap-3.5 overflow-y-auto pr-1" role="log" aria-live="polite" aria-label="Conversation">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex max-w-[88%] gap-2.5 ${m.sender === 'user' ? 'self-end' : 'self-start'}`}
            >
              {m.sender === 'bot' && (
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-600">
                  <Bot size={16} className="text-white" aria-hidden="true" />
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-slate-100 text-slate-900'
                }`}
              >
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-700">
                  <User size={16} className="text-white" aria-hidden="true" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Query Input */}
        <form onSubmit={handleSend} className="flex gap-2">
          <label htmlFor="ai-input" className="sr-only">Your question</label>
          <input
            id="ai-input"
            className="form-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about complaints, status stages, or city statistics..."
          />
          <button type="submit" className="btn btn-primary shrink-0 px-4" aria-label="Send message">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
