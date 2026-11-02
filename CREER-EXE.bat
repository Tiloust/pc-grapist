@echo off
setlocal
cd /d "%~dp0"
where npm >nul 2>&1
if errorlevel 1 goto missing
echo Installation ou verification des dependances. Internet est necessaire.
call npm install
if errorlevel 1 goto failed
call npm run build:win
if errorlevel 1 goto failed
echo EXE portable genere dans le dossier dist.
start "" "%~dp0dist"
pause
exit /b 0
:missing
echo Installe Node.js LTS depuis https://nodejs.org puis relance ce fichier.
pause
exit /b 1
:failed
echo Construction echouee. Copie le message d'erreur affiche au-dessus.
pause
exit /b 1
