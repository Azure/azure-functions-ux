@if "%SCM_TRACE_LEVEL%" NEQ "4" @echo off

:: ----------------------
:: KUDU Deployment Script
:: Version: 1.0.6
:: ----------------------

:: Prerequisites
:: -------------

:: Verify node.js installed
where node 2>nul >nul
IF %ERRORLEVEL% NEQ 0 (
  echo Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment.
  goto error
)

:: Setup
:: -----
:: Setup npm global path to d:\home

echo Print variables
echo dp0=%~dp0%
echo ARTIFACTS=%ARTIFACTS%
echo DEPLOYMENT_SOURCE=%DEPLOYMENT_SOURCE%
echo DEPLOYMENT_TARGET=%DEPLOYMENT_TARGET%
echo DEPLOYMENT_TARGET_ANGULAR=%DEPLOYMENT_TARGET_ANGULAR%
echo NEXT_MANIFEST_PATH=%NEXT_MANIFEST_PATH%
echo PREVIOUS_MANIFEST_PATH=%PREVIOUS_MANIFEST_PATH%
echo DEPLOYMENT_TEMP=%DEPLOYMENT_TEMP%
echo IN_PLACE_DEPLOYMENT=%IN_PLACE_DEPLOYMENT%
echo ANGUALR_CLI=%ANGUALR_CLI%

setlocal enabledelayedexpansion

SET ARTIFACTS=%~dp0%..\artifacts

IF NOT DEFINED DEPLOYMENT_SOURCE (
	SET DEPLOYMENT_SOURCE=%~dp0%.
	echo SET DEPLOYMENT_SOURCE
)

IF NOT DEFINED DEPLOYMENT_TARGET (
  SET DEPLOYMENT_TARGET=%ARTIFACTS%\wwwroot
)

IF NOT DEFINED NEXT_MANIFEST_PATH (
  SET NEXT_MANIFEST_PATH=%ARTIFACTS%\manifest

  IF NOT DEFINED PREVIOUS_MANIFEST_PATH (
    SET PREVIOUS_MANIFEST_PATH=%ARTIFACTS%\manifest
  )
)

IF NOT DEFINED NEXT_CLIENT_MANIFEST_PATH (
  SET NEXT_CLIENT_MANIFEST_PATH=%ARTIFACTS%\client-manifest

  IF NOT EXIST "%NEXT_CLIENT_MANIFEST_PATH%" (MKDIR "%NEXT_CLIENT_MANIFEST_PATH%")

  IF NOT DEFINED PREVIOUS_CLIENT_MANIFEST_PATH (
    SET PREVIOUS_CLIENT_MANIFEST_PATH=%ARTIFACTS%\client-manifest
  )

  IF NOT EXIST "%PREVIOUS_CLIENT_MANIFEST_PATH%" (MKDIR "%PREVIOUS_CLIENT_MANIFEST_PATH%")
)

IF NOT EXIST "%HOME%\tools" (MKDIR "%HOME%\tools")

SET PATH=%PATH%;%HOME%\tools

call npm config set prefix "%HOME%\tools"
IF !ERRORLEVEL! NEQ 0 goto error

IF NOT DEFINED KUDU_SYNC_CMD (
  :: Install kudu sync
  echo Installing Kudu Sync
  call npm install kudusync -g --silent
  IF !ERRORLEVEL! NEQ 0 goto error

  :: Locally just running "kuduSync" would also work
  SET KUDU_SYNC_CMD=%appdata%\npm\kuduSync.cmd
)

IF NOT DEFINED ANGUALR_CLI (
  :: Install angular-cli
  echo Installing angular-cli
  call npm install -g angular-cli@1.0.0-beta.19-3
  
  IF !ERRORLEVEL! NEQ 0 goto error
  
  SET ANGUALR_CLI=true
)

IF NOT DEFINED DEPLOYMENT_TEMP (
  SET DEPLOYMENT_TEMP=%temp%\___deployTemp%random%
  SET CLEAN_LOCAL_DEPLOYMENT_TEMP=true
)

IF DEFINED CLEAN_LOCAL_DEPLOYMENT_TEMP (
  IF EXIST "%DEPLOYMENT_TEMP%" rd /s /q "%DEPLOYMENT_TEMP%"
  mkdir "%DEPLOYMENT_TEMP%"
)

IF DEFINED MSBUILD_PATH goto MsbuildPathDefined
SET MSBUILD_PATH=%ProgramFiles(x86)%\MSBuild\14.0\Bin\MSBuild.exe
:MsbuildPathDefined

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
:: Deployment
:: ----------

echo Print variables
echo dp0=%~dp0%
echo ARTIFACTS=%ARTIFACTS%
echo DEPLOYMENT_SOURCE=%DEPLOYMENT_SOURCE%
echo DEPLOYMENT_TARGET=%DEPLOYMENT_TARGET%
echo DEPLOYMENT_TARGET_ANGULAR=%DEPLOYMENT_TARGET_ANGULAR%
echo NEXT_MANIFEST_PATH=%NEXT_MANIFEST_PATH%
echo PREVIOUS_MANIFEST_PATH=%PREVIOUS_MANIFEST_PATH%
echo DEPLOYMENT_TEMP=%DEPLOYMENT_TEMP%
echo IN_PLACE_DEPLOYMENT=%IN_PLACE_DEPLOYMENT%
echo ANGUALR_CLI=%ANGUALR_CLI%

echo Handling backend WebApi project.
echo Restore NuGet packages
IF /I "AzureFunctions.sln" NEQ "" (
  call :ExecuteCmd nuget restore "%DEPLOYMENT_SOURCE%\AzureFunctions.sln"
  IF !ERRORLEVEL! NEQ 0 goto error
)

:: 1. Build backend WebApi to the temporary path
IF /I "%IN_PLACE_DEPLOYMENT%" NEQ "1" (
  echo "%MSBUILD_PATH%" "%DEPLOYMENT_SOURCE%\AzureFunctions\AzureFunctions.csproj" /nologo /verbosity:m /t:Build /t:pipelinePreDeployCopyAllFilesToOneFolder /p:_PackageTempDir="%DEPLOYMENT_TEMP%";AutoParameterizationWebConfigConnectionStrings=false;Configuration=Release;UseSharedCompilation=false  /p:DeleteExistingFiles=False /p:SolutionDir="%DEPLOYMENT_SOURCE%\.\\" %SCM_BUILD_ARGS%
  call :ExecuteCmd "%MSBUILD_PATH%" "%DEPLOYMENT_SOURCE%\AzureFunctions\AzureFunctions.csproj" /nologo /verbosity:m /t:Build /t:pipelinePreDeployCopyAllFilesToOneFolder /p:_PackageTempDir="%DEPLOYMENT_TEMP%";AutoParameterizationWebConfigConnectionStrings=false;Configuration=Release;UseSharedCompilation=false  /p:DeleteExistingFiles=False /p:SolutionDir="%DEPLOYMENT_SOURCE%\.\\" %SCM_BUILD_ARGS%
) ELSE (
  call :ExecuteCmd "%MSBUILD_PATH%" "%DEPLOYMENT_SOURCE%\AzureFunctions\AzureFunctions.csproj" /nologo /verbosity:m /t:Build /p:AutoParameterizationWebConfigConnectionStrings=false;Configuration=Release;UseSharedCompilation=false  /p:DeleteExistingFiles=False /p:SolutionDir="%DEPLOYMENT_SOURCE%\.\\" %SCM_BUILD_ARGS%
)

echo Handling frontend Angular2 project.
:: 2. Bundle frontend angular2 app to the temporary path
IF EXIST "%DEPLOYMENT_SOURCE%\AzureFunctions.AngularClient\package.json" (

	IF /I "%IN_PLACE_DEPLOYMENT%" NEQ "1" (
	echo ROBOCOPY "%DEPLOYMENT_SOURCE%\AzureFunctions.AngularClient" "%ARTIFACTS%\AzureFunctions.AngularClient" /E /IS
		call :ExecuteCmd ROBOCOPY "%DEPLOYMENT_SOURCE%\AzureFunctions.AngularClient" "%ARTIFACTS%\AzureFunctions.AngularClient" /E /IS
		:: http://ss64.com/nt/robocopy-exit.html
		IF %ERRORLEVEL% EQU 16 echo ***FATAL ERROR*** & goto error
		IF %ERRORLEVEL% EQU 15 echo OKCOPY + FAIL + MISMATCHES + XTRA & goto error
		IF %ERRORLEVEL% EQU 14 echo FAIL + MISMATCHES + XTRA & goto error
		IF %ERRORLEVEL% EQU 13 echo OKCOPY + FAIL + MISMATCHES & goto error
		IF %ERRORLEVEL% EQU 12 echo FAIL + MISMATCHES& goto error
		IF %ERRORLEVEL% EQU 11 echo OKCOPY + FAIL + XTRA & goto error
		IF %ERRORLEVEL% EQU 10 echo FAIL + XTRA & goto error
		IF %ERRORLEVEL% EQU 9 echo OKCOPY + FAIL & goto error
		IF %ERRORLEVEL% EQU 8 echo FAIL & goto error
		IF %ERRORLEVEL% EQU 7 echo OKCOPY + MISMATCHES + XTRA & goto error
		IF %ERRORLEVEL% EQU 6 echo MISMATCHES + XTRA & goto error
		IF %ERRORLEVEL% EQU 5 echo OKCOPY + MISMATCHES & goto error
		IF %ERRORLEVEL% EQU 4 echo MISMATCHES & goto error
		IF %ERRORLEVEL% EQU 3 echo OKCOPY + XTRA
		IF %ERRORLEVEL% EQU 2 echo XTRA
		IF %ERRORLEVEL% EQU 1 echo OKCOPY
		IF %ERRORLEVEL% EQU 0 echo No Change
	) 

	pushd "%ARTIFACTS%\AzureFunctions.AngularClient"
	echo Restore npm packages
	call :ExecuteCmd npm install
	IF !ERRORLEVEL! NEQ 0 (
		call :ExecuteCmd npm install
		IF !ERRORLEVEL! NEQ 0 goto error
	)
	echo Bundle angular2 app
	call :ExecuteCmd ng build --prod --environment=prod --output-path="%ARTIFACTS%\AzureFunctions.AngularClient\dist"
	IF !ERRORLEVEL! NEQ 0 (
		call :ExecuteCmd ng build --prod --environment=prod --output-path="%ARTIFACTS%\AzureFunctions.AngularClient\dist"
		IF !ERRORLEVEL! NEQ 0 goto error
	)
	
	mv %ARTIFACTS%\AzureFunctions.AngularClient\dist\main.*.bundle.js %ARTIFACTS%\AzureFunctions.AngularClient\dist\main.bundle.js
	mv %ARTIFACTS%\AzureFunctions.AngularClient\dist\scripts.*.bundle.js %ARTIFACTS%\AzureFunctions.AngularClient\dist\scripts.bundle.js
	mv %ARTIFACTS%\AzureFunctions.AngularClient\dist\styles.*.bundle.js %ARTIFACTS%\AzureFunctions.AngularClient\dist\styles.bundle.js
	
	each Copy angular output to the temporary path
	IF /I "%IN_PLACE_DEPLOYMENT%" NEQ "1" (
		echo ROBOCOPY "%ARTIFACTS%\AzureFunctions.AngularClient\dist" "%DEPLOYMENT_TEMP%" /E /IS
		call :ExecuteCmd ROBOCOPY "%ARTIFACTS%\AzureFunctions.AngularClient\dist" "%DEPLOYMENT_TEMP%" /E /IS
		:: http://ss64.com/nt/robocopy-exit.html
		IF %ERRORLEVEL% EQU 16 echo ***FATAL ERROR*** & goto error
		IF %ERRORLEVEL% EQU 15 echo OKCOPY + FAIL + MISMATCHES + XTRA & goto error
		IF %ERRORLEVEL% EQU 14 echo FAIL + MISMATCHES + XTRA & goto error
		IF %ERRORLEVEL% EQU 13 echo OKCOPY + FAIL + MISMATCHES & goto error
		IF %ERRORLEVEL% EQU 12 echo FAIL + MISMATCHES& goto error
		IF %ERRORLEVEL% EQU 11 echo OKCOPY + FAIL + XTRA & goto error
		IF %ERRORLEVEL% EQU 10 echo FAIL + XTRA & goto error
		IF %ERRORLEVEL% EQU 9 echo OKCOPY + FAIL & goto error
		IF %ERRORLEVEL% EQU 8 echo FAIL & goto error
		IF %ERRORLEVEL% EQU 7 echo OKCOPY + MISMATCHES + XTRA & goto error
		IF %ERRORLEVEL% EQU 6 echo MISMATCHES + XTRA & goto error
		IF %ERRORLEVEL% EQU 5 echo OKCOPY + MISMATCHES & goto error
		IF %ERRORLEVEL% EQU 4 echo MISMATCHES & goto error
		IF %ERRORLEVEL% EQU 3 echo OKCOPY + XTRA
		IF %ERRORLEVEL% EQU 2 echo XTRA
		IF %ERRORLEVEL% EQU 1 echo OKCOPY
		IF %ERRORLEVEL% EQU 0 echo No Change
	) 
)

:: 4. KuduSync
IF /I "%IN_PLACE_DEPLOYMENT%" NEQ "1" (
  call :ExecuteCmd "%KUDU_SYNC_CMD%" -v 50 -f "%DEPLOYMENT_TEMP%" -t "%DEPLOYMENT_TARGET%" -n "%NEXT_MANIFEST_PATH%" -p "%PREVIOUS_MANIFEST_PATH%" -i ".git;.hg;.deployment;deploy.cmd"
  IF !ERRORLEVEL! NEQ 0 goto error
)

IF !ERRORLEVEL! NEQ 0 goto error

:: 4. Copy templates-update webjob
SET WEBJOB_PATH=%HOME%\site\wwwroot\App_Data\jobs\triggered\templates-update
IF NOT EXIST "%WEBJOB_PATH%" (
  mkdir "%WEBJOB_PATH%"
)

IF EXIST %WEBJOB_PATH%\templates-update.cmd (
    del %WEBJOB_PATH%\templates-update.cmd
)

copy "%DEPLOYMENT_SOURCE%\WebJobs\templates-update\templates-update.ps1" "%WEBJOB_PATH%"
copy "%DEPLOYMENT_SOURCE%\WebJobs\templates-update\settings.job" "%WEBJOB_PATH%"

:: 5. update build.txt
call :ExecuteCmd echo %SCM_COMMIT_ID% > %DEPLOYMENT_TARGET%\build.txt
IF !ERRORLEVEL! NEQ 0 (
  call :ExecuteCmd echo %SCM_COMMIT_ID% > %DEPLOYMENT_TARGET%\build.txt
  IF !ERRORLEVEL! NEQ 0 goto error
)

::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
goto end

:: Execute command routine that will echo out when error
:ExecuteCmd
setlocal
set _CMD_=%*
call %_CMD_%
if "%ERRORLEVEL%" NEQ "0" echo Failed exitCode=%ERRORLEVEL%, command=%_CMD_%
exit /b %ERRORLEVEL%

:error
endlocal
echo An error has occurred during web site deployment.
call :exitSetErrorLevel
call :exitFromFunction 2>nul

:exitSetErrorLevel
exit /b 1

:exitFromFunction
()

:end
endlocal
echo Finished successfully.
