# Detection Windows en lecture seule

Lancer l'application Electron avec npm.cmd start, puis cocher l'autorisation et cliquer Analyser mon PC. Le menu permet de revenir au formulaire manuel. Ce dernier n'est pas encore rempli automatiquement par le scan.

Le processus principal execute un script PowerShell fixe via execFile, sans shell ni commande fournie par l'interface, sans elevation ou modification de politique d'execution. Les requetes Get-CimInstance lisent CPU, GPU, RAM, carte mere, BIOS, disques, Windows et pilotes signes. Timeout de 90 secondes et erreurs partielles visibles. Le preload expose deux operations precises ; les messages IPC sont limites a la fenetre principale et a la page materiel locale.

Le consentement est une autorisation dans l'application, pas une demande UAC Windows. Aucun droit administrateur n'est exige par le programme. Les restrictions WMI de certains PC peuvent empecher des lectures ; ne pas contourner automatiquement ces restrictions.

Aucun numero de serie ou identifiant reseau n'est selectionne. Le scan n'effectue pas de requete reseau explicite et ne sauvegarde pas son resultat automatiquement. L'export est volontaire et peut contenir des noms de peripheriques personnels : le relire avant partage. Les liens officiels ouvrent un navigateur sans transmettre l'inventaire.

Les versions de pilotes sont celles rapportees par Windows, pas necessairement le numero commercial NVIDIA/AMD/Intel. DriverDate est une date declaree par le fabricant, pas une preuve d'obsolescence. Aucun catalogue de dernieres versions n'est encore interroge. Aucun pilote n'est installe. Les conseils Windows Update sont un parcours manuel, pas un scan des mises a jour disponibles.

Le scan ne couvre pas tout le materiel : pas d'alimentation, boitier, temperatures, FPS, VRAM fiable ou diagnostic SMART. Les champs vides restent inconnus. L'inventaire BIOS ne permet pas de savoir si une nouvelle version existe.

Integration non executee sous Windows par l'assistant. A verifier avant diffusion : scan normal, refus de consentement, PowerShell bloque, lectures partielles, export JSON, ouverture des quatre sources, passage au formulaire manuel, et construction portable puis scan dans l'EXE. Le workflow Pages ne publie pas cette interface native.

Sources techniques :
https://learn.microsoft.com/en-us/previous-versions/windows/desktop/legacy/aa394354(v=vs.85)
https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-videocontroller
https://electronjs.org/docs/latest/tutorial/ipc
