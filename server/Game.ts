import type {
  Card,
  GamePhase,
  TrickCard,
  PlayerRoundResult,
  ClientGameState,
  MissionActionRequest,
  MissionActionPayload,
} from '../src/types/game.types';
import type { RoomPlayer } from './Room';
import type { RoomSettings } from '../src/types/game.types';
import { Deck } from './Deck';
import { getMission, getAllMissionIds, type Mission, type MissionContext } from './missions';
import {
  PHASE_TRANSITION_DELAY_MS,
  TRICK_RESOLVE_DELAY_MS,
  ROUND_END_TIMEOUT_MS,
  BOT_THINK_MIN_MS,
  BOT_THINK_MAX_MS,
  JOKER_HIGH_VALUE,
  JOKER_LOW_VALUE,
} from '../src/lib/constants';

// ============================================================
// Internal Types
// ============================================================

interface GamePlayer {
  id: string;
  name: string;
  isBot: boolean;
  botDifficulty?: 'easy' | 'medium' | 'hard';
  seatIndex: number;
  isConnected: boolean;
  isEliminated: boolean;

  hand: Card[];
  bet: number | null;
  tricksWon: number;
  pilis: number;

  designatedVictimId?: string;
  missionPilisThisRound: number;
  missionActionDone: boolean;
  hasAcknowledged: boolean;
}

export interface GameCallbacks {
  emitToPlayer(playerId: string, event: string, data: unknown): void;
  emitToAll(event: string, data: unknown): void;
}

// ============================================================
// Game Engine
// ============================================================

export class Game {
  private players: GamePlayer[];
  private settings: RoomSettings;
  private callbacks: GameCallbacks;

  private phase: GamePhase = 'ROUND_START';
  private roundNumber = 0;
  private trickNumber = 0;
  private cardsPerPlayer = 0;

  private deck!: Deck;
  private currentMission!: Mission;
  private missionQueue: number[] = [];

  // Betting
  private bettingOrder: string[] = [];
  private currentBettorIndex = 0;

  // Trick play
  private turnOrder: string[] = [];
  private currentTurnIndex = 0;
  private currentTrick: TrickCard[] = [];
  private leadPlayerIndex = 0;
  private isSimultaneous = false;
  private simultaneousPlayed = new Map<string, Card>();

  // Forehead / visibility state
  private foreheadActive = false;
  private allHandsVisible = false;
  private dealtAfterBetting = false;

  // Buffered card passes — applied all at once when all players have acted
  private pendingCardPasses = new Map<string, { recipientId: string; cards: Card[] }>();

  // Phase acknowledgment
  private acknowledgedPlayers = new Set<string>();

  // Timers
  private botTimers: ReturnType<typeof setTimeout>[] = [];
  private phaseTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  private lastRoundResults: PlayerRoundResult[] | null = null;

  constructor(roomPlayers: RoomPlayer[], settings: RoomSettings, callbacks: GameCallbacks) {
    this.settings = settings;
    this.callbacks = callbacks;

    this.players = roomPlayers.map(p => ({
      id: p.id,
      name: p.name,
      isBot: p.isBot,
      botDifficulty: p.botDifficulty,
      seatIndex: p.seatIndex,
      isConnected: p.isConnected,
      isEliminated: false,
      hand: [],
      bet: null,
      tricksWon: 0,
      pilis: 0,
      missionPilisThisRound: 0,
      missionActionDone: false,
      hasAcknowledged: false,
    }));

    // Build mission queue
    const missionIds = getAllMissionIds(settings.includeExpertMissions);
    this.missionQueue = this.shuffleArray([...missionIds]);
  }

  // ============================================================
  // Public API
  // ============================================================

  start(): void {
    this.startRound();
  }

  placeBet(playerId: string, bet: number): { ok: boolean; error?: string } {
    if (this.phase !== 'BETTING') return { ok: false, error: 'Ce n\'est pas la phase de paris' };

    const currentBettorId = this.bettingOrder[this.currentBettorIndex];
    if (playerId !== currentBettorId) return { ok: false, error: 'Ce n\'est pas votre tour de parier' };

    const player = this.getPlayer(playerId);
    if (!player) return { ok: false, error: 'Joueur introuvable' };

    // Validate bet range
    if (bet < 0 || bet > this.cardsPerPlayer) return { ok: false, error: 'Pari invalide' };

    // Check mission constraints
    const constraints = this.currentMission.getBettingConstraints?.(this.buildMissionContext());
    if (constraints?.forbiddenValues?.includes(bet)) {
      return { ok: false, error: `Le pari ${bet} est interdit par la mission` };
    }
    if (constraints?.differentFromPrevious) {
      const prevId = this.bettingOrder[this.currentBettorIndex - 1];
      const prev = prevId ? this.getPlayer(prevId) : null;
      if (prev?.bet !== null && prev?.bet === bet) {
        return { ok: false, error: 'Vous ne pouvez pas parier pareil que le joueur précédent' };
      }
    }

    // Check last bettor constraint (sum != totalTricks)
    const isLastBettor = this.currentBettorIndex === this.bettingOrder.length - 1;
    if (isLastBettor) {
      const sumSoFar = this.getActivePlayers()
        .filter(p => p.bet !== null)
        .reduce((s, p) => s + p.bet!, 0);
      if (sumSoFar + bet === this.cardsPerPlayer) {
        return { ok: false, error: `La somme des paris ne peut pas égaler ${this.cardsPerPlayer}` };
      }
    }

    player.bet = bet;
    this.broadcastState();
    this.advanceBetting();
    return { ok: true };
  }

  playCard(playerId: string, cardId: number): { ok: boolean; error?: string } {
    if (this.phase !== 'TRICK_PLAY') return { ok: false, error: 'Ce n\'est pas la phase de jeu' };

    const player = this.getPlayer(playerId);
    if (!player) return { ok: false, error: 'Joueur introuvable' };

    if (this.isSimultaneous) {
      if (this.simultaneousPlayed.has(playerId)) {
        return { ok: false, error: 'Vous avez déjà joué' };
      }
    } else {
      const currentTurnId = this.turnOrder[this.currentTurnIndex];
      if (playerId !== currentTurnId) return { ok: false, error: 'Ce n\'est pas votre tour' };
    }

    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return { ok: false, error: 'Carte introuvable dans votre main' };

    const card = player.hand[cardIndex];

    // Joker: needs value choice first (value < 0 means unset)
    if (card.isJoker && card.value < 0) {
      // Request joker value choice
      this.callbacks.emitToPlayer(playerId, 'game:stateUpdate', {
        gameState: {
          ...this.getClientState(playerId),
          missionAction: { type: 'CHOOSE_JOKER_VALUE' } as MissionActionRequest,
        },
      });
      return { ok: true };
    }

    // Mission validation
    if (this.currentMission.validatePlay) {
      const validation = this.currentMission.validatePlay(
        this.buildMissionContext(),
        playerId,
        card
      );
      if (!validation.valid) return { ok: false, error: validation.reason };
    }

    // Remove card from hand
    player.hand.splice(cardIndex, 1);

    if (this.isSimultaneous) {
      this.simultaneousPlayed.set(playerId, card);
      this.broadcastState();

      // Check if all active players have played
      const active = this.getActivePlayers();
      if (this.simultaneousPlayed.size === active.length) {
        // Build trick from simultaneous plays
        this.currentTrick = active.map(p => ({
          playerId: p.id,
          card: this.simultaneousPlayed.get(p.id)!,
        }));
        this.resolveTrick();
      }
    } else {
      this.currentTrick.push({ playerId, card });
      this.broadcastState();

      // Check if all active players have played
      if (this.currentTrick.length === this.getActivePlayers().length) {
        this.resolveTrick();
      } else {
        this.advanceTurn();
      }
    }

    return { ok: true };
  }

  chooseJokerValue(playerId: string, value: 0 | 56): { ok: boolean; error?: string } {
    const player = this.getPlayer(playerId);
    if (!player) return { ok: false, error: 'Joueur introuvable' };

    const joker = player.hand.find(c => c.isJoker);
    if (!joker) return { ok: false, error: 'Pas de joker en main' };

    joker.value = value;
    // Now play the joker
    return this.playCard(playerId, joker.id);
  }

  handleMissionAction(playerId: string, action: MissionActionPayload): { ok: boolean; error?: string } {
    const player = this.getPlayer(playerId);
    if (!player) return { ok: false, error: 'Joueur introuvable' };
    if (player.missionActionDone) return { ok: false, error: 'Action déjà effectuée' };

    if (action.type === 'CARDS_TO_PASS') {
      const cards = action.cardIds.map(id => player.hand.find(c => c.id === id)).filter(Boolean) as Card[];
      if (cards.length !== action.cardIds.length) {
        return { ok: false, error: 'Cartes invalides' };
      }

      // Determine recipient
      const active = this.getActivePlayers();
      const myIndex = active.findIndex(p => p.id === playerId);
      const missionAction = this.currentMission.getRequiredAction?.('postBetting', this.buildMissionContext(), playerId);
      const direction = missionAction?.type === 'CHOOSE_CARDS_TO_PASS' ? missionAction.direction : 'left';
      const recipientIndex = direction === 'left'
        ? (myIndex + 1) % active.length
        : (myIndex - 1 + active.length) % active.length;
      const recipient = active[recipientIndex];

      // Remove cards from sender immediately (they see their hand shrink)
      for (const card of cards) {
        const idx = player.hand.findIndex(c => c.id === card.id);
        if (idx !== -1) player.hand.splice(idx, 1);
      }
      // Buffer the pass — cards are given to the recipient only once everyone has acted,
      // so no player sees received cards before making their own choice.
      this.pendingCardPasses.set(playerId, { recipientId: recipient.id, cards });

      player.missionActionDone = true;
    } else if (action.type === 'DESIGNATE_VICTIM') {
      if (action.victimId === playerId) return { ok: false, error: 'Vous ne pouvez pas vous désigner vous-même' };
      const victim = this.getPlayer(action.victimId);
      if (!victim) return { ok: false, error: 'Victime introuvable' };

      player.designatedVictimId = action.victimId;
      player.missionActionDone = true;
    }

    // Check if all players completed their action
    const active = this.getActivePlayers();
    const allDone = active.every(p => p.missionActionDone || p.isBot);
    if (allDone) {
      this.finishPostBetting();
    } else {
      this.broadcastState();
    }

    return { ok: true };
  }

  acknowledgePhase(playerId: string): void {
    this.acknowledgedPlayers.add(playerId);

    const humans = this.getActivePlayers().filter(p => !p.isBot);
    if (humans.every(p => this.acknowledgedPlayers.has(p.id))) {
      if (this.phaseTimer) {
        clearTimeout(this.phaseTimer);
        this.phaseTimer = null;
      }
      this.advanceFromAcknowledgment();
    }
  }

  handleDisconnect(playerId: string): void {
    const player = this.getPlayer(playerId);
    if (!player) return;

    // Replace the disconnected player with a bot
    player.isConnected = false;
    player.isBot = true;
    player.botDifficulty = 'medium';
    player.name = `${player.name} (Bot)`;

    console.log(`[Game] Player ${playerId} disconnected, replaced with bot`);

    // If it's the bot's turn, trigger bot action
    this.checkAndTriggerBotAction(playerId);

    this.broadcastState();
  }

  handleReconnect(playerId: string): void {
    const player = this.getPlayer(playerId);
    if (player) {
      player.isConnected = true;
      this.callbacks.emitToPlayer(playerId, 'game:stateUpdate', {
        gameState: this.getClientState(playerId),
      });
    }
  }

  private checkAndTriggerBotAction(playerId: string): void {
    const player = this.getPlayer(playerId);
    if (!player || !player.isBot) return;

    // Check if it's this bot's turn and trigger appropriate action
    if (this.phase === 'BETTING') {
      const currentBettorId = this.bettingOrder[this.currentBettorIndex];
      if (currentBettorId === playerId) {
        this.scheduleBotAction(() => this.botPlaceBet(player));
      }
    } else if (this.phase === 'TRICK_PLAY') {
      if (this.isSimultaneous && !this.simultaneousPlayed.has(playerId)) {
        this.scheduleBotAction(() => this.botPlayCard(player));
      } else if (!this.isSimultaneous) {
        const currentTurnId = this.turnOrder[this.currentTurnIndex];
        if (currentTurnId === playerId) {
          this.scheduleBotAction(() => this.botPlayCard(player));
        }
      }
    } else if (this.phase === 'POST_BETTING') {
      if (!player.missionActionDone) {
        this.scheduleBotAction(() => this.handleBotMissionAction(player));
      }
    }
  }

  replacePlayerWithBot(playerId: string, botName: string, difficulty: 'easy' | 'medium' | 'hard'): { ok: boolean; botId?: string; error?: string } {
    const player = this.getPlayer(playerId);
    if (!player) return { ok: false, error: 'Joueur introuvable' };

    // Convert player to bot
    player.isBot = true;
    player.botDifficulty = difficulty;
    player.name = botName;

    // Broadcast updated state to all players
    this.broadcastState();

    // If it's the bot's turn and we're in an active phase, schedule bot action
    if (this.phase === 'BETTING' && this.bettingOrder[this.currentBettorIndex] === playerId) {
      this.scheduleBotAction(() => this.botPlaceBet(player));
    } else if (this.phase === 'TRICK_PLAY' && !this.isSimultaneous && this.turnOrder[this.currentTurnIndex] === playerId) {
      this.scheduleBotAction(() => this.botPlayCard(player));
    } else if (this.phase === 'TRICK_PLAY' && this.isSimultaneous && !this.simultaneousPlayed.has(playerId)) {
      this.scheduleBotAction(() => this.botPlayCard(player));
    } else if (this.phase === 'POST_BETTING' && !player.missionActionDone) {
      this.scheduleBotAction(() => this.handleBotMissionAction(player));
    }

    return { ok: true, botId: playerId };
  }

  destroy(): void {
    this.destroyed = true;
    this.clearAllTimers();
  }

  // ============================================================
  // State Machine
  // ============================================================

  private startRound(): void {
    if (this.destroyed) return;

    this.roundNumber++;
    this.trickNumber = 0;

    // Reset player state for new round
    for (const p of this.players) {
      p.hand = [];
      p.bet = null;
      p.tricksWon = 0;
      p.missionPilisThisRound = 0;
      p.missionActionDone = false;
      p.hasAcknowledged = false;
      p.designatedVictimId = undefined;
    }
    this.currentTrick = [];
    this.foreheadActive = false;
    this.allHandsVisible = false;
    this.dealtAfterBetting = false;
    this.isSimultaneous = false;
    this.simultaneousPlayed.clear();
    this.acknowledgedPlayers.clear();
    this.pendingCardPasses.clear();
    this.lastRoundResults = null;

    // Pick next mission
    if (this.missionQueue.length === 0) {
      this.missionQueue = this.shuffleArray(getAllMissionIds(this.settings.includeExpertMissions));
    }
    const missionId = this.missionQueue.pop()!;
    this.currentMission = getMission(missionId);

    const activePlayers = this.getActivePlayers();
    this.cardsPerPlayer = this.currentMission.getCardsPerPlayer(activePlayers.length);

    if (this.currentMission.isSimultaneous) {
      this.isSimultaneous = true;
    }

    this.phase = 'ROUND_START';
    this.broadcastState();

    // After delay, move to dealing (or pre-betting for blind missions)
    this.schedulePhaseTransition(() => {
      const preBet = this.currentMission.preBetting?.(this.buildMissionContext());
      if (preBet?.dealAfterBetting) {
        // Blind betting: go to betting without dealing
        this.dealtAfterBetting = true;
        this.startBetting();
      } else {
        this.dealCards();
      }
    }, PHASE_TRANSITION_DELAY_MS);
  }

  private dealCards(): void {
    if (this.destroyed) return;

    this.deck = new Deck(true);
    const active = this.getActivePlayers();

    for (const player of active) {
      player.hand = this.deck.deal(this.cardsPerPlayer);
      player.hand.sort((a, b) => a.value - b.value);
    }

    // Check for forehead mode before broadcasting
    const preBet = this.currentMission.preBetting?.(this.buildMissionContext());
    if (preBet?.foreheadCards) {
      this.foreheadActive = true;
    }

    this.phase = 'DEALING';
    this.broadcastState();

    this.schedulePhaseTransition(() => {
      // Check for pre-betting actions
      if (preBet?.foreheadCards) {
        this.phase = 'PRE_BETTING';
        this.broadcastState();
        this.schedulePhaseTransition(() => this.startBetting(), PHASE_TRANSITION_DELAY_MS);
      } else {
        this.startBetting();
      }
    }, PHASE_TRANSITION_DELAY_MS);
  }

  private startBetting(): void {
    if (this.destroyed) return;

    this.phase = 'BETTING';

    // Betting order: rotate each round
    const active = this.getActivePlayers();
    const startIdx = (this.roundNumber - 1) % active.length;
    this.bettingOrder = [];
    for (let i = 0; i < active.length; i++) {
      this.bettingOrder.push(active[(startIdx + i) % active.length].id);
    }
    this.currentBettorIndex = 0;

    this.broadcastState();
    this.scheduleBotBetIfNeeded();
  }

  private advanceBetting(): void {
    if (this.destroyed) return;

    this.currentBettorIndex++;

    if (this.currentBettorIndex >= this.bettingOrder.length) {
      // All bets placed
      this.startPostBetting();
    } else {
      this.broadcastState();
      this.scheduleBotBetIfNeeded();
    }
  }

  private startPostBetting(): void {
    if (this.destroyed) return;

    // If blind betting, deal cards now
    if (this.dealtAfterBetting) {
      this.deck = new Deck(true);
      const active = this.getActivePlayers();
      for (const player of active) {
        player.hand = this.deck.deal(this.cardsPerPlayer);
        player.hand.sort((a, b) => a.value - b.value);
      }
    }

    const postBet = this.currentMission.postBetting?.(this.buildMissionContext());

    if (postBet?.revealAllHands) {
      this.allHandsVisible = true;
    }

    if (postBet?.extraDraws) {
      const active = this.getActivePlayers();
      for (const player of active) {
        for (let i = 0; i < postBet.extraDraws; i++) {
          const card = this.deck.drawOne();
          if (card) {
            player.hand.push(card);
          }
        }
        player.hand.sort((a, b) => a.value - b.value);
      }
      this.cardsPerPlayer += postBet.extraDraws;
    }

    if (postBet?.passEntireHand) {
      // Rotate hands clockwise
      const active = this.getActivePlayers();
      const hands = active.map(p => [...p.hand]);
      for (let i = 0; i < active.length; i++) {
        const nextIdx = (i + 1) % active.length;
        active[nextIdx].hand = hands[i];
      }
    }

    // Check if mission requires player action (card pass, victim designation)
    const active = this.getActivePlayers();
    const needsAction = active.some(p => {
      if (p.isBot) return false;
      const req = this.currentMission.getRequiredAction?.('postBetting', this.buildMissionContext(), p.id);
      return req !== null && req !== undefined;
    });

    if (needsAction) {
      this.phase = 'POST_BETTING';

      // Auto-handle bot actions
      for (const p of active) {
        if (p.isBot) {
          this.handleBotMissionAction(p);
        }
      }

      this.broadcastState();

      // Timeout fallback
      this.schedulePhaseTransition(() => {
        if (this.phase !== 'POST_BETTING') return; // Already moved past this phase
        // Auto-complete for any player who hasn't acted
        for (const p of active) {
          if (!p.missionActionDone) {
            this.autoCompleteMissionAction(p);
          }
        }
        this.finishPostBetting();
      }, ROUND_END_TIMEOUT_MS);
    } else {
      this.finishPostBetting();
    }
  }

  private finishPostBetting(): void {
    if (this.destroyed) return;

    // Apply all buffered card passes simultaneously so no one sees received
    // cards before they've had a chance to make their own choice.
    for (const [, pass] of this.pendingCardPasses) {
      const recipient = this.getPlayer(pass.recipientId);
      if (recipient) {
        recipient.hand.push(...pass.cards);
        recipient.hand.sort((a, b) => a.value - b.value);
      }
    }
    this.pendingCardPasses.clear();

    // Disable forehead after post-betting is done
    this.foreheadActive = false;

    this.phase = 'POST_BETTING';
    this.broadcastState();

    this.schedulePhaseTransition(() => {
      this.startTrickPlay();
    }, 1000);
  }

  private startTrickPlay(): void {
    if (this.destroyed) return;

    this.trickNumber++;
    this.currentTrick = [];
    this.simultaneousPlayed.clear();

    const active = this.getActivePlayers();

    if (this.trickNumber === 1) {
      // First trick: lead is first bettor
      this.leadPlayerIndex = 0;
    }
    // Subsequent tricks: leadPlayerIndex is set by resolveTrick

    this.turnOrder = [];
    for (let i = 0; i < active.length; i++) {
      this.turnOrder.push(active[(this.leadPlayerIndex + i) % active.length].id);
    }
    this.currentTurnIndex = 0;

    this.phase = 'TRICK_PLAY';
    this.broadcastState();

    if (this.isSimultaneous) {
      // Schedule bot plays for simultaneous
      for (const p of active) {
        if (p.isBot) this.scheduleBotPlay(p);
      }
    } else {
      this.scheduleBotPlayIfNeeded();
    }
  }

  private advanceTurn(): void {
    if (this.destroyed) return;

    this.currentTurnIndex++;
    this.broadcastState();
    this.scheduleBotPlayIfNeeded();
  }

  private resolveTrick(): void {
    if (this.destroyed) return;

    const winner = this.determineTrickWinner();
    const winnerPlayer = this.getPlayer(winner.winnerId);
    if (winnerPlayer) {
      winnerPlayer.tricksWon++;
    }

    this.phase = 'TRICK_RESOLVE';

    // Apply mission afterTrick hooks
    if (this.currentMission.afterTrick) {
      const ctx = this.buildMissionContext();
      ctx.trickCards = this.currentTrick;
      ctx.trickNumber = this.trickNumber;
      ctx.totalTricks = this.cardsPerPlayer;
      const modifier = this.currentMission.afterTrick(ctx, winner.winnerId);
      if (modifier.extraPilis) {
        for (const ep of modifier.extraPilis) {
          const p = this.getPlayer(ep.playerId);
          if (p) {
            p.pilis += ep.amount;
            p.missionPilisThisRound += ep.amount;
          }
        }
      }
    }

    this.callbacks.emitToAll('game:trickResult', {
      winnerId: winner.winnerId,
      winnerName: winnerPlayer?.name ?? '',
      trick: this.currentTrick,
    });
    this.broadcastState();

    // Set lead for next trick
    const active = this.getActivePlayers();
    this.leadPlayerIndex = active.findIndex(p => p.id === winner.winnerId);
    if (this.leadPlayerIndex === -1) this.leadPlayerIndex = 0;

    this.schedulePhaseTransition(() => {
      if (this.trickNumber < this.cardsPerPlayer) {
        this.startTrickPlay();
      } else {
        this.endRound();
      }
    }, TRICK_RESOLVE_DELAY_MS);
  }

  private endRound(): void {
    if (this.destroyed) return;

    this.phase = 'ROUND_END';
    this.acknowledgedPlayers.clear();

    const active = this.getActivePlayers();
    const results: PlayerRoundResult[] = [];

    // Calculate base pilis (gap from bet/tricks ecart)
    for (const p of active) {
      const gap = Math.abs((p.bet ?? 0) - p.tricksWon);
      results.push({
        playerId: p.id,
        playerName: p.name,
        bet: p.bet ?? 0,
        tricksWon: p.tricksWon,
        gap,
        pilisGained: gap,
        missionPilis: p.missionPilisThisRound, // trick-time pilis already applied to player.pilis
        pilisRemoved: 0,
        totalPilis: 0,
        isEliminated: false,
      });
    }

    // Apply mission afterRound modifier
    if (this.currentMission.afterRound) {
      const modifier = this.currentMission.afterRound(this.buildMissionContext());
      if (modifier.bonusRemovals) {
        for (const removal of modifier.bonusRemovals) {
          const r = results.find(r => r.playerId === removal.playerId);
          if (r) r.pilisRemoved = removal.amount;
        }
      }
    }

    // Expert 9: victim designation — snapshot victim gap only (not trick pilis)
    // to avoid transitive chaining (A→B, B→C: A should not inherit C's pilis).
    if (this.currentMission.id === 109) {
      const victimGapMap = new Map<string, number>(results.map(r => [r.playerId, r.gap]));
      for (const p of active) {
        if (p.designatedVictimId) {
          const myResult = results.find(r => r.playerId === p.id);
          if (myResult) {
            const bonus = victimGapMap.get(p.designatedVictimId) ?? 0;
            myResult.missionPilis += bonus; // display
            myResult.pilisGained += bonus;  // application
          }
        }
      }
    }

    // Apply pilis
    for (const r of results) {
      const player = this.getPlayer(r.playerId)!;
      player.pilis += r.pilisGained;
      player.pilis = Math.max(0, player.pilis - r.pilisRemoved);
      r.totalPilis = player.pilis;
      r.isEliminated = player.pilis >= this.settings.piliLimit;
      if (r.isEliminated) player.isEliminated = true;
    }

    this.lastRoundResults = results;
    this.callbacks.emitToAll('game:roundResults', { results });
    this.broadcastState();

    // Wait for acknowledgments or timeout
    // Bots auto-acknowledge
    for (const p of active) {
      if (p.isBot) this.acknowledgedPlayers.add(p.id);
    }

    this.phaseTimer = setTimeout(() => {
      this.advanceFromAcknowledgment();
    }, ROUND_END_TIMEOUT_MS);
  }

  private advanceFromAcknowledgment(): void {
    if (this.destroyed) return;

    if (this.checkGameOver()) {
      this.endGame();
    } else {
      this.startRound();
    }
  }

  private checkGameOver(): boolean {
    return this.players.some(p => p.pilis >= this.settings.piliLimit);
  }

  private endGame(): void {
    if (this.destroyed) return;

    this.phase = 'GAME_OVER';

    const standings: PlayerRoundResult[] = this.players
      .map(p => ({
        playerId: p.id,
        playerName: p.name,
        bet: p.bet ?? 0,
        tricksWon: p.tricksWon,
        gap: 0,
        pilisGained: 0,
        missionPilis: 0,
        pilisRemoved: 0,
        totalPilis: p.pilis,
        isEliminated: p.isEliminated,
      }))
      .sort((a, b) => a.totalPilis - b.totalPilis);

    const winnerId = standings[0]?.playerId ?? '';

    this.callbacks.emitToAll('game:gameOver', { standings, winnerId });
    this.broadcastState();
  }

  // ============================================================
  // Trick Resolution
  // ============================================================

  private determineTrickWinner(): { winnerId: string; card: Card } {
    const invertValues = this.currentMission.invertValues;

    let bestEntry = this.currentTrick[0];
    for (let i = 1; i < this.currentTrick.length; i++) {
      const entry = this.currentTrick[i];
      const better = invertValues
        ? entry.card.value < bestEntry.card.value
        : entry.card.value > bestEntry.card.value;
      if (better) bestEntry = entry;
    }

    return { winnerId: bestEntry.playerId, card: bestEntry.card };
  }

  // ============================================================
  // Bot AI
  // ============================================================

  private scheduleBotBetIfNeeded(): void {
    const currentBettorId = this.bettingOrder[this.currentBettorIndex];
    const player = this.getPlayer(currentBettorId);
    if (player?.isBot) {
      this.scheduleBotAction(() => this.botPlaceBet(player));
    }
  }

  private scheduleBotPlayIfNeeded(): void {
    if (this.isSimultaneous) return;
    const currentTurnId = this.turnOrder[this.currentTurnIndex];
    const player = this.getPlayer(currentTurnId);
    if (player?.isBot) {
      this.scheduleBotAction(() => this.botPlayCard(player));
    }
  }

  private scheduleBotPlay(player: GamePlayer): void {
    this.scheduleBotAction(() => this.botPlayCard(player));
  }

  private scheduleBotAction(action: () => void): void {
    const delay = BOT_THINK_MIN_MS + Math.random() * (BOT_THINK_MAX_MS - BOT_THINK_MIN_MS);
    const timer = setTimeout(() => {
      if (!this.destroyed) action();
    }, delay);
    this.botTimers.push(timer);
  }

  // ── Bot Betting ────────────────────────────────────────────

  private botPlaceBet(player: GamePlayer): void {
    if (this.destroyed || this.phase !== 'BETTING') return;

    const validBets = this.getValidBets(player);
    if (validBets.length === 0) { this.placeBet(player.id, 0); return; }

    // Forehead mode: bot can't see its own cards — bet randomly like a human would
    if (this.foreheadActive) {
      const bet = validBets[Math.floor(Math.random() * validBets.length)];
      this.placeBet(player.id, bet);
      return;
    }

    let bet: number;
    switch (player.botDifficulty) {
      case 'easy':
        bet = this.botBetEasy(player, validBets);
        break;
      case 'hard':
        bet = this.botBetHard(player, validBets);
        break;
      default: // medium
        bet = this.botBetMedium(player, validBets);
        break;
    }

    this.placeBet(player.id, bet);
  }

  /** Compute valid bets respecting all constraints */
  private getValidBets(player: GamePlayer): number[] {
    const constraints = this.currentMission.getBettingConstraints?.(this.buildMissionContext());
    const forbidden = new Set(constraints?.forbiddenValues ?? []);

    if (constraints?.differentFromPrevious) {
      const prevId = this.bettingOrder[this.currentBettorIndex - 1];
      const prev = prevId ? this.getPlayer(prevId) : null;
      if (prev?.bet !== null && prev?.bet !== undefined) {
        forbidden.add(prev.bet);
      }
    }

    const isLastBettor = this.currentBettorIndex === this.bettingOrder.length - 1;
    if (isLastBettor) {
      const sumSoFar = this.getActivePlayers()
        .filter(p => p.bet !== null)
        .reduce((s, p) => s + p.bet!, 0);
      const forbiddenBet = this.cardsPerPlayer - sumSoFar;
      if (forbiddenBet >= 0 && forbiddenBet <= this.cardsPerPlayer) {
        forbidden.add(forbiddenBet);
      }
    }

    return Array.from({ length: this.cardsPerPlayer + 1 }, (_, i) => i)
      .filter(b => !forbidden.has(b));
  }

  /** Estimate how many tricks this hand can win (card-by-card analysis) */
  private estimateWins(hand: Card[], totalPlayers: number): number {
    const invert = !!this.currentMission.invertValues;
    // Threshold: a card "above" this is likely to win a trick
    // With N players and values 1-55, median winning value ≈ 55 - 55/N
    const winThreshold = invert ? (55 / totalPlayers) : 55 - (55 / totalPlayers);
    let wins = 0;
    for (const c of hand) {
      if (c.isJoker) {
        // Joker is flexible: count as ~0.6 wins (can be set high or low)
        wins += 0.6;
      } else if (invert ? c.value < winThreshold : c.value > winThreshold) {
        // Scale confidence: the further from threshold, the more likely it wins
        const distance = invert
          ? (winThreshold - c.value) / winThreshold
          : (c.value - winThreshold) / (55 - winThreshold);
        wins += 0.5 + distance * 0.5;
      } else {
        // Weak cards might still win in small tricks
        const distance = invert
          ? (c.value - winThreshold) / (55 - winThreshold)
          : (winThreshold - c.value) / winThreshold;
        wins += Math.max(0, 0.15 - distance * 0.15);
      }
    }
    return wins;
  }

  /** Easy: basic hand-strength estimate with some randomness */
  private botBetEasy(player: GamePlayer, validBets: number[]): number {
    const totalPlayers = this.getActivePlayers().length;
    const estimated = this.estimateWins(player.hand, totalPlayers);
    // Add random noise ±1
    const noisy = estimated + (Math.random() * 2 - 1);
    const target = Math.round(Math.max(0, Math.min(this.cardsPerPlayer, noisy)));
    return this.closestValid(target, validBets);
  }

  /** Medium: better hand analysis, considers invert, and the joker */
  private botBetMedium(player: GamePlayer, validBets: number[]): number {
    const totalPlayers = this.getActivePlayers().length;
    const estimated = this.estimateWins(player.hand, totalPlayers);

    // Consider others' bets: if total bets are trending high, be more conservative
    const otherBets = this.getActivePlayers()
      .filter(p => p.bet !== null && p.id !== player.id)
      .map(p => p.bet!);
    const avgOtherBet = otherBets.length > 0
      ? otherBets.reduce((s, b) => s + b, 0) / otherBets.length
      : this.cardsPerPlayer / totalPlayers;
    const totalExpected = avgOtherBet * (totalPlayers - 1) + estimated;
    // If everyone is over-betting, reduce our estimate slightly
    const adjustment = totalExpected > this.cardsPerPlayer
      ? -(totalExpected - this.cardsPerPlayer) / totalPlayers
      : 0;

    const target = Math.round(Math.max(0, Math.min(this.cardsPerPlayer, estimated + adjustment)));
    return this.closestValid(target, validBets);
  }

  /** Hard: precise card counting, joker hedging, strategic thinking */
  private botBetHard(player: GamePlayer, validBets: number[]): number {
    const invert = !!this.currentMission.invertValues;
    const hand = player.hand;

    // Classify each card
    let sureWins = 0;
    let maybeWins = 0;
    let hasJoker = false;
    const midpoint = 28; // 55/2 ≈ 28

    for (const c of hand) {
      if (c.isJoker) { hasJoker = true; continue; }
      if (invert) {
        if (c.value <= 5) sureWins++;
        else if (c.value <= 15) maybeWins++;
      } else {
        if (c.value >= 50) sureWins++;
        else if (c.value >= 40) maybeWins++;
      }
    }

    // Base estimate: sure wins + fraction of maybe wins
    let estimated = sureWins + maybeWins * 0.45;

    // Joker strategy: count it as a flexible tool
    // If we have mostly high or mostly low cards, joker complements well
    if (hasJoker) {
      const nonJokerAvg = hand.filter(c => !c.isJoker).reduce((s, c) => s + c.value, 0)
        / Math.max(1, hand.length - 1);
      const handIsPolarized = invert ? nonJokerAvg < midpoint : nonJokerAvg > midpoint;
      // If hand is strong, joker can be used as a dump (low) → don't add
      // If hand is balanced, joker can be the swing card → add ~0.5
      estimated += handIsPolarized ? 0.3 : 0.6;
    }

    // Factor in other players' bets for late-position advantage
    const otherBets = this.getActivePlayers()
      .filter(p => p.bet !== null && p.id !== player.id)
      .map(p => p.bet!);
    if (otherBets.length > 0) {
      const totalOtherBets = otherBets.reduce((s, b) => s + b, 0);
      const remainingTricks = this.cardsPerPlayer - totalOtherBets;
      // Blend our estimate with what's "left": trust card analysis more (70/30)
      estimated = estimated * 0.7 + Math.max(0, remainingTricks) * 0.3;
    }

    const target = Math.round(Math.max(0, Math.min(this.cardsPerPlayer, estimated)));
    return this.closestValid(target, validBets);
  }

  /** Pick the closest value to target among valid bets */
  private closestValid(target: number, validBets: number[]): number {
    return validBets.reduce((closest, b) =>
      Math.abs(b - target) < Math.abs(closest - target) ? b : closest
    , validBets[0]);
  }

  // ── Bot Card Play ─────────────────────────────────────────

  private botPlayCard(player: GamePlayer): void {
    if (this.destroyed || this.phase !== 'TRICK_PLAY') return;
    if (player.hand.length === 0) return;

    const validCards = this.getValidCards(player);
    const sorted = [...validCards].sort((a, b) => a.value - b.value);

    let card: Card;
    switch (player.botDifficulty) {
      case 'easy':
        card = this.botPlayEasy(player, sorted);
        break;
      case 'hard':
        card = this.botPlayHard(player, sorted);
        break;
      default: // medium
        card = this.botPlayMedium(player, sorted);
        break;
    }

    // Handle joker value
    if (card.isJoker && card.value < 0) {
      card.value = this.botChooseJokerValue(player);
    }

    this.playCard(player.id, card.id);
  }

  /** Get valid cards respecting mission constraints */
  private getValidCards(player: GamePlayer): Card[] {
    let valid = [...player.hand];
    if (this.currentMission.validatePlay) {
      const ctx = this.buildMissionContext();
      valid = valid.filter(c => this.currentMission.validatePlay!(ctx, player.id, c).valid);
    }
    return valid.length > 0 ? valid : [player.hand[0]];
  }

  /** How many more tricks does this player need? (negative = already over) */
  private tricksNeeded(player: GamePlayer): number {
    return (player.bet ?? 0) - player.tricksWon;
  }

  /**
   * Adjusted tricks-needed for medium/hard bots, factoring in mission penalties.
   * Mission 103: winning the first or last trick gives +1 pili → treat those tricks
   * as if we already have enough (don't want to win).
   */
  private effectiveTricksNeeded(player: GamePlayer): number {
    const need = this.tricksNeeded(player);
    if (
      this.currentMission.id === 103 &&
      (this.trickNumber === 1 || this.trickNumber === this.cardsPerPlayer)
    ) {
      return Math.min(need, 0);
    }
    return need;
  }

  /** Easy: basic intent-based play (old medium logic) */
  private botPlayEasy(player: GamePlayer, sorted: Card[]): Card {
    const need = this.tricksNeeded(player);
    if (this.currentTrick.length === 0) {
      // Leading: high if want tricks, low if not
      return need > 0 ? sorted[sorted.length - 1] : sorted[0];
    }
    const currentHighest = Math.max(...this.currentTrick.map(tc => tc.card.value));
    if (need > 0) {
      const beaters = sorted.filter(c => c.value > currentHighest);
      return beaters.length > 0 ? beaters[0] : sorted[0];
    }
    return sorted[0];
  }

  /** Medium: considers position, tries not to over/under-shoot */
  private botPlayMedium(player: GamePlayer, sorted: Card[]): Card {
    const need = this.effectiveTricksNeeded(player);
    const invert = !!this.currentMission.invertValues;
    const effectiveSorted = invert ? [...sorted].reverse() : sorted;
    // In inverted mode, "strong" = low value. effectiveSorted: weakest first → strongest last.

    if (this.currentTrick.length === 0) {
      // Leading
      if (need > 0) {
        // Play a strong card, but not our absolute strongest (save it)
        const idx = Math.max(0, effectiveSorted.length - 2);
        return effectiveSorted[idx];
      } else if (need === 0) {
        // Exact: play weakest to avoid winning more
        return effectiveSorted[0];
      } else {
        // Over-shot: dump weakest
        return effectiveSorted[0];
      }
    }

    // Following
    const currentBest = this.currentTrick.reduce((best, tc) => {
      if (invert) return tc.card.value < best ? tc.card.value : best;
      return tc.card.value > best ? tc.card.value : best;
    }, invert ? Infinity : -Infinity);

    if (need > 0) {
      // Want tricks: play smallest winner
      const beaters = effectiveSorted.filter(c =>
        invert ? c.value < currentBest : c.value > currentBest
      );
      return beaters.length > 0 ? beaters[0] : effectiveSorted[0];
    }

    // Don't want tricks: play the highest non-winning card, or dump strongest if must win
    const losers = effectiveSorted.filter(c =>
      invert ? c.value > currentBest : c.value < currentBest
    );
    // Among losers, play the strongest (get rid of dangerous cards)
    return losers.length > 0 ? losers[losers.length - 1] : effectiveSorted[effectiveSorted.length - 1];
  }

  /** Hard: advanced strategy with sabotage, position awareness, and joker tactics */
  private botPlayHard(player: GamePlayer, sorted: Card[]): Card {
    const need = this.effectiveTricksNeeded(player);
    const tricksRemaining = this.cardsPerPlayer - this.trickNumber + 1;
    const invert = !!this.currentMission.invertValues;
    const totalPlayers = this.getActivePlayers().length;
    const isLastToPlay = this.currentTrick.length === totalPlayers - 1;
    const isLeading = this.currentTrick.length === 0;

    // Separate joker from normal cards
    const joker = sorted.find(c => c.isJoker && c.value < 0);
    const normalCards = sorted.filter(c => !(c.isJoker && c.value < 0));
    const effectiveNormal = invert ? [...normalCards].reverse() : normalCards;

    // ── LEADING ──
    if (isLeading) {
      if (need > 0 && need >= tricksRemaining) {
        // Must win every remaining trick: play strongest
        return effectiveNormal.length > 0
          ? effectiveNormal[effectiveNormal.length - 1]
          : joker!;
      }
      if (need > 0) {
        // Want some tricks: lead with a mid-strong card to probe others
        const idx = Math.min(effectiveNormal.length - 1,
          Math.floor(effectiveNormal.length * 0.6));
        return effectiveNormal[idx] ?? joker!;
      }
      if (need === 0) {
        // Exact bet: dump weakest cards safely
        return effectiveNormal[0] ?? joker!;
      }
      // Over-shot (need < 0): play weakest
      return effectiveNormal[0] ?? joker!;
    }

    // ── FOLLOWING ──
    const currentBest = this.currentTrick.reduce((best, tc) => {
      if (invert) return tc.card.value < best ? tc.card.value : best;
      return tc.card.value > best ? tc.card.value : best;
    }, invert ? Infinity : -Infinity);

    const winners = effectiveNormal.filter(c =>
      invert ? c.value < currentBest : c.value > currentBest
    );
    const losers = effectiveNormal.filter(c =>
      invert ? c.value >= currentBest : c.value <= currentBest
    );

    if (need > 0) {
      // ── Want tricks ──
      if (isLastToPlay) {
        // Last position: can win precisely with smallest winner
        if (winners.length > 0) return winners[0];
        // Can't win — dump a dangerous card we don't want later
        if (effectiveNormal.length === 0) return joker ?? sorted[0];
        return this.dumpCard(effectiveNormal);
      }
      // Not last: play a strong winner to secure the trick
      if (winners.length > 0) {
        // Play a strong winner (not necessarily the top — save that)
        const idx = Math.min(winners.length - 1, Math.max(0, winners.length - 2));
        return winners[idx];
      }
      // Can't win: dump a middle card
      if (effectiveNormal.length === 0) return joker ?? sorted[0];
      return this.dumpCard(effectiveNormal);
    }

    if (need === 0) {
      // ── Exact: avoid winning more tricks ──
      if (losers.length > 0) {
        // Play the strongest loser: get rid of dangerous high cards
        return losers[losers.length - 1];
      }
      // Must win... play smallest winner to minimize damage
      if (winners.length > 0) return winners[0];
      // Use joker as dump
      if (joker) return joker;
      return effectiveNormal[0];
    }

    // ── Over-shot: avoid winning at all costs ──
    if (losers.length > 0) {
      return losers[losers.length - 1];
    }
    // Forced to win: minimize future wins — play our strongest now
    if (winners.length > 0) return winners[winners.length - 1];
    if (joker) return joker;
    return effectiveNormal[0];
  }

  /** Pick a card to "dump" — get rid of mid-range cards that are unpredictable */
  private dumpCard(sorted: Card[]): Card {
    // Dump a middle-value card: safer than extreme ones
    if (sorted.length <= 2) return sorted[0];
    const midIdx = Math.floor(sorted.length / 2);
    return sorted[midIdx];
  }

  /** Choose joker value based on difficulty and game state */
  private botChooseJokerValue(player: GamePlayer): number {
    const need = this.effectiveTricksNeeded(player);
    const tricksRemaining = this.cardsPerPlayer - this.trickNumber + 1;

    if (player.botDifficulty === 'hard') {
      // Hard: use joker as a precision tool
      if (need > 0 && need >= tricksRemaining) {
        // Must win remaining: play joker high
        return JOKER_HIGH_VALUE;
      }
      if (need <= 0) {
        // Don't need tricks: dump joker low
        return JOKER_LOW_VALUE;
      }
      // Need some tricks but not desperate: use joker to win this trick
      // if we're following and can't win with normal cards
      if (this.currentTrick.length > 0) {
        const currentHighest = Math.max(...this.currentTrick.map(tc => tc.card.value));
        const hasNormalWinner = player.hand.some(c =>
          !c.isJoker && c.value > currentHighest
        );
        return hasNormalWinner ? JOKER_LOW_VALUE : JOKER_HIGH_VALUE;
      }
      return JOKER_HIGH_VALUE;
    }

    // Easy/Medium: simple want-win logic
    return need > 0 ? JOKER_HIGH_VALUE : JOKER_LOW_VALUE;
  }

  // ── Bot Mission Actions ───────────────────────────────────

  private handleBotMissionAction(player: GamePlayer): void {
    const req = this.currentMission.getRequiredAction?.('postBetting', this.buildMissionContext(), player.id);
    if (!req) {
      player.missionActionDone = true;
      return;
    }

    if (req.type === 'CHOOSE_CARDS_TO_PASS') {
      this.botPassCards(player, req.count);
    } else if (req.type === 'DESIGNATE_VICTIM') {
      this.botDesignateVictim(player);
    }
  }

  private botPassCards(player: GamePlayer, count: number): void {
    const sorted = [...player.hand].sort((a, b) => a.value - b.value);
    let cardsToPass: number[];

    if (player.botDifficulty === 'hard') {
      // Hard: pass mid-range cards that are hardest to control
      // Keep extremes (strong winners / safe losers), dump the middle
      const midStart = Math.floor((sorted.length - count) / 2);
      cardsToPass = sorted.slice(midStart, midStart + count).map(c => c.id);
    } else if (player.botDifficulty === 'medium') {
      // Medium: pass weakest cards (keep strong hand)
      cardsToPass = sorted.slice(0, count).map(c => c.id);
    } else {
      // Easy: pass weakest
      cardsToPass = sorted.slice(0, count).map(c => c.id);
    }

    this.handleMissionAction(player.id, { type: 'CARDS_TO_PASS', cardIds: cardsToPass });
  }

  private botDesignateVictim(player: GamePlayer): void {
    const others = this.getActivePlayers().filter(p => p.id !== player.id);
    if (others.length === 0) { player.missionActionDone = true; return; }

    let victim: GamePlayer;
    if (player.botDifficulty === 'hard') {
      // Hard: target the player closest to winning (fewest pilis)
      // This is more strategic: prevent the leader from winning
      victim = others.sort((a, b) => a.pilis - b.pilis)[0];
    } else {
      // Easy/Medium: target the player with the most pilis (least strategic)
      victim = others.sort((a, b) => b.pilis - a.pilis)[0];
    }

    this.handleMissionAction(player.id, { type: 'DESIGNATE_VICTIM', victimId: victim.id });
  }

  private autoCompleteMissionAction(player: GamePlayer): void {
    const req = this.currentMission.getRequiredAction?.('postBetting', this.buildMissionContext(), player.id);
    if (!req) {
      player.missionActionDone = true;
      return;
    }

    if (req.type === 'CHOOSE_CARDS_TO_PASS') {
      const cardsToPass = player.hand.slice(0, req.count).map(c => c.id);
      this.handleMissionAction(player.id, { type: 'CARDS_TO_PASS', cardIds: cardsToPass });
    } else if (req.type === 'DESIGNATE_VICTIM') {
      const others = this.getActivePlayers().filter(p => p.id !== player.id);
      if (others.length > 0) {
        this.handleMissionAction(player.id, { type: 'DESIGNATE_VICTIM', victimId: others[0].id });
      }
    }
    player.missionActionDone = true;
  }

  // ============================================================
  // State Serialization
  // ============================================================

  getClientState(forPlayerId: string): ClientGameState {
    const active = this.getActivePlayers();
    const me = this.getPlayer(forPlayerId);

    // Build visible hands
    let visibleHands: Record<string, Card[]> = {};
    if (this.allHandsVisible) {
      for (const p of active) {
        visibleHands[p.id] = [...p.hand];
      }
    } else if (this.foreheadActive && this.currentMission.getVisibility) {
      visibleHands = this.currentMission.getVisibility(this.buildMissionContext(), forPlayerId);
    }

    // Betting constraint for last bettor
    let bettingConstraint: ClientGameState['bettingConstraint'] = null;
    const currentBettorId = this.bettingOrder[this.currentBettorIndex];
    if (this.phase === 'BETTING' && forPlayerId === currentBettorId) {
      const isLastBettor = this.currentBettorIndex === this.bettingOrder.length - 1;
      if (isLastBettor) {
        const sumSoFar = active
          .filter(p => p.bet !== null)
          .reduce((s, p) => s + p.bet!, 0);
        const forbiddenBet = this.cardsPerPlayer - sumSoFar;
        bettingConstraint = {
          sumSoFar,
          forbiddenBet: (forbiddenBet >= 0 && forbiddenBet <= this.cardsPerPlayer) ? forbiddenBet : null,
        };
      }
    }

    // Forbidden bet values from mission
    const constraints = this.currentMission.getBettingConstraints?.(this.buildMissionContext());
    let forbiddenBetValues = constraints?.forbiddenValues ?? [];
    if (constraints?.differentFromPrevious) {
      const prevId = this.bettingOrder[this.currentBettorIndex - 1];
      const prev = prevId ? this.getPlayer(prevId) : null;
      if (prev?.bet !== null && prev?.bet !== undefined) {
        forbiddenBetValues = [...forbiddenBetValues, prev.bet];
      }
    }

    // Mission action for this player
    let missionAction: MissionActionRequest | null = null;
    if (this.phase === 'POST_BETTING' && me && !me.missionActionDone && !me.isBot) {
      missionAction = this.currentMission.getRequiredAction?.('postBetting', this.buildMissionContext(), forPlayerId) ?? null;
    }

    // Build round results if available — use the cached results from endRound()
    // which contain the correct missionPilis, pilisRemoved, and designation bonuses.
    const roundResults: PlayerRoundResult[] | null =
      (this.phase === 'ROUND_END' || this.phase === 'GAME_OVER')
        ? this.lastRoundResults
        : null;

    // Final standings
    let finalStandings: PlayerRoundResult[] | null = null;
    let winnerId: string | null = null;
    if (this.phase === 'GAME_OVER') {
      finalStandings = this.players
        .map(p => ({
          playerId: p.id,
          playerName: p.name,
          bet: p.bet ?? 0,
          tricksWon: p.tricksWon,
          gap: 0,
          pilisGained: 0,
          missionPilis: 0,
          pilisRemoved: 0,
          totalPilis: p.pilis,
          isEliminated: p.isEliminated,
        }))
        .sort((a, b) => a.totalPilis - b.totalPilis);
      winnerId = finalStandings[0]?.playerId ?? null;
    }

    return {
      phase: this.phase,
      roundNumber: this.roundNumber,
      trickNumber: this.trickNumber,
      totalTricks: this.cardsPerPlayer,
      mission: {
        id: this.currentMission.id,
        name: this.currentMission.name,
        description: this.currentMission.description,
        difficulty: this.currentMission.difficulty,
        cardsPerPlayer: this.cardsPerPlayer,
        icon: this.currentMission.icon,
      },

      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        isBot: p.isBot,
        seatIndex: p.seatIndex,
        cardCount: p.hand.length,
        bet: p.bet,
        tricksWon: p.tricksWon,
        pilis: p.pilis,
        isCurrentTurn: this.isSimultaneous
          ? !this.simultaneousPlayed.has(p.id) && !p.isEliminated
          : this.turnOrder[this.currentTurnIndex] === p.id,
        isEliminated: p.isEliminated,
        isConnected: p.isConnected,
        designatedVictimId: p.designatedVictimId,
      })),

      myHand: this.foreheadActive
        ? []  // Can't see own cards during forehead mode
        : (me?.hand ?? []),

      visibleHands,
      currentTrick: this.currentTrick,
      leadPlayerId: this.turnOrder[this.leadPlayerIndex] ?? null,

      bettingOrder: this.bettingOrder,
      currentBettorId: this.bettingOrder[this.currentBettorIndex] ?? null,
      bettingConstraint,
      forbiddenBetValues,

      currentTurnPlayerId: this.isSimultaneous
        ? null
        : (this.turnOrder[this.currentTurnIndex] ?? null),
      turnTimeRemaining: null,

      isSimultaneous: this.isSimultaneous,
      simultaneousPlayed: Array.from(this.simultaneousPlayed.keys()),

      missionAction,
      roundResults,
      finalStandings,
      winnerId,
    };
  }

  // ============================================================
  // Helpers
  // ============================================================

  private getActivePlayers(): GamePlayer[] {
    return this.players.filter(p => !p.isEliminated);
  }

  private getPlayer(id: string): GamePlayer | undefined {
    return this.players.find(p => p.id === id);
  }

  private buildMissionContext(): MissionContext {
    return {
      players: this.getActivePlayers().map(p => ({
        id: p.id,
        hand: p.hand,
        bet: p.bet,
        tricksWon: p.tricksWon,
        pilis: p.pilis,
        seatIndex: p.seatIndex,
      })),
      cardsPerPlayer: this.cardsPerPlayer,
      totalPlayers: this.getActivePlayers().length,
      deck: this.deck ?? { drawOne: () => undefined },
      trickCards: this.currentTrick,
      trickNumber: this.trickNumber,
      totalTricks: this.cardsPerPlayer,
    };
  }

  private broadcastState(): void {
    for (const p of this.players) {
      if (!p.isBot && p.isConnected) {
        this.callbacks.emitToPlayer(p.id, 'game:stateUpdate', {
          gameState: this.getClientState(p.id),
        });
      }
    }
  }

  private schedulePhaseTransition(action: () => void, delayMs: number): void {
    if (this.phaseTimer) clearTimeout(this.phaseTimer);
    this.phaseTimer = setTimeout(() => {
      if (!this.destroyed) action();
    }, delayMs);
  }

  private clearAllTimers(): void {
    for (const t of this.botTimers) clearTimeout(t);
    this.botTimers = [];
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
    }
  }

  private shuffleArray<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
