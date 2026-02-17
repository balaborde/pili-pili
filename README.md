# 🌶️ PiliPili - Jeu de Cartes en Ligne

Jeu de plis avec paris et missions. Version web multijoueur temps réel avec IA.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Socket.io](https://img.shields.io/badge/Socket.io-4-green)

## 🎮 Caractéristiques

- **Multijoueur temps réel** : 2-8 joueurs via WebSocket (Socket.io)
- **Bots IA intelligents** : 3 niveaux de difficulté avec stratégies avancées
- **17 missions** : Règles changeantes à chaque manche
- **Design premium** : Thème piment/épices avec animations Framer Motion
- **Remplacement automatique** : Les joueurs déconnectés sont remplacés par des bots
- **Protection anti-rejoin** : Impossible de rejoindre une partie en cours
- **Responsive** : Jouable sur desktop et mobile

## 🎯 Règles du Jeu

### Objectif
Avoir le **moins de Pilis** (pénalités) possible. Le jeu se termine quand un joueur atteint 6 Pilis.

### Déroulement
1. Une **carte Mission** est révélée → détermine le nombre de cartes et les règles spéciales
2. Les cartes sont distribuées
3. Chaque joueur **parie** combien de plis il va gagner
4. Les plis sont joués (carte la plus forte gagne)
5. **Scoring** : 1 Pili par écart entre pari et plis réels

### Les Cartes
- 55 cartes numérotées (1-55)
- 1 Joker (valeur déclarée 0-56 quand joué)
- Pas de couleurs, juste des nombres

### Contraintes
- **Dernier parieur** : ne peut pas faire un pari tel que la somme = nombre de cartes
- **Missions** : modifient les règles (pari aveugle, échange de cartes, valeurs inversées...)

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

Le jeu sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Stack Technique
- **Frontend** : Next.js 15 (App Router) + React 19 + TypeScript
- **Styling** : Tailwind CSS 4 + Framer Motion
- **Backend** : Serveur Node.js custom avec Socket.io
- **State Management** : Zustand
- **Real-time** : Socket.io (WebSocket + fallback polling)

### Structure

```
pili-pili/
├── server/              # Serveur Node.js + Socket.io
│   ├── Game.ts         # Moteur de jeu principal (800+ lignes, IA avancée)
│   ├── Room.ts         # Gestion des salons et joueurs
│   ├── Deck.ts         # Gestion du paquet de cartes
│   ├── missions/       # 17 missions avec règles spéciales
│   ├── socket/         # Handlers Socket.io (lobby, game, disconnect)
│   └── store/          # RoomStore et GameStore (état en mémoire)
├── src/
│   ├── app/            # Pages Next.js (App Router)
│   ├── components/     # Composants React (GameView, cartes, animations)
│   ├── hooks/          # Hooks Socket.io et game
│   ├── stores/         # Stores Zustand (player, room, game)
│   └── types/          # Types TypeScript partagés
```

### Principe Clé
Le **serveur est la source de vérité unique**. Le client envoie des intentions ("je parie 3", "je joue la carte 42"), le serveur valide, exécute et broadcast le nouvel état.

### Gestion de la Déconnexion
- **En lobby** : Le joueur déconnecté est retiré de la room
- **En partie** : Le joueur est automatiquement remplacé par un bot de difficulté moyenne
- **Nettoyage** : Les rooms vides sont automatiquement supprimées

## 🎴 Les 17 Missions

| # | Mission | Description |
|---|---------|-------------|
| 1 | Passer X cartes | Passer 1-2 cartes à gauche/droite après paris |
| 2 | Passer toutes les cartes | Donner toute sa main au voisin |
| 3 | Pari interdit | Interdit de parier 0 ou 1 |
| 4 | Poker indien | Cartes sur le front, on voit celles des autres |
| 5 | Carte bonus | Piocher 1 carte supplémentaire après paris |
| 6 | Cartes visibles | Tous jouent cartes face visible |
| 7 | Peek 5 secondes | 5s pour mémoriser, puis jeu à l'aveugle |
| 8 | Pas de copie | Interdit de copier le pari précédent |
| 9 | Désigner un joueur | On reçoit ses Pilis + ceux du désigné |
| 10 | Plus haute/basse | Obligation de jouer carte max ou min |
| 11 | Numéros pénalité | Gagner un pli avec certains numéros = +1 Pili |
| 12 | Échange sur victoire | Gagner un pli → échanger 1 carte |
| 13 | Récompense pari réussi ⭐ | Pari correct → défausser X Pilis |
| 14 | Valeurs inversées ⭐ | 55 = faible, 1 = fort |
| 15 | Jeu simultané ⭐ | Tous jouent en même temps |
| 16 | Peek 3 secondes ⭐ | 3s pour mémoriser (Expert) |
| 17 | 1er/dernier pli ⭐ | Gagner 1er ou dernier = +1 Pili |

⭐ = Mission Expert

## 🤖 IA des Bots

Les bots sont progressivement plus intelligents, avec des stratégies distinctes :

### 🌱 Facile
- **Paris** : Estimation par force de main + aléatoire (±1 pli)
- **Jeu** : Logique basique — joue haut si besoin de plis, bas sinon
- **Joker** : Déclaré selon besoin (56 si veut gagner, 0 sinon)

### 🔥 Moyen
- **Paris** : Analyse de main + ajustement selon les paris adverses
- **Jeu** : Gestion de position — économise les meilleures cartes, dump des cartes dangereuses
- **Cartes à passer** : Défausse des cartes faibles
- **Joker** : Utilisé tactiquement selon la situation

### 💀 Expert
- **Paris** : Comptage précis par carte avec classification "sûr/probable", joker considéré comme hedge
- **Jeu avancé** :
  - **Position awareness** : Dernier à jouer = victoire précise avec la plus petite carte gagnante
  - **Sabotage** : Évite de gagner quand au-dessus du pari, force les autres à gagner
  - **Card dumping** : Se débarrasse des cartes "moyennes" imprévisibles (garde les extrêmes)
  - **Joker tactique** : Sauvé si une carte normale peut gagner, sinon utilisé comme arme
- **Désignation de victime** : Cible le leader (moins de Pilis) pour l'empêcher de gagner
- **Cartes à passer** : Défausse des cartes mid-range difficiles à contrôler

## 📝 Scripts

```bash
npm run dev      # Démarrer en mode développement
npm run build    # Build de production
npm run start    # Lancer en production
npm run lint     # ESLint
```

## 🎨 Design

### Palette Thème Piment
- Background : `#1a0a0a` (brun-noir)
- Accents : `#e63946` (rouge piment), `#f4845f` (orange), `#f4a261` (or)
- Pili token : `#c1121f` (rouge poivron)

### Animations
- **Cartes** : Distribution fluide, jeu en éventail avec rotation, collection des plis
- **Pili** : Rebond + shake quand reçu
- **Tracker de pari** : Affichage dynamique avec code couleur (vert = exact, rouge = dépassé)
- **Transitions** : Framer Motion pour tous les états de jeu

## 🐛 Debugging

### Logs serveur
Les logs Socket.io et GameEngine s'affichent dans la console du serveur.

### Vérifier Socket.io
```bash
curl "http://localhost:3000/socket.io/?EIO=4&transport=polling"
# Doit retourner un JSON avec sid, upgrades, etc.
```

### États de la machine
Les phases du jeu : `LOBBY → ROUND_START → MISSION_REVEAL → DEALING → BETTING → TRICK_PLAY → ROUND_SCORING → ROUND_END`

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 🙏 Crédits

- Jeu original : **PiliPili** par ATM Gaming
- Développement web : Implémentation Next.js + Socket.io

---

**Bon jeu !** 🌶️
