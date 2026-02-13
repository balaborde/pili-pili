'use client';

import { useEffect } from 'react';
import { useSocket } from './useSocket';
import { useGameStore } from '@/stores/gameStore';
import { useRoomStore } from '@/stores/roomStore';
import { usePlayerStore } from '@/stores/playerStore';

/**
 * Hook that wires all Socket.io events to Zustand stores.
 * Should be mounted once at the game layout level.
 */
export function useGameSocket(): void {
  const socket = useSocket();
  const gameStore = useGameStore;
  const roomStore = useRoomStore;
  const playerStore = usePlayerStore;

  useEffect(() => {
    // Room events
    socket.on('room:playerJoined', ({ player }) => {
      roomStore.getState().addPlayer(player);
    });

    socket.on('room:playerLeft', ({ playerId }) => {
      roomStore.getState().removePlayer(playerId);
    });

    socket.on('room:botAdded', ({ bot }) => {
      roomStore.getState().addPlayer(bot);
    });

    socket.on('room:botRemoved', ({ botId }) => {
      roomStore.getState().removePlayer(botId);
    });

    socket.on('room:readyChanged', ({ playerId, ready }) => {
      roomStore.getState().setPlayerReady(playerId, ready);
    });

    socket.on('room:settingsUpdated', (settings) => {
      roomStore.getState().updateSettings(settings);
    });

    socket.on('room:error', ({ message }) => {
      gameStore.getState().setError(message);
      setTimeout(() => gameStore.getState().setError(null), 5000);
    });

    // Game events
    socket.on('game:started', ({ state }) => {
      gameStore.getState().syncState(state);
    });

    socket.on('game:phaseChanged', ({ phase }) => {
      gameStore.getState().setPhase(phase);
    });

    socket.on('game:missionRevealed', ({ mission }) => {
      gameStore.getState().setMission(mission);
    });

    socket.on('game:cardsDealt', ({ hand, totalCards }) => {
      gameStore.getState().setHand(hand);
    });

    socket.on('game:betPlaced', ({ playerId, bet }) => {
      gameStore.getState().setBetPlaced(playerId, bet);
    });

    socket.on('game:allBetsRevealed', ({ bets }) => {
      for (const { playerId, bet } of bets) {
        gameStore.getState().setBetPlaced(playerId, bet);
      }
    });

    socket.on('game:turnChanged', ({ currentPlayerIndex }) => {
      gameStore.getState().setTurnChanged(currentPlayerIndex);
    });

    socket.on('game:cardPlayed', ({ playerId, play }) => {
      gameStore.getState().addCardPlayed(playerId, play);
    });

    socket.on('game:trickWon', ({ winnerId, trick }) => {
      gameStore.getState().setTrickWon(winnerId, trick);
    });

    socket.on('game:handUpdate', ({ hand }) => {
      gameStore.getState().setHand(hand);
    });

    socket.on('game:roundScoring', (data) => {
      gameStore.getState().setRoundScoring(data);
    });

    socket.on('game:roundEnd', ({ scores }) => {
      gameStore.getState().setRoundEnd(scores);
    });

    socket.on('game:over', ({ finalStandings, eliminatedId }) => {
      gameStore.getState().setGameOver(finalStandings, eliminatedId);
    });

    socket.on('game:stateSync', ({ state }) => {
      gameStore.getState().syncState(state);
    });

    socket.on('game:peekStart', ({ durationMs }) => {
      gameStore.getState().setPeeking(true, durationMs);
    });

    socket.on('game:peekEnd', () => {
      gameStore.getState().setPeeking(false);
    });

    socket.on('game:opponentHandsRevealed', ({ hands }) => {
      gameStore.getState().setVisibleOpponentHands(hands);
    });

    // Designate player mission
    socket.on('game:designateRequired', () => {
      gameStore.getState().setDesignateRequired(true);
    });

    // Card exchange mission
    socket.on('game:exchangeRequired', ({ withPlayerId }) => {
      gameStore.getState().setExchangeRequired({ winnerId: withPlayerId });
    });

    socket.on('game:exchangeTargeted', ({ winnerId }) => {
      gameStore.getState().setExchangeAsTarget({ winnerId });
    });

    socket.on('game:betError', ({ message }) => {
      gameStore.getState().setError(message);
      setTimeout(() => gameStore.getState().setError(null), 5000);
    });

    socket.on('game:playError', ({ message }) => {
      gameStore.getState().setError(message);
      setTimeout(() => gameStore.getState().setError(null), 5000);
    });

    // Player status
    socket.on('player:disconnected', ({ playerId }) => {
      gameStore.getState().updatePlayerConnection(playerId, false);
    });

    socket.on('player:reconnected', ({ playerId }) => {
      gameStore.getState().updatePlayerConnection(playerId, true);
    });

    return () => {
      socket.off('room:playerJoined');
      socket.off('room:playerLeft');
      socket.off('room:botAdded');
      socket.off('room:botRemoved');
      socket.off('room:readyChanged');
      socket.off('room:settingsUpdated');
      socket.off('room:error');
      socket.off('game:started');
      socket.off('game:phaseChanged');
      socket.off('game:missionRevealed');
      socket.off('game:cardsDealt');
      socket.off('game:betPlaced');
      socket.off('game:allBetsRevealed');
      socket.off('game:turnChanged');
      socket.off('game:cardPlayed');
      socket.off('game:trickWon');
      socket.off('game:handUpdate');
      socket.off('game:roundScoring');
      socket.off('game:roundEnd');
      socket.off('game:over');
      socket.off('game:stateSync');
      socket.off('game:peekStart');
      socket.off('game:peekEnd');
      socket.off('game:opponentHandsRevealed');
      socket.off('game:designateRequired');
      socket.off('game:exchangeRequired');
      socket.off('game:exchangeTargeted');
      socket.off('game:betError');
      socket.off('game:playError');
      socket.off('player:disconnected');
      socket.off('player:reconnected');
    };
  }, [socket]);
}
