# Node.js via Express framework

## installation
```
yarn install
```

changer .env.exemple en .env

## utilisation
Dans le terminal à la racine du projet
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

## modules
checkBody, permet de vérifier si un ou plusieurs champs sont remplis pour les req.body par exemple
Ajouter cette ligne au début de votre fichier
```
const { checkBody } = require('@modules/checkBody');
```
Voici un exemple d'utilisation
```
// vérifie si les champs sont remplis
if(!checkBody(req.body, ['titre', 'code_postal', 'ville', 'description', 'token' ])) return res.json({ result: false, error: 'Champs vide(s) ou manquant(s)' })
```

checkIdFormat, permet de vérifier si l'id est au bon format pour mongoose
Ajouter cette ligne au début de votre fichier
```
const { checkIdFormat } = require('@modules/checkIdFormat')
```
Voici un exemple d'utilisation
```
// vérifier si l'id est au bon format
if(!checkIdFormat(id)) return res.json({ result: false, error: 'ID d\'annonce invalide' })
```

cleanSpace, permet de retire les espaces avant et après dans un champ, à la reception des données
Ajouter cette ligne au début de votre fichier
```
const { cleanSpace } = require('@modules/cleanSpace')
```
Voici un exemple d'utilisation
```
// cela retire les espaces avant et après dans un champ à la reception des données
const cleanClasseList = { titre, adresse, code_postal, ville }

for (const i in cleanClasseList) {
  const cleanedField = cleanSpace(cleanClasseList[i])

  if(cleanedField !== null) champs[i] = cleanedField
}
```

isValidEmail, permet de verifier si une adresse mail utilisée est vailde, en vérifiant si elle suit le format typique d'une adresse e-mail, y compris la partie avant le caractère @, le caractère @ lui-même et la partie après le caractère @
```
const { isValidEmail } = require('@modules/emailValidator');
```
Voici un exemple d'utilisation
```
//Vérifier si l'adresse e-mail est valide

if (!isValidEmail(email)) {
return res.json({ result: false, error: 'Adresse e-mail invalide' });
};
```
isStrongPassword,  permet de vérifiez si le mot de passe est très fort, Le mot de passe doit comporter au moins 8 caractères, dont au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial (@$!%*?&)
```
const { isStrongPassword } = require('@modules/passwordValidator');
```
Voici un exemple d'utilisation
```
// Vérifiez si le mot de passe est très fort
if (!isStrongPassword(mot_de_passe)) {
res.json({ result: false, error: 'Le mot de passe doit comporter au moins 8 caractères, dont au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial (@$!%*?&)' });
return;
  };
```
sendResetPasswordEmail, permet d'envoyer le jeton de réinitialisation à l'adresse e-mail de l'utilisateur
```
const { sendResetPasswordEmail } = require('@modules/sendResetPasswordEmail');
```
Voici un exemple d'utilisation
```
// Envoyer le jeton de réinitialisation à l'adresse e-mail de l'utilisateur
sendResetPasswordEmail(email, resetToken);
res.json({ result: true, message: 'Instructions de réinitialisation de mot de passe envoyées à votre adresse e-mail' });
```