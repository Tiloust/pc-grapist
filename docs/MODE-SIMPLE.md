# Mode simple

La page principale ne demande plus de nom de jeu, resolution, FPS, budget ou modele de composant obligatoire. Seuls le consentement et le choix du mode observation normale / pendant le jeu sont utilises pour commencer. La configuration est lue apres clic et consentement, pas en silence au demarrage.

Les donnees absentes restent null, notamment jeu, reglages, objectif FPS et budget. Le type reste non precise par defaut. La limite FPS/VSync est inconnue par defaut : les hypotheses CPU/GPU sont bloquees tant qu'elle n'est pas renseignee comme desactivee. Le choix pendant le jeu est une declaration, pas une detection de processus.

Les options techniques, alimentation et boitier sont repliees. Les donnees de diagnostic NVIDIA absentes ne sont plus affichees comme une erreur sur un PC AMD/Intel : le message principal explique la couverture manquante. Les donnees brutes restent consultables et exportees. Cette modification ne change PAS le backend : pas de nouveau support AMD/Intel ni de collecteur natif de temperatures dans ce lot.

Aucune configuration LibreHardwareMonitor requise pour lancer le parcours simple ; son ancien connecteur est optionnel et desactive par defaut. Les temperatures peuvent donc rester indisponibles. Le dossier unifie et les anciennes pages sont conserves. L'analyse ne sait toujours pas identifier le jeu ou ses FPS automatiquement.

Non teste dans Electron/Windows par l'assistant. Verifier : consentement obligatoire, lancement sans autre saisie, inventaire refuse, AMD sans NVIDIA, mode bureau sans recommandation gaming, options FPS inconnues, export null, seconde session et navigation.
