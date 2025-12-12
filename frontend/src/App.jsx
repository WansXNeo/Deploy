import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import Result from './components/Result';
import LoadingSpinner from './components/LoadingSpinner';
import Question from './components/Question';

// --- ICONS SVG (Compact) ---
const SunIcon = () => (<svg className="w-4 h-4 text-amber-500 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const MoonIcon = () => (<svg className="w-4 h-4 text-indigo-300 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>);
const ArrowRightIcon = () => (<svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>);
const ShieldCheckIcon = () => (<svg className="w-3.5 h-3.5 mr-1 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>);
const LevelIcon = () => <svg className="w-4 h-4 mr-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const ChartIcon = () => <svg className="w-3.5 h-3.5 mr-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;

const HeroIllustration = () => (
  <svg className="w-full h-full text-blue-600 drop-shadow-[0_8px_16px_rgba(37,99,235,0.3)] dark:drop-shadow-[0_8px_16px_rgba(37,99,235,0.5)] transition-all duration-500" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="80" fill="url(#grad1)" fillOpacity="0.15" className="animate-pulse-slow"/>
    <path d="M70 130L100 70L130 130H70Z" fill="url(#grad2)" />
    <defs>
      <linearGradient id="grad1" x1="0" y1="0" x2="200" y2="200"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#9333EA"/></linearGradient>
      <linearGradient id="grad2" x1="70" y1="130" x2="130" y2="70"><stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#2563EB"/></linearGradient>
    </defs>
  </svg>
);

const HistoryChart = ({ history, isDark }) => {
  if (!history || history.length === 0) return null;
  const chartData = [...history].reverse(); 

  const containerClasses = isDark 
    ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-inner' 
    : 'bg-slate-50/80 border-slate-200/80 backdrop-blur-sm shadow-sm';

  const titleColors = isDark ? 'text-slate-400' : 'text-slate-500';
  const baselineColor = isDark ? 'border-slate-700' : 'border-slate-300';

  return (
    <div className={`mt-3 p-3 rounded-xl border ${containerClasses} w-full animate-fade-in transition-all duration-300`}>
      <h3 className={`text-[10px] font-bold mb-2 uppercase tracking-widest flex items-center ${titleColors}`}>
          <ChartIcon /> Progress ({chartData.length} Sesi Terakhir)
      </h3>
      <div className={`flex items-end justify-between h-16 gap-2 border-b ${baselineColor} pb-px`}>
          {chartData.map((item, idx) => {
            const safeScore = isNaN(item.score) ? 0 : item.score;
            let barGradient = safeScore >= 80 
                ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' 
                : safeScore >= 50 
                    ? 'bg-gradient-to-t from-amber-500 to-yellow-400' 
                    : 'bg-gradient-to-t from-red-600 to-rose-500';
            
            return (
              <div key={idx} className="flex flex-col items-center flex-1 group cursor-default h-full justify-end">
                  <span className={`text-[6px] uppercase font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.difficulty?.substring(0, 3) || 'EAS'}
                  </span>
                  
                  <div className="relative w-full flex justify-center items-end h-[80%]">
                      <div 
                        className={`w-full max-w-[14px] sm:max-w-[20px] rounded-t-sm sm:rounded-t-md transition-all duration-[1000ms] ease-out ${barGradient} opacity-90 group-hover:opacity-100 shadow-sm`}
                        style={{ height: `${Math.max(safeScore, 5)}%` }}
                      >
                        <span className={`absolute -top-6 left-1/2 transform -translate-x-1/2 text-[9px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 shadow-sm
                          ${isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 ring-1 ring-slate-200'}`}>
                          {safeScore}%
                        </span>
                      </div>
                  </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

function App() {
  const [quizData, setQuizData] = useState(null);
  const [preferences, setPreferences] = useState({ theme: 'light', fontSize: 'medium' });
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameStatus, setGameStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [tutorialId, setTutorialId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [confidenceScores, setConfidenceScores] = useState({});
  const [initLoading, setInitLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('easy'); 
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tutId = params.get('tutorial_id') || 'react-basic';
    const uId = params.get('user_id') || '1';
    
    setTutorialId(tutId);
    setUserId(uId);

    // History Local
    try {
        const savedHistory = JSON.parse(localStorage.getItem('learncheck_history') || '[]');
        setHistory(savedHistory);
    } catch (e) { console.warn("History reset"); }

    // --- FIX PENGAMBILAN PREFERENCES DARI API ---
    axios.get(`${API_URL}/preferences`, { params: { user_id: uId } })
      .then(res => { 
          if(res.data) {
              console.log("Raw Preferences API:", res.data);
              
              // PERBAIKAN: Cek apakah data dibungkus dalam properti 'preference'
              // API mengembalikan: { preference: { theme: 'dark', ... } }
              // Jadi kita harus mengambil res.data.preference jika ada.
              const actualPreferences = res.data.preference || res.data;
              
              console.log("Processed Preferences:", actualPreferences);
              
              setPreferences(prev => ({ ...prev, ...actualPreferences }));
          }
      })
      .catch(err => {
          console.warn("Gagal load preferences, pakai default.", err);
      });

    // Session Restore
    const sessionKey = `learncheck_session_${uId}_${tutId}`;
    const savedSession = localStorage.getItem(sessionKey);
    if (savedSession) {
        try {
            const parsedSession = JSON.parse(savedSession);
            if (parsedSession.gameStatus !== 'idle' && parsedSession.quizData) {
                setQuizData(parsedSession.quizData);
                setUserAnswers(parsedSession.userAnswers || {});
                setConfidenceScores(parsedSession.confidenceScores || {});
                setCurrentQuestionIndex(parsedSession.currentQuestionIndex || 0);
                const restoredDiff = parsedSession.difficulty === 'medium' ? 'easy' : parsedSession.difficulty;
                setDifficulty(restoredDiff || 'easy');
                setGameStatus(parsedSession.gameStatus);
            }
        } catch (err) {
            localStorage.removeItem(sessionKey);
        }
    }
    setInitLoading(false);
  }, []);

  useEffect(() => {
    if (userId && tutorialId && (gameStatus === 'active' || gameStatus === 'submitted')) {
        const sessionKey = `learncheck_session_${userId}_${tutorialId}`;
        const sessionData = {
            gameStatus, quizData, userAnswers, confidenceScores, currentQuestionIndex, difficulty
        };
        localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    }
  }, [gameStatus, quizData, userAnswers, confidenceScores, currentQuestionIndex, difficulty, userId, tutorialId]);

  const handleStartQuiz = async () => {
    setGameStatus('loading');
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/quiz`, { 
          params: { tutorial_id: tutorialId, difficulty: difficulty } 
      });
      if (!response.data || !response.data.questions || response.data.questions.length === 0) {
          throw new Error("Data kuis kosong atau tidak valid dari AI.");
      }
      setQuizData(response.data);
      setUserAnswers({});
      setConfidenceScores({});
      setCurrentQuestionIndex(0);
      setGameStatus('active');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Gagal memuat kuis. Cek koneksi backend.');
      setGameStatus('error');
    }
  };

  const handleAnswerSubmit = (questionId, selectedOption, confidence) => {
    const newAnswers = { ...userAnswers, [questionId]: selectedOption };
    setUserAnswers(newAnswers);
    const newConfidence = { ...confidenceScores, [questionId]: confidence };
    setConfidenceScores(newConfidence);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex === quizData.questions.length - 1) setGameStatus('submitted');
    else setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleRetry = () => {
    if (userId && tutorialId) localStorage.removeItem(`learncheck_session_${userId}_${tutorialId}`);
    setUserAnswers({});
    setConfidenceScores({});
    setCurrentQuestionIndex(0);
    setGameStatus('idle');
    setQuizData(null);
  };

  // --- STYLING DINAMIS BERDASARKAN PREFERENCES ---
  const isDark = preferences.theme === 'dark';
  const themeClass = isDark ? 'dark' : '';
  
  const fontSizeClass = { 
      'small': 'text-sm', 
      'medium': 'text-base', 
      'large': 'text-lg', 
      'extra-large': 'text-xl' 
  }[preferences.fontSize] || 'text-base';

  const fontTypeClass = preferences.fontType === 'serif' ? 'font-serif' : preferences.fontType === 'mono' ? 'font-mono' : 'font-sans';
  const wrapperBg = isDark 
    ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0B1120] to-black text-slate-100' 
    : 'bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white via-slate-50 to-blue-50 text-slate-800';
    
  const wrapperClasses = `w-full min-h-screen flex flex-col transition-all duration-500 ease-in-out ${themeClass} ${fontSizeClass} ${fontTypeClass} ${wrapperBg} antialiasedSelection`;

  if (initLoading) return <LoadingSpinner isDark={false} />;

  return (
    <div className={wrapperClasses}>
      
      {/* 1. ERROR */}
      {gameStatus === 'error' && (
        <div className="flex items-center justify-center p-8 h-full backdrop-blur-sm flex-1">
          <div className="p-6 bg-white/90 dark:bg-slate-800/90 rounded-2xl border-l-4 border-red-500 text-center shadow-xl w-full max-w-sm backdrop-blur-md">
            <h2 className="font-bold text-lg text-red-600 mb-2">Terjadi Kesalahan</h2>
            <p className="text-xs opacity-90 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300 transition">Muat Ulang</button>
          </div>
        </div>
      )}

      {/* 2. LOADING */}
      {gameStatus === 'loading' && <LoadingSpinner isDark={isDark} />}

      {/* 3. RESULT */}
      {gameStatus === 'submitted' && quizData && (
        <div className="flex justify-center p-3 sm:p-4 animate-fade-in flex-1">
          <div className="w-full max-w-4xl my-auto"> 
            <Result questions={quizData.questions} userAnswers={userAnswers} confidenceScores={confidenceScores} onRetry={handleRetry} isDark={isDark} difficulty={difficulty} />
          </div>
        </div>
      )}

      {/* 4. ACTIVE QUIZ (COMPACT) */}
      {gameStatus === 'active' && quizData && quizData.questions ? (
        <div className={`w-full max-w-4xl mx-auto p-3 sm:p-5 animate-fade-in flex flex-col h-full shadow-2xl ${isDark ? 'bg-slate-800/50' : 'bg-white/60'} backdrop-blur-md flex-1`}>
          {quizData.questions[currentQuestionIndex] ? (
            <>
                <header className={`flex-shrink-0 mb-2 sm:mb-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200/60'} pb-3 transition-colors duration-300`}>
                    <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col gap-0.5">
                        <h1 className="text-sm sm:text-base font-extrabold truncate pr-2 leading-tight">{quizData.materialTitle}</h1>
                        <span className={`text-[10px] font-medium uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          User: {userId} <span className="opacity-50">•</span> {difficulty}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {quizData.aiAudit && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center shadow-sm ${isDark ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200/60 text-emerald-700'}`}>
                            <ShieldCheckIcon /> {quizData.aiAudit.score}%
                            </span>
                        )}
                        <div className={`p-1.5 rounded-full border shadow-sm ${isDark ? 'border-slate-700 bg-slate-800/80 text-indigo-300' : 'border-slate-200 bg-white/80 text-amber-500'}`}>
                            {isDark ? <MoonIcon /> : <SunIcon />}
                        </div>
                    </div>
                    </div>
                    
                    <div className="w-full flex items-center gap-3 mb-1 mt-2 px-1">
                      <div className={`flex-1 rounded-full h-2.5 overflow-hidden shadow-inner relative ${isDark ? 'bg-slate-700/80' : 'bg-slate-200'}`}>
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-700 ease-spring shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                          style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-[10px] font-bold font-mono min-w-[30px] text-right ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {currentQuestionIndex + 1}/{quizData.questions.length}
                      </span>
                    </div>
                </header>

                <main className="flex-1 min-h-0 relative overflow-hidden flex flex-col"> 
                    <div className="flex-1 p-1 overflow-hidden">
                       <Question key={currentQuestionIndex} question={quizData.questions[currentQuestionIndex]} userAnswer={userAnswers[quizData.questions[currentQuestionIndex].id] || null} onAnswerSubmit={handleAnswerSubmit} isDark={isDark} />
                    </div>
                </main>

                {userAnswers[quizData.questions[currentQuestionIndex].id] && (
                    <div className="flex-shrink-0 pt-3 pb-1 z-20 bg-transparent animate-slide-up">
                        <button onClick={handleNextQuestion} className="w-full py-3 rounded-xl font-bold text-base text-white bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 hover:from-blue-700 hover:to-indigo-900 flex items-center justify-center shadow-lg transition-all duration-300 active:scale-[0.98]">
                            {currentQuestionIndex === quizData.questions.length - 1 ? 'Lihat Laporan' : 'Lanjut'}
                            {currentQuestionIndex !== quizData.questions.length - 1 && <ArrowRightIcon />}
                        </button>
                    </div>
                )}
            </>
          ) : ( <div className="text-center p-8 text-red-500 font-medium">Gagal memuat soal.</div> )}
        </div>
      ) : null}

      {/* 5. START / IDLE */}
      {gameStatus === 'idle' && (
        <div className="flex items-center justify-center p-3 animate-fade-in flex-1">
          <div className={`w-full max-w-5xl shadow-xl rounded-[1.5rem] overflow-hidden border transition-all duration-500
            ${isDark ? 'bg-slate-800/70 border-slate-700/50 backdrop-blur-md' : 'bg-white/80 border-white/50 backdrop-blur-md'}`}>
            
            <div className="flex flex-col-reverse lg:flex-row">
              {/* Kiri: Konten Teks */}
              <div className="w-full lg:w-7/12 p-5 sm:p-6 flex flex-col justify-center relative">
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1.5 shadow-sm ${isDark ? 'bg-slate-700/50 border-slate-600 text-indigo-300' : 'bg-blue-50/80 border-blue-100 text-blue-600'}`}>
                      {isDark ? <MoonIcon /> : <SunIcon />} {preferences.theme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </div>
                  
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-2 leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    LearnCheck AI
                  </h1>
                  <p className={`text-xs sm:text-sm mb-4 leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Platform evaluasi belajar cerdas & adaptif.
                  </p>
                  
                  <div className="w-full mb-4 text-left">
                      <p className={`text-[9px] font-bold mb-1.5 uppercase tracking-widest flex items-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <LevelIcon /> Pilih Kesulitan:
                      </p>
                      
                      <div className="flex gap-2">
                          {['easy', 'hard'].map((level) => {
                             const isActive = difficulty === level;
                             const activeClasses = isActive 
                                ? (level === 'easy' 
                                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                    : 'border-rose-500 bg-rose-50/80 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400')
                                : `border-slate-200 dark:border-slate-700 ${isDark ? 'text-slate-400 hover:bg-slate-700/50' : 'text-slate-500 hover:bg-slate-50'}`;

                             return (
                              <button key={level} onClick={() => setDifficulty(level)} 
                                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all duration-300 capitalize active:scale-[0.97] ${activeClasses}`}>
                                  <span className="flex items-center justify-center gap-1.5">
                                    {level === 'easy' ? 'Mudah' : 'Sulit'}
                                  </span>
                              </button>
                             )
                          })}
                      </div>
                  </div>
                  
                  <button onClick={handleStartQuiz} disabled={!tutorialId || !userId} 
                    className={`w-full py-3 px-6 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] relative overflow-hidden group
                    ${(!tutorialId || !userId) 
                        ? 'bg-slate-400 cursor-not-allowed opacity-70' 
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700'}`}>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {(!tutorialId || !userId) ? 'Memuat...' : 'Mulai Sekarang'} <ArrowRightIcon />
                    </span>
                  </button>

                  <HistoryChart history={history} isDark={isDark} />
                </div>
              </div>

              {/* Kanan: Ilustrasi */}
              <div className={`w-full lg:w-5/12 p-4 flex items-center justify-center relative overflow-hidden
                ${isDark ? 'bg-gradient-to-br from-slate-800 to-indigo-950/50' : 'bg-gradient-to-br from-blue-50 to-indigo-100/50'}`}>
                  <div className={`relative z-10 w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 transform hover:scale-110 transition-transform duration-500`}>
                    <HeroIllustration />
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;