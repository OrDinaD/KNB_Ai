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
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto h-[90vh] justify-between">
      {/* TOP: STATS & XAI */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between gap-2">
          <StatCard label="ВЫ" value={gameState.score.player} />
          <StatCard label="НИЧЬИ" value={gameState.score.ties} color="bg-neo-tie" />
          <StatCard label="ИИ" value={gameState.score.ai} color="bg-neo-lose text-white" />
        </div>
        
        <div className="neo-card bg-white flex flex-col gap-4">
          <h3 className="text-xs font-black uppercase border-b-2 border-black pb-1">Уверенность предсказания ИИ</h3>
          <div className="flex flex-col gap-3">
            {MOVES.map(move => (
              <ProbabilityBar key={move} move={move} probability={probabilities[move]} />
            ))}
          </div>
          <p className="text-[10px] font-mono leading-tight opacity-70">
            {gameState.rounds < 5 
              ? "> ИНИЦИАЛИЗАЦИЯ ГЛОБАЛЬНЫХ МАТРИЦ ПСИХОЛОГИИ..." 
              : `> АДАПТАЦИЯ ПОД ПАТТЕРНЫ ПОЛЬЗОВАТЕЛЯ (РАУНД ${gameState.rounds})`}
          </p>
        </div>
      </section>

      {/* CENTER: ARENA */}
      <section className="relative flex-grow flex items-center justify-center my-4 overflow-hidden">
        <div className="neo-border bg-neo-black w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
           {/* Grid background for technical feel */}
           <div className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '20px 20px'}} />
           
           <AnimatePresence mode="wait">
            {!gameState.lastAiMove ? (
              <motion.div 
                key="start"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-white text-center z-10"
              >
                <p className="text-4xl font-black uppercase italic tracking-tighter">Готовы?</p>
                <p className="text-xs font-mono opacity-50 mt-2">ВЫБЕРИТЕ ХОД, ЧТОБЫ НАЧАТЬ</p>
              </motion.div>
            ) : (
              <motion.div 
                key={gameState.rounds}
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center gap-4 z-10"
              >
                <div className="flex gap-8 items-center">
                   <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] text-white font-mono opacity-50">ВЫ</span>
                      <div className="text-6xl">{gameState.lastPlayerMove === 'ROCK' ? '✊' : gameState.lastPlayerMove === 'PAPER' ? '✋' : '✌️'}</div>
                   </div>
                   <div className="text-white font-black text-2xl italic">ПРОТИВ</div>
                   <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] text-white font-mono opacity-50">ИИ</span>
                      <div className="text-6xl">{gameState.lastAiMove === 'ROCK' ? '✊' : gameState.lastAiMove === 'PAPER' ? '✋' : '✌️'}</div>
                   </div>
                </div>
                
                <motion.div 
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  className={`px-6 py-2 neo-border font-black uppercase text-xl ${
                    gameState.lastOutcome === 'WIN' ? 'bg-neo-win' : 
                    gameState.lastOutcome === 'LOSE' ? 'bg-neo-lose text-white' : 'bg-neo-tie'
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
               className="absolute inset-0 bg-neo-black/80 flex items-center justify-center z-20"
             >
                <div className="text-neo-win font-mono text-xl animate-pulse">
                  АНАЛИЗ ПАТТЕРНОВ...
                </div>
             </motion.div>
           )}
        </div>
      </section>

      {/* BOTTOM: ACTIONS */}
      <section className="grid grid-cols-3 gap-4 pb-4">
        <MoveButton move="ROCK" onClick={handlePlayerMove} disabled={gameState.isThinking} />
        <MoveButton move="PAPER" onClick={handlePlayerMove} disabled={gameState.isThinking} />
        <MoveButton move="SCISSORS" onClick={handlePlayerMove} disabled={gameState.isThinking} />
      </section>
    </div>
  );
}
