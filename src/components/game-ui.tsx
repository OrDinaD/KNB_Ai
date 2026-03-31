import React from 'react';
import { Move, MOVES } from '@/lib/markov-engine';
import { Scissors, Square as Rock, StickyNote as Paper } from 'lucide-react';

interface GameButtonProps {
  move: Move;
  onClick: (move: Move) => void;
  disabled?: boolean;
}

export const MoveButton: React.FC<GameButtonProps> = ({ move, onClick, disabled }) => {
  const Icon = move === 'ROCK' ? Rock : move === 'PAPER' ? Paper : Scissors;
  const label = move === 'ROCK' ? 'КАМЕНЬ' : move === 'PAPER' ? 'БУМАГА' : 'НОЖНИЦЫ';
  
  return (
    <button
      onClick={() => onClick(move)}
      disabled={disabled}
      className="neo-button group flex flex-col items-center justify-center gap-4 py-8 md:py-12 aspect-square"
    >
      <Icon size={48} strokeWidth={3} className="group-active:scale-90 transition-transform" />
      <span className="text-xl font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
};

export const StatCard: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = "bg-white" }) => (
  <div className={`neo-card ${color} flex flex-col items-center justify-center py-2 px-4 min-w-[100px]`}>
    <span className="text-[10px] font-bold uppercase opacity-60 leading-none mb-1">{label}</span>
    <span className="text-2xl font-black tabular-nums">{value}</span>
  </div>
);

export const ProbabilityBar: React.FC<{ move: Move; probability: number }> = ({ move, probability }) => {
  const percentage = (probability * 100).toFixed(0);
  const label = move === 'ROCK' ? 'КАМЕНЬ' : move === 'PAPER' ? 'БУМАГА' : 'НОЖНИЦЫ';
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between text-[10px] font-black uppercase">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-4 neo-border bg-white overflow-hidden">
        <div 
          className="h-full bg-neo-black transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
