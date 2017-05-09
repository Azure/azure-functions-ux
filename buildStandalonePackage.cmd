set ROOTPATH=%~dp0
set PACKAGEPATH=%ROOTPATH%StandalonePackage

setlocal enabledelayedexpansion

IF DEFINED MSBUILD_PATH goto MsbuildPathDefined
SET MSBUILD_PATH=%ProgramFiles(x86)%\MSBuild\14.0\Bin\MSBuild.exe
:MsbuildPathDefined

echo Handling backend WebApi project.
echo Restore NuGet packages
call :ExecuteCmd nuget restore ".\AzureFunctions.sln"
IF !ERRORLEVEL! NEQ 0 goto error

:: 1. Build backend WebApi and copy to output folder
echo "%MSBUILD_PATH%" ".\AzureFunctions\AzureFunctions.csproj" /nologo /verbosity:m /t:Build /t:pipelinePreDeployCopyAllFilesToOneFolder /p:_PackageTempDir="%PACKAGEPATH%";AutoParameterizationWebConfigConnectionStrings=false;Configuration=Standalone;UseSharedCompilation=false  /p:DeleteExistingFiles=False /p:SolutionDir=".\.\\" %SCM_BUILD_ARGS%
call :ExecuteCmd "%MSBUILD_PATH%" ".\AzureFunctions\AzureFunctions.csproj" /nologo /verbosity:m /t:Build /t:pipelinePreDeployCopyAllFilesToOneFolder /p:_PackageTempDir="%PACKAGEPATH%";AutoParameterizationWebConfigConnectionStrings=false;Configuration=Standalone;UseSharedCompilation=false  /p:DeleteExistingFiles=False /p:SolutionDir=".\.\\" %SCM_BUILD_ARGS%
IF !ERRORLEVEL! NEQ 0 goto error

:: 2. Bundle frontend angular2 app
echo Handling frontend Angular2 project.
    pushd .\AzureFunctions.AngularClient

    echo %CD%

	echo Bundle angular2 app
	call :ExecuteCmd node_modules\.bin\ng build --output-path="%PACKAGEPATH%\ng"
	IF !ERRORLEVEL! NEQ 0 (
		call :ExecuteCmd node_modules\.bin\ng build --output-path="%PACKAGEPATH%\ng"
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