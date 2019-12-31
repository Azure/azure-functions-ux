# Installera beroenden

Innan du kan komma igång bör du [installera Visual Studio-kod](https://go.microsoft.com/fwlink/?linkid=2016593). Du bör också [installera Node. JS](https://go.microsoft.com/fwlink/?linkid=2016195) som innehåller NPM, vilket är hur du får tillgång till Azure Functions Core Tools. Om du inte vill installera noden kan du läsa andra installationsalternativ i [referens om Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Kör följande kommando för att installera Core Tools-paketet:

``` npm install -g azure-functions-core-tools ```

Kärnverktygen använder [.NET Core 2,1](https://go.microsoft.com/fwlink/?linkid=2016373) så du bör installera det också.

[Installera sedan Azure Functions-tillägget för Visual Studio-kod](https://go.microsoft.com/fwlink/?linkid=2016800). När tillägget har installerats klickar du på Azure-logotypen i aktivitetsfältet. Under **Azure: Funktioner** klickar du på **Logga in på Azure...** och följer anvisningarna på skärmen.

<br/>
# Skapa ett Azure Functions-projekt

Klicka på ikonen **Skapa nytt projekt...** i **Azure: Panelen Funktioner**.

Du uppmanas att välja en katalog för din app. Välj en tom katalog.

Du uppmanas sedan att välja ett språk för projektet. Välj {workerRuntime}.

<br/>
# Skapa en funktion

Klicka på ikonen **Skapa funktion...** i **Azure: Panelen Funktioner**.

Då uppmanas du att välja en mall för din funktion. Vi rekommenderar HTTP-utlösare för att komma igång.

<br/>
# Kör ditt funktionsprojekt lokalt

Tryck på **F5** för att köra din funktionsapp.

Körningen kommer att skapa en URL för alla HTTP-funktioner som kan kopieras och köras i webbläsarens adressfält.

Stoppa felsökningen genom att trycka på **Shift + F5**.

<br/>
# Distribuera din kod till Azure

Använd knappen **Slutför och gå till distributionscenter** nedan för att gå till distributionscenter och slutföra konfigurationen av appen. Detta leder dig genom en ny guide för att konfigurera flera olika distributionsalternativ. När du har slutfört det här flödet utlöser du en distribution med den mekanism som du har konfigurerat.
