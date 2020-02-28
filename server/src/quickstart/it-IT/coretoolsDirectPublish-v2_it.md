### Installare le dipendenze

Prima di iniziare, è necessario <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">installare .NET Core 2.1</a>. È anche necessario <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installare Node.JS</a> che include npm, per ottenere Azure Functions Core Tools. Se si preferisce non installare Node, vedere le altre opzioni di installazione nelle <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">informazioni di riferimento su Core Tools</a>.

Eseguire il comando seguente per installare il pacchetto Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

<br/>
### Creare un progetto Funzioni di Azure

Nella finestra del terminale o da un prompt dei comandi, passare a una cartella vuota per il progetto ed eseguire questo comando:

<MarkdownHighlighter>func init</MarkdownHighlighter>

Verrà inoltre richiesto di scegliere un runtime per il progetto. Selezionare {workerRuntime}.

<br/>
### Creare una funzione

Per creare una funzione, eseguire questo comando:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Verrà richiesto di scegliere un modello per la funzione. Per iniziare, è consigliabile usare il trigger HTTP.

<br/>
### Eseguire il progetto di funzione in locale

Per avviare l'app per le funzioni, eseguire questo comando:

<MarkdownHighlighter>func start</MarkdownHighlighter>

Il runtime genererà l'output di un URL per qualsiasi funzione HTTP, che può essere copiato ed eseguito nella barra degli indirizzi del browser.

Per arrestare il debug, usare **CTRL-C** nel terminale.

<br/>
### Distribuire il codice in Azure

Per pubblicare il progetto Funzioni in Azure, immettere il comando seguente:

<MarkdownHighlighter>func azure functionapp publish {functionAppName}</MarkdownHighlighter>

Potrebbe essere richiesto di eseguire l'accesso ad Azure. Seguire le istruzioni visualizzate.
