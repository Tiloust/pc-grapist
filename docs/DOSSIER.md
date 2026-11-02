# Dossier unifie - schema 2

La page Jeux et performances relie desormais un instantane de l'inventaire Windows a chaque nouvelle session. La lecture est tentee avant chaque capture, apres consentement. Une lecture refusee ou partielle n'est pas inventee : le dossier conserve null ou les avertissements Windows. Les informations PSU et boitier sont seulement declarees, jamais marquees comme detectees.

Le rapport et l'export JSON schemaVersion 2 reunissent inventory, context, samples, session, coverage, advice et limitations. Le scan et les sessions precedentes ne sont pas charges automatiquement : tout reste temporairement en memoire jusqu'a export volontaire. Une nouvelle session remplace le dossier courant apres confirmation. Relire l'export avant de le partager. Le formulaire manuel historique reste independant ; les objectifs de ce dossier sont ceux de la page Jeux et performances.

L'inventaire est fige au debut de session. Un scan ulterieur ne change pas retroactivement le rapport exporte. Les modeles CPU/GPU sont cites, mais pas compares a des benchmarks. canValidatePurchase reste false meme si les champs detectes sont remplis. La couverture n'est pas un score de sante.

Corrections : premier intervalle CPU ignore pour chaque session ; condition CPU/GPU evaluee sur les memes echantillons ; minimum 10 valeurs valides, couverture 80 % et condition satisfaite dans 70 % de celles-ci. Seuils exploratoires, pas preuves d'un bottleneck. Les mesures ne sont pas simultanees au niveau materiel : chaque collecteur a sa latence ; seule l'appartenance au meme echantillon est garantie.

Tests fournis : node --test desktop/advisor.test.cjs desktop/dossier.test.cjs. Non executes par l'assistant. Integration Windows non executee. Verifier : scan refuse, session terminee sans mesures, seconde session apres inactivite, export, champs absents, relecture d'un ancien dossier, changement de configuration.

Toujours non inclus : FPS automatiques, processus du jeu, catalogue/prix/compatibilite, verification des capteurs externes et import/reouverture des dossiers exportes.
