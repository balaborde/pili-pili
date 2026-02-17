'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useRoomStore } from '@/stores/roomStore';
import PlayersRing from './PlayersRing';
import PlayArea from './PlayArea';
import PlayerHand from './PlayerHand';
import BettingPanel from './BettingPanel';
import MissionReveal from './MissionReveal';
import MissionAction from './MissionAction';
import MissionInfoSheet from './MissionInfoSheet';
import TrickResult from './TrickResult';
import RoundResults from './RoundResults';
import GameOverModal from './GameOverModal';
import NotificationToast from './NotificationToast';
import CardComponent from './CardComponent';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
}

export default function GameView() {
  const socket = useSocket();

  const { playerId } = usePlayerStore();
  const gameState = useGameStore((s) => s.gameState);
  const selectedCardId = useGameStore((s) => s.selectedCardId);
  const selectCard = useGameStore((s) => s.selectCard);
  const showRoundResults = useGameStore((s) => s.showRoundResults);
  const setShowRoundResults = useGameStore((s) => s.setShowRoundResults);
  const showGameOver = useGameStore((s) => s.showGameOver);
  const lastTrickResult = useGameStore((s) => s.lastTrickResult);
  const showMissionInfo = useGameStore((s) => s.showMissionInfo);
  const setShowMissionInfo = useGameStore((s) => s.setShowMissionInfo);
  const clearGameState = useGameStore((s) => s.clearGameState);
  const setGameStarted = useRoomStore((s) => s.setGameStarted);

  const [showMissionReveal, setShowMissionReveal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const prevRoundRef = useRef(0);

  // Show mission reveal on new round
  useEffect(() => {
    if (gameState?.phase === 'ROUND_START' && gameState.roundNumber !== prevRoundRef.current) {
      prevRoundRef.current = gameState.roundNumber;
      setShowMissionReveal(true);
      const timer = setTimeout(() => setShowMissionReveal(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.phase, gameState?.roundNumber]);

  // Listen for game notifications
  useEffect(() => {
    const handler = ({ message, type }: { message: string; type: 'info' | 'warning' | 'success' }) => {
      const id = `${Date.now()}-${Math.random()}`;
      setNotifications((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3000);
    };
    socket.on('game:notification', handler);
    return () => { socket.off('game:notification', handler); };
  }, [socket]);

  // Listen for game errors
  useEffect(() => {
    const handler = ({ message }: { message: string }) => {
      const id = `${Date.now()}-${Math.random()}`;
      setNotifications((prev) => [...prev, { id, message, type: 'warning' }]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3000);
    };
    socket.on('game:error', handler);
    return () => { socket.off('game:error', handler); };
  }, [socket]);

  const handlePlayCard = useCallback((cardId: number) => {
    socket.emit('game:playCard', { cardId });
    selectCard(null);
  }, [socket, selectCard]);

  const handlePlaceBet = useCallback((bet: number) => {
    socket.emit('game:placeBet', { bet });
  }, [socket]);

  const handleMissionCardSubmit = useCallback((cardIds: number[]) => {
    socket.emit('game:missionAction', { action: { type: 'CARDS_TO_PASS', cardIds } });
  }, [socket]);

  const handleDesignateVictim = useCallback((victimId: string) => {
    socket.emit('game:missionAction', { action: { type: 'DESIGNATE_VICTIM', victimId } });
  }, [socket]);

  const handleChooseJokerValue = useCallback((value: 0 | 56) => {
    socket.emit('game:chooseJokerValue', { value });
  }, [socket]);

  const handleAcknowledge = useCallback(() => {
    socket.emit('game:acknowledgePhase');
    setShowRoundResults(false);
  }, [socket, setShowRoundResults]);

  const handleBackToLobby = useCallback(() => {
    clearGameState();
    setGameStarted(false);
  }, [clearGameState, setGameStarted]);

  if (!gameState || !playerId) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-text-muted font-medium">Chargement de la partie...</p>
      </div>
    );
  }

  const {
    phase,
    mission,
    roundNumber,
    trickNumber,
    totalTricks,
    players,
    myHand,
    visibleHands,
    currentTrick,
    bettingOrder,
    currentBettorId,
    bettingConstraint,
    forbiddenBetValues,
    currentTurnPlayerId,
    isSimultaneous,
    simultaneousPlayed,
    missionAction,
    roundResults,
    finalStandings,
    winnerId,
  } = gameState;

  const isMyTurnToPlay = isSimultaneous
    ? !simultaneousPlayed.includes(playerId) && phase === 'TRICK_PLAY'
    : currentTurnPlayerId === playerId && phase === 'TRICK_PLAY';
  const isMyTurnToBet = currentBettorId === playerId && phase === 'BETTING';
  const canPlayCards = isMyTurnToPlay && myHand.length > 0;
  const showBets = phase !== 'ROUND_START' && phase !== 'DEALING';

  // Phase status message
  let statusMessage = '';
  if (phase === 'DEALING') statusMessage = 'Distribution des cartes...';
  else if (phase === 'PRE_BETTING') statusMessage = 'Préparation...';
  else if (phase === 'BETTING') {
    if (isMyTurnToBet) statusMessage = 'C\'est votre tour de parier !';
    else {
      const bettor = players.find(p => p.id === currentBettorId);
      statusMessage = `${bettor?.name ?? '...'} est en train de parier...`;
    }
  } else if (phase === 'POST_BETTING') {
    if (missionAction) statusMessage = 'Action de mission requise !';
    else statusMessage = 'Échanges en cours...';
  } else if (phase === 'TRICK_PLAY') {
    if (isSimultaneous) {
      statusMessage = simultaneousPlayed.includes(playerId)
        ? 'En attente des autres joueurs...'
        : 'Jouez une carte !';
    } else if (isMyTurnToPlay) {
      statusMessage = 'C\'est votre tour !';
    } else {
      const turner = players.find(p => p.id === currentTurnPlayerId);
      statusMessage = `${turner?.name ?? '...'} joue...`;
    }
  } else if (phase === 'TRICK_RESOLVE') statusMessage = 'Résolution du pli...';

  // Visible hands (from other players via mission)
  const otherVisibleHands = Object.entries(visibleHands).filter(([pid]) => pid !== playerId);

  return (
    <div className="min-h-dvh relative overflow-hidden flex flex-col">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 30%, rgba(230,57,70,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 70% 60%, rgba(244,132,95,0.04) 0%, transparent 60%),
            var(--bg-primary)
          `,
        }}
      />
      <div
        className="fixed inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(45deg, var(--accent-gold) 25%, transparent 25%),
            linear-gradient(-45deg, var(--accent-gold) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, var(--accent-gold) 75%),
            linear-gradient(-45deg, transparent 75%, var(--accent-gold) 75%)
          `,
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 0 15px, 15px -15px, -15px 0px',
        }}
      />

      {/* Notifications */}
      <NotificationToast notifications={notifications} />

      {/* Top section: mission info + round */}
      <div className="px-3 pt-3 pb-1 flex flex-col items-center gap-2">
        {/* Round badge */}
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(61,31,31,0.8)',
              border: '1px solid rgba(92,51,51,0.5)',
              color: 'var(--text-muted)',
            }}
          >
            Manche {roundNumber}
          </span>
        </div>

        {/* Mission info bar */}
        <MissionInfoSheet
          mission={mission}
          isOpen={showMissionInfo}
          onToggle={() => setShowMissionInfo(!showMissionInfo)}
        />
      </div>

      {/* Middle section: players + play area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-3 py-2 min-h-0">
        {/* Other players */}
        <PlayersRing
          players={players}
          myPlayerId={playerId}
          showBets={showBets}
        />

        {/* Visible hands from missions */}
        {otherVisibleHands.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 px-2">
            {otherVisibleHands.map(([pid, cards]) => {
              const player = players.find(p => p.id === pid);
              return (
                <div key={pid} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold text-text-muted">
                    {player?.name ?? 'Joueur'}
                  </span>
                  <div className="flex gap-1">
                    {cards.map((card) => (
                      <CardComponent key={card.id} card={card} size="sm" />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Play area */}
        <PlayArea
          currentTrick={currentTrick}
          mission={mission}
          trickNumber={trickNumber}
          totalTricks={totalTricks}
          players={players}
          isSimultaneous={isSimultaneous}
        />

        {/* Status message */}
        {statusMessage && phase !== 'ROUND_START' && phase !== 'ROUND_END' && phase !== 'GAME_OVER' && (
          <div
            className="text-[11px] font-bold px-4 py-1.5 rounded-full text-center"
            style={{
              background: (isMyTurnToPlay || isMyTurnToBet)
                ? 'rgba(244,162,97,0.15)'
                : 'rgba(61,31,31,0.6)',
              border: (isMyTurnToPlay || isMyTurnToBet)
                ? '1px solid rgba(244,162,97,0.3)'
                : '1px solid rgba(92,51,51,0.3)',
              color: (isMyTurnToPlay || isMyTurnToBet)
                ? 'var(--accent-gold)'
                : 'var(--text-muted)',
            }}
          >
            {statusMessage}
          </div>
        )}
      </div>

      {/* Bottom section: betting / hand / mission action */}
      <div className="px-3 pb-4 pt-1">
        <AnimatePresence mode="wait">
          {/* Mission action (card pass, victim, joker) */}
          {missionAction && phase === 'POST_BETTING' && (
            <MissionAction
              key="mission-action"
              action={missionAction}
              myHand={myHand}
              players={players}
              myPlayerId={playerId}
              onSubmitCards={handleMissionCardSubmit}
              onDesignateVictim={handleDesignateVictim}
              onChooseJokerValue={handleChooseJokerValue}
            />
          )}

          {/* Betting panel */}
          {phase === 'BETTING' && (
            <BettingPanel
              key="betting"
              totalTricks={totalTricks}
              forbiddenBetValues={forbiddenBetValues}
              bettingConstraint={bettingConstraint}
              isMyTurn={isMyTurnToBet}
              onPlaceBet={handlePlaceBet}
            />
          )}

          {/* Player hand (during trick play and other phases where hand is visible) */}
          {phase !== 'BETTING' && phase !== 'ROUND_START' && phase !== 'GAME_OVER' && myHand.length > 0 && (
            <PlayerHand
              key="hand"
              cards={myHand}
              canPlay={canPlayCards}
              selectedCardId={selectedCardId}
              onSelectCard={selectCard}
              onPlayCard={handlePlayCard}
              disabled={!canPlayCards}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Overlays ── */}

      {/* Mission reveal */}
      <AnimatePresence>
        {showMissionReveal && phase === 'ROUND_START' && (
          <MissionReveal
            mission={mission}
            roundNumber={roundNumber}
            onDismiss={() => setShowMissionReveal(false)}
          />
        )}
      </AnimatePresence>

      {/* Trick result */}
      <AnimatePresence>
        {lastTrickResult && (
          <TrickResult
            winnerId={lastTrickResult.winnerId}
            winnerName={lastTrickResult.winnerName}
            trick={lastTrickResult.trick}
          />
        )}
      </AnimatePresence>

      {/* Round results */}
      <AnimatePresence>
        {showRoundResults && roundResults && (
          <RoundResults
            results={roundResults}
            roundNumber={roundNumber}
            onContinue={handleAcknowledge}
          />
        )}
      </AnimatePresence>

      {/* Game over */}
      <AnimatePresence>
        {showGameOver && finalStandings && winnerId && (
          <GameOverModal
            standings={finalStandings}
            winnerId={winnerId}
            onBackToLobby={handleBackToLobby}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
