### Installera beroenden

Innan du kan komma igång bör du <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">installera .NET Core 2.1</a>. Du bör också <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installera Node. JS</a> som innehåller NPM, vilket är hur du får tillgång till Azure Functions Core Tools. Om du inte vill installera noden kan du läsa andra installationsalternativ i <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referens om Core Tools</a>.

Kör följande kommando för att installera Core Tools-paketet:

<MarkdownHighlighter>npm install -g azure-functions-core-tools </MarkdownHighlighter>

<br/>
### Skapa ett Azure Functions-projekt

I terminalfönstret eller från en kommandotolk navigerar du till en tom mapp för projektet och kör följande kommando:

<MarkdownHighlighter>func init </MarkdownHighlighter>

Du kommer också att uppmanas att välja en körning för projektet. Välj {workerRuntime}.

<br/>
### Skapa en funktion

Kör följande kommando för att skapa en funktion:

<MarkdownHighlighter>func new </MarkdownHighlighter>

Då uppmanas du att välja en mall för din funktion. Vi rekommenderar HTTP-utlösare för att komma igång.

<br/>
### Kör ditt funktionsprojekt lokalt

Kör följande kommando för att starta din funktionsapp:

<MarkdownHighlighter>func start </MarkdownHighlighter>

Körningen kommer att skapa en URL för alla HTTP-funktioner som kan kopieras och köras i webbläsarens adressfält.

Använd **CTRL-C** i terminalen för att avbryta felsökningen.

<br/>
### Distribuera din kod till Azure

Om du vill publicera ett Functions-projekt i Azure anger du följande kommando:

<MarkdownHighlighter>func azure functionapp publish {functionAppName} </MarkdownHighlighter>

Du kan uppmanas att logga in på Azure. Följ anvisningarna på skärmen.
