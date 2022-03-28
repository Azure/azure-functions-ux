### <a name="install-dependencies"></a>Installare le dipendenze

Prima di iniziare, è necessario <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installare Node.js</a> che include npm. Questo è il modo in cui si otterrà Azure Functions Core Tools. Se si preferisce non installare Node.js, vedere le altre opzioni di installazione nella <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Guida di riferimento a Core Tools</a>.

Eseguire il comando seguente per installare il pacchetto Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Creare un progetto di Funzioni di Azure

Nella finestra del terminale o da un prompt dei comandi, passare a una cartella vuota del progetto ed eseguire questo comando:

<MarkdownHighlighter>func init</MarkdownHighlighter>

Verrà inoltre richiesto di scegliere un runtime per il progetto. Selezionare {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Creare una funzione

Eseguire il comando seguente per creare una funzione:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Verrà richiesto di scegliere un modello per la funzione. Per iniziare, è consigliabile usare il trigger HTTP.

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>Eseguire il progetto di funzione localmente

Usare il comando seguente per avviare l'app per le funzioni:

<MarkdownHighlighter>func start</MarkdownHighlighter>

Il runtime restituirà un URL per qualsiasi funzione HTTP, che può essere copiato ed eseguito nella barra degli indirizzi del browser.

Per arrestare il debug, usare **CTRL+C** nel terminale.

<br/>
### <a name="deploy-your-code-to-azure"></a>Distribuire il codice in Azure

Per pubblicare il progetto di Funzioni in Azure, immettere il comando seguente:

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

Verrà visualizzata la richiesta di accedere ad Azure. Seguire le istruzioni visualizzate.
