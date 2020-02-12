# Installera beroenden

Innan du kan komma igång bör du [installera Java Developer Kit, version 8](https://go.microsoft.com/fwlink/?linkid=2016706). Se till att JAVA\_HOME-miljövariabeln ställs in på installationsplatsen för JDK. Du måste också [installera Apache Maven, version 3,0 eller senare](https://go.microsoft.com/fwlink/?linkid=2016384).

Du bör också [installera Node. JS](https://go.microsoft.com/fwlink/?linkid=2016195) som innehåller npm. Så här får du åtkomst till Azure Functions Core Tools. Om du inte vill installera noden kan du läsa andra installationsalternativ i [referens om Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Kör följande kommando för att installera Core Tools-paketet:

``` npm install -g azure-functions-core-tools ```

Kärnverktygen använder [.NET Core 2,1](https://go.microsoft.com/fwlink/?linkid=2016373) så du bör installera det också.

Så här [installerar du Azure CLI 2.0](https://go.microsoft.com/fwlink/?linkid=2016701). När det är installerat kontrollerar du att du är inloggad genom att köra inloggningskommandot och följa anvisningarna på skärmen:

``` az login ```

<br/>
# Skapa ett Azure Functions-projekt

I terminalfönstret eller från en kommandotolk navigerar du till en tom mapp för projektet och kör följande kommando:

``` mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false ```

<br/>
# Skapa en funktion

När du skapar projektet skapas en HTTP-funktion som standard, så du behöver inte göra något för det här steget just nu. Om du senare vill lägga till en ny funktion kör du följande kommando:

``` mvn azure-functions:add ```

Maven kommer att uppmana dig att välja och anpassa en mall för den nya funktionen.

<br/>
# Kör ditt funktionsprojekt lokalt

Kör följande kommando för att starta din funktionsapp:

``` mvn clean package mvn azure-functions:run ```

Körningen kommer att skapa en URL för alla HTTP-funktioner som kan kopieras och köras i webbläsarens adressfält.

Använd **CTRL-C** i terminalen för att avbryta felsökningen.

<br/>
# Distribuera din kod till Azure

Om du vill publicera ett Functions-projekt i Azure anger du följande kommando:

``` mvn azure-functions:deploy ```

Du kan uppmanas att logga in på Azure om du inte redan har gjort det. Följ anvisningarna på skärmen.
