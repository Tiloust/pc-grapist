@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 goto missing
where npm >nul 2>&1
if errorlevel 1 goto missing
if exist "node_modules\.bin\electron.cmd" goto launch
echo Installation des dependances gratuites. Internet est necessaire.
call npm install
if errorlevel 1 goto failed
:launch
call npm start
if errorlevel 1 goto failed
exit /b 0
:missing
echo Installe Node.js LTS depuis https://nodejs.org puis relance ce fichier.
pause
exit /b 1
:failed
echo Echec. Copie le message d'erreur affiche au-dessus.
pause
exit /b 1
