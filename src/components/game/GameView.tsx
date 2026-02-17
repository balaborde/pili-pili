'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
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
  const router = useRouter();

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
  const [showLeaveMenu, setShowLeaveMenu] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
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

  // Close menu when clicking outside
  useEffect(() => {
    if (!showLeaveMenu) return;
    const handleClick = () => setShowLeaveMenu(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showLeaveMenu]);

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

  const handleLeaveGame = useCallback(() => {
    socket.emit('game:leave');
    clearGameState();
    setGameStarted(false);
    router.push('/');
  }, [socket, clearGameState, setGameStarted, router]);

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

  const me = players.find(p => p.id === playerId);
  const isMyTurnToPlay = isSimultaneous
    ? !simultaneousPlayed.includes(playerId) && phase === 'TRICK_PLAY'
    : currentTurnPlayerId === playerId && phase === 'TRICK_PLAY';
  const isMyTurnToBet = currentBettorId === playerId && phase === 'BETTING';
  const canPlayCards = isMyTurnToPlay && myHand.length > 0;
  const showBets = phase !== 'ROUND_START' && phase !== 'DEALING';
  const showBetTracker = me?.bet !== null && me?.bet !== undefined
    && ['POST_BETTING', 'TRICK_PLAY', 'TRICK_RESOLVE'].includes(phase);

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

      {/* Leave game menu button */}
      <button
        className="fixed top-3 right-3 z-40 w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          background: 'rgba(61,31,31,0.9)',
          border: '1px solid rgba(92,51,51,0.5)',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowLeaveMenu(!showLeaveMenu);
        }}
      >
        <span className="text-lg text-text-muted">⋮</span>
      </button>

      {/* Leave menu dropdown */}
      <AnimatePresence>
        {showLeaveMenu && (
          <motion.div
            className="fixed top-16 right-3 z-40 rounded-xl overflow-hidden"
            style={{
              background: 'rgba(45,21,21,0.98)',
              border: '1px solid rgba(92,51,51,0.5)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full px-4 py-3 text-sm font-bold text-left hover:bg-white/5 transition-colors"
              style={{ color: 'var(--accent-red)' }}
              onClick={() => {
                setShowLeaveMenu(false);
                setShowLeaveConfirm(true);
              }}
            >
              🚪 Quitter la partie
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave confirmation modal */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(10,5,5,0.9)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLeaveConfirm(false)}
          >
            <motion.div
              className="rounded-2xl p-6 text-center max-w-xs w-full"
              style={{
                background: 'linear-gradient(145deg, rgba(61,31,31,0.98), rgba(45,21,21,0.98))',
                border: '1px solid rgba(230,57,70,0.3)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-black text-accent-red mb-2">Quitter la partie ?</h3>
              <p className="text-xs text-text-muted mb-6">
                Vous serez remplacé par un bot. La partie continuera sans vous.
              </p>

              <div className="flex gap-3">
                <motion.button
                  className="flex-1 rounded-xl py-3 text-sm font-bold"
                  style={{
                    background: 'rgba(92,51,51,0.3)',
                    border: '1px solid rgba(92,51,51,0.5)',
                    color: 'var(--text-muted)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLeaveConfirm(false)}
                >
                  Annuler
                </motion.button>
                <motion.button
                  className="flex-1 rounded-xl py-3 text-sm font-bold"
                  style={{
                    background: 'rgba(230,57,70,0.2)',
                    border: '1px solid rgba(230,57,70,0.5)',
                    color: 'var(--accent-red)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowLeaveConfirm(false);
                    handleLeaveGame();
                  }}
                >
                  Quitter
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        {/* Bet tracker */}
        <AnimatePresence>
          {showBetTracker && me && (
            <motion.div
              className="flex items-center justify-center gap-3 mb-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <div
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold"
                style={{
                  background: 'rgba(61,31,31,0.8)',
                  border: '1px solid rgba(92,51,51,0.5)',
                }}
              >
                <span style={{ color: 'var(--accent-gold)' }}>
                  🎯 Pari : {me.bet}
                </span>
                <span
                  className="w-px h-3"
                  style={{ background: 'rgba(92,51,51,0.6)' }}
                />
                <span style={{
                  color: me.tricksWon === me.bet
                    ? '#588157'
                    : me.tricksWon > me.bet!
                      ? 'var(--accent-red)'
                      : 'var(--text-secondary)',
                }}>
                  ✓ Plis : {me.tricksWon}/{totalTricks}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* Mission action (card pass, victim, joker) */}
          {missionAction && (phase === 'POST_BETTING' || (phase === 'TRICK_PLAY' && missionAction.type === 'CHOOSE_JOKER_VALUE')) && (
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

          {/* Player hand (visible during betting and trick play) */}
          {phase !== 'ROUND_START' && phase !== 'GAME_OVER' && myHand.length > 0 && !(missionAction?.type === 'CHOOSE_JOKER_VALUE') && (
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
