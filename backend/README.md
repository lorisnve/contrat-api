# Backend du classement

API Express/TypeScript consommée par le frontend sur `http://localhost:3001/api/v1/leaderboard`.

## Démarrage

Depuis ce dossier :

```powershell
npm install
npm run dev
```

Le token de développement par défaut est `p_9`, identique à la valeur de repli du frontend. Pour utiliser un autre token, définir `PLAYER_TOKEN` dans l’environnement et configurer le frontend avec la même valeur. `CORS_ORIGIN` accepte par défaut `http://localhost:5173`.

En production, `PLAYER_TOKEN` doit être fourni explicitement. Les paramètres `PORT`, `PLAYER_TOKEN` et `CORS_ORIGIN` peuvent être déclarés dans un fichier `.env` local à partir de `.env.example`.

## Endpoint

`GET /api/v1/leaderboard?period=season&page=1&pageSize=50`

L’endpoint exige une authentification Bearer. `period` accepte `season` ou `today`; `page` commence à 1 et `pageSize` est compris entre 1 et 100.

Le contrat de référence est `classement-v1.yaml` : la réponse contient `totalItems` et `totalPages`, l’équipe est un objet ou `null`, et les codes d’erreur sont `BAD_REQUEST`, `INVALID_TOKEN` et `RATE_LIMITED`. `total` et l’enveloppe `error` sont ajoutés pour le frontend existant, qui attend ces propriétés. Les joueurs sans équipe ont `team: null`, ce qui est compatible avec les deux contrats.

Les joueurs sont actuellement fournis par un jeu de données en mémoire aligné sur les données de démonstration existantes du frontend. Ce backend n’enregistre pas les joueurs ni leurs XP : une source de données persistante et les événements de gain d’XP devront être reliés quand le modèle métier sera disponible.

## Vérification et production

```powershell
npm test
npm run build
npm start
```
