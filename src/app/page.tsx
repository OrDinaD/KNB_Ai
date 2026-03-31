'use client';

import { useState } from 'react';
import GameContainer from '@/components/game-container';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-neo-white selection:bg-neo-win overflow-hidden">
      <AnimatePresence mode="wait">
        {!isStarted ? (
          <motion.div 
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl w-full flex flex-col gap-12"
          >
            <header className="flex flex-col gap-4">
              <h1 className="neo-title leading-none">
                Поведенческий<br />детерминизм
              </h1>
              <div className="neo-card bg-neo-black text-neo-white">
                <p className="text-xl md:text-2xl font-mono uppercase tracking-widest">
                  Эксперимент 001: КНБ с ИИ
                </p>
              </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="neo-card flex flex-col gap-4 bg-neo-white border-2">
                <h2 className="text-2xl font-black uppercase">Суть эксперимента</h2>
                <p className="text-lg">
                  Человеческий выбор редко бывает спонтанным. Мы ограничены скрытыми паттернами, 
                  эвристиками и эмоциональными реакциями на предыдущие исходы.
                </p>
                <p className="text-lg font-bold italic">
                  Может ли алгоритм предсказать вашу «свободную волю»?
                </p>
              </div>

              <div className="neo-card flex flex-col gap-4 bg-neo-tie border-2">
                <h2 className="text-2xl font-black uppercase">Техстек</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="neo-border bg-white px-2 py-1 font-bold text-sm">NEXT.JS 16</span>
                  <span className="neo-border bg-white px-2 py-1 font-bold text-sm">TAILWIND V4</span>
                  <span className="neo-border bg-white px-2 py-1 font-bold text-sm">ЦЕПИ МАРКОВА</span>
                </div>
                <button 
                  onClick={() => setIsStarted(true)}
                  className="neo-button mt-4"
                >
                  ИНИЦИАЛИЗИРОВАТЬ ИНТЕРФЕЙС
                </button>
              </div>
            </section>

            <footer className="text-center font-mono uppercase text-sm mt-12 opacity-50">
              [ 2026 исследовательская группа по философии ]
            </footer>
          </motion.div>
        ) : (
          <motion.div 
            key="game"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex items-center justify-center"
          >
            <GameContainer />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
