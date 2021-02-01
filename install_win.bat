@ECHO OFF
TITLE DALIM ES Connector Installer

:: BASEDIR: The folder where this script is located
SET BASEDIR=%~dp0
SET BASEDIR=%BASEDIR:~0,-1%
:: EXTDIR: The location where to install the ES Connector
IF DEFINED APPDATA (
	SET EXTDIR=%APPDATA%\Adobe\CEP\extensions\com.dalim.esconnector
) ELSE (
	SET EXTDIR=%USERPROFILE%\AppData\Roaming\Adobe\CEP\extensions\com.dalim.esconnector
)
:: ZIPFILE: The ZIP file containing the ES Connector
SET ZIPFILE=%BASEDIR%\build\ESConnector_prd.zip

:::: Step 1 - Remove older version of the ES Connector

IF EXIST "%EXTDIR%" ( 
	echo + Removing older DALIM ES Connector
	RMDIR /s/q "%EXTDIR%"
)

:::: Step 2 - Extract ZIPFILE in EXTDIR

ECHO + Installing DALIM ES Connector
ECHO ++ %EXTDIR%

MKDIR "%EXTDIR%"
Call :UnZipFile "%EXTDIR%" "%ZIPFILE%"


:::: Step 3 - Enable Debug mode for Adoce CC 2019, 2020 and 2021

REG add "HKCU\SOFTWARE\Adobe\CSXS.8"  /f /v PlayerDebugMode /t REG_SZ /d 1
REG add "HKCU\SOFTWARE\Adobe\CSXS.9"  /f /v PlayerDebugMode /t REG_SZ /d 1
REG add "HKCU\SOFTWARE\Adobe\CSXS.10" /f /v PlayerDebugMode /t REG_SZ /d 1

ECHO + DALIM ES Connector successfully installed !!!

PAUSE

:UnZipFile <ExtractTo> <newzipfile>
set vbs="%temp%\_.vbs"
if exist %vbs% del /f /q %vbs%
>%vbs% echo set objShell = CreateObject("Shell.Application")
>>%vbs% echo set FilesInZip=objShell.NameSpace(%2).items
>>%vbs% echo objShell.NameSpace(%1).CopyHere(FilesInZip)
>>%vbs% echo Set fso = Nothing
>>%vbs% echo Set objShell = Nothing
cscript //nologo %vbs%
if exist %vbs% del /f /q %vbs%