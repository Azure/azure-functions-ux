### Installera beroenden

Innan du kan komma igång bör du <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">installera Visual Studio-kod</a>. Du bör också <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installera Node. JS</a> som innehåller NPM, vilket är hur du får tillgång till Azure Functions Core Tools. Om du inte vill installera noden kan du läsa andra installationsalternativ i <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referens om Core Tools</a>.

Kör följande kommando för att installera Core Tools-paketet:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Kärnverktygen använder <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2,1</a> så du bör installera det också.

<a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">Installera sedan Azure Functions-tillägget för Visual Studio-kod</a>. När tillägget har installerats klickar du på Azure-logotypen i aktivitetsfältet. Under **Azure: Funktioner** klickar du på **Logga in på Azure...** och följer anvisningarna på skärmen.

<br/>
### Skapa ett Azure Functions-projekt

Klicka på ikonen **Skapa nytt projekt...** i **Azure: Panelen Funktioner**.

Du uppmanas att välja en katalog för din app. Välj en tom katalog.

Du uppmanas sedan att välja ett språk för projektet. Välj {workerRuntime}.

<br/>
### Skapa en funktion

Klicka på ikonen **Skapa funktion...** i **Azure: Panelen Funktioner**.

Då uppmanas du att välja en mall för din funktion. Vi rekommenderar HTTP-utlösare för att komma igång.

<br/>
### Kör ditt funktionsprojekt lokalt

Tryck på **F5** för att köra din funktionsapp.

Körningen kommer att skapa en URL för alla HTTP-funktioner som kan kopieras och köras i webbläsarens adressfält.

Stoppa felsökningen genom att trycka på **Shift + F5**.

<br/>
### Distribuera din kod till Azure

Klicka på ikonen **Distribuera till Funktionsapp...** (blå uppil) i **Azure: Panelen Funktioner**.

När du uppmanas att välja en funktionsapp väljer du {functionAppName}.
