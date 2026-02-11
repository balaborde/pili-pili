import { nanoid } from 'nanoid';
import type {
  Card,
  ClientGameState,
  ClientPlayer,
  GamePhase,
  MissionCardDef,
  PlayedCard,
  Player,
  PlayerScore,
  RoomSettings,
  RoundScoringData,
  Trick,
  BotDifficulty,
} from '../../src/types/game.types';
import { DEFAULT_ROOM_SETTINGS } from '../../src/types/game.types';
import type { BetContext, ScoreModification, StateModification } from '../../src/types/mission.types';
import { StateMachine } from './StateMachine';
import { Deck } from './Deck';
import { TrickResolver } from './TrickResolver';
import { ScoringEngine } from './ScoringEngine';
import { BetValidator } from './BetValidator';
import { BaseMission, createMissionDeck, shuffleMissions } from './missions';
import { BotPlayer } from './ai/BotPlayer';

export type GameEvent =
  | { type: 'phaseChanged'; phase: GamePhase; phaseData?: Record<string, unknown> }
  | { type: 'missionRevealed'; mission: MissionCardDef }
  | { type: 'cardsDealt'; playerHands: Map<string, Card[]>; totalCards: number }
  | { type: 'betPlaced'; playerId: string; bet: number }
  | { type: 'allBetsRevealed'; bets: { playerId: string; bet: number }[] }
  | { type: 'turnChanged'; currentPlayerIndex: number }
  | { type: 'cardPlayed'; playerId: string; play: PlayedCard }
  | { type: 'trickWon'; winnerId: string; trick: Trick }
  | { type: 'roundScoring'; data: RoundScoringData }
  | { type: 'roundEnd'; scores: PlayerScore[] }
  | { type: 'gameOver'; finalStandings: PlayerScore[]; eliminatedId: string }
  | { type: 'peekStart'; durationMs: number }
  | { type: 'peekEnd' }
  | { type: 'cardsPassRequired'; direction: 'left' | 'right'; count: number }
  | { type: 'handUpdate'; playerId: string; hand: Card[] }
  | { type: 'designateRequired' }
  | { type: 'exchangeRequired'; winnerId: string }
  | { type: 'opponentHandsRevealed'; hands: { playerId: string; cards: Card[] }[] }
  | { type: 'indianPokerReveal'; targetPlayerId: string; otherPlayersCards: { playerId: string; cards: Card[] }[] }
  | { type: 'stateModification'; modifications: StateModification[] };

export class GameEngine {
  readonly roomCode: string;
  private stateMachine = new StateMachine();
  private deck = new Deck();
  private trickResolver = new TrickResolver();
  private scoringEngine = new ScoringEngine();
  private betValidator = new BetValidator();

  private players: Player[] = [];
  private settings: RoomSettings;
  private hostId: string = '';

  private currentRound = 0;
  private currentTrick: Trick = { plays: [], winnerId: null, trickNumber: 0 };
  private previousTricks: Trick[] = [];
  private currentPlayerIndex = 0;
  private dealerIndex = 0;
  private totalTricksThisRound = 0;

  private missionDeck: BaseMission[] = [];
  private missionIndex = 0;
  private currentMission: BaseMission | null = null;
  private missionState: Record<string, unknown> = {};

  // Pending actions trackers
  private pendingPasses: Map<string, Card[]> = new Map();
  private pendingExchanges: Map<string, { cardId: string; targetPlayerId: string }> = new Map();
  private pendingDesignations: Map<string, string> = new Map();
  private peekAcknowledged: Set<string> = new Set();

  // Extra pilis from mission effects during the round
  private roundMissionPilis: Map<string, number> = new Map();

  // Bot players
  private bots: Map<string, BotPlayer> = new Map();

  // Event listener
  private eventListener: ((event: GameEvent) => void) | null = null;

  constructor(roomCode: string, settings?: Partial<RoomSettings>) {
    this.roomCode = roomCode;
    this.settings = { ...DEFAULT_ROOM_SETTINGS, ...settings };
  }

  onEvent(listener: (event: GameEvent) => void): void {
    this.eventListener = listener;
  }

  private emit(event: GameEvent): void {
    this.eventListener?.(event);
  }

  // ============================================================
  // Player Management
  // ============================================================

  addPlayer(name: string, isBot = false, botDifficulty?: BotDifficulty): Player {
    const id = nanoid(10);
    const player: Player = {
      id,
      name,
      isBot,
      botDifficulty,
      isConnected: !isBot,
      isReady: isBot,
      hand: [],
      bet: null,
      tricksWon: 0,
      pilis: 0,
      seatIndex: this.players.length,
    };
    this.players.push(player);

    if (isBot && botDifficulty) {
      this.bots.set(id, new BotPlayer(id, botDifficulty));
    }

    if (this.players.length === 1 && !isBot) {
      this.hostId = id;
    }

    return player;
  }

  removePlayer(playerId: string): void {
    const index = this.players.findIndex((p) => p.id === playerId);
    if (index === -1) return;

    this.players.splice(index, 1);
    this.bots.delete(playerId);

    // Reassign seat indices
    this.players.forEach((p, i) => {
      p.seatIndex = i;
    });

    // Reassign host if needed
    if (this.hostId === playerId) {
      const nextHuman = this.players.find((p) => !p.isBot);
      this.hostId = nextHuman?.id ?? '';
    }
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.find((p) => p.id === playerId);
  }

  getPlayers(): Player[] {
    return this.players;
  }

  getHostId(): string {
    return this.hostId;
  }

  getSettings(): RoomSettings {
    return this.settings;
  }

  updateSettings(settings: Partial<RoomSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  toggleReady(playerId: string): boolean {
    const player = this.getPlayer(playerId);
    if (!player) return false;
    player.isReady = !player.isReady;
    return player.isReady;
  }

  // ============================================================
  // Game Flow
  // ============================================================

  canStart(): { ok: boolean; reason?: string } {
    if (this.players.length < 2) {
      return { ok: false, reason: 'Il faut au moins 2 joueurs' };
    }
    const allReady = this.players.filter((p) => !p.isBot).every((p) => p.isReady);
    if (!allReady) {
      return { ok: false, reason: 'Tous les joueurs doivent être prêts' };
    }
    // Prevent starting if already in game
    if (this.stateMachine.phase !== ('LOBBY' as GamePhase)) {
      return { ok: false, reason: 'La partie a déjà commencé' };
    }
    return { ok: true };
  }

  startGame(): void {
    const check = this.canStart();
    if (!check.ok) throw new Error(check.reason);

    // Reset state machine to LOBBY (in case it was somehow not in LOBBY)
    this.stateMachine.reset();

    // Initialize mission deck
    this.missionDeck = shuffleMissions(createMissionDeck(this.settings.includeExpertMissions));
    this.missionIndex = 0;
    this.currentRound = 0;
    this.dealerIndex = 0;

    // Reset all player scores
    for (const player of this.players) {
      player.pilis = 0;
    }

    this.stateMachine.transition('ROUND_START' as GamePhase);
    this.startRound();
  }

  private startRound(): void {
    this.currentRound++;
    this.previousTricks = [];
    this.currentTrick = { plays: [], winnerId: null, trickNumber: 0 };
    this.roundMissionPilis.clear();
    this.pendingPasses.clear();
    this.pendingExchanges.clear();
    this.pendingDesignations.clear();
    this.peekAcknowledged.clear();
    this.missionState = {};

    // Reset player round state
    for (const player of this.players) {
      player.hand = [];
      player.bet = null;
      player.tricksWon = 0;
    }

    this.emit({ type: 'phaseChanged', phase: 'ROUND_START' as GamePhase });

    // Reveal mission
    this.revealMission();
  }

  private revealMission(): void {
    // Cycle through mission deck
    if (this.missionIndex >= this.missionDeck.length) {
      this.missionDeck = shuffleMissions(this.missionDeck);
      this.missionIndex = 0;
    }

    this.currentMission = this.missionDeck[this.missionIndex++];
    this.stateMachine.transition('MISSION_REVEAL' as GamePhase);
    this.emit({ type: 'missionRevealed', mission: this.currentMission.toCardDef() });

    // Short delay then deal
    this.dealCards();
  }

  private dealCards(): void {
    this.stateMachine.transition('DEALING' as GamePhase);

    const cardsPerPlayer = this.currentMission!.cardsPerPlayer;
    this.totalTricksThisRound = cardsPerPlayer;

    const hands = this.deck.deal(this.players.length, cardsPerPlayer);

    const playerHands = new Map<string, Card[]>();
    this.players.forEach((player, i) => {
      player.hand = hands[i];
      playerHands.set(player.id, hands[i]);
    });

    this.emit({ type: 'cardsDealt', playerHands, totalCards: cardsPerPlayer });

    // Check for pre-bet mission phase
    if (this.currentMission!.hasPreBetPhase()) {
      this.startPreBetPhase();
    } else {
      this.startBetting();
    }
  }

  private startPreBetPhase(): void {
    this.stateMachine.transition('PRE_BET_MISSION' as GamePhase);
    this.emit({ type: 'phaseChanged', phase: 'PRE_BET_MISSION' as GamePhase });

    const mission = this.currentMission!;

    // Handle peek missions
    if (mission.getPeekDurationMs() > 0) {
      this.emit({ type: 'peekStart', durationMs: mission.getPeekDurationMs() });
      // After peek timer, cards are hidden and we move to betting
      setTimeout(() => {
        this.emit({ type: 'peekEnd' });
        this.startBetting();
      }, mission.getPeekDurationMs() + 500); // +500ms buffer
      return;
    }

    // Handle Indian poker
    if (mission.type === 'indianPoker') {
      // Send each player the OTHER players' cards
      for (const player of this.players) {
        const othersCards = this.players
          .filter((p) => p.id !== player.id)
          .map((p) => ({ playerId: p.id, cards: p.hand }));
        this.emit({
          type: 'indianPokerReveal',
          targetPlayerId: player.id,
          otherPlayersCards: othersCards,
        });
      }
      // Move to betting (players bet without seeing their own cards)
      this.startBetting();
      return;
    }

    // Default: just move to betting
    this.startBetting();
  }

  private startBetting(): void {
    this.stateMachine.transition('BETTING' as GamePhase);

    // First player to bet is left of dealer
    this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.length;

    this.emit({ type: 'phaseChanged', phase: 'BETTING' as GamePhase });
    this.emit({ type: 'turnChanged', currentPlayerIndex: this.currentPlayerIndex });

    // If the current player is a bot, trigger bot bet
    this.triggerBotActionIfNeeded();
  }

  placeBet(playerId: string, bet: number): { ok: boolean; error?: string } {
    if (this.stateMachine.phase !== ('BETTING' as GamePhase)) {
      return { ok: false, error: 'Phase incorrecte pour parier' };
    }

    const player = this.players[this.currentPlayerIndex];
    if (player.id !== playerId) {
      return { ok: false, error: "Ce n'est pas votre tour de parier" };
    }

    // Build bet context
    const context: BetContext = {
      playerIndex: this.getBettingOrderIndex(playerId),
      playerCount: this.players.length,
      totalCards: this.totalTricksThisRound,
      previousBets: this.players.map((p) => p.bet),
      hand: player.hand,
    };

    // Core validation
    const coreResult = this.betValidator.validateCoreBet(bet, context);
    if (!coreResult.valid) {
      return { ok: false, error: coreResult.reason };
    }

    // Mission validation
    const missionResult = this.currentMission!.validateBet(bet, context);
    if (!missionResult.valid) {
      return { ok: false, error: missionResult.reason };
    }

    player.bet = bet;
    this.emit({ type: 'betPlaced', playerId, bet });

    // Move to next player
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

    // Check if all bets are placed
    if (this.players.every((p) => p.bet !== null)) {
      this.emit({
        type: 'allBetsRevealed',
        bets: this.players.map((p) => ({ playerId: p.id, bet: p.bet! })),
      });

      if (this.currentMission!.hasPostBetPhase()) {
        this.startPostBetPhase();
      } else {
        this.startTrickPlay();
      }
    } else {
      this.emit({ type: 'turnChanged', currentPlayerIndex: this.currentPlayerIndex });
      this.triggerBotActionIfNeeded();
    }

    return { ok: true };
  }

  private getBettingOrderIndex(playerId: string): number {
    // Count how many players have already bet (in order from dealer+1)
    let count = 0;
    let idx = (this.dealerIndex + 1) % this.players.length;
    while (this.players[idx].id !== playerId) {
      if (this.players[idx].bet !== null) count++;
      idx = (idx + 1) % this.players.length;
    }
    return count;
  }

  private startPostBetPhase(): void {
    this.stateMachine.transition('POST_BET_MISSION' as GamePhase);
    this.emit({ type: 'phaseChanged', phase: 'POST_BET_MISSION' as GamePhase });

    const mission = this.currentMission!;

    // Handle card passing
    if (mission.getPassCount() > 0 || mission.isPassAll()) {
      const count = mission.isPassAll()
        ? this.players[0].hand.length
        : mission.getPassCount();
      this.emit({ type: 'cardsPassRequired', direction: mission.getPassDirection(), count });
      // Wait for all players to submit their cards to pass
      // Bots will auto-pass
      this.triggerBotPassIfNeeded(count);
      return;
    }

    // Handle draw extra card
    if (mission.drawsExtraCard()) {
      for (const player of this.players) {
        const extraCard = this.deck.drawOne();
        if (extraCard) {
          player.hand.push(extraCard);
          this.emit({ type: 'handUpdate', playerId: player.id, hand: player.hand });
        }
      }
      this.totalTricksThisRound = this.players[0].hand.length;
      this.startTrickPlay();
      return;
    }

    // Handle face up
    if (mission.getVisibility().canSeeOthersCards) {
      const hands = this.players.map((p) => ({ playerId: p.id, cards: p.hand }));
      this.emit({ type: 'opponentHandsRevealed', hands });
      this.startTrickPlay();
      return;
    }

    // Handle designate player
    if (mission.requiresDesignation()) {
      this.emit({ type: 'designateRequired' });
      this.triggerBotDesignateIfNeeded();
      return;
    }

    this.startTrickPlay();
  }

  submitPassCards(playerId: string, cardIds: string[]): { ok: boolean; error?: string } {
    const player = this.getPlayer(playerId);
    if (!player) return { ok: false, error: 'Joueur introuvable' };

    const cards = cardIds.map((id) => player.hand.find((c) => c.id === id)).filter(Boolean) as Card[];
    if (cards.length !== cardIds.length) {
      return { ok: false, error: 'Cartes invalides' };
    }

    this.pendingPasses.set(playerId, cards);

    // Check if all players have submitted
    if (this.pendingPasses.size === this.players.length) {
      this.executeCardPassing();
    }

    return { ok: true };
  }

  private executeCardPassing(): void {
    const direction = this.currentMission!.getPassDirection();

    for (let i = 0; i < this.players.length; i++) {
      const giver = this.players[i];
      const receiverIndex = direction === 'left'
        ? (i + 1) % this.players.length
        : (i - 1 + this.players.length) % this.players.length;
      const receiver = this.players[receiverIndex];

      const cardsToPass = this.pendingPasses.get(giver.id) ?? [];

      // Remove from giver
      giver.hand = giver.hand.filter((c) => !cardsToPass.some((pc) => pc.id === c.id));
      // Add to receiver
      receiver.hand.push(...cardsToPass);
    }

    // Emit hand updates
    for (const player of this.players) {
      this.emit({ type: 'handUpdate', playerId: player.id, hand: player.hand });
    }

    this.totalTricksThisRound = this.players[0].hand.length;
    this.startTrickPlay();
  }

  submitDesignation(playerId: string, targetPlayerId: string): { ok: boolean; error?: string } {
    if (playerId === targetPlayerId) {
      return { ok: false, error: 'Tu ne peux pas te désigner toi-même' };
    }

    const mission = this.currentMission;
    if (!mission || !mission.requiresDesignation()) {
      return { ok: false, error: 'Pas de désignation requise' };
    }

    this.pendingDesignations.set(playerId, targetPlayerId);

    // Store in mission
    if ('setDesignation' in mission) {
      (mission as any).setDesignation(playerId, targetPlayerId);
    }

    if (this.pendingDesignations.size === this.players.length) {
      this.startTrickPlay();
    }

    return { ok: true };
  }

  // ============================================================
  // Trick Play
  // ============================================================

  private startTrickPlay(): void {
    this.stateMachine.transition('TRICK_PLAY' as GamePhase);

    this.currentTrick = {
      plays: [],
      winnerId: null,
      trickNumber: this.previousTricks.length + 1,
    };

    // First trick: left of dealer. Subsequent: winner of last trick
    if (this.previousTricks.length === 0) {
      this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.length;
    }
    // Otherwise currentPlayerIndex is already set to trick winner

    this.emit({ type: 'phaseChanged', phase: 'TRICK_PLAY' as GamePhase });
    this.emit({ type: 'turnChanged', currentPlayerIndex: this.currentPlayerIndex });

    if (this.currentMission!.isSimultaneous()) {
      // All players play simultaneously — bots play immediately
      for (const player of this.players) {
        if (player.isBot) {
          const bot = this.bots.get(player.id);
          if (bot) {
            setTimeout(() => {
              const card = bot.decideCardToPlay(player.hand, this.currentTrick, this.currentMission!);
              this.playCard(player.id, card.id);
            }, bot.getThinkDelay());
          }
        }
      }
    } else {
      this.triggerBotActionIfNeeded();
    }
  }

  playCard(
    playerId: string,
    cardId: string,
    jokerDeclaredValue?: number
  ): { ok: boolean; error?: string } {
    if (this.stateMachine.phase !== ('TRICK_PLAY' as GamePhase)) {
      return { ok: false, error: 'Phase incorrecte pour jouer' };
    }

    const mission = this.currentMission!;
    const isSimultaneous = mission.isSimultaneous();

    // In non-simultaneous mode, check turn order
    if (!isSimultaneous) {
      const currentPlayer = this.players[this.currentPlayerIndex];
      if (currentPlayer.id !== playerId) {
        return { ok: false, error: "Ce n'est pas votre tour" };
      }
    }

    // Check player hasn't already played this trick
    if (this.currentTrick.plays.some((p) => p.playerId === playerId)) {
      return { ok: false, error: 'Vous avez déjà joué ce pli' };
    }

    const player = this.getPlayer(playerId);
    if (!player) return { ok: false, error: 'Joueur introuvable' };

    const card = player.hand.find((c) => c.id === cardId);
    if (!card) return { ok: false, error: 'Carte introuvable dans votre main' };

    // Check play constraints
    const constraints = mission.getPlayConstraints(player, player.hand);
    if (constraints.type === 'restricted' && !constraints.allowedCardIds.includes(cardId)) {
      return { ok: false, error: 'Cette carte ne peut pas être jouée (contrainte de mission)' };
    }

    // Handle joker
    let effectiveValue: number;
    if (card.isJoker) {
      if (jokerDeclaredValue === undefined || jokerDeclaredValue < 0 || jokerDeclaredValue > 56) {
        return { ok: false, error: 'Valeur du joker invalide (0-56)' };
      }
      effectiveValue = mission.modifyEffectiveValue(jokerDeclaredValue, true);
    } else {
      effectiveValue = mission.modifyEffectiveValue(card.value, false);
    }

    const play: PlayedCard = {
      playerId,
      card,
      effectiveValue,
      jokerDeclaredValue: card.isJoker ? jokerDeclaredValue : undefined,
    };

    // Remove card from hand
    player.hand = player.hand.filter((c) => c.id !== cardId);

    this.currentTrick.plays.push(play);
    this.emit({ type: 'cardPlayed', playerId, play });

    // Check if all players have played
    if (this.currentTrick.plays.length === this.players.length) {
      this.resolveTrick();
    } else if (!isSimultaneous) {
      // Move to next player
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      this.emit({ type: 'turnChanged', currentPlayerIndex: this.currentPlayerIndex });
      this.triggerBotActionIfNeeded();
    }

    return { ok: true };
  }

  private resolveTrick(): void {
    this.stateMachine.transition('TRICK_RESOLUTION' as GamePhase);

    const winnerPlay = this.trickResolver.resolve(this.currentTrick.plays);
    this.currentTrick.winnerId = winnerPlay.playerId;

    const winner = this.getPlayer(winnerPlay.playerId)!;
    winner.tricksWon++;

    this.emit({ type: 'trickWon', winnerId: winnerPlay.playerId, trick: { ...this.currentTrick } });

    // Mission on-trick-won effects
    const modifications = this.currentMission!.onTrickWon(
      winnerPlay.playerId,
      this.currentTrick.plays,
      this.currentTrick.trickNumber,
      this.totalTricksThisRound,
      this.players
    );

    for (const mod of modifications) {
      if (mod.type === 'addPili') {
        const current = this.roundMissionPilis.get(mod.playerId) ?? 0;
        this.roundMissionPilis.set(mod.playerId, current + (mod.amount ?? 1));
      }
    }

    // Handle card exchange mission
    if (this.currentMission!.requiresExchangeOnWin() && winner.hand.length > 0) {
      this.emit({ type: 'exchangeRequired', winnerId: winner.id });
      // Wait for exchange actions
      if (winner.isBot) {
        const bot = this.bots.get(winner.id);
        if (bot) {
          setTimeout(() => {
            const target = this.players.find((p) => p.id !== winner.id && p.hand.length > 0);
            if (target) {
              const cardToGive = winner.hand[winner.hand.length - 1]; // Bot gives worst card
              this.submitExchange(winner.id, cardToGive.id, target.id);
            } else {
              this.afterTrickResolution();
            }
          }, 1000);
        }
      }
      return;
    }

    this.afterTrickResolution();
  }

  submitExchange(
    playerId: string,
    cardId: string,
    targetPlayerId: string
  ): { ok: boolean; error?: string } {
    const player = this.getPlayer(playerId);
    const target = this.getPlayer(targetPlayerId);
    if (!player || !target) return { ok: false, error: 'Joueur introuvable' };

    const card = player.hand.find((c) => c.id === cardId);
    if (!card) return { ok: false, error: 'Carte introuvable' };

    this.pendingExchanges.set(playerId, { cardId, targetPlayerId });

    // If both sides have submitted (or if only winner submits and target auto-gives)
    // For simplicity: winner picks card to give and target, target gives their worst card
    // In a full implementation, both would choose. For now, target auto-gives lowest.
    const targetCard = target.hand.sort((a, b) => a.value - b.value)[0];
    if (!targetCard) {
      this.afterTrickResolution();
      return { ok: true };
    }

    // Execute swap
    player.hand = player.hand.filter((c) => c.id !== card.id);
    target.hand = target.hand.filter((c) => c.id !== targetCard.id);
    player.hand.push(targetCard);
    target.hand.push(card);

    this.emit({ type: 'handUpdate', playerId: player.id, hand: player.hand });
    this.emit({ type: 'handUpdate', playerId: target.id, hand: target.hand });

    this.afterTrickResolution();
    return { ok: true };
  }

  private afterTrickResolution(): void {
    this.previousTricks.push({ ...this.currentTrick });

    // Set next leader to trick winner
    const winnerId = this.currentTrick.winnerId!;
    this.currentPlayerIndex = this.players.findIndex((p) => p.id === winnerId);

    // Check if more tricks to play
    if (this.previousTricks.length < this.totalTricksThisRound) {
      this.stateMachine.transition('TRICK_PLAY' as GamePhase);
      this.currentTrick = {
        plays: [],
        winnerId: null,
        trickNumber: this.previousTricks.length + 1,
      };

      this.emit({ type: 'phaseChanged', phase: 'TRICK_PLAY' as GamePhase });
      this.emit({ type: 'turnChanged', currentPlayerIndex: this.currentPlayerIndex });

      if (this.currentMission!.isSimultaneous()) {
        for (const player of this.players) {
          if (player.isBot) {
            const bot = this.bots.get(player.id);
            if (bot) {
              setTimeout(() => {
                const card = bot.decideCardToPlay(player.hand, this.currentTrick, this.currentMission!);
                this.playCard(player.id, card.id);
              }, bot.getThinkDelay());
            }
          }
        }
      } else {
        this.triggerBotActionIfNeeded();
      }
    } else {
      this.endRound();
    }
  }

  // ============================================================
  // Round End & Scoring
  // ============================================================

  private endRound(): void {
    this.stateMachine.transition('ROUND_SCORING' as GamePhase);

    // Get mission end-of-round modifications
    const missionMods = this.currentMission!.onRoundEnd(this.players);

    // Add per-trick mission pilis
    for (const [playerId, extraPilis] of this.roundMissionPilis) {
      missionMods.push({
        playerId,
        extraPilis,
        removedPilis: 0,
        reason: 'Pénalités de mission pendant la manche',
      });
    }

    const scoring = this.scoringEngine.calculateRoundScoring(this.players, missionMods);
    this.scoringEngine.applyScoring(this.players, scoring);

    this.emit({ type: 'roundScoring', data: scoring });

    // Check game over
    this.stateMachine.transition('ROUND_END' as GamePhase);

    if (this.scoringEngine.isGameOver(this.players, this.settings.piliLimit)) {
      this.stateMachine.transition('GAME_OVER' as GamePhase);
      const standings = this.scoringEngine.getFinalStandings(this.players);
      const eliminatedId = this.scoringEngine.getEliminatedPlayerId(
        this.players,
        this.settings.piliLimit
      )!;
      this.emit({ type: 'gameOver', finalStandings: standings, eliminatedId });
    } else {
      const scores = this.scoringEngine.getFinalStandings(this.players);
      this.emit({ type: 'roundEnd', scores });

      // Advance dealer
      this.dealerIndex = (this.dealerIndex + 1) % this.players.length;

      // Auto start next round after a delay
      setTimeout(() => {
        if (this.stateMachine.phase === ('ROUND_END' as GamePhase)) {
          this.stateMachine.transition('ROUND_START' as GamePhase);
          this.startRound();
        }
      }, 5000);
    }
  }

  // ============================================================
  // Bot Actions
  // ============================================================

  private triggerBotActionIfNeeded(): void {
    const currentPlayer = this.players[this.currentPlayerIndex];
    if (!currentPlayer?.isBot) return;

    const bot = this.bots.get(currentPlayer.id);
    if (!bot) return;

    const phase = this.stateMachine.phase;

    setTimeout(() => {
      if (phase === ('BETTING' as GamePhase)) {
        const context: BetContext = {
          playerIndex: this.getBettingOrderIndex(currentPlayer.id),
          playerCount: this.players.length,
          totalCards: this.totalTricksThisRound,
          previousBets: this.players.map((p) => p.bet),
          hand: currentPlayer.hand,
        };
        const bet = bot.decideBet(currentPlayer.hand, this.currentMission!, context, this.betValidator);
        this.placeBet(currentPlayer.id, bet);
      } else if (phase === ('TRICK_PLAY' as GamePhase)) {
        const card = bot.decideCardToPlay(currentPlayer.hand, this.currentTrick, this.currentMission!);
        const jokerValue = card.isJoker ? bot.decideJokerValue(this.currentMission!) : undefined;
        this.playCard(currentPlayer.id, card.id, jokerValue);
      }
    }, bot.getThinkDelay());
  }

  private triggerBotPassIfNeeded(count: number): void {
    for (const player of this.players) {
      if (player.isBot) {
        const bot = this.bots.get(player.id);
        if (bot) {
          setTimeout(() => {
            const cardsToPass = bot.decideCardsToPass(player.hand, count);
            this.submitPassCards(player.id, cardsToPass.map((c) => c.id));
          }, bot.getThinkDelay());
        }
      }
    }
  }

  private triggerBotDesignateIfNeeded(): void {
    for (const player of this.players) {
      if (player.isBot) {
        const bot = this.bots.get(player.id);
        if (bot) {
          setTimeout(() => {
            const others = this.players.filter((p) => p.id !== player.id);
            const target = others[Math.floor(Math.random() * others.length)];
            this.submitDesignation(player.id, target.id);
          }, bot.getThinkDelay());
        }
      }
    }
  }

  // ============================================================
  // Client State Projection
  // ============================================================

  getClientState(forPlayerId: string): ClientGameState {
    const mission = this.currentMission;
    const visibility = mission?.getVisibility() ?? { canSeeOwnCards: true, canSeeOthersCards: false };
    const isPeekPhaseOver =
      mission?.getPeekDurationMs() &&
      this.stateMachine.phase !== ('PRE_BET_MISSION' as GamePhase) &&
      this.stateMachine.phase !== ('DEALING' as GamePhase);

    const clientPlayers: ClientPlayer[] = this.players.map((p) => {
      const isMe = p.id === forPlayerId;
      let visibleHand: Card[] | undefined;

      if (visibility.canSeeOthersCards && !isMe) {
        visibleHand = p.hand;
      }

      return {
        id: p.id,
        name: p.name,
        isBot: p.isBot,
        isConnected: p.isConnected,
        isReady: p.isReady,
        cardCount: p.hand.length,
        bet: p.bet,
        tricksWon: p.tricksWon,
        pilis: p.pilis,
        seatIndex: p.seatIndex,
        visibleHand,
      };
    });

    const me = this.players.find((p) => p.id === forPlayerId);
    let myHand: Card[] = me?.hand ?? [];

    // If peek mission and peek is over, hide own cards
    if (isPeekPhaseOver && !visibility.canSeeOwnCards) {
      myHand = myHand.map((c) => ({ ...c, value: -1 })); // Hidden marker
    }

    // Indian poker: during betting, player can't see own cards
    if (
      mission?.type === 'indianPoker' &&
      (this.stateMachine.phase === ('BETTING' as GamePhase) ||
        this.stateMachine.phase === ('PRE_BET_MISSION' as GamePhase))
    ) {
      myHand = myHand.map((c) => ({ ...c, value: -1 }));
    }

    return {
      phase: this.stateMachine.phase,
      roomCode: this.roomCode,
      players: clientPlayers,
      myPlayerId: forPlayerId,
      myHand,
      currentRound: this.currentRound,
      currentTrick: this.currentTrick,
      previousTricks: this.previousTricks,
      currentMission: mission?.toCardDef() ?? null,
      currentPlayerIndex: this.currentPlayerIndex,
      dealerIndex: this.dealerIndex,
      totalTricksThisRound: this.totalTricksThisRound,
      missionState: this.missionState,
    };
  }

  // ============================================================
  // Connection Management
  // ============================================================

  setPlayerConnected(playerId: string, connected: boolean): void {
    const player = this.getPlayer(playerId);
    if (player) {
      player.isConnected = connected;
    }
  }

  getPhase(): GamePhase {
    return this.stateMachine.phase;
  }
}
