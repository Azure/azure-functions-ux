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

setlocal enabledelayedexpansion

SET ARTIFACTS=%~dp0%..\artifacts

IF NOT DEFINED DEPLOYMENT_SOURCE (
  SET DEPLOYMENT_SOURCE=%~dp0%.
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

IF NOT DEFINED KUDU_SYNC_CMD (
  :: Install kudu sync
  echo Installing Kudu Sync
  call npm install kudusync -g --silent
  IF !ERRORLEVEL! NEQ 0 goto error

  :: Locally just running "kuduSync" would also work
  SET KUDU_SYNC_CMD=%appdata%\npm\kuduSync.cmd
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

echo Handling backend WebApi project.

:: 1. Restore NuGet packages
IF /I "AzureFunctions.sln" NEQ "" (
  call :ExecuteCmd nuget restore "%DEPLOYMENT_SOURCE%\AzureFunctions.sln"
  IF !ERRORLEVEL! NEQ 0 goto error
)

:: 2. Build to the temporary path
IF /I "%IN_PLACE_DEPLOYMENT%" NEQ "1" (
  call :ExecuteCmd "%MSBUILD_PATH%" "%DEPLOYMENT_SOURCE%\AzureFunctions\AzureFunctions.csproj" /nologo /verbosity:m /t:Build /t:pipelinePreDeployCopyAllFilesToOneFolder /p:_PackageTempDir="%DEPLOYMENT_TEMP%";AutoParameterizationWebConfigConnectionStrings=false;Configuration=Release;UseSharedCompilation=false /p:SolutionDir="%DEPLOYMENT_SOURCE%\.\\" %SCM_BUILD_ARGS%
) ELSE (
  call :ExecuteCmd "%MSBUILD_PATH%" "%DEPLOYMENT_SOURCE%\AzureFunctions\AzureFunctions.csproj" /nologo /verbosity:m /t:Build /p:AutoParameterizationWebConfigConnectionStrings=false;Configuration=Release;UseSharedCompilation=false /p:SolutionDir="%DEPLOYMENT_SOURCE%\.\\" %SCM_BUILD_ARGS%
)

IF !ERRORLEVEL! NEQ 0 goto error

:: 3. KuduSync
IF /I "%IN_PLACE_DEPLOYMENT%" NEQ "1" (
  call :ExecuteCmd "%KUDU_SYNC_CMD%" -v 50 -f "%DEPLOYMENT_TEMP%" -t "%DEPLOYMENT_TARGET%" -n "%NEXT_MANIFEST_PATH%" -p "%PREVIOUS_MANIFEST_PATH%" -i ".git;.hg;.deployment;deploy.cmd"
  IF !ERRORLEVEL! NEQ 0 goto error
)

echo Handling frontend Angular2 project.

:: 4. KuduSync
IF /I "%IN_PLACE_DEPLOYMENT%" NEQ "1" (
  call :ExecuteCmd "%KUDU_SYNC_CMD%" -v 50 -f "%DEPLOYMENT_SOURCE%\AzureFunctions.Client" -t "%DEPLOYMENT_TARGET%" -n "%NEXT_MANIFEST_PATH%" -p "%PREVIOUS_MANIFEST_PATH%" -i ".git;.hg;.deployment;deploy.cmd"
  IF !ERRORLEVEL! NEQ 0 goto error
)


:: 5. Create lastCommit, packageJsonLastCommit, bowerLastCommit, typingsLastCommit vars
  pushd "%DEPLOYMENT_SOURCE%"

  call :ExecuteCmd git log -n 1 --oneline > lastCommit.txt
  IF !ERRORLEVEL! NEQ 0 goto error
  SET /p lastCommit=<lastCommit.txt
  DEL lastCommit.txt


  call :ExecuteCmd git log -n 1 --oneline -- AzureFunctions.Client\package.json > packageJsonLastCommit.txt
  IF !ERRORLEVEL! NEQ 0 goto error
  SET /p packageJsonLastCommit=<packageJsonLastCommit.txt
  DEL packageJsonLastCommit.txt

  call :ExecuteCmd git log -n 1 --oneline -- AzureFunctions.Client\bower.json > bowerLastCommit.txt
  IF !ERRORLEVEL! NEQ 0 goto error
  SET /p bowerLastCommit=<bowerLastCommit.txt
  DEL bowerLastCommit.txt

  call :ExecuteCmd git log -n 1 --oneline -- AzureFunctions.Client\typings.json > typingsLastCommit.txt
  IF !ERRORLEVEL! NEQ 0 goto error
  SET /p typingsLastCommit=<typingsLastCommit.txt
  DEL typingsLastCommit.txt

  popd

:: 6. Install npm packages
IF EXIST "%DEPLOYMENT_TARGET%\package.json" (
  pushd "%DEPLOYMENT_TARGET%"

  SET res=F
  IF "%packageJsonLastCommit%"=="%lastCommit%" SET res=T
  IF NOT EXIST "node_modules" SET res=T
  IF "%res%"=="T" (
    call :ExecuteCmd npm install
    IF !ERRORLEVEL! NEQ 0 goto error
  ) ELSE (
    echo skipping npm install
  )

  SET res=F
  IF "%packageJsonLastCommit%"=="%lastCommit%" SET res=T
  IF NOT EXIST "jspm_packages" SET res=T
  IF "%res%"=="T" (
    call :ExecuteCmd npm run jspm:i
    IF !ERRORLEVEL! NEQ 0 goto error
  ) ELSE (
    echo skipping jspm install
  )

  SET res=F
  IF "%typingsLastCommit%"=="%lastCommit%" SET res=T
  IF NOT EXIST "typings" SET res=T
  IF "%res%"=="T" (
    call :ExecuteCmd npm run typings install
    IF !ERRORLEVEL! NEQ 0 goto error
  ) ELSE (
    echo skipping typings install
  )
  
  call :ExecuteCmd gulp
  IF !ERRORLEVEL! NEQ 0 goto error

  call :ExecuteCmd npm run tsc
  IF !ERRORLEVEL! NEQ 0 goto error

  call :ExecuteCmd npm run jspm:bundle
  IF !ERRORLEVEL! NEQ 0 goto error
  
  call :ExecuteCmd npm run uglifyjs
  IF !ERRORLEVEL! NEQ 0 goto error

  popd
)

:: 7. Install bower
IF EXIST "%DEPLOYMENT_TARGET%\bower.json" (
  pushd "%DEPLOYMENT_TARGET%"

  SET res=F
  IF NOT "%bowerLastCommit%"=="%lastCommit%" SET res=T
  IF NOT EXIST "bower_components" SET res=T
  IF "%res%"=="T" (
    call :ExecuteCmd bower install
    IF !ERRORLEVEL! NEQ 0 goto error
  ) ELSE (
    echo skipping bower install
  )
  popd
)

:: 8. Copy templates-update webjob
SET WEBJOB_PATH=%HOME%\site\wwwroot\App_Data\jobs\triggered\templates-update
IF NOT EXIST "%WEBJOB_PATH%" (
  mkdir "%WEBJOB_PATH%"
)

copy "%DEPLOYMENT_SOURCE%\WebJobs\templates-update\templates-update.cmd" "%WEBJOB_PATH%"
copy "%DEPLOYMENT_SOURCE%\WebJobs\templates-update\settings.job" "%WEBJOB_PATH%"

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
