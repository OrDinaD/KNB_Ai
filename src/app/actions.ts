'use server';

import { Move, Outcome, MarkovEngine, BEATS, MOVES } from '@/lib/markov-engine';
import fs from 'fs';
import path from 'path';

// In-memory storage for engines per session
// In production, this should be Redis or a database
const engines = new Map<string, MarkovEngine>();

const LOG_FILE = path.join(process.cwd(), 'telemetry.log');

async function logMove(sessionId: string, data: any) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = JSON.stringify({ timestamp, sessionId, ...data }) + '\n';
    // On Serverless platforms like Vercel, the filesystem is often read-only or ephemeral.
    // We try to write, but if it fails, we don't block the game.
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (error) {
    console.warn('Telemetry logging failed (expected on Vercel):', error);
  }
}

export async function processMove(
  sessionId: string,
  playerMove: Move,
  lastPlayerMove: Move | null,
  lastOutcome: Outcome | null
) {
  // 1. Get or create engine for this session
  if (!engines.has(sessionId)) {
    engines.set(sessionId, new MarkovEngine());
  }
  const engine = engines.get(sessionId)!;

  // 2. Predict AI move based on PREVIOUS round's context
  let aiMove: Move;
  if (!lastPlayerMove || !lastOutcome) {
    aiMove = MOVES[Math.floor(Math.random() * 3)];
  } else {
    aiMove = engine.predict(lastPlayerMove, lastOutcome);
  }

  // 3. Determine Outcome of CURRENT round
  let outcome: Outcome;
  if (playerMove === aiMove) {
    outcome = 'TIE';
  } else if (BEATS[playerMove] === aiMove) {
    outcome = 'WIN';
  } else {
    outcome = 'LOSE';
  }

  // 4. Update Engine with transitions from PREVIOUS to CURRENT move
  if (lastPlayerMove && lastOutcome) {
    engine.update(lastPlayerMove, playerMove, lastOutcome);
  }

  // 5. Calculate probabilities for the NEXT round (XAI)
  const nextProbabilities = engine.getProbabilities(playerMove, outcome);

  // 6. Log telemetry
  await logMove(sessionId, {
    playerMove,
    aiMove,
    outcome,
    round: engine.getState().WIN.ROCK.ROCK + engine.getState().LOSE.ROCK.ROCK + 1 // simplified round count for log
  });

  return {
    aiMove,
    outcome,
    probabilities: nextProbabilities
  };
}
