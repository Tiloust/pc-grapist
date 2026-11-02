# Utiliser PC GRAPIST sans téléchargements répétés

## Activation unique
1. Dans le dépôt GitHub, ouvrir Settings > Pages.
2. Sous Build and deployment, choisir Source : GitHub Actions.
3. Dans Actions, ouvrir Publier PC GRAPIST puis Run workflow sur main. Si un premier lancement a échoué avant l'activation de Pages, relancer ce workflow.
4. Attendre la réussite de la publication. Le lien confirmé apparaît dans Settings > Pages et dans l'environnement github-pages.

Adresse attendue après publication réussie : https://tiloust.github.io/pc-grapist/
Ce document ne garantit pas que le site est déjà activé ou déployé.

## Mises à jour
Chaque push sur main relance la publication. Après la réussite du workflow, ouvrir le même lien ou recharger la page. Si l'ancienne version reste affichée, effectuer un rechargement forcé (Ctrl+F5 sous Windows). Aucune archive à télécharger et aucune installation nécessaire.

## Coûts et confidentialité
Le projet utilise GitHub Pages et un runner GitHub Actions standard pour un dépôt public ; aucun hébergeur payant, nom de domaine acheté, API ou service tiers supplémentaire n'est requis. Les conditions et limites de GitHub continuent de s'appliquer. Ne pas activer de runner payant.
Le site est public, mais le formulaire actuel n'envoie pas la configuration du PC à une API. GitHub reçoit les requêtes HTTP nécessaires pour servir les fichiers. La sauvegarde du navigateur est propre à l'origine du site : une ancienne sauvegarde créée en ouvrant un fichier local n'est pas automatiquement transférée au site.

## Périmètre du déploiement
Le workflow publie uniquement index.html et LICENSE, pas l'ensemble du dépôt. Ajouter explicitement les futurs scripts, styles et catalogues à l'étape de copie lorsqu'ils seront créés. Le contrôle de présence des fichiers n'est pas un test fonctionnel de l'application. Le déploiement ne fournit pas de détection matérielle ni de surveillance en jeu.

## Documentation GitHub
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
