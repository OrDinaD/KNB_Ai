'use client';

import React, { useState, useEffect } from 'react';
import { Move, Outcome, MOVES } from '@/lib/markov-engine';
import { MoveButton, StatCard, ProbabilityBar } from '@/components/game-ui';
import { motion, AnimatePresence } from 'framer-motion';
import { processMove } from '@/app/actions';

export default function GameContainer() {
  const [sessionId, setSessionId] = useState<string>('');
  const [gameState, setGameState] = useState<{
    lastPlayerMove: Move | null;
    lastAiMove: Move | null;
    lastOutcome: Outcome | null;
    rounds: number;
    score: { player: number; ai: number; ties: number };
    isThinking: boolean;
  }>({
    lastPlayerMove: null,
    lastAiMove: null,
    lastOutcome: null,
    rounds: 0,
    score: { player: 0, ai: 0, ties: 0 },
    isThinking: false,
  });

  const [probabilities, setProbabilities] = useState<Record<Move, number>>({
    ROCK: 0.33, PAPER: 0.33, SCISSORS: 0.33
  });

  useEffect(() => {
    // Generate or retrieve session ID
    let sid = localStorage.getItem('rps_session_id');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('rps_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  const handlePlayerMove = async (playerMove: Move) => {
    if (gameState.isThinking || !sessionId) return;

    setGameState(prev => ({ ...prev, isThinking: true }));

    try {
      // Call server to process move (AI logic and Telemetry)
      const result = await processMove(
        sessionId,
        playerMove,
        gameState.lastPlayerMove,
        gameState.lastOutcome
      );

      setGameState(prev => ({
        ...prev,
        lastPlayerMove: playerMove,
        lastAiMove: result.aiMove as Move,
        lastOutcome: result.outcome as Outcome,
        rounds: prev.rounds + 1,
        score: {
          player: result.outcome === 'WIN' ? prev.score.player + 1 : prev.score.player,
          ai: result.outcome === 'LOSE' ? prev.score.ai + 1 : prev.score.ai,
          ties: result.outcome === 'TIE' ? prev.score.ties + 1 : prev.score.ties,
        },
        isThinking: false,
      }));

      setProbabilities(result.probabilities);
    } catch (error) {
      console.error('Failed to process move:', error);
      setGameState(prev => ({ ...prev, isThinking: false }));
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto h-full justify-between pb-safe">
      {/* TOP: STATS & XAI */}
      <section className="flex flex-col gap-2 pt-2 px-2">
        <div className="flex justify-between gap-2">
          <StatCard label="ВЫ" value={gameState.score.player} />
          <StatCard label="НИЧЬИ" value={gameState.score.ties} color="bg-neo-tie" />
          <StatCard label="ИИ" value={gameState.score.ai} color="bg-neo-lose text-white" />
        </div>
        
        <div className="neo-card bg-white flex flex-col gap-3 p-4">
          <h3 className="text-[10px] font-black uppercase border-b-2 border-black pb-1">Уверенность предсказания ИИ</h3>
          <div className="flex flex-col gap-2">
            {MOVES.map(move => (
              <ProbabilityBar key={move} move={move} probability={probabilities[move]} />
            ))}
          </div>
          <p className="text-[9px] font-mono leading-tight opacity-70">
            {gameState.rounds < 5 
              ? "> ИНИЦИАЛИЗАЦИЯ ГЛОБАЛЬНЫХ МАТРИЦ ПСИХОЛОГИИ..." 
              : `> АДАПТАЦИЯ ПОД ПАТТЕРНЫ ПОЛЬЗОВАТЕЛЯ (РАУНД ${gameState.rounds})`}
          </p>
        </div>
      </section>

      {/* CENTER: ARENA */}
      <section className="relative flex-grow flex items-center justify-center my-2 px-2 overflow-hidden min-h-[180px]">
        <div className="neo-border bg-neo-black w-full h-full flex flex-col items-center justify-center p-2 relative overflow-hidden">
           {/* Grid background for technical feel */}
           <div className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '15px 15px'}} />
           
           <AnimatePresence mode="wait">
            {!gameState.lastAiMove ? (
              <motion.div 
                key="start"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-white text-center z-10"
              >
                <p className="text-3xl font-black uppercase italic tracking-tighter">Готовы?</p>
                <p className="text-[10px] font-mono opacity-50 mt-1 uppercase">ВЫБЕРИТЕ ХОД, ЧТОБЫ НАЧАТЬ</p>
              </motion.div>
            ) : (
              <motion.div 
                key={gameState.rounds}
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4 z-10 w-full"
              >
                <div className="flex justify-around items-center w-full px-4">
                   <div className="flex flex-col items-center gap-1">
                      <span className="text-[8px] text-white font-mono opacity-50 uppercase">ВЫ</span>
                      <div className="text-5xl md:text-6xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        {gameState.lastPlayerMove === 'ROCK' ? '✊' : gameState.lastPlayerMove === 'PAPER' ? '✋' : '✌️'}
                      </div>
                   </div>
                   
                   <div className="flex flex-col items-center">
                      <div className="text-white font-black text-lg italic bg-white/10 px-2 py-1 neo-border border-white/20 uppercase">
                        ПРОТИВ
                      </div>
                   </div>

                   <div className="flex flex-col items-center gap-1">
                      <span className="text-[8px] text-white font-mono opacity-50 uppercase">ИИ</span>
                      <div className="text-5xl md:text-6xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        {gameState.lastAiMove === 'ROCK' ? '✊' : gameState.lastAiMove === 'PAPER' ? '✋' : '✌️'}
                      </div>
                   </div>
                </div>
                
                <motion.div 
                  initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className={`px-4 py-1.5 neo-border font-black uppercase text-sm md:text-base ${
                    gameState.lastOutcome === 'WIN' ? 'bg-neo-win text-black' : 
                    gameState.lastOutcome === 'LOSE' ? 'bg-neo-lose text-white' : 'bg-neo-tie text-black'
                  }`}
                >
                  {gameState.lastOutcome === 'WIN' ? 'ВЫ ВЫИГРАЛИ' : 
                   gameState.lastOutcome === 'LOSE' ? 'ИИ ВЫИГРАЛ' : 'НИЧЬЯ'}
                </motion.div>
              </motion.div>
            )}
           </AnimatePresence>

           {gameState.isThinking && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               className="absolute inset-0 bg-neo-black/90 flex flex-col items-center justify-center z-20"
             >
                <div className="text-neo-win font-mono text-base md:text-lg animate-pulse tracking-widest uppercase">
                  АНАЛИЗ ПАТТЕРНОВ...
                </div>
                <div className="w-24 h-1 bg-white/10 mt-2 neo-border border-white/20 overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }} animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-full h-full bg-neo-win shadow-[0_0_10px_#00ff00]"
                  />
                </div>
             </motion.div>
           )}
        </div>
      </section>

      {/* BOTTOM: ACTIONS */}
      <section className="grid grid-cols-3 gap-3 px-2 pb-4">
        <MoveButton move="ROCK" onClick={handlePlayerMove} disabled={gameState.isThinking} />
        <MoveButton move="PAPER" onClick={handlePlayerMove} disabled={gameState.isThinking} />
        <MoveButton move="SCISSORS" onClick={handlePlayerMove} disabled={gameState.isThinking} />
      </section>
    </div>
  );
}
