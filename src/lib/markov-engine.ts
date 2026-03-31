export type Move = 'ROCK' | 'PAPER' | 'SCISSORS';
export type Outcome = 'WIN' | 'LOSE' | 'TIE';

export const MOVES: Move[] = ['ROCK', 'PAPER', 'SCISSORS'];

export const BEATS: Record<Move, Move> = {
  ROCK: 'SCISSORS',
  PAPER: 'ROCK',
  SCISSORS: 'PAPER',
};

export const LOSES_TO: Record<Move, Move> = {
  ROCK: 'PAPER',
  PAPER: 'SCISSORS',
  SCISSORS: 'ROCK',
};

// Transition frequencies table
export type TransitionTable = Record<Move, Record<Move, number>>;

export interface MarkovState {
  WIN: TransitionTable;
  LOSE: TransitionTable;
  TIE: TransitionTable;
}

const createEmptyTable = (): TransitionTable => ({
  ROCK: { ROCK: 0, PAPER: 0, SCISSORS: 0 },
  PAPER: { ROCK: 0, PAPER: 0, SCISSORS: 0 },
  SCISSORS: { ROCK: 0, PAPER: 0, SCISSORS: 0 },
});

/**
 * GLOBAL_MATRIX represents common human psychological patterns in RPS.
 * Patterns:
 * - Winners tend to repeat their winning move.
 * - Losers tend to shift to the move that would have beaten the move they just lost to.
 */
export const GLOBAL_MATRIX: MarkovState = {
  WIN: {
    ROCK: { ROCK: 5, PAPER: 2, SCISSORS: 3 },
    PAPER: { ROCK: 3, PAPER: 5, SCISSORS: 2 },
    SCISSORS: { ROCK: 2, PAPER: 3, SCISSORS: 5 },
  },
  LOSE: {
    ROCK: { ROCK: 2, PAPER: 5, SCISSORS: 3 },
    PAPER: { ROCK: 3, PAPER: 2, SCISSORS: 5 },
    SCISSORS: { ROCK: 5, PAPER: 3, SCISSORS: 2 },
  },
  TIE: {
    ROCK: { ROCK: 3, PAPER: 4, SCISSORS: 3 },
    PAPER: { ROCK: 3, PAPER: 3, SCISSORS: 4 },
    SCISSORS: { ROCK: 4, PAPER: 3, SCISSORS: 3 },
  },
};

export class MarkovEngine {
  private uniqueMatrix: MarkovState;
  private totalRounds: number = 0;

  constructor(initialState?: MarkovState) {
    this.uniqueMatrix = initialState || {
      WIN: createEmptyTable(),
      LOSE: createEmptyTable(),
      TIE: createEmptyTable(),
    };
  }

  public update(prevMove: Move, currentMove: Move, outcome: Outcome) {
    this.uniqueMatrix[outcome][prevMove][currentMove]++;
    this.totalRounds++;
  }

  /**
   * Predicts the player's next move using Markov Chains with Laplace Smoothing
   * and a weighted combination of Global and Unique matrices.
   */
  public predict(lastMove: Move, lastOutcome: Outcome): Move {
    const uniqueTable = this.uniqueMatrix[lastOutcome][lastMove];
    const globalTable = GLOBAL_MATRIX[lastOutcome][lastMove];

    // Calculate dynamic weights as per PDF (starts at 50% global, decays to 25%)
    const globalWeight = Math.max(0.25, 0.5 * Math.exp(-this.totalRounds / 20));
    const uniqueWeight = 1 - globalWeight;

    let bestMove: Move = 'ROCK';
    let maxProb = -1;

    // Laplace smoothing parameter (v = 3 states)
    const LAPLACE_SMOOTHING = 1;
    const V = 3;

    for (const move of MOVES) {
      const uniqueCount = uniqueTable[move];
      const globalCount = globalTable[move];

      // Sum of all unique transitions from lastMove in this outcome context
      const totalUnique = Object.values(uniqueTable).reduce((a, b) => a + b, 0);
      const totalGlobal = Object.values(globalTable).reduce((a, b) => a + b, 0);

      // Estimated probabilities with Laplace smoothing
      const pUnique = (uniqueCount + LAPLACE_SMOOTHING) / (totalUnique + V);
      const pGlobal = (globalCount + LAPLACE_SMOOTHING) / (totalGlobal + V);

      const combinedProb = pUnique * uniqueWeight + pGlobal * globalWeight;

      if (combinedProb > maxProb) {
        maxProb = combinedProb;
        bestMove = move;
      }
    }

    // Return the move that BEATS the predicted move
    return LOSES_TO[bestMove];
  }

  public getProbabilities(lastMove: Move, lastOutcome: Outcome): Record<Move, number> {
    const probs: Record<string, number> = {};
    const uniqueTable = this.uniqueMatrix[lastOutcome][lastMove];
    const globalTable = GLOBAL_MATRIX[lastOutcome][lastMove];
    const globalWeight = Math.max(0.25, 0.5 * Math.exp(-this.totalRounds / 20));
    const uniqueWeight = 1 - globalWeight;
    const LAPLACE_SMOOTHING = 1;
    const V = 3;

    for (const move of MOVES) {
      const totalUnique = Object.values(uniqueTable).reduce((a, b) => a + b, 0);
      const totalGlobal = Object.values(globalTable).reduce((a, b) => a + b, 0);
      const pUnique = (uniqueTable[move] + LAPLACE_SMOOTHING) / (totalUnique + V);
      const pGlobal = (globalTable[move] + LAPLACE_SMOOTHING) / (totalGlobal + V);
      probs[move] = pUnique * uniqueWeight + pGlobal * globalWeight;
    }

    return probs as Record<Move, number>;
  }

  public getState(): MarkovState {
    return this.uniqueMatrix;
  }
}
