# PC GRAPIST

Prototype gratuit et open source, sous licence MIT, pour préparer un diagnostic de PC gaming.

## Démarrer
Télécharger le dépôt puis ouvrir `index.html` dans un navigateur récent. Aucun compte, serveur, abonnement, installation ou clé API nécessaire. Le prototype ne charge aucune ressource externe.

## Fonctions
- Saisie manuelle de la configuration, du budget et des objectifs.
- Rapport de vérifications non diagnostique : aucune estimation de FPS inventée.
- Sauvegarde facultative dans le navigateur, suppression et export JSON.

Les données restent sur cet appareil tant que vous ne partagez pas un export. La persistance du stockage pour une page ouverte en fichier local dépend du navigateur ; conservez un export.

## Limites
Pas de détection matérielle automatique, de télémétrie en jeu, de catalogue de composants ou de validation de compatibilité dans cette version. Les noms de composants sont du texte libre et ne servent pas à déduire leurs performances. Le rapport organise des vérifications, il ne détermine pas le composant responsable d'un problème. Aucun gain de performances n'est promis.

## Suite
Tests du moteur, import de mesures documentées, catalogue sourcé puis collecte Windows facultative.

## Vérification manuelle
1. Ouvrir index.html et remplir les champs obligatoires.
2. Générer le rapport : vérifier les limites et les informations manquantes.
3. Sauvegarder, recharger et vérifier les valeurs (si le navigateur autorise le stockage local).
4. Exporter et ouvrir le JSON.
5. Effacer la saisie et la sauvegarde.

Ce prototype n'a pas encore été testé dans un navigateur par son auteur automatisé.
