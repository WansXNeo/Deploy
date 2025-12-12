// frontend/src/components/Question.jsx

import React, { useState, useEffect, useMemo } from 'react';

// --- ICONS SVG (Styling diperhalus sedikit, path tetap sama) ---
const CheckIcon = () => <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>;
const XIcon = () => <svg className="w-5 h-5 text-rose-500 flex-shrink-0 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>;
// Icon Warning tidak dipakai di logika utama, tapi kita simpan saja
const WarningIcon = () => <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const SpeakerIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
const SpeakerWaveIcon = () => <svg className="w-5 h-5 animate-pulse text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;
const LightBulbIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M12 21v-1m-6.364-1.636l.707-.707M6.343 6.343l.707.707m12.728 0l.707.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>;

// --- DATA FEEDBACK (LOGIKA TIDAK DIUBAH) ---
const FEEDBACK_MESSAGES = {
  correct: [
    "🎉 Mantap! Jawaban Anda tepat sekali.",
    "🌟 Luar biasa! Pemahaman Anda sangat baik.",
    "🔥 Keren! Lanjutkan momentum ini.",
    "✅ Tepat sasaran! Kerja bagus.",
    "🤩 Sempurna! Anda menguasai materi ini."
  ],
  partial: [
    "🤏 Hampir benar! Tapi masih ada opsi yang terlewat.",
    "⚠️ Sedikit lagi! Jawaban Anda belum lengkap.",
    "🤔 Cukup oke, tapi coba cek lagi opsi lainnya.",
    "👀 Teliti lagi ya, masih ada bagian yang kurang."
  ],
  wrong: [
    "😅 Ups, kurang tepat. Yuk coba pelajari lagi!",
    "💪 Tidak apa-apa salah, yang penting belajar.",
    "❌ Belum benar. Jadikan ini pelajaran untuk lebih paham.",
    "📉 Jangan menyerah! Coba baca lagi materinya.",
    "🧐 Coba perhatikan petunjuk (Hint) yang ada."
  ]
};

const getRandomMessage = (status) => {
  const messages = FEEDBACK_MESSAGES[status] || FEEDBACK_MESSAGES.wrong;
  return messages[Math.floor(Math.random() * messages.length)];
};

const getAnswerStatus = (userAnswer, correctAnswer) => {
  if (!userAnswer || userAnswer.length === 0) return 'wrong';
  const correctPicks = userAnswer.filter(ans => correctAnswer.includes(ans));
  const wrongPicks = userAnswer.filter(ans => !correctAnswer.includes(ans));
  if (correctPicks.length === correctAnswer.length && wrongPicks.length === 0) return 'correct';
  if (correctPicks.length === 0) return 'wrong';
  return 'partial';
};

// --- SUB-COMPONENT: CONFIDENCE BUTTON (Updated Visuals) ---
const ConfidenceButton = ({ text, onClick, isSelected, colorBase, isDark }) => {
  let baseClasses = "flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 transform active:scale-95 shadow-sm border border-transparent";
  let activeClasses = "";

  if (colorBase === 'yellow') {
    activeClasses = isSelected 
      ? "bg-amber-400 text-amber-900 shadow-amber-400/50 ring-2 ring-amber-200 scale-[1.02]" 
      : isDark 
        ? "bg-amber-900/30 text-amber-200 border-amber-800/50 hover:bg-amber-900/50 hover:border-amber-700" 
        : "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200";
  } else {
    activeClasses = isSelected 
      ? "bg-emerald-500 text-white shadow-emerald-500/50 ring-2 ring-emerald-200 scale-[1.02]" 
      : isDark 
        ? "bg-emerald-900/30 text-emerald-200 border-emerald-800/50 hover:bg-emerald-900/50 hover:border-emerald-700" 
        : "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200";
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${activeClasses}`}>
      {text}
    </button>
  );
};

// --- MAIN COMPONENT ---
function Question({ question, userAnswer, onAnswerSubmit, isDark }) {
  const [stagedAnswers, setStagedAnswers] = useState([]); 
  const [stagedConfidence, setStagedConfidence] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(false); 

  const isMultipleChoice = question.type === 'multiple';
  const isAnswered = userAnswer !== null && userAnswer !== undefined;
  const answerStatus = isAnswered ? getAnswerStatus(userAnswer, question.answer) : null;

  const feedbackText = useMemo(() => {
    if (!isAnswered || !answerStatus) return "";
    return getRandomMessage(answerStatus);
  }, [isAnswered, answerStatus]); 

  useEffect(() => {
    setShowQuestion(false);
    const timer = setTimeout(() => setShowQuestion(true), 100); // Sedikit delay agar animasi halus
    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setShowHint(false);
    };
  }, [question]);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const optionsText = question.options.join('. '); 
      const fullText = `${question.question}. Pilihan jawaban adalah: ${optionsText}`;
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = 'id-ID'; 
      utterance.rate = 0.9; 
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.cancel(); 
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleSelectAnswer = (option) => {
    if (isAnswered) return;
    setStagedAnswers(prev => {
      if (isMultipleChoice) {
        if (prev.includes(option)) return prev.filter(item => item !== option);
        if (prev.length >= 2) { alert("Maksimal pilih 2 jawaban!"); return prev; }
        return [...prev, option];
      } else {
        return [option];
      }
    });
    setStagedConfidence(null); 
  };

  const handleSelectConfidence = (level) => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setStagedConfidence(level);
    onAnswerSubmit(question.id, stagedAnswers, level);
  };

  // --- STYLING UTAMA ---
  const cardClasses = isDark 
    ? 'bg-slate-800/60 backdrop-blur-xl border-slate-700 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]' 
    : 'bg-white/80 backdrop-blur-xl border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]';
  
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-800';
  
  // Border status card utama
  let statusBorderClass = "border";
  if (isAnswered) {
    if (answerStatus === 'correct') statusBorderClass = "border-emerald-500 ring-1 ring-emerald-500/50 shadow-emerald-500/10";
    else if (answerStatus === 'partial') statusBorderClass = "border-amber-500 ring-1 ring-amber-500/50 shadow-amber-500/10";
    else statusBorderClass = "border-rose-500 ring-1 ring-rose-500/50 shadow-rose-500/10";
  } else {
    statusBorderClass = isDark ? "border-slate-700" : "border-slate-200";
  }

  return (
    <div className={`w-full h-full flex flex-col ${cardClasses} ${statusBorderClass} rounded-2xl overflow-hidden transition-all duration-500`}>
      
      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar scroll-smooth">
        <div className={`transition-all duration-500 ease-out transform ${showQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          
          {/* --- HEADER (Topic & Tools) --- */}
          <div className="flex justify-between items-center mb-6 gap-3">
            <div className="flex items-center gap-2">
                {question.topic && (
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm
                  ${isDark ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                    {question.topic}
                </span>
                )}
            </div>
            
            <div className="flex items-center gap-2">
                {question.hint && (
                  <button 
                      onClick={() => setShowHint(!showHint)}
                      className={`p-2 rounded-full transition-all duration-300 active:scale-90
                      ${showHint 
                        ? 'text-amber-500 bg-amber-100 dark:bg-amber-900/30 ring-2 ring-amber-200 dark:ring-amber-700' 
                        : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                      title="Lihat Petunjuk"
                  >
                      <LightBulbIcon />
                  </button>
                )}
                
                <button 
                    onClick={handleToggleSpeech}
                    className={`p-2 rounded-full transition-all duration-300 active:scale-90
                    ${isSpeaking 
                      ? 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-200 dark:ring-blue-700' 
                      : 'text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    title={isSpeaking ? "Matikan Suara" : "Bacakan Soal"}
                >
                    {isSpeaking ? <SpeakerWaveIcon /> : <SpeakerIcon />}
                </button>
            </div>
          </div>

          {/* --- QUESTION TEXT --- */}
          <h2 className={`text-base sm:text-lg font-bold mb-2 leading-relaxed tracking-tight ${textPrimary}`}>
            {question.question}
          </h2>
          
          <div className="mb-6">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border 
              ${isDark ? 'border-slate-600 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
              {isMultipleChoice ? "Pilih Lebih dari Satu" : "Pilih Satu Jawaban"}
            </span>
          </div>

          {/* --- HINT BOX --- */}
          {showHint && question.hint && (
            <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 animate-slide-down
              ${isDark ? 'bg-amber-900/10 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
               <div className="mt-0.5 flex-shrink-0 text-amber-500"><LightBulbIcon /></div>
               <div className="text-sm leading-relaxed"><span className="font-bold">Petunjuk:</span> {question.hint}</div>
            </div>
          )}

          {/* --- OPTIONS LIST --- */}
          <div className="space-y-3 pb-2">
            {question.options.map((option, index) => {
              const isCorrectOption = question.answer.includes(option);
              const isSelected = stagedAnswers.includes(option);
              const isUserFinalChoice = isAnswered && userAnswer.includes(option);
              
              // Logic Styling Opsi yang lebih "Clean"
              let containerClasses = `relative w-full p-4 border rounded-xl text-left transition-all duration-300 flex items-center gap-4 group `;
              let iconClasses = "w-5 h-5 flex-shrink-0 flex items-center justify-center border transition-all duration-300 ";
              
              // Base State (Belum dijawab)
              if (!isAnswered) {
                if (isSelected) {
                    // Selected State (Gradient Blue)
                    containerClasses += "border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 translate-x-1";
                    iconClasses += isMultipleChoice ? "rounded bg-white border-transparent" : "rounded-full bg-white border-transparent";
                } else {
                    // Default State
                    containerClasses += isDark 
                        ? "bg-slate-800/50 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-300 hover:pl-5" 
                        : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md text-slate-600 hover:pl-5";
                    iconClasses += isMultipleChoice 
                        ? `rounded border-slate-400 ${isDark ? 'group-hover:border-slate-300' : 'group-hover:border-blue-400'}` 
                        : `rounded-full border-slate-400 ${isDark ? 'group-hover:border-slate-300' : 'group-hover:border-blue-400'}`;
                }
              } 
              // Result State (Sudah dijawab)
              else {
                if (isCorrectOption) {
                    // Jawaban Benar (Green)
                    containerClasses += isDark 
                        ? "bg-emerald-900/20 border-emerald-500/50 text-emerald-300" 
                        : "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm";
                    iconClasses += "rounded-full border-emerald-500 bg-emerald-500 text-white";
                } else if (isUserFinalChoice && !isCorrectOption) {
                    // Jawaban User Salah (Red)
                    containerClasses += isDark 
                        ? "bg-rose-900/20 border-rose-500/50 text-rose-300" 
                        : "bg-rose-50 border-rose-500 text-rose-800 shadow-sm";
                    iconClasses += "rounded-full border-rose-500 bg-rose-500 text-white";
                } else {
                    // Opsi Lain (Dimmed)
                    containerClasses += "opacity-50 grayscale border-transparent " + (isDark ? "bg-slate-800" : "bg-slate-100 text-slate-400");
                    iconClasses += "rounded border-slate-300";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={isAnswered}
                  className={containerClasses}
                  style={{ 
                    animation: showQuestion ? `slideIn 0.5s ease-out ${index * 0.1}s backwards` : 'none'
                  }}
                >
                  {/* Icon Checkbox/Radio */}
                  <div className={iconClasses}>
                      {isAnswered && isCorrectOption && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      {isAnswered && isUserFinalChoice && !isCorrectOption && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}
                      {!isAnswered && isSelected && (
                         isMultipleChoice 
                         ? <svg className={`w-3 h-3 ${isSelected ? 'text-blue-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                         : <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                  </div>
                  
                  <span className={`text-sm font-medium flex-1 leading-snug ${isSelected && !isAnswered ? 'text-white' : ''}`}>
                    {option}
                  </span>
                  
                  {isAnswered && isCorrectOption && <div className="animate-scale-in"><CheckIcon /></div>}
                  {isAnswered && isUserFinalChoice && !isCorrectOption && <div className="animate-scale-in"><XIcon /></div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- FOOTER AREA --- */}
      {(stagedAnswers.length > 0 || isAnswered) && (
        <div className={`flex-shrink-0 p-4 sm:p-5 border-t backdrop-blur-md transition-all duration-500
            ${isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-slate-50/80 border-slate-200'}`}>
          
          {/* CONFIDENCE SELECTOR */}
          {!isAnswered && stagedAnswers.length > 0 && (
            <div className="animate-fade-in-up">
              <div className="flex justify-between items-end mb-3">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Konfirmasi Jawaban
                  </p>
                  <span className="text-[10px] opacity-60">Seberapa yakin Anda?</span>
              </div>
              <div className="flex gap-3">
                <ConfidenceButton text="🤔 Masih Ragu" onClick={() => handleSelectConfidence(0.5)} isSelected={stagedConfidence === 0.5} colorBase="yellow" isDark={isDark} />
                <ConfidenceButton text="🚀 Sangat Yakin" onClick={() => handleSelectConfidence(1.0)} isSelected={stagedConfidence === 1.0} colorBase="green" isDark={isDark} />
              </div>
            </div>
          )}

          {/* FEEDBACK & EXPLANATION (Hasil) */}
          {isAnswered && (
             <div className={`rounded-2xl p-4 sm:p-5 text-sm leading-relaxed border shadow-sm animate-fade-in-up overflow-hidden relative
                ${answerStatus === 'correct' 
                    ? (isDark ? 'bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border-emerald-500/30 text-emerald-100' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200 text-emerald-900') 
                : answerStatus === 'partial' 
                    ? (isDark ? 'bg-gradient-to-br from-amber-900/40 to-amber-900/10 border-amber-500/30 text-amber-100' : 'bg-gradient-to-br from-amber-50 to-white border-amber-200 text-amber-900')
                : (isDark ? 'bg-gradient-to-br from-rose-900/40 to-rose-900/10 border-rose-500/30 text-rose-100' : 'bg-gradient-to-br from-rose-50 to-white border-rose-200 text-rose-900')}`}>
                
                {/* Dekorasi Background */}
                <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full blur-2xl opacity-20 
                    ${answerStatus === 'correct' ? 'bg-emerald-400' : answerStatus === 'partial' ? 'bg-amber-400' : 'bg-rose-400'}`}></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        {answerStatus === 'correct' ? <CheckIcon /> : answerStatus === 'partial' ? <WarningIcon /> : <XIcon />}
                        <span className="font-bold text-base tracking-tight">{feedbackText}</span>
                    </div>
                    <div className={`w-full h-px mb-3 ${isDark ? 'bg-white/10' : 'bg-black/5'}`}></div>
                    <p className="opacity-90 font-light">{question.explanation}</p>
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Question;