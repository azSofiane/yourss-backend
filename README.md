# Node.js via Express framework

## installation
```
npm i
```
ou
```
yarn install
```

changer .env.exemple en .env

## utilisation
Dans le terminal à la racine du projet (par défaut pour le start nodemon)
```
npm run start
```
ou
```
yarn start
```

## utiles
Déjà installé
```
dotenv
cors
mongoose
uid2
bcrypt
```

Pour les chemins il est possible
```
@ // dosier racine
@models // dossier models
@modules // dossier modules
@routes // dossier routes
```

exemple: au lieu de
```
const { checkBody } = require('../modules/checkBody')
```
faire
```
const { checkBody } = require('@modules/checkBody')
```

