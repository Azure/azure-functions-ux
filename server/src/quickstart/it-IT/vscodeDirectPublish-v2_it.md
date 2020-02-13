### Installare le dipendenze

Prima di iniziare, è necessario <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">installare Visual Studio Code</a>. È anche necessario <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installare Node.JS</a> che include npm, per ottenere Azure Functions Core Tools. Se si preferisce non installare Node, vedere le altre opzioni di installazione nelle <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">informazioni di riferimento su Core Tools</a>.

Eseguire il comando seguente per installare il pacchetto Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools fa uso di <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a> che deve quindi essere installato.

Successivamente, <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">installare l'estensione Funzioni di Azure per Visual Studio Code</a>. Una volta installata l'estensione, fare clic sul logo di Azure nella barra delle attività. In **Azure: Funzioni** fare clic su **Accedi ad Azure...** e seguire le istruzioni visualizzate.

<br/>
### Creare un progetto Funzioni di Azure

Fare clic sull'icona **Crea nuovo progetto...** nel riquadro **Azure: Funzioni**.

Verrà richiesto di scegliere una directory per l'app. Scegliere una directory vuota.

Verrà quindi richiesto di selezionare un linguaggio per il progetto. Scegliere {workerRuntime}.

<br/>
### Creare una funzione

Fare clic sull'icona **Crea funzione...** nel riquadro **Azure: Funzioni**.

Verrà richiesto di scegliere un modello per la funzione. Per iniziare, è consigliabile usare il trigger HTTP.

<br/>
### Eseguire il progetto di funzione in locale

Premere **F5** per eseguire l'app per le funzioni.

Il runtime genererà l'output di un URL per qualsiasi funzione HTTP, che può essere copiato ed eseguito nella barra degli indirizzi del browser.

Per arrestare il debug, premere **MAIUSC + F5**.

<br/>
### Distribuire il codice in Azure

Fare clic sull'icona **Distribuisci nell'app per le funzioni...** (freccia blu verso l'alto) nel riquadro **Azure: Funzioni**.

Quando viene richiesto di selezionare un'app per le funzioni, scegliere {functionAppName}.
