# Installera beroenden

Innan du kan komma igång bör du [installera .NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373). Du bör också [installera Node. JS](https://go.microsoft.com/fwlink/?linkid=2016195) som innehåller NPM, vilket är hur du får tillgång till Azure Functions Core Tools. Om du inte vill installera noden kan du läsa andra installationsalternativ i [referens om Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Kör följande kommando för att installera Core Tools-paketet:

``` npm install -g azure-functions-core-tools ```

<br/>
# Skapa ett Azure Functions-projekt

I terminalfönstret eller från en kommandotolk navigerar du till en tom mapp för projektet och kör följande kommando:

``` func init ```

Du kommer också att uppmanas att välja en körning för projektet. Välj {workerRuntime}.

<br/>
# Skapa en funktion

Kör följande kommando för att skapa en funktion:

``` func new ```

Då uppmanas du att välja en mall för din funktion. Vi rekommenderar HTTP-utlösare för att komma igång.

<br/>
# Kör ditt funktionsprojekt lokalt

Kör följande kommando för att starta din funktionsapp:

``` func start ```

Körningen kommer att skapa en URL för alla HTTP-funktioner som kan kopieras och köras i webbläsarens adressfält.

Använd **CTRL-C** i terminalen för att avbryta felsökningen.

<br/>
# Distribuera din kod till Azure

Om du vill publicera ett Functions-projekt i Azure anger du följande kommando:

``` func azure functionapp publish {functionAppName} ```

Du kan uppmanas att logga in på Azure. Följ anvisningarna på skärmen.
