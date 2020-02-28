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

Använd knappen **Slutför och gå till distributionscenter** nedan för att gå till distributionscenter och slutföra konfigurationen av appen. Detta leder dig genom en ny guide för att konfigurera flera olika distributionsalternativ. När du har slutfört det här flödet utlöser du en distribution med den mekanism som du har konfigurerat.
