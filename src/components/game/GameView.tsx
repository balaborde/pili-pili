'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Target, Flag, Trophy } from 'lucide-react';
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
import TurnTimer from './TurnTimer';
import CardComponent from './CardComponent';
import { useI18n } from '@/i18n';

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
  const settings = useRoomStore((s) => s.room?.settings);
  const setGameStarted = useRoomStore((s) => s.setGameStarted);

  const { t } = useI18n();
  const [showMissionReveal, setShowMissionReveal] = useState(false);
  const [bettingReady, setBettingReady] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const prevRoundRef = useRef(0);
  const missionRevealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bettingReadyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissMissionReveal = useCallback(() => {
    if (missionRevealTimerRef.current) clearTimeout(missionRevealTimerRef.current);
    setShowMissionReveal(false);
    if (bettingReadyTimerRef.current) clearTimeout(bettingReadyTimerRef.current);
    bettingReadyTimerRef.current = setTimeout(() => setBettingReady(true), 600);
  }, []);

  // Show mission reveal on new round
  useEffect(() => {
    if (gameState?.phase === 'ROUND_START' && gameState.roundNumber !== prevRoundRef.current) {
      prevRoundRef.current = gameState.roundNumber;
      if (missionRevealTimerRef.current) clearTimeout(missionRevealTimerRef.current);
      if (bettingReadyTimerRef.current) clearTimeout(bettingReadyTimerRef.current);
      setBettingReady(false);
      setShowMissionReveal(true);
      missionRevealTimerRef.current = setTimeout(dismissMissionReveal, 7000);
    }
  }, [gameState?.phase, gameState?.roundNumber, dismissMissionReveal]);

  useEffect(() => () => {
    if (missionRevealTimerRef.current) clearTimeout(missionRevealTimerRef.current);
    if (bettingReadyTimerRef.current) clearTimeout(bettingReadyTimerRef.current);
  }, []);

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
    // Server resets room state (gameStarted=false, isReady=false) and
    // broadcasts room:returnedToLobby to all clients in the room.
    socket.emit('game:returnToLobby');
  }, [socket]);

  const handleLeaveGame = useCallback(() => {
    socket.emit('game:leave');
    clearGameState();
    setGameStarted(false);
    router.push('/');
  }, [socket, clearGameState, setGameStarted, router]);

  if (!gameState || !playerId) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <p className="text-text-muted font-medium">{t.game.loading}</p>
      </main>
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
    turnDeadline,
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
  if (phase === 'DEALING') statusMessage = t.game.dealing;
  else if (phase === 'PRE_BETTING') statusMessage = t.game.preBetting;
  else if (phase === 'BETTING') {
    if (isMyTurnToBet) statusMessage = t.game.myBettingTurn;
    else {
      const bettor = players.find(p => p.id === currentBettorId);
      statusMessage = t.game.otherBetting(bettor?.name ?? '...');
    }
  } else if (phase === 'POST_BETTING') {
    if (missionAction) statusMessage = t.game.missionActionRequired;
    else statusMessage = t.game.exchangeInProgress;
  } else if (phase === 'TRICK_PLAY') {
    if (isSimultaneous) {
      statusMessage = simultaneousPlayed.includes(playerId)
        ? t.game.waitingOthers
        : t.game.playACard;
    } else if (isMyTurnToPlay) {
      statusMessage = t.game.myPlayTurn;
    } else {
      const turner = players.find(p => p.id === currentTurnPlayerId);
      statusMessage = t.game.otherPlaying(turner?.name ?? '...');
    }
  } else if (phase === 'TRICK_RESOLVE') statusMessage = t.game.resolvingTrick;

  // Visible hands (from other players via mission)
  const otherVisibleHands = Object.entries(visibleHands).filter(([pid]) => pid !== playerId);

  return (
    <main className="min-h-dvh relative overflow-hidden flex flex-col">
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
        aria-label={t.game.leaveAriaLabel}
        className="fixed top-3 right-3 z-40 w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          background: 'rgba(61,31,31,0.9)',
          border: '1px solid rgba(92,51,51,0.5)',
        }}
        onClick={() => setShowLeaveConfirm(true)}
      >
        <LogOut size={18} style={{ color: 'var(--accent-red)' }} />
      </button>

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
              <h3 className="text-lg font-black text-accent-red mb-2">{t.game.leaveTitle}</h3>
              <p className="text-xs text-text-muted mb-6">
                {t.game.leaveBody}
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
                  {t.game.leaveCancel}
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
                  {t.game.leaveConfirm}
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
            className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(61,31,31,0.8)',
              border: '1px solid rgba(92,51,51,0.5)',
              color: 'var(--text-secondary)',
            }}
          >
            {t.game.round(roundNumber)}
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
                  <span className="text-xs font-bold text-text-muted">
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

        {/* Status message + turn timer */}
        {statusMessage && phase !== 'ROUND_START' && phase !== 'ROUND_END' && phase !== 'GAME_OVER' && (
          <div className="flex items-center gap-2">
            {turnDeadline && (phase === 'BETTING' || phase === 'TRICK_PLAY')
              && !(isSimultaneous && simultaneousPlayed.includes(playerId)) && (
              <TurnTimer
                deadline={turnDeadline}
                duration={settings?.turnTimerSeconds ?? 30}
                isMyTurn={isMyTurnToPlay || isMyTurnToBet}
              />
            )}
            <div
              className="text-xs font-bold px-4 py-1.5 rounded-full text-center"
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
          </div>
        )}
      </div>

      {/* Bottom section: betting / hand / mission action */}
      <div className="px-3 pb-4 pt-1">
        {/* Bet tracker */}
        {me && phase !== 'ROUND_START' && phase !== 'GAME_OVER' && (
          <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
            {/* Pili count — always visible */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(61,31,31,0.8)',
                border: '1px solid rgba(92,51,51,0.5)',
              }}
            >
              <span className="text-pili" aria-hidden="true">🌶️</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {t.game.pilis(me.pilis)}
              </span>
            </div>

            {/* Bet + tricks tracker — visible once bet is placed */}
            <AnimatePresence>
              {showBetTracker && (
                <motion.div
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    background: 'rgba(61,31,31,0.8)',
                    border: '1px solid rgba(92,51,51,0.5)',
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <span style={{ color: 'var(--accent-gold)' }} className="flex items-center gap-1">
                    <Flag size={12} /> {t.game.bet} : {me.bet}
                  </span>
                  <span
                    className="w-px h-3"
                    style={{ background: 'rgba(92,51,51,0.6)' }}
                  />
                  <span
                    className="flex items-center gap-1"
                    style={{
                      color: me.tricksWon === me.bet
                        ? '#588157'
                        : me.tricksWon > me.bet!
                          ? 'var(--accent-red)'
                          : 'var(--text-secondary)',
                    }}
                  >
                    <Trophy size={12} /> {t.game.tricks} : {me.tricksWon}/{totalTricks}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* My victim designation badge */}
            {me.designatedVictimId && (() => {
              const victim = players.find(p => p.id === me.designatedVictimId);
              return victim ? (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    background: 'rgba(193,18,31,0.15)',
                    border: '1px solid rgba(193,18,31,0.4)',
                  }}
                >
                  <span className="flex items-center gap-0.5">
                    →<Target size={12} />
                  </span>
                  <span style={{ color: 'var(--accent-red)' }}>{victim.name}</span>
                </div>
              ) : null;
            })()}
          </div>
        )}

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
          {phase === 'BETTING' && bettingReady && (
            <BettingPanel
              key="betting"
              totalTricks={totalTricks}
              forbiddenBetValues={forbiddenBetValues}
              bettingConstraint={bettingConstraint}
              isMyTurn={isMyTurnToBet}
              onPlaceBet={handlePlaceBet}
            />
          )}

          {/* Player hand (visible during betting and trick play, hidden when any mission action is required) */}
          {phase !== 'ROUND_START' && phase !== 'GAME_OVER' && myHand.length > 0 && !missionAction && !showMissionReveal && (
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
        {showMissionReveal && (
          <MissionReveal
            mission={mission}
            roundNumber={roundNumber}
            onDismiss={dismissMissionReveal}
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
    </main>
  );
}
