import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

// --- HELPER LOGIC (TIDAK DIUBAH) ---
const getAnswerStatus = (userAnswer, correctAnswer) => {
  if (!userAnswer || userAnswer.length === 0) return 'wrong';
  const correctPicks = userAnswer.filter(ans => correctAnswer.includes(ans));
  const wrongPicks = userAnswer.filter(ans => !correctAnswer.includes(ans));
  if (correctPicks.length === correctAnswer.length && wrongPicks.length === 0) return 'correct';
  if (correctPicks.length === 0) return 'wrong';
  return 'partial';
};

// --- ICONS (Styling diperhalus) ---
const RefreshIcon = () => (<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>);
const IconBenarYakin = () => <svg className="w-6 h-6 text-emerald-500 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconBenarRagu = () => <svg className="w-6 h-6 text-amber-500 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const WarningIcon = () => <svg className="w-6 h-6 text-orange-500 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const IconSalahYakin = () => <svg className="w-6 h-6 text-rose-500 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SpeakerIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
const SpeakerWaveIcon = () => <svg className="w-5 h-5 animate-pulse text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
const RobotIcon = () => <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const SparklesIcon = () => <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>;

// --- SUB-COMPONENTS (Tampilan Diperbarui) ---

const StatBox = ({ label, value, subLabel, isDark, type }) => {
    // Style berbeda untuk Skor vs Keyakinan
    const bgGradient = type === 'score' 
        ? (isDark ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100')
        : (isDark ? 'bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100');

    const textColor = type === 'score' 
        ? (isDark ? 'text-blue-300' : 'text-blue-600') 
        : (isDark ? 'text-purple-300' : 'text-purple-600');

    return (
        <div className={`flex-1 p-3 sm:p-4 rounded-2xl border backdrop-blur-sm flex flex-col items-center justify-center shadow-sm transition-all duration-300 hover:shadow-md ${bgGradient}`}>
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1 opacity-70 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
            <span className={`text-3xl sm:text-4xl font-black leading-none tracking-tight my-1 ${textColor}`}>{value}</span>
            {subLabel && <span className="text-[10px] font-medium opacity-60">{subLabel}</span>}
        </div>
    );
}

const MatrixItem = ({ label, count, icon, variant, isDark }) => {
    // Warna spesifik untuk setiap varian
    let colors = {};
    if (variant === 'green') colors = isDark ? 'bg-emerald-900/20 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700';
    else if (variant === 'yellow') colors = isDark ? 'bg-amber-900/20 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-100 text-amber-700';
    else if (variant === 'orange') colors = isDark ? 'bg-orange-900/20 border-orange-500/20 text-orange-400' : 'bg-orange-50 border-orange-100 text-orange-700';
    else colors = isDark ? 'bg-rose-900/20 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-100 text-rose-700';

    return (
        <div className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${colors}`}>
            <div className="flex items-center gap-1.5 mb-1">
                {icon}
                <span className="text-xl sm:text-2xl font-bold">{count}</span>
            </div>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wide opacity-80">{label}</span>
        </div>
    );
};

const RecommendationItem = ({ question, userAnswer, status, isDark }) => {
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  let theme = {};
  if (status === 'wrong') {
    theme = {
        border: 'border-l-rose-500', 
        bg: isDark ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-white border-gray-100 hover:bg-gray-50',
        badge: isDark ? 'bg-rose-900/30 text-rose-300' : 'bg-rose-100 text-rose-700',
        label: 'Salah'
    };
  } else if (status === 'partial') {
    theme = {
        border: 'border-l-orange-500',
        bg: isDark ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-white border-gray-100 hover:bg-gray-50',
        badge: isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700',
        label: 'Kurang Tepat'
    };
  } else {
    theme = {
        border: 'border-l-amber-500',
        bg: isDark ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-white border-gray-100 hover:bg-gray-50',
        badge: isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-700',
        label: 'Tinjau Ulang'
    };
  }

  const formattedUserAnswer = Array.isArray(userAnswer) ? userAnswer.join(', ') : (userAnswer || "-");
  const formattedCorrect = question.answer.join(', ');

  const handleAskAI = async () => {
    if (aiExplanation) return;
    setLoadingAi(true);
    try {
        const res = await axios.post(`${API_URL}/explain`, {
            question: question.question,
            topic: question.topic,
            userAnswer: formattedUserAnswer,
            correctAnswer: formattedCorrect
        });
        setAiExplanation(res.data.explanation);
    } catch (err) {
        setAiExplanation("Gagal menghubungi AI Tutor. Coba lagi nanti.");
    } finally {
        setLoadingAi(false);
    }
  };

  return (
    <div className={`p-4 rounded-xl border border-l-4 shadow-sm transition-all duration-300 ${theme.border} ${theme.bg}`}>
      <div className="flex justify-between items-start mb-2">
         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}>
            {theme.label}
         </span>
         {question.topic && (
             <span className={`text-[10px] font-semibold opacity-50 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                 {question.topic}
             </span>
         )}
      </div>
      
      <p className={`font-semibold mb-3 leading-relaxed text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
        {question.question}
      </p>
      
      <div className={`text-xs p-3 rounded-lg flex flex-col gap-1.5 ${isDark ? 'bg-slate-900/50 text-slate-400' : 'bg-gray-50 text-gray-600'}`}>
        <div className="flex gap-2">
            <span className="font-bold min-w-[60px]">Jawaban:</span> 
            <span className={`${status === 'wrong' ? (isDark ? 'text-rose-400' : 'text-rose-600') : ''}`}>{formattedUserAnswer}</span>
        </div>
        <div className="flex gap-2 opacity-80">
            <span className="font-bold min-w-[60px]">Ket:</span> 
            <span>{question.explanation.substring(0, 120)}...</span>
        </div>
      </div>

      <div className="mt-3">
        {!aiExplanation && !loadingAi && (
            <button onClick={handleAskAI} className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all
                ${isDark ? 'border-slate-600 hover:bg-slate-700 text-blue-400' : 'border-gray-200 hover:bg-blue-50 text-blue-600'}`}>
                <RobotIcon /> Tanya AI Tutor
            </button>
        )}
        
        {loadingAi && (
            <div className="flex items-center gap-2 text-xs italic text-gray-500 mt-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div> Sedang mengetik penjelasan...
            </div>
        )}
        
        {aiExplanation && (
            <div className={`mt-3 p-4 rounded-xl border animate-fade-in relative overflow-hidden
                ${isDark ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-100'}`}>
                <div className={`flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    <SparklesIcon /> Penjelasan AI
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-indigo-100/90' : 'text-indigo-900/80'}`}>{aiExplanation}</p>
            </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
function Result({ questions, userAnswers, confidenceScores, onRetry, isDark, difficulty }) {
  let score = 0;
  let totalConfidenceSum = 0;
  const buckets = { benarYakin: [], benarRagu: [], partial: [], salah: [] };
  const [isSpeaking, setIsSpeaking] = useState(false);
  const saveRef = useRef(false);

  // LOGIK PERHITUNGAN (TIDAK DIUBAH)
  questions.forEach(q => {
    const uAnswer = userAnswers[q.id];
    const status = getAnswerStatus(uAnswer, q.answer);
    const confidence = confidenceScores[q.id] || 0.5;
    totalConfidenceSum += confidence;

    if (status === 'correct') {
      score += 1;
      if (confidence === 1.0) buckets.benarYakin.push(q);
      else buckets.benarRagu.push(q);
    } else if (status === 'partial') {
      score += 0.5;
      buckets.partial.push(q);
    } else {
      buckets.salah.push(q);
    }
  });

  const totalQuestions = questions.length;
  const scorePercentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
  const avgConfidence = totalQuestions > 0 ? (totalConfidenceSum / totalQuestions) * 100 : 0;
  
  const priorityList = [
    ...buckets.salah.map(q => ({ ...q, answerStatus: 'wrong' })),
    ...buckets.partial.map(q => ({ ...q, answerStatus: 'partial' })),
    ...buckets.benarRagu.map(q => ({ ...q, answerStatus: 'review' }))
  ];

  // SAVE HISTORY
  useEffect(() => {
    if (saveRef.current) return;
    saveRef.current = true;
    const safeScore = isNaN(scorePercentage) ? 0 : Math.round(scorePercentage);
    const newEntry = {
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        score: safeScore,
        difficulty: difficulty || 'medium',
        timestamp: Date.now()
    };
    const existingHistory = JSON.parse(localStorage.getItem('learncheck_history') || '[]');
    const updatedHistory = [newEntry, ...existingHistory].slice(0, 7);
    localStorage.setItem('learncheck_history', JSON.stringify(updatedHistory));
  }, [scorePercentage, difficulty]);

  // GENERATE SUMMARY
  const generateSummaryText = () => {
    let text = `Ringkasan hasil. Skor Anda ${scorePercentage.toFixed(0)} persen. `;
    if (buckets.benarYakin.length > 0) text += `${buckets.benarYakin.length} soal dipahami sempurna. `;
    if (buckets.salah.length > 0) text += `${buckets.salah.length} soal perlu dipelajari lagi. `;
    if (scorePercentage >= 80) text += "Hasil luar biasa!";
    else if (scorePercentage >= 50) text += "Cukup bagus.";
    else text += "Jangan menyerah.";
    return text;
  };
  const summaryText = generateSummaryText();

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };
  }, []);

  const handleToggleSummarySpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel(); setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(summaryText);
      utterance.lang = 'id-ID'; utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-1 sm:p-2 overflow-hidden relative">
      
      {/* HEADER SECTION */}
      <div className="flex-shrink-0 flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-end px-1">
          <div>
            <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Hasil Analisis</h1>
            <div className={`flex items-center gap-2 text-xs font-medium mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
               <span className="capitalize px-2 py-0.5 rounded border border-current opacity-70">{difficulty}</span>
               <span>•</span>
               <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
          </div>
        </div>

        {/* SCORE CARDS */}
        <div className="flex gap-3 sm:gap-4">
          <StatBox label="Skor Akhir" value={`${scorePercentage.toFixed(0)}%`} type="score" isDark={isDark} />
          <StatBox label="Tingkat Keyakinan" value={`${avgConfidence.toFixed(0)}%`} type="confidence" isDark={isDark} />
        </div>

        {/* MATRIX GRID */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <MatrixItem label="Paham" count={buckets.benarYakin.length} icon={<IconBenarYakin />} variant="green" isDark={isDark} />
          <MatrixItem label="Hoki" count={buckets.benarRagu.length} icon={<IconBenarRagu />} variant="yellow" isDark={isDark} />
          <MatrixItem label="Kurang" count={buckets.partial.length} icon={<WarningIcon />} variant="orange" isDark={isDark} />
          <MatrixItem label="Salah" count={buckets.salah.length} icon={<IconSalahYakin />} variant="red" isDark={isDark} />
        </div>
      </div>

      {/* DETAIL LIST SECTION */}
      <div className={`flex-1 min-h-0 flex flex-col border-t pt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center mb-3 px-1">
            <h2 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {priorityList.length > 0 ? "Rekomendasi Perbaikan" : "Analisis Sempurna"}
            </h2>
        </div>
        
        <div className="overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-20">
          {priorityList.map((q) => (
              <RecommendationItem key={q.id} question={q} userAnswer={userAnswers[q.id]} status={q.answerStatus} isDark={isDark} />
          ))}
          
          {priorityList.length === 0 && (
             <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-bold text-emerald-600 dark:text-emerald-400">Kerja Bagus!</h3>
                <p className="text-sm opacity-70 mt-1">Anda menjawab semua soal dengan tepat dan yakin.</p>
             </div>
          )}

          {/* SUMMARY BOX */}
          <div className={`mt-4 p-5 rounded-2xl border relative overflow-hidden group transition-all
              ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isDark ? 'bg-slate-700 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    <SpeakerIcon />
                  </div>
                  <h3 className={`font-bold text-sm uppercase tracking-wide ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Ringkasan Suara</h3>
              </div>
              <button 
                onClick={handleToggleSummarySpeech} 
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-2
                ${isSpeaking 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 animate-pulse' 
                    : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {isSpeaking ? <>🔊 Sedang Membaca...</> : <>▶️ Putar Ringkasan</>}
              </button>
            </div>
            <p className={`text-sm leading-relaxed italic relative z-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                "{summaryText}"
            </p>
          </div>

          {/* RETRY BUTTON */}
          <div className="pt-4 pb-2">
            <button 
              onClick={onRetry} 
              className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/20 flex items-center justify-center transform active:scale-[0.98] transition-all duration-300 group"
            >
              <span className="group-hover:rotate-180 transition-transform duration-500"><RefreshIcon /></span> 
              Mulai Sesi Baru
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Result;