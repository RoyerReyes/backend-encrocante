@echo off
REM Script de Backup Automático para EnCrocante
REM Requiere que el contenedor de Docker se llame 'backend-encrocante-db-1' o similar.
REM Ajustar el nombre del contenedor según 'docker ps'.

set CONTAINER_NAME=backend-encrocante-db-1
set DB_USER=root
set DB_PASS=root
set DB_NAME=encrocante
set TIMESTAMP=%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_DIR=backups

if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

echo Iniciando backup de la base de datos %DB_NAME%...
docker exec %CONTAINER_NAME% /usr/bin/mysqldump -u %DB_USER% --password=%DB_PASS% %DB_NAME% > %BACKUP_DIR%\backup_%TIMESTAMP%.sql

if %ERRORLEVEL% equ 0 (
    echo [EXITO] Backup creado correctamente en: %BACKUP_DIR%\backup_%TIMESTAMP%.sql
) else (
    echo [ERROR] Falló el backup. Verifica que el contenedor esté corriendo.
)
timeout /t 5
