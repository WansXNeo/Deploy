import React, { useEffect, useState } from 'react';

const BUBBLE_MESSAGES = [
  {
    title: "Sabar ya, soal kamu sedang dibuat…",
    subtitle: "Sistem lagi membaca materi dan mencari poin-poin pentingnya."
  },
  {
    title: "AI lagi nyusun soal terbaik buat kamu 🤔",
    subtitle: "Kami memastikan soal tetap relevan dengan materi yang kamu pelajari."
  },
  {
    title: "Sambil menunggu, boleh cek materi lagi.",
    subtitle: "Lihat cepat poin utama modul biar makin siap jawab."
  },
  {
    title: "Sedikit lagi, hampir selesai ✨",
    subtitle: "Soal sedang dicek supaya tidak keluar konteks."
  },
  {
    title: "Terima kasih sudah menunggu 🙏",
    subtitle: "Kami ingin pengalaman belajarmu tetap nyaman."
  }
];

const BUBBLE_POSITIONS = [
  { x: -400, y: -150 }, // kiri atas
  { x: 100,  y: -130 }, // kanan atas
  { x: -400, y: 70  },  // kiri bawah
  { x: 90,   y: 70  },  // kanan bawah
];

function LoadingSpinner({ isDark }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % BUBBLE_MESSAGES.length);
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  const current = BUBBLE_MESSAGES[messageIndex];
  const position = BUBBLE_POSITIONS[messageIndex % BUBBLE_POSITIONS.length];

  // true kalau bubble di sisi kiri (x negatif)
  const isLeftSide = position.x < 0;

  // kelas warna ekor (tanpa side border)
  const tailBase = isDark
    ? 'bg-gray-800 border-b border-gray-700'
    : 'bg-white border-b border-gray-200';

  // border samping ekor (supaya ngarah ke tengah)
  const sideBorderClass = isLeftSide ? 'border-r' : 'border-l';

  return (
    <div
      className={`relative flex items-center justify-center h-screen w-full
      ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-white to-gray-50 text-gray-800'}`}
    >
      {/* SPINNER DI TENGAH DENGAN TEKS "Loading..." */}
      <div className="flex flex-col items-center">
        <div
          className={`w-16 h-16 border-4 rounded-full animate-spin
          ${isDark ? 'border-gray-700 border-t-blue-500' : 'border-gray-200 border-t-blue-600'}`}
        />
        <p
          className={`mt-4 text-sm md:text-base tracking-wide
          ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Loading...
        </p>
      </div>

      {/* BUBBLE TEKS BERGERAK DI SEKITAR SPINNER */}
      <div
        className="absolute left-1/2 top-1/2 pointer-events-none"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        {/* wrapper supaya ekor bisa di bawah bubble */}
        <div key={messageIndex} className="relative inline-block">
          {/* EKOR BUBBLE (di bawah bubble box) */}
          <div
            className={`pointer-events-none absolute bottom-3 h-3 w-3 ${
              isLeftSide ? '-right-2' : '-left-2'
            }`}
          >
            <div
              className={`h-full w-full rotate-45 ${tailBase} ${sideBorderClass}`}
            />
          </div>

          {/* BUBBLE BOX */}
          <div
            className={`relative max-w-xs px-4 py-3 rounded-2xl shadow-lg border
            text-xs sm:text-sm animate-fade-in-fast
            ${isDark ? 'bg-gray-800/95 border-gray-700 text-gray-100'
                    : 'bg-white/95 border-gray-200 text-gray-800'}`}
          >
            <p className="font-semibold">
              {current.title}
            </p>
            {current.subtitle && (
              <p className="mt-1 opacity-80">
                {current.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
