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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <h1 className="neo-title leading-none">
                  Алгоритмический<br />детерминизм
                </h1>
                <div className="text-right font-mono text-[10px] uppercase opacity-60 hidden md:block">
                  БГУИР / Кафедра философии<br />
                  Минск, 2026
                </div>
              </div>
              
              <div className="neo-card bg-neo-black text-neo-white">
                <p className="text-lg md:text-xl font-mono uppercase tracking-widest leading-tight">
                  Иллюзия свободы воли:<br />
                  Человек как предсказуемый механизм
                </p>
              </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="neo-card flex flex-col gap-6 bg-neo-white border-2">
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-black uppercase leading-none">Авторы исследования</h2>
                  <p className="font-mono text-sm uppercase">
                    Василевский В.В. (гр. 420603)<br />
                    Иосько М.А. (гр. 420604)
                  </p>
                </div>

                <div className="flex flex-col gap-2 border-t-2 border-black pt-4">
                  <h3 className="text-xs font-black uppercase opacity-60">Научный руководитель</h3>
                  <p className="font-mono text-sm uppercase">
                    Миськевич В.И.<br />
                    <span className="text-[10px]">Кандидат философских наук, доцент</span>
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t-2 border-black/10">
                  <p className="font-mono text-[10px] uppercase opacity-70 leading-tight">
                    Для обратной связи можете писать Василевскому в ТГ: <a href="https://t.me/lokhotonkot" target="_blank" className="underline decoration-neo-tie decoration-2 underline-offset-2 hover:text-neo-black transition-colors font-bold">@LOKHOTONKOT</a>
                  </p>
                </div>
              </div>

              <div className="neo-card flex flex-col gap-4 bg-neo-white border-2">
                <h2 className="text-2xl font-black uppercase leading-none">О проекте</h2>
                <p className="text-sm md:text-base">
                  Разработано для <strong>62-й Научной Конференции</strong> Аспирантов, Магистрантов и Студентов БГУИР.
                </p>
                <p className="text-sm md:text-base italic">
                  Эксперимент доказывает неспособность человеческого сознания генерировать истинно случайные последовательности.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="neo-border bg-neo-win px-2 py-1 font-bold text-[10px]">MARKOV ENGINE V2.1</span>
                  <span className="neo-border bg-white px-2 py-1 font-bold text-[10px]">NEXT.JS 16</span>
                </div>
                <button 
                  onClick={() => setIsStarted(true)}
                  className="neo-button mt-4 bg-neo-black text-white hover:bg-neo-gray"
                >
                  ЗАПУСТИТЬ ТЕСТ ДЕТЕРМИНИЗМА
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
