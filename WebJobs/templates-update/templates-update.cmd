@ECHO OFF

SET TEMPLATES_PATH=%HOME%\site\wwwroot\App_Data\Templates

IF NOT EXIST "%TEMPLATES_PATH%" (
    mkdir "%TEMPLATES_PATH%"
    pushd "%TEMPLATES_PATH%"
    git clone https://github.com/Azure/azure-webjobs-sdk-templates.git .
    popd
)

pushd "%TEMPLATES_PATH%"
git pull
popd