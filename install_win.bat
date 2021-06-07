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
:: BUILDDIR: The Build dir containing the ES Connector
SET BUILDDIR=%BASEDIR%\build

:::: Step 1 - Remove older version of the ES Connector

IF EXIST "%EXTDIR%" ( 
	echo + Removing older DALIM ES Connector
	RMDIR /s/q "%EXTDIR%"
)

:::: Step 2 - Extract ZIPFILE in EXTDIR

ECHO + Installing DALIM ES Connector
ECHO ++ %EXTDIR%

XCOPY "%BUILDDIR%" "%EXTDIR%" /s /e /k /h /i

:::: Step 3 - Enable Debug mode for Adoce CC 2019, 2020 and 2021

REG add "HKCU\SOFTWARE\Adobe\CSXS.8"  /f /v PlayerDebugMode /t REG_SZ /d 1
REG add "HKCU\SOFTWARE\Adobe\CSXS.9"  /f /v PlayerDebugMode /t REG_SZ /d 1
REG add "HKCU\SOFTWARE\Adobe\CSXS.10" /f /v PlayerDebugMode /t REG_SZ /d 1

ECHO + DALIM ES Connector successfully installed !!!

PAUSE

