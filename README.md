# SWIPEKING - Spécifications de l'application

## Présentation

SWIPEKING est une application web de jeu basée sur un prototype HTML/CSS/JavaScript.
Le jeu propose un écran d'accueil, un écran de jeu et un écran de classement, avec des données stockées et lues via Firebase.

url - https://slebrethon.github.io/repo_swipeking/

## Pages principales

### `index.html`

- Écran d'accueil du jeu.
- Boutons : `start` (redirige vers `game.html`) et `ranking` (redirige vers `ranking.html`).
- Affiche des statistiques en direct :
  - `Active Rope` (nombre de documents dans la collection `rooms_1v1`)
  - `Swipe King` (visites globales de `stats/global`)
  - `Rope Solo` (visites globales de `statsropesolo/global`)
- Contient un lien Discord pour des alertes.
- Rafraîchit les statistiques toutes les 5 secondes.

### `game.html`

- Écran de jeu principal.
- Structure visuelle : compteur, titre, sous-titre, distance, timer, bonus, arena et corde.
- Charge un script externe `dist/js/js_game.js` pour la logique de jeu.
- Déclare des utilitaires Firebase côté client :
  - `saveScore(name, score)` : enregistre un score dans la collection `scores`.
  - `getScores()` : récupère le Top 10 des scores `scores`.
  - `incrementVisits()` : incrémente le compteur `stats/global.visits`.
- Gestion de score :
  - Limite de score acceptée entre 0 et 50000.
  - Après insertion de score, supprime les documents au-delà du Top 10.

### `ranking.html`

- Écran de classement.
- Affiche deux tableaux Top 10 :
  - `Swipe Top 10` : top 10 des scores `scores` triés par `score` descendant.
  - `Rope Top 10` : top 10 des temps `scoresropesolo` triés par `time` croissant.
- Inclut un bouton `back` vers `index.html`.
- Rafraîchit les classements et les statistiques toutes les 5 secondes.

## Style

- `style.css` importe :
  - `dist/css/bootstrap.css`
  - `dist/css/font_fontawesome.css`
  - `dist/css/font_googleemls.css`
  - `dist/css/custom_style.css`
- Force `body` à avoir un fond blanc.

## Intégration Firebase

- Même configuration Firebase utilisée dans toutes les pages :
  - `apiKey`: `AIzaSyB6z3ajkXJr7NIj7PmAkREA9uieAttGyk0`
  - `authDomain`: `swipe-king-6f95b.firebaseapp.com`
  - `projectId`: `swipe-king-6f95b`
  - `storageBucket`: `swipe-king-6f95b.firebasestorage.app`
  - `messagingSenderId`: `149048703091`
  - `appId`: `1:149048703091:web:8bd7b61d44648fd4a7d206`
- Authentification : anonymous sign-in `signInAnonymously`.

## Collections Firestore utilisées

### `rooms_1v1`

- Utilisée pour calculer le nombre de `Active Rope` sur l'écran d'accueil.

### `stats/global`

- Stocke le compteur de visites pour `Swipe King`.
- Utilisé sur `index.html`, `game.html` et `ranking.html`.

### `statsropesolo/global`

- Stocke le compteur de visites pour `Rope Solo`.
- Utilisé sur `index.html` et `ranking.html`.

### `scores`

- Stocke les scores de type Swipe King.
- Documents contiennent : `uid`, `name`, `score`, `date`.
- `ranking.html` affiche le Top 10.

### `scoresropesolo`

- Stocke les scores de type Rope Solo.
- Documents attendent une propriété `time` pour le classement.
- `ranking.html` en fait le tri pour présenter les 10 meilleurs temps.

## Comportement côté client

- Tous les scripts Firebase sont chargés en module depuis `https://www.gstatic.com/firebasejs/12.12.1/`.
- `index.html` et `ranking.html` utilisent `getDocs`, `getDoc`, `query`, `orderBy`, `limit`.
- `game.html` utilise aussi `addDoc`, `updateDoc`, `increment`, `setDoc`, `deleteDoc`.

## Notes importantes

- Le projet repose sur la présence du dossier `dist/` contenant Bootstrap, FontAwesome, la police Google et un fichier JavaScript `js_game.js`.
- L’application est construite comme un prototype web statique avec des intégrations Firebase côté client.
- Les données de score sont partagées en clair avec Firebase : validation minimale côté client.

## Accès REPO

- lancez l'agent : eval "$(ssh-agent -s)"
- activer l'agent : ssh-add ~/.ssh/nom_cle_privee
