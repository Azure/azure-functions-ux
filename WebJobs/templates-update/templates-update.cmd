@ECHO OFF

SET TEMPLATES_PATH=%HOME%\site\wwwroot\App_Data\Templates

IF NOT EXIST "%TEMPLATES_PATH%" (
    mkdir "%TEMPLATES_PATH%"
    pushd "%TEMPLATES_PATH%"
    git clone https://github.com/Azure/azure-webjobs-sdk-templates.git .
    popd
)

pushd "%TEMPLATES_PATH%"
git fetch

IF "%FUNCTIONS_SLOT_NAME%" == "next" (
    git reset --hard origin/dev
) ELSE (
    git reset --hard origin/master
)

popd