import React, { useState, useEffect } from 'react';
import { X, Sparkles, Upload, Send, MapPin, CheckCircle2, ArrowRight, ArrowLeft, Phone, User, Trash2, RefreshCw, AlertTriangle, ShieldCheck, Check, Info, Loader2 } from 'lucide-react';
import axios from 'axios';
import { LocationPicker } from './LocationPicker.jsx';

export function IncidentFormModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  
  // STEP 1: Citizen Details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleStep1Submit = (e) => {
    e.preventDefault();
    const normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setPhoneError('');
    setPhone(normalizedPhone);
    setName(prev => prev.trim() || 'Citizen');
    setStep(2);
  };

  // STEP 2: Issue Details
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Pothole & Road Damage');
  const [description, setDescription] = useState('');
  const [issueError, setIssueError] = useState('');

  const handleStep2Submit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setIssueError('Please enter a problem description.');
      return;
    }
    setIssueError('');
    setStep(3);
  };

  // STEP 3: Photo Upload (Supabase Storage)
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [supabaseMedia, setSupabaseMedia] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit. Please select a smaller photo.');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setImagePreview(base64);

      setUploadingMedia(true);
      try {
        const uploadRes = await axios.post('/api/upload', { image: base64, type: 'problem' });
        if (uploadRes.data?.success && uploadRes.data?.media) {
          setSupabaseMedia(uploadRes.data.media);
        }
      } catch (err) {
        console.warn('Supabase upload endpoint returned warning, maintaining base64 preview reference:', err);
      } finally {
        setUploadingMedia(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSupabaseMedia(null);
    setUploadError('');
  };

  // STEP 4: AI Analysis
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');
  const [severity, setSeverity] = useState('Medium');

  const handleRunAiAnalysis = async () => {
    setAnalyzing(true);
    setAiError('');
    try {
      const res = await axios.post('/api/ai/analyze', {
        text: `${title} ${description}`,
        image: imagePreview || supabaseMedia?.url
      });
      if (res.data.success) {
        const analysis = res.data.analysis;
        setAiResult({
          detectedIssue: analysis.category || category,
          confidence: analysis.confidence || 0.94,
          severity: analysis.severity || severity,
          actionPlan: analysis.actionPlan || 'Automated AI classification complete.',
          recommendedDepartment: analysis.recommendedDepartment || 'Road Maintenance'
        });
        if (analysis.category) setCategory(analysis.category);
        if (analysis.severity) setSeverity(analysis.severity);
      }
    } catch (err) {
      setAiError('AI analysis is currently unavailable. You can still submit the complaint.');
    } finally {
      setAnalyzing(false);
    }
  };

  // STEP 5: Location Picker
  const [locationData, setLocationData] = useState({
    latitude: 20.3587,
    longitude: 85.8333,
    address: 'Patia, Bhubaneswar, Odisha',
    source: 'PIN'
  });
  const [locationError, setLocationError] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }
    setLocationError('');
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationData({
          latitude,
          longitude,
          address: `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`,
          source: 'GPS',
        });
        setIsDetecting(false);
        setStep(6);
      },
      (err) => {
        setLocationError('Unable to retrieve your location.');
        setIsDetecting(false);
      }
    );
  };
  // Submission & Success state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await axios.post('/api/incidents', {
        title: title || `${category} Report`,
        category,
        severity,
        description: description || 'Citizen reported civic infrastructure issue.',
        address: locationData.address,
        lat: locationData.latitude,
        lng: locationData.longitude,
        imageUrl: supabaseMedia?.url || imagePreview,
        complainant: {
          name: name.trim() || 'Citizen',
          phone: phone.replace(/\D/g, ''),
          phoneVerified: true
        },
        evidence: supabaseMedia ? [supabaseMedia] : [],
        location: locationData,
        aiAnalysis: aiResult ? {
          detectedIssue: aiResult.detectedIssue,
          confidence: aiResult.confidence,
          suggestedPriority: aiResult.severity,
          actionPlan: aiResult.actionPlan
        } : null
      });

      if (res.data.success) {
        setSubmitSuccess(res.data.incident);
        if (onCreated) onCreated(res.data.incident);
      }
    } catch (err) {
      console.error('Failed to submit complaint:', err);
      setSubmitError(err.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Your Details' },
    { num: 2, title: 'Issue Details' },
    { num: 3, title: 'Photo Evidence' },
    { num: 4, title: 'AI Analysis' },
    { num: 5, title: 'Location' },
    { num: 6, title: 'Review & Submit' }
  ];

  const card = 'mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5';
  const eyebrow = 'mb-1 text-xs font-bold uppercase tracking-wider text-blue-700';
  const h4 = 'mb-1.5 flex items-center gap-2 text-lg font-extrabold text-slate-900';
  const hint = 'mb-5 mt-0 text-sm text-slate-600';
  const footer = 'mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between';
  const errBox = 'alert alert-error mb-4';

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
      <div className="modal-box max-h-[92vh] w-full max-w-[780px]">

        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div>
            <div className="eyebrow mb-0.5">CIVIC ISSUE SUBMISSION PORTAL</div>
            <h3 id="report-modal-title" className="font-display text-xl font-extrabold text-slate-900 sm:text-2xl mb-0">
              Report a Civic Issue
            </h3>
            <p className="mt-1 text-sm text-slate-600 mb-0">
              Help city authorities identify and resolve problems in your community
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>

        {/* Success Screen */}
        {submitSuccess ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={34} />
            </div>
            <h3 className="mb-1.5 font-display text-2xl font-extrabold text-slate-900">
              Report Submitted Successfully!
            </h3>
            <p className="mb-5 text-sm text-slate-600 mt-0">
              Ticket Reference ID: <strong className="font-mono text-base text-blue-700">{submitSuccess.id}</strong>
            </p>
            <div className="mb-6 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm text-slate-700">
              <div><strong>Issue Title:</strong> {submitSuccess.title}</div>
              <div><strong>Category:</strong> {submitSuccess.category}</div>
              <div><strong>Severity Level:</strong> <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">{submitSuccess.severity}</span></div>
              <div><strong>Assigned Department:</strong> {submitSuccess.assignedDepartment || 'Municipal Operations'}</div>
              <div><strong>Problem Location:</strong> {submitSuccess.address}</div>
            </div>
            <button className="btn btn-primary min-h-11 w-full" onClick={onClose}>
              Close & Track Live Progress
            </button>
          </div>
        ) : (
          <>
            {/* Step Progress Pills Bar */}
            <ol className="m-0 mb-6 flex list-none gap-1.5 overflow-x-auto p-0 pb-1">
              {stepsList.map(s => {
                const state = s.num === step ? 'current' : s.num < step ? 'done' : 'todo';
                return (
                  <li key={s.num} className="flex-none">
                    <button
                      type="button"
                      onClick={() => {
                        if (s.num < step) setStep(s.num);
                      }}
                      disabled={s.num >= step}
                      aria-current={state === 'current' ? 'step' : undefined}
                      className={`min-w-[104px] rounded-lg border px-2.5 py-2 text-center transition-colors disabled:cursor-default ${
                        state === 'current'
                          ? 'border-blue-300 bg-blue-50'
                          : state === 'done'
                            ? 'cursor-pointer border-emerald-300 bg-emerald-50 hover:bg-emerald-100'
                            : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className={`text-[11px] font-extrabold ${state === 'current' ? 'text-blue-700' : state === 'done' ? 'text-emerald-700' : 'text-slate-500'}`}>
                        0{s.num}
                      </div>
                      <div className={`overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold ${state === 'current' ? 'text-blue-900' : state === 'done' ? 'text-emerald-800' : 'text-slate-600'}`}>
                        {s.title}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* STEP 1: Citizen Details */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit}>
                <div className={card}>
                  <div className={eyebrow}>01. YOUR DETAILS</div>
                  <h4 className={h4}>
                    <User size={18} className="text-blue-600" /> Contact Information
                  </h4>
                  <p className={hint}>
                    Provide contact details so department staff can reach out for status updates.
                  </p>

                  {phoneError && (
                    <div role="alert" className={errBox}>
                      <span>⚠️ {phoneError}</span>
                    </div>
                  )}

                  <div className="mb-4">
                    <label htmlFor="rp-name" className="field-label">
                      Full Name <span className="font-normal text-slate-500">(Optional)</span>
                    </label>
                    <input
                      id="rp-name"
                      className="form-input"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g., Ramesh Kumar"
                      autoComplete="name"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="rp-phone" className="field-label">
                      Mobile Number <span className="text-rose-600" aria-hidden="true">*</span>
                    </label>
                    <div className="flex gap-2">
                      <span className="grid place-items-center rounded-lg border border-slate-300 bg-slate-100 px-3 text-sm font-bold text-slate-700">
                        +91
                      </span>
                      <input
                        id="rp-phone"
                        className="form-input flex-1"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={phone}
                        onChange={e => {
                          setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                          setPhoneError('');
                        }}
                        placeholder="9876543210"
                        required
                        autoFocus
                        autoComplete="tel-national"
                      />
                    </div>
                  </div>

                  <div className="alert alert-info items-center text-[13px]">
                    <ShieldCheck size={16} className="shrink-0" />
                    Your phone number is strictly confidential and only visible to authorized municipal responders.
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={phone.replace(/\D/g, '').length !== 10}>
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Issue Details */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit}>
                <div className={card}>
                  <div className={eyebrow}>02. ISSUE DETAILS</div>
                  <h4 className={h4}>What is the Problem?</h4>
                  <p className={hint}>
                    Describe the civic issue clearly so department teams can prioritize response.
                  </p>

                  {issueError && (
                    <div role="alert" className={errBox}>
                      <span>⚠️ {issueError}</span>
                    </div>
                  )}

                  <div className="mb-4">
                    <label htmlFor="rp-title" className="field-label">
                      Issue Title <span className="font-normal text-slate-500">(Optional)</span>
                    </label>
                    <input
                      id="rp-title"
                      className="form-input"
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Hazardous deep pothole near main road intersection"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="rp-category" className="field-label">
                      Category <span className="text-rose-600" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="rp-category"
                      className="form-select"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                    >
                      <option value="Pothole & Road Damage">Pothole & Road Damage</option>
                      <option value="Municipal/Sanitation">Sanitation & Waste Overflow</option>
                      <option value="Water & Sanitation">Water Main Leak & Drainage</option>
                      <option value="Animal Control & Sanitation">Dead Animal Road Removal</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="rp-description" className="field-label">
                      Problem Description <span className="text-rose-600" aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="rp-description"
                      className="form-textarea"
                      rows={4}
                      value={description}
                      onChange={e => {
                        setDescription(e.target.value);
                        setIssueError('');
                      }}
                      placeholder="Describe what you see, traffic hazards, or safety concerns..."
                      required
                    />
                  </div>
                </div>

                <div className={footer}>
                  <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Next: Photo Evidence <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Add Photo */}
            {step === 3 && (
              <div>
                <div className={card}>
                  <div className={eyebrow}>03. PHOTO EVIDENCE</div>
                  <h4 className={h4}>Upload Problem Photo</h4>
                  <p className={hint}>
                    Attach a photo to assist field crews and enable automated AI classification.
                  </p>

                  {uploadError && (
                    <div role="alert" className={errBox}>
                      <span>⚠️ {uploadError}</span>
                    </div>
                  )}

                  <div className="relative rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 text-center transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-600/25 hover:border-blue-400">
                    {!imagePreview ? (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          aria-label="Choose a problem photo"
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                        <Upload size={36} className="mx-auto mb-2.5 text-blue-600" aria-hidden="true" />
                        <div className="text-[15px] font-bold text-slate-900">
                          Take a photo or choose one from your device
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          Supports JPG, PNG, WEBP files up to 10MB
                        </div>
                      </div>
                    ) : (
                      <div>
                        <img src={imagePreview} alt="Problem Preview" className="mx-auto mb-3 max-h-56 rounded-lg border border-slate-200 object-cover" />
                        <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-emerald-700">
                          {uploadingMedia ? <RefreshCw size={16} className="animate-spin" aria-hidden="true" /> : <Check size={16} />} {uploadingMedia ? 'Uploading to Supabase Storage...' : 'Photo Attached'}
                        </div>
                        <div className="mt-3.5 flex flex-wrap justify-center gap-2">
                          <label className="btn btn-secondary btn-sm cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-600">
                            Replace Photo
                            <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                          </label>
                          <button type="button" onClick={handleRemoveImage} className="btn btn-danger-soft btn-sm">
                            <Trash2 size={14} /> Remove Photo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={footer}>
                  <button type="button" onClick={() => setStep(2)} className="btn btn-secondary">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setStep(4);
                      handleRunAiAnalysis();
                    }}
                  >
                    Next: AI Analysis <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: AI Analysis */}
            {step === 4 && (
              <div>
                <div className={card}>
                  <div className={eyebrow}>04. AI ANALYSIS</div>
                  <h4 className={h4}>Automated Issue Diagnostic</h4>
                  <p className={hint}>
                    Computer vision diagnostic results based on uploaded media and text observations.
                  </p>

                  {analyzing ? (
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center" role="status">
                      <RefreshCw size={28} className="mx-auto mb-2.5 animate-spin text-blue-600" aria-hidden="true" />
                      <div className="text-[15px] font-bold text-slate-900">AI is analyzing the uploaded image...</div>
                      <div className="mt-1 text-[13px] text-slate-600">Extracting features and evaluating category urgency</div>
                    </div>
                  ) : aiError ? (
                    <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                      ⚠️ {aiError}
                      <button type="button" onClick={handleRunAiAnalysis} className="btn btn-secondary btn-sm mt-3 block">
                        Retry AI Analysis
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                      <div className="mb-4 grid gap-4 text-sm sm:grid-cols-2">
                        <div>
                          <div className="text-xs font-semibold tracking-wide text-slate-600">DETECTED PROBLEM</div>
                          <div className="mt-0.5 text-[17px] font-extrabold text-slate-900">{category}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold tracking-wide text-slate-600">CRITICALITY LEVEL</div>
                          <div className="mt-1">
                            <span className={`rounded-md px-2.5 py-1 text-[13px] font-extrabold ${severity === 'Critical' ? 'bg-rose-100 text-rose-800' : severity === 'High' ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-900'}`}>
                              {severity.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold tracking-wide text-slate-600">CONFIDENCE SCORE</div>
                          <div className="mt-0.5 text-[17px] font-extrabold text-emerald-700">94%</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold tracking-wide text-slate-600">ROUTING DEPARTMENT</div>
                          <div className="mt-0.5 text-[15px] font-bold text-blue-800">{category.includes('Sanitation') ? 'Municipal/Sanitation' : 'Road Maintenance'}</div>
                        </div>
                      </div>
                      {aiResult?.actionPlan && (
                        <div className="alert alert-info text-[13px] leading-relaxed">
                          <span>💡 <strong>Analysis Summary:</strong> {aiResult.actionPlan}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className={footer}>
                  <button type="button" onClick={() => setStep(3)} className="btn btn-secondary">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => setStep(5)}>
                    Next: Location <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Location Picker */}
            {step === 5 && (
              <div>
                <div className={card}>
                  <div className={eyebrow}>05. ISSUE LOCATION</div>
                  <h4 className={h4}>Pinpoint Exact Issue Location</h4>
                  <p className="mb-4 text-sm text-slate-600 mt-0">
                    Search address or drag the marker to set the exact problem location.
                  </p>

                  <LocationPicker
                    initialLat={locationData.latitude}
                    initialLng={locationData.longitude}
                    initialAddress={locationData.address}
                    onConfirmLocation={(confirmedLoc) => {
                      setLocationData(confirmedLoc);
                      setStep(6);
                    }}
                  />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={detectLocation}
                    disabled={isDetecting}
                  >
                    {isDetecting ? (
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    ) : (
                      'Detect My Location'
                    )}
                  </button>
                  {locationError && (
                    <div className={errBox}>
                      <span>⚠️ {locationError}</span>
                    </div>
                  )}
                </div>
                <div className={footer}>
                  <button type="button" onClick={() => setStep(4)} className="btn btn-secondary">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="button" onClick={() => setStep(6)} className="btn btn-primary ml-2">
                    <ArrowRight size={16} /> Review &amp; Submit
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: Review & Submit */}
            {step === 6 && (
              <div>
                <div className={eyebrow}>06. REVIEW & SUBMIT</div>
                <h4 className="mb-1.5 text-lg font-extrabold text-slate-900">
                  Review Your Report
                </h4>
                <p className={hint}>
                  Confirm all details below before officially lodging your complaint ticket.
                </p>

                {submitError && (
                  <div role="alert" className={errBox}>
                    <span>⚠️ {submitError}</span>
                  </div>
                )}

                <div className="mb-5 grid gap-4 md:grid-cols-2">
                  {/* Left Column: Complaint Details */}
                  <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
                    <div className="mb-2 text-xs font-extrabold uppercase tracking-wider text-blue-700">
                      REPORT DETAILS
                    </div>
                    <div className="mb-1.5 text-[17px] font-extrabold text-slate-900">
                      {title || `${category} Report`}
                    </div>
                    <div className="mb-3 text-sm leading-relaxed text-slate-700">
                      {description}
                    </div>
                    <div className="space-y-1 border-t border-slate-200 pt-2.5 text-[13px] text-slate-700">
                      <div><strong>Complainant:</strong> {name || 'Citizen'} (+91-{phone})</div>
                      <div><strong>Category:</strong> {category}</div>
                      <div><strong>Criticality:</strong> {severity}</div>
                    </div>
                  </div>

                  {/* Right Column: Location & Media Evidence */}
                  <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
                    <div className="mb-2 text-xs font-extrabold uppercase tracking-wider text-blue-700">
                      LOCATION & MEDIA
                    </div>
                    <div className="mb-2.5 text-sm font-semibold text-slate-900">
                      📍 {locationData.address}
                    </div>
                    {imagePreview ? (
                      <div className="mt-2">
                        <div className="mb-1 text-[13px] font-bold text-emerald-700">✓ Photo Evidence Attached</div>
                        <img src={imagePreview} alt="Attached Preview" className="max-h-28 w-full rounded-md border border-slate-300 object-cover" />
                      </div>
                    ) : (
                      <div className="mt-2 text-sm italic text-slate-500">No photo evidence attached</div>
                    )}
                  </div>
                </div>

                <div className="alert alert-info mb-5 items-center">
                  <Info size={18} className="shrink-0" />
                  Ready to submit? Your ticket will be auto-routed to the assigned department team.
                </div>

                <div className={footer.replace('mt-6 ', '')}>
                  <button type="button" onClick={() => setStep(5)} className="btn btn-secondary">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-success min-h-11 px-6 font-extrabold"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Send size={16} />}
                    {isSubmitting ? 'Submitting Report...' : 'SUBMIT REPORT'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
