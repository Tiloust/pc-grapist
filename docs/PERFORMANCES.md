# Jeux et suivi local

Apres mise a jour du depot, lancer npm.cmd start. La nouvelle page est aussi accessible via PC GRAPIST > Jeux et performances. Les pages inventaire et formulaire manuel sont conservees.

Renseigner le jeu, le profil, les reglages, l'objectif, les FPS observes (saisis), le budget et le probleme. Autoriser la collecte, demarrer, jouer activement dans une scene reproductible puis arreter. Refaire une nouvelle session pour chaque jeu ou changement de reglage. Les nouvelles sessions remplacent l'historique precedent ; exporter avant si necessaire. Aucun test de charge n'est lance.

CPU : deltas des temps par processeur logique via Node os.cpus. RAM : memoire physique Windows via Node os. Ce sont des mesures globales, pas attribuees au processus du jeu. GPU : lecture seule de nvidia-smi uniquement s'il est present dans un emplacement systeme prevu. Pas de telechargement, pas de commandes de modification, champs N/A conserves comme absents. Les GPU AMD/Intel ne sont pas mesures par ce backend NVIDIA.

Option LibreHardwareMonitor : lecture HTTP de 127.0.0.1:8085/data.json uniquement, sans URL personnalisable ni redirection. Serveur externe a activer volontairement et a limiter a la boucle locale, sans ouverture pare-feu publique. Les versions ne proposent pas toutes le meme serveur. Capteurs CPU/GPU Temperature/Load/Clock reconnus par identifiant ; le nom de l'ordinateur et les interfaces reseau ne sont pas conserves dans les mesures. Aucune bibliotheque ou pilote tiers n'est embarque. Les donnees du serveur peuvent etre figees ; leur fraicheur n'est pas certifiee.

Historique temporaire : 600 mesures maximum, intervalle cible de 3 secondes apres la fin de chaque requete, delais maximaux cote collecteur. Arret sur erreur ; pas de boucle infinie de tentatives. Le suivi continue quand la fenetre est en arriere-plan pour permettre le jeu, avec un cout CPU non nul. Fermer ou naviguer hors de la page arrete la boucle.

Conseils deterministes et prudents : profil de jeu et symptomes, puis hypotheses de pression RAM / GPU fortement sollicite / piste CPU-logiciel. Minimum 10 mesures et 30 secondes ; seuils exploratoires documentes dans le code. Pas de preuve de bottleneck ou de panne. Pas de priorite GPU/CPU avec VSync/limite declaree, ni attribution automatique en multi-GPU. Les capteurs LHM sont affiches mais pas utilises pour inferer automatiquement une limite thermique. Aucun gain FPS, modele a acheter ou prix invente. Le budget ne sert pas encore a classer un catalogue.

Non inclus : FPS et frametimes automatiques, SMART, consommation fiable universelle, controle des pilotes disponibles, recommandations par benchmarks sources. Les donnees de session ne sont pas encore reliees au formulaire manuel ni a l'inventaire dans le rapport.

Tests unitaires fournis : node --test desktop/advisor.test.cjs. Ces tests et la capture Windows n'ont pas ete executes par l'assistant. A verifier : arret pendant requete, fonctionnement en arriere-plan, donnees absentes, GPU multiple, absence de serveur LHM, export, lancement portable.

Sources : https://docs.nvidia.com/deploy/nvidia-smi/index.html ; https://github.com/LibreHardwareMonitor/LibreHardwareMonitor ; https://learn.microsoft.com/en-us/windows/win32/wmisdk/wmi-tasks--performance-monitoring
