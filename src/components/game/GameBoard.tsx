'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
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

export function GameBoard() {
  const socket = useSocket();
  const { playerId } = usePlayerStore();

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
  // Last player constraint
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
      // Confirm play
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

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <MissionCard mission={currentMission} />

        <div className="text-center">
          <div className="text-xs text-text-muted">Manche {currentRound}</div>
          <div className="text-sm font-bold text-foreground">
            {phase === GamePhase.BETTING && 'Phase de paris'}
            {phase === GamePhase.TRICK_PLAY && 'Jouez vos cartes'}
            {phase === GamePhase.TRICK_RESOLUTION && 'R\u00e9solution du pli'}
            {phase === GamePhase.ROUND_SCORING && 'Score'}
            {phase === GamePhase.PRE_BET_MISSION && 'Mission sp\u00e9ciale'}
            {phase === GamePhase.POST_BET_MISSION && 'Action de mission'}
            {phase === GamePhase.MISSION_REVEAL && 'Nouvelle mission'}
            {phase === GamePhase.DEALING && 'Distribution'}
          </div>
          {isPeeking && (
            <div className="text-xs text-accent-red animate-pulse font-bold">
              M\u00e9morise tes cartes !
            </div>
          )}
        </div>

        <PiliTracker players={players} piliLimit={6} myPlayerId={playerId} />
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-accent-red/90 text-foreground px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
            {error}
          </div>
        )}
      </AnimatePresence>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-between py-4 px-3">
        {/* Opponent Seats */}
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
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

        {/* Trick Area */}
        <div className="my-4">
          <TrickArea
            trick={currentTrick}
            players={players}
            winnerId={currentTrick?.winnerId}
          />
        </div>

        {/* My Seat Info */}
        <div className="mb-2">
          {myIndex >= 0 && (
            <PlayerSeat
              player={players[myIndex]}
              isCurrentTurn={isMyTurn}
              isDealer={myIndex === dealerIndex}
              isMe
            />
          )}
        </div>

        {/* Betting Panel */}
        {isBettingPhase && (
          <BettingPanel
            maxBet={totalTricksThisRound}
            forbiddenBets={forbiddenBets}
            onPlaceBet={handlePlaceBet}
            isMyTurn={isMyTurn}
          />
        )}

        {/* Card Pass Panel */}
        {needsPass && currentMission?.params && (
          <CardPassPanel
            hand={myHand}
            count={(currentMission.params as any).passCount ?? myHand.length}
            direction={(currentMission.params as any).direction ?? 'left'}
            onPass={handlePassCards}
          />
        )}

        {/* My Hand */}
        <div className="w-full max-w-2xl mt-4">
          <PlayerHand
            cards={myHand}
            onCardClick={handleCardClick}
            disabled={!isTrickPhase || !isMyTurn}
            hidden={isPeeking === false && myHand.some((c) => c.value === -1)}
          />
          {isTrickPhase && isMyTurn && selectedCardId && (
            <p className="text-center text-xs text-accent-gold mt-2 animate-pulse">
              Clique &agrave; nouveau pour confirmer
            </p>
          )}
        </div>
      </div>

      {/* Overlays */}
      {showJokerPanel && (
        <JokerDeclarePanel onDeclare={handleJokerDeclare} />
      )}

      {roundScoring && phase === GamePhase.ROUND_SCORING && (
        <RoundSummary scoring={roundScoring} myPlayerId={playerId} />
      )}

      {finalStandings && eliminatedId && (
        <GameOverOverlay
          standings={finalStandings}
          eliminatedId={eliminatedId}
          myPlayerId={playerId}
          onPlayAgain={() => {
            // Re-start would need server support
            window.location.href = '/';
          }}
          onLeave={() => {
            window.location.href = '/';
          }}
        />
      )}
    </div>
  );
}
