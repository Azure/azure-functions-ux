### <a name="install-dependencies"></a>Installera beroenden

Innan du börjar måste du <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installera Node.js</a> som innehåller npm. Så här får du Azure Functions Core Tools. Om du inte vill installera Node.js kan du se andra installationsalternativ i vår <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools-referens</a>.

Kör följande kommando för att installera Core Tools-paketet:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Skapa ett Azure Functions-projekt

I terminalfönstret eller från en kommandotolk navigerar du till en tom mapp för projektet och kör följande kommando:

<MarkdownHighlighter>func init</MarkdownHighlighter>

Du kommer också att uppmanas att välja en körmiljö för projektet. Välj {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Skapa en funktion

Skapa en funktion genom att köra följande kommando:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Då uppmanas du att välja en mall för din funktion. Vi rekommenderar HTTP-utlösare för att komma igång.

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>Kör ditt funktionsprojekt lokalt

Kör följande kommando för att starta funktionsappen:

<MarkdownHighlighter>func start</MarkdownHighlighter>

Vid körningen matas en URL ut för alla HTTP-funktioner. Du kan kopiera och köra dessa i adressfältet i din webbläsare.

Använd **Ctrl-C** i terminalen för att stoppa felsökningen.

<br/>
### <a name="deploy-your-code-to-azure"></a>Distribuera din kod till Azure

Om du vill publicera ditt Functions-projekt i Azure anger du följande kommando:

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

Du kan uppmanas att logga in i Azure. Följ anvisningarna på skärmen.
