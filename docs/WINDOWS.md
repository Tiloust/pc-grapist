# PC GRAPIST sur Windows

Le dossier GitHub contient le code source, pas un EXE deja construit. Electron reutilise l'interface existante dans une fenetre de bureau. Cela ne rajoute pas de diagnostic materiel automatique. Aucun besoin de GitHub Pages.

## Premiere utilisation
1. Installer Node.js LTS depuis https://nodejs.org (npm inclus). Fermer et rouvrir VS Code s'il etait deja ouvert.
2. Telecharger et EXTRAIRE le ZIP GitHub, ou cloner le depot avec Git. Ne pas lancer les scripts depuis l'archive ZIP.
3. Double-cliquer LANCER.bat. Au premier lancement, les dependances sont telechargees. Internet et de l'espace disque sont necessaires. Les lancements suivants reutilisent ces dependances.

## Depuis VS Code
Fichier > Ouvrir un dossier : choisir le dossier contenant package.json. Dans le terminal PowerShell :

```powershell
npm.cmd install
npm.cmd start
```

Ou utiliser Terminal > Executer la tache > PC GRAPIST : lancer.

## Creer le programme portable
Sur Windows x64, double-cliquer CREER-EXE.bat, ou executer :

```powershell
npm.cmd install
npm.cmd run build:win
```

Le resultat attendu est dist/PC-GRAPIST-0.1.0-x64.exe. Il contient l'application et son moteur Electron : Node.js et VS Code ne sont pas requis pour l'utiliser ensuite. La construction peut telecharger des outils supplementaires. Le fichier n'est pas signe ; Windows peut afficher un avertissement. Ne pas desactiver les protections pour contourner un blocage : verifier la provenance et relever le message. Aucun certificat payant n'est impose.

## Recuperer les mises a jour sans ZIP
Installer Git si necessaire. Une seule fois, dans un dossier parent choisi :

```powershell
git clone https://github.com/Tiloust/pc-grapist.git
cd pc-grapist
npm.cmd install
npm.cmd start
```

Ensuite, fermer l'application et, dans ce meme dossier :

```powershell
git pull --ff-only
npm.cmd install
npm.cmd start
```

En cas d'erreur Git, arreter et lire le message : ne pas ecraser les modifications locales. Pour mettre a jour un EXE deja construit, refaire la construction. Il n'y a pas d'auto-update dans cette version.

## Limites et securite
Electron est plus volumineux qu'une simple page web. L'interface n'a pas acces directement a Node.js : isolation et sandbox activees. Aucun serveur, compte ou API payante n'est requis. Les dependances tierces restent a maintenir ; conserver package-lock.json genere par npm. Ne pas committer node_modules ni dist.

Les sauvegardes du navigateur et celles de l'application Electron sont distinctes. La version portable peut conserver ses preferences dans le profil utilisateur Windows ; portable ne signifie pas absence de fichiers locaux.

Cette integration n'a pas encore ete executee ni construite sous Windows par l'assistant. Le succes d'une ecriture GitHub ne constitue pas un test de fonctionnement.
