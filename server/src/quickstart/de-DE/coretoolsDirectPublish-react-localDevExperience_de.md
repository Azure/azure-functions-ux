### <a name="install-dependencies"></a>Installieren von Abhängigkeiten

Als Erstes sollten Sie die <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.js-Plattform installieren</a>, die npm enthält. Auf diese Weise erhalten Sie die Azure Functions Core Tools. Falls Sie Node.js nicht installieren möchten, können Sie sich die anderen Installationsoptionen in unserer <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools-Referenz</a> ansehen.

Führen Sie den folgenden Befehl aus, um das Core Tools-Paket zu installieren:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Erstellen eines Azure Functions-Projekts

Navigieren Sie im Terminalfenster oder an einer Eingabeaufforderung zu einem leeren Ordner Ihres Projekts, und führen Sie den folgenden Befehl aus:

<MarkdownHighlighter>func init</MarkdownHighlighter>

Sie werden auch aufgefordert, eine Runtime für das Projekt auszuwählen. Wählen Sie „{workerRuntime}“ aus.

<br/>
### <a name="create-a-function"></a>Erstellen einer Funktion

Um eine Funktion zu erstellen, führen Sie den folgenden Befehl aus:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Sie werden aufgefordert, eine Vorlage für Ihre Funktion auszuwählen. Für den Einstieg empfehlen wir die Auswahl von „HTTP-Trigger“.

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>Lokales Ausführen Ihres Funktionsprojekts

Führen Sie den folgenden Befehl aus, um Ihre Funktions-App zu starten:

<MarkdownHighlighter>func start</MarkdownHighlighter>

Die Runtime gibt eine URL für beliebige HTTP-Funktionen aus, die kopiert und in der Adressleiste Ihres Browsers ausgeführt werden kann.

Drücken Sie im Terminal die Tastenkombination **STRG+C**, um das Debuggen zu beenden.

<br/>
### <a name="deploy-your-code-to-azure"></a>Bereitstellen Ihres Codes in Azure

Geben Sie den folgenden Befehl ein, um Ihr Functions-Projekt in Azure zu veröffentlichen:

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

Unter Umständen werden Sie aufgefordert, sich bei Azure anzumelden. Folgen Sie den Anweisungen auf dem Bildschirm.
