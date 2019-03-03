# Site web Autonomens

## Structure

La branche `source` est la branche principale de travail.

La branche `master`est réservée au déploiement, et **ne doit pas**
_théoriquement_ être modifiée directement.

## Developpment

Utilisez la commande :

    npm run start

## Déploiement vers autonomens.github.io

Une fois les modifications appliquée dans la branche `source`, utiliser la
commande **`npm run deploy`**.  
Celle-ci va enchainer les actions suivantes :

- `npm run clean`  
  _Vide le cache des précédents builds._
- `gatsby build`  
  _Génère la version statique du site à partir de la branche actuelle._
- `gh-pages deploy`  
  _Crée un nouveau commit sur la branche `master`, contenant la version
  compilée, et pousse la branche master vers le dépôt distant._

## Déploiement vers autonomens.netlify.com

Ce déploiement est automatique chaque fois que la branche `source` est mise à
jour, indépendemment du contenu de a branche `master`.
