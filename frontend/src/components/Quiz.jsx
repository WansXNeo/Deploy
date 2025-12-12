import React from 'react';
import Question from './Question';

function Quiz({ questions, userAnswers, onAnswerChange, onSubmit }) {
  
  // Hitung berapa banyak pertanyaan yang sudah dijawab
  const answeredCount = Object.values(userAnswers).filter(Boolean).length;
  const allAnswered = answeredCount === questions.length;

  return (
    // 'form' agar kita bisa menggunakan onSubmit
    <form onSubmit={onSubmit}>
      {/* Daftar semua pertanyaan */}
      <div className="space-y-8">
        {questions.map((q) => (
          <Question
            key={q.id} // Gunakan ID dari data jika tersedia
            question={q}
            // Kirim jawaban yang sudah dipilih untuk pertanyaan ini
            selectedAnswer={userAnswers[q.id] || null}
            onAnswerChange={onAnswerChange}
          />
        ))}
      </div>

      {/* Tombol Submit Kuis */}
      <button
        type="submit"
        disabled={!allAnswered} // Tombol disabled jika belum semua dijawab
        className={`w-full mt-10 font-bold py-3 px-6 rounded-lg text-lg
                    transition duration-300 ease-in-out focus:outline-none 
                    focus:ring-2 focus:ring-offset-2
                    ${allAnswered
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' // State: Aktif
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed' // State: Disabled
                    }`}
      >
        {allAnswered ? 'Kirim Jawaban' : `Jawab ${questions.length - answeredCount} pertanyaan lagi`}
      </button>
    </form>
  );
}

export default Quiz;