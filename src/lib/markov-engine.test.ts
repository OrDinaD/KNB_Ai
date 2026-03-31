import { describe, it, expect } from 'vitest';
import { MarkovEngine, MOVES, LOSES_TO } from './markov-engine';

describe('MarkovEngine', () => {
  it('should initialize with probabilities close to 0.33 due to Laplace smoothing and Global Matrix', () => {
    const engine = new MarkovEngine();
    const probs = engine.getProbabilities('ROCK', 'TIE');
    
    const sum = probs.ROCK + probs.PAPER + probs.SCISSORS;
    expect(sum).toBeCloseTo(1, 5);
    // Values are influenced by GLOBAL_MATRIX, so they won't be exactly 0.33
    expect(probs.ROCK).toBeGreaterThan(0.2);
    expect(probs.PAPER).toBeGreaterThan(0.2);
    expect(probs.SCISSORS).toBeGreaterThan(0.2);
  });

  it('should update transition counts and influence predictions', () => {
    const engine = new MarkovEngine();
    
    // Pattern: After ROCK and a TIE, the user ALWAYS picks PAPER
    for (let i = 0; i < 10; i++) {
      engine.update('ROCK', 'PAPER', 'TIE');
    }

    const probs = engine.getProbabilities('ROCK', 'TIE');
    
    // Probability of PAPER should be much higher than others
    expect(probs.PAPER).toBeGreaterThan(probs.ROCK);
    expect(probs.PAPER).toBeGreaterThan(probs.SCISSORS);

    // AI should predict PAPER and therefore play SCISSORS
    const prediction = engine.predict('ROCK', 'TIE');
    expect(prediction).toBe(LOSES_TO['PAPER']); // SCISSORS
  });

  it('should respect the outcome context (WIN vs LOSE)', () => {
    const engine = new MarkovEngine();

    // After ROCK and WIN, player picks SCISSORS
    engine.update('ROCK', 'SCISSORS', 'WIN');
    // After ROCK and LOSE, player picks ROCK
    engine.update('ROCK', 'ROCK', 'LOSE');

    const predictionWin = engine.predict('ROCK', 'WIN');
    const predictionLose = engine.predict('ROCK', 'LOSE');

    expect(predictionWin).toBe(LOSES_TO['SCISSORS']); // ROCK
    expect(predictionLose).toBe(LOSES_TO['ROCK']); // PAPER
  });
});
