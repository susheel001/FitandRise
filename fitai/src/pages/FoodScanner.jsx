import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import Icon from '@mdi/react';
import {
  mdiCamera, mdiClose, mdiPlus, mdiReload,
  mdiFood, mdiLoading, mdiArrowLeft, mdiCheck,
} from '@mdi/js';

export default function FoodScanner() {
  const { state, addMeal } = useApp();
  const { darkMode: dm } = state;
  const navigate = useNavigate();

  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);

  const [phase, setPhase]           = useState('camera');   // camera | analyzing | result | error
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState('');
  const [mealType, setMealType]     = useState('Lunch');
  const [camError, setCamError]     = useState('');
  const [added, setAdded]           = useState(false);

  const textMain  = dm ? 'text-white'    : 'text-gray-800';
  const textMuted = dm ? 'text-gray-400' : 'text-gray-500';
  const card      = `rounded-2xl border p-4 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`;

  // ── Start camera ─────────────────────────────────────────────
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setCamError('Camera access denied. Please allow camera permission and try again.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  // ── Capture & analyze ────────────────────────────────────────
  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    setPhase('analyzing');
    stopCamera();

    try {
      const token   = await getToken();
      const res     = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/scan-food`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ image: base64 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze food');

      setResult(data);
      setPhase('result');
    } catch (err) {
      setError(err.message || 'Failed to analyze food. Try again!');
      setPhase('error');
    }
  };

  // ── Get token ────────────────────────────────────────────────
  const getToken = async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const { supabase } = await import('../lib/supabase');
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  // ── Add to meal ──────────────────────────────────────────────
  const handleAdd = () => {
    if (!result) return;
    addMeal(mealType, {
      name:     result.name,
      calories: result.calories,
      protein:  result.protein,
      carbs:    result.carbs,
      fat:      result.fat,
      img:      '',
    });
    setAdded(true);
    setTimeout(() => navigate('/nutrition'), 1500);
  };

  // ── Retry ────────────────────────────────────────────────────
  const retry = () => {
    setPhase('camera');
    setResult(null);
    setError('');
    setAdded(false);
    startCamera();
  };

  const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  return (
    <div className="space-y-4 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/nutrition')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${dm ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100 shadow-sm'}`}>
          <Icon path={mdiArrowLeft} size={0.8} color={dm ? '#9ca3af' : '#6b7280'} />
        </button>
        <div>
          <h2 className={`text-xl font-black ${textMain}`}>Food Scanner</h2>
          <p className={`text-xs ${textMuted}`}>Point camera at food — AI will analyze it</p>
        </div>
      </div>

      {/* ── CAMERA PHASE ── */}
      {phase === 'camera' && (
        <div className="space-y-3">
          {camError ? (
            <div className={`${card} text-center py-10`}>
              <Icon path={mdiCamera} size={2} color={dm ? '#4b5563' : '#d1d5db'} />
              <p className={`text-sm font-semibold mt-3 ${textMuted}`}>{camError}</p>
              <button onClick={startCamera}
                className="mt-4 px-5 py-2.5 rounded-xl text-sm font-black text-white bg-blue-500 hover:bg-blue-600 transition">
                Try Again
              </button>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden shadow-xl"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <video ref={videoRef} autoPlay playsInline muted
                className="w-full rounded-2xl"
                style={{ maxHeight: '420px', objectFit: 'cover' }} />

              {/* Scan overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-56 relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-xl" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-blue-400 opacity-60 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <p className="text-white text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.5)' }}>
                  Center food in frame
                </p>
              </div>
            </div>
          )}

          {/* Capture button */}
          {!camError && (
            <button onClick={capture}
              className="w-full py-4 rounded-2xl font-black text-white text-sm transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)' }}>
              <Icon path={mdiCamera} size={0.85} color="white" />
              Capture & Analyze
            </button>
          )}
        </div>
      )}

      {/* ── ANALYZING PHASE ── */}
      {phase === 'analyzing' && (
        <div className={`${card} text-center py-12`}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(34,197,94,0.2))' }}>
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className={`font-black text-base ${textMain}`}>Analyzing food...</p>
          <p className={`text-xs mt-1 ${textMuted}`}>AI is calculating nutrition info</p>
        </div>
      )}

      {/* ── RESULT PHASE ── */}
      {phase === 'result' && result && (
        <div className="space-y-3">
          {/* Food result card */}
          <div className={card}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(34,197,94,0.2))' }}>
                <Icon path={mdiFood} size={1} color="#3b82f6" />
              </div>
              <div>
                <p className={`font-black text-base ${textMain}`}>{result.name}</p>
                <p className={`text-xs ${textMuted}`}>{result.portion || '1 serving'}</p>
              </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: 'Calories', val: result.calories, unit: 'kcal', color: '#f97316' },
                { label: 'Protein',  val: result.protein,  unit: 'g',    color: '#22c55e' },
                { label: 'Carbs',    val: result.carbs,    unit: 'g',    color: '#3b82f6' },
                { label: 'Fat',      val: result.fat,      unit: 'g',    color: '#a855f7' },
              ].map(m => (
                <div key={m.label} className={`rounded-xl p-2.5 text-center ${dm ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className="font-black text-base" style={{ color: m.color }}>{m.val}</p>
                  <p className="text-xs" style={{ color: m.color }}>{m.unit}</p>
                  <p className={`text-xs font-semibold mt-0.5 ${textMuted}`}>{m.label}</p>
                </div>
              ))}
            </div>

            {/* AI confidence note */}
            {result.note && (
              <p className={`text-xs ${textMuted} mb-4 px-3 py-2 rounded-xl ${dm ? 'bg-gray-700' : 'bg-gray-50'}`}>
                {result.note}
              </p>
            )}

            {/* Meal type selector */}
            <div className="mb-4">
              <p className={`text-xs font-bold mb-2 ${textMuted}`}>Add to meal:</p>
              <div className="flex gap-2 flex-wrap">
                {meals.map(m => (
                  <button key={m} onClick={() => setMealType(m)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${mealType === m ? 'bg-blue-500 text-white' : dm ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Add button */}
            <button onClick={handleAdd} disabled={added}
              className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: added ? '#22c55e' : 'linear-gradient(135deg,#3b82f6,#22c55e)' }}>
              <Icon path={added ? mdiCheck : mdiPlus} size={0.85} color="white" />
              {added ? 'Added! Redirecting...' : `Add to ${mealType}`}
            </button>
          </div>

          {/* Scan again */}
          <button onClick={retry}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${dm ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-100'}`}>
            <Icon path={mdiReload} size={0.75} />
            Scan Another Food
          </button>
        </div>
      )}

      {/* ── ERROR PHASE ── */}
      {phase === 'error' && (
        <div className={`${card} text-center py-10`}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Icon path={mdiClose} size={1} color="#ef4444" />
          </div>
          <p className={`font-black text-base ${textMain} mb-1`}>Analysis Failed</p>
          <p className={`text-sm ${textMuted} mb-5`}>{error}</p>
          <button onClick={retry}
            className="px-6 py-3 rounded-xl font-black text-white text-sm flex items-center gap-2 mx-auto"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)' }}>
            <Icon path={mdiReload} size={0.75} color="white" />
            Try Again
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}