### Installieren von Abhängigkeiten

Bevor Sie beginnen können, müssen Sie <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1 installieren</a>. Außerdem sollten Sie <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS installieren</a>, das npm umfasst. Über npm rufen Sie die Azure Functions Core Tools ab. Wenn Sie Node nicht installieren möchten, finden Sie weitere Installationsoptionen in der <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools-Referenz</a>.

Führen Sie den folgenden Befehl aus, um das Core Tools-Paket zu installieren:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

<br/>
### Erstellen eines Azure Functions-Projekts

Navigieren Sie im Terminalfenster oder von einer Eingabeaufforderung aus zu einem leeren Ordner für Ihr Projekt, und führen Sie den folgenden Befehl aus:

<MarkdownHighlighter>func init</MarkdownHighlighter>

Sie werden aufgefordert, eine Runtime für das Projekt auszuwählen. Wählen Sie {workerRuntime} aus.

<br/>
### Erstellen einer Funktion

Führen Sie zum Erstellen einer Funktion den folgenden Befehl aus:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Hierdurch werden Sie aufgefordert, eine Vorlage für Ihre Funktion auszuwählen. Für den Einstieg wird ein HTTP-Trigger empfohlen.

<br/>
### Lokale Ausführung Ihres Funktionsprojekts

Führen Sie den folgenden Befehl aus, um Ihre Funktions-App zu starten:

<MarkdownHighlighter>func start</MarkdownHighlighter>

Die Runtime gibt eine URL für beliebige HTTP-Funktionen aus, die Sie in die Adressleiste Ihres Browsers kopieren und ausführen können.

Verwenden Sie zum Beenden des Debuggens im Terminal die Tastenkombination **STRG-C**.

<br/>
### Bereitstellen Ihres Codes in Azure

Um Ihr Functions-Projekt in Azure zu veröffentlichen, geben Sie den folgenden Befehl ein:

<MarkdownHighlighter>func azure functionapp publish {functionAppName}</MarkdownHighlighter>

Sie werden möglicherweise aufgefordert, sich bei Azure anzumelden. Folgen Sie den Anweisungen auf dem Bildschirm.
