'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { GamePhase } from '@/types/game.types';
import type { Card } from '@/types/game.types';
import { PlayerHand } from './PlayerHand';
import { TrickArea } from './TrickArea';
import { BettingPanel } from './BettingPanel';
import { PlayerSeat } from './PlayerSeat';
import { MissionCard } from './MissionCard';
import { PiliTracker } from './PiliTracker';
import { RoundSummary } from './RoundSummary';
import { GameOverOverlay } from './GameOverOverlay';
import { JokerDeclarePanel } from './JokerDeclarePanel';
import { CardPassPanel } from './CardPassPanel';
import { MissionRevealOverlay } from './MissionRevealOverlay';

export function GameBoard() {
  const socket = useSocket();
  const { playerId, roomCode } = usePlayerStore();

  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const myHand = useGameStore((s) => s.myHand);
  const currentTrick = useGameStore((s) => s.currentTrick);
  const currentMission = useGameStore((s) => s.currentMission);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const dealerIndex = useGameStore((s) => s.dealerIndex);
  const totalTricksThisRound = useGameStore((s) => s.totalTricksThisRound);
  const currentRound = useGameStore((s) => s.currentRound);
  const roundScoring = useGameStore((s) => s.roundScoring);
  const finalStandings = useGameStore((s) => s.finalStandings);
  const eliminatedId = useGameStore((s) => s.eliminatedId);
  const isPeeking = useGameStore((s) => s.isPeeking);
  const error = useGameStore((s) => s.error);
  const selectedCardId = useGameStore((s) => s.selectedCardId);
  const setSelectedCard = useGameStore((s) => s.setSelectedCard);

  const [showJokerPanel, setShowJokerPanel] = useState(false);
  const [pendingJokerCardId, setPendingJokerCardId] = useState<string | null>(null);
  const [showMissionReveal, setShowMissionReveal] = useState(false);
  const [showMissionDetail, setShowMissionDetail] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const prevMissionIdRef = useRef<string | null>(null);

  // Trigger mission reveal animation when a new mission appears
  useEffect(() => {
    if (currentMission && currentMission.id !== prevMissionIdRef.current) {
      setShowMissionReveal(true);
      prevMissionIdRef.current = currentMission.id;
    }
  }, [currentMission]);

  const myIndex = players.findIndex((p) => p.id === playerId);
  const isMyTurn = players[currentPlayerIndex]?.id === playerId;
  const otherPlayers = players.filter((p) => p.id !== playerId);

  const isBettingPhase = phase === GamePhase.BETTING;
  const isTrickPhase = phase === GamePhase.TRICK_PLAY;
  const isPostBet = phase === GamePhase.POST_BET_MISSION;

  // Check if card pass is required
  const needsPass = isPostBet && currentMission?.params &&
    (('passCount' in currentMission.params) || ('direction' in currentMission.params && !('passCount' in currentMission.params)));

  // Compute forbidden bets
  const forbiddenBets: number[] = [];
  if (currentMission?.params) {
    if ('forbiddenValue' in currentMission.params) {
      forbiddenBets.push(currentMission.params.forbiddenValue as number);
    }
  }
  const betsPlaced = players.filter((p) => p.bet !== null);
  const isLastBetter = betsPlaced.length === players.length - 1 && isBettingPhase && isMyTurn;
  if (isLastBetter) {
    const sumBets = betsPlaced.reduce((sum, p) => sum + (p.bet ?? 0), 0);
    const forbidden = totalTricksThisRound - sumBets;
    if (forbidden >= 0 && forbidden <= totalTricksThisRound && !forbiddenBets.includes(forbidden)) {
      forbiddenBets.push(forbidden);
    }
  }

  const handleCardClick = useCallback((card: Card) => {
    if (!isTrickPhase || !isMyTurn) return;

    if (card.isJoker) {
      setPendingJokerCardId(card.id);
      setShowJokerPanel(true);
      return;
    }

    if (selectedCardId === card.id) {
      socket.emit('game:playCard', { cardId: card.id });
      setSelectedCard(null);
    } else {
      setSelectedCard(card.id);
    }
  }, [isTrickPhase, isMyTurn, selectedCardId, socket, setSelectedCard]);

  const handleJokerDeclare = useCallback((value: number) => {
    if (pendingJokerCardId) {
      socket.emit('game:playCard', { cardId: pendingJokerCardId, jokerDeclaredValue: value });
      setShowJokerPanel(false);
      setPendingJokerCardId(null);
      setSelectedCard(null);
    }
  }, [pendingJokerCardId, socket, setSelectedCard]);

  const handlePlaceBet = useCallback((bet: number) => {
    socket.emit('game:placeBet', { bet });
  }, [socket]);

  const handlePassCards = useCallback((cardIds: string[]) => {
    socket.emit('game:passCards', { cardIds });
  }, [socket]);

  const handleQuit = useCallback(() => {
    socket.emit('room:leave');
    window.location.href = '/';
  }, [socket]);

  const getPhaseLabel = () => {
    switch (phase) {
      case GamePhase.BETTING: return 'Phase de paris';
      case GamePhase.TRICK_PLAY: return 'Jouez vos cartes';
      case GamePhase.TRICK_RESOLUTION: return 'R\u00e9solution du pli';
      case GamePhase.ROUND_SCORING: return 'Score';
      case GamePhase.PRE_BET_MISSION: return 'Mission sp\u00e9ciale';
      case GamePhase.POST_BET_MISSION: return 'Action de mission';
      case GamePhase.MISSION_REVEAL: return 'Nouvelle mission';
      case GamePhase.DEALING: return 'Distribution';
      default: return '';
    }
  };

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2">
          {/* Quit Button - door icon */}
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-text-muted hover:text-accent-red hover:border-accent-red/40 transition-all"
            title="Quitter la partie"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
          {/* Mission Card - clickable to see details */}
          <div onClick={() => currentMission && setShowMissionDetail(true)} className="cursor-pointer">
            <MissionCard mission={currentMission} />
          </div>
        </div>

        <div className="text-center">
          <div className="text-[10px] text-text-muted">Manche {currentRound}</div>
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold text-foreground"
          >
            {getPhaseLabel()}
          </motion.div>
          {isPeeking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-accent-red animate-pulse font-bold"
            >
              M\u00e9morise tes cartes !
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {roomCode && (
            <span className="text-[9px] font-mono text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border">
              {roomCode}
            </span>
          )}
          <PiliTracker players={players} piliLimit={6} myPlayerId={playerId} />
        </div>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-12 left-1/2 -translate-x-1/2 z-40 bg-accent-red/90 text-foreground px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game Area - fills remaining space */}
      <div className="flex-1 min-h-0 flex flex-col px-3 py-2">
        {/* Opponent Seats */}
        <div className="flex flex-wrap justify-center gap-1 shrink-0">
          {otherPlayers.map((player) => (
            <PlayerSeat
              key={player.id}
              player={player}
              isCurrentTurn={players[currentPlayerIndex]?.id === player.id}
              isDealer={players[dealerIndex]?.id === player.id}
              isMe={false}
            />
          ))}
        </div>

        {/* Trick Area - takes remaining vertical space */}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <TrickArea
            trick={currentTrick}
            players={players}
            winnerId={currentTrick?.winnerId}
          />
        </div>

        {/* My Seat + Action Zone */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          {myIndex >= 0 && (
            <PlayerSeat
              player={players[myIndex]}
              isCurrentTurn={isMyTurn}
              isDealer={myIndex === dealerIndex}
              isMe
            />
          )}

          {/* Betting Panel */}
          <AnimatePresence mode="wait">
            {isBettingPhase && (
              <motion.div
                key="betting"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full max-w-sm overflow-hidden"
              >
                <BettingPanel
                  maxBet={totalTricksThisRound}
                  forbiddenBets={forbiddenBets}
                  onPlaceBet={handlePlaceBet}
                  isMyTurn={isMyTurn}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card Pass Panel */}
          <AnimatePresence>
            {needsPass && currentMission?.params && (
              <motion.div
                key="pass"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full max-w-sm overflow-hidden"
              >
                <CardPassPanel
                  hand={myHand}
                  count={(currentMission.params as any).passCount ?? myHand.length}
                  direction={(currentMission.params as any).direction ?? 'left'}
                  onPass={handlePassCards}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* My Hand */}
        <div className="shrink-0 w-full max-w-xl mx-auto">
          <PlayerHand
            cards={myHand}
            onCardClick={handleCardClick}
            disabled={!isTrickPhase || !isMyTurn}
            hidden={isPeeking === false && myHand.some((c) => c.value === -1)}
          />
          <AnimatePresence>
            {isTrickPhase && isMyTurn && selectedCardId && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-[10px] text-accent-gold mt-1 animate-pulse"
              >
                Clique \u00e0 nouveau pour confirmer
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* === Overlays === */}

      {/* Mission Reveal (auto on new round) */}
      <AnimatePresence>
        {showMissionReveal && currentMission && (
          <MissionRevealOverlay
            mission={currentMission}
            onComplete={() => setShowMissionReveal(false)}
          />
        )}
      </AnimatePresence>

      {/* Mission Detail (manual click) */}
      <AnimatePresence>
        {showMissionDetail && currentMission && !showMissionReveal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={() => setShowMissionDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`
                rounded-2xl border-2 p-6 max-w-sm w-full mx-4 shadow-2xl
                ${currentMission.isExpert
                  ? 'border-accent-red bg-gradient-to-br from-[#3d1520] to-[#2d1515]'
                  : 'border-accent-gold bg-gradient-to-br from-[#3d2a15] to-[#2d1515]'
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg font-black mx-auto mb-3
                ${currentMission.isExpert
                  ? 'bg-accent-red/30 text-accent-red border-2 border-accent-red/50'
                  : 'bg-accent-gold/30 text-accent-gold border-2 border-accent-gold/50'
                }
              `}>
                {currentMission.id}
              </div>
              <h2 className="text-xl font-black text-center text-foreground mb-2">
                {currentMission.name}
              </h2>
              <p className="text-sm text-text-secondary text-center leading-relaxed mb-3">
                {currentMission.description}
              </p>
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-xs text-text-muted">
                  {currentMission.cardsPerPlayer} carte{currentMission.cardsPerPlayer > 1 ? 's' : ''} / joueur
                </span>
                {currentMission.isExpert && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent-red/20 text-accent-red font-bold">
                    Expert
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowMissionDetail(false)}
                className="btn-secondary w-full text-sm"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Joker Panel */}
      <AnimatePresence>
        {showJokerPanel && (
          <JokerDeclarePanel onDeclare={handleJokerDeclare} />
        )}
      </AnimatePresence>

      {/* Round Summary */}
      <AnimatePresence>
        {roundScoring && phase === GamePhase.ROUND_SCORING && (
          <RoundSummary scoring={roundScoring} myPlayerId={playerId} />
        )}
      </AnimatePresence>

      {/* Game Over */}
      {finalStandings && eliminatedId && (
        <GameOverOverlay
          standings={finalStandings}
          eliminatedId={eliminatedId}
          myPlayerId={playerId}
          onPlayAgain={() => { window.location.href = '/'; }}
          onLeave={() => { window.location.href = '/'; }}
        />
      )}

      {/* Quit Confirm Dialog */}
      <AnimatePresence>
        {showQuitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface rounded-2xl border border-border p-6 w-full max-w-xs shadow-2xl text-center mx-4"
            >
              <h3 className="text-lg font-bold mb-2">Quitter la partie ?</h3>
              <p className="text-sm text-text-secondary mb-5">
                Tu seras remplac\u00e9 par un bot.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQuitConfirm(false)}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  onClick={handleQuit}
                  className="btn-primary flex-1"
                >
                  Quitter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
