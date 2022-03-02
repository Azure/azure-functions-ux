### <a name="install-dependencies"></a>Installare le dipendenze

Prima di iniziare, è necessario <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">installare Visual Studio Code</a>. È necessario anche <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installare Node.JS</a>, che include npm. Questo è il modo in cui si otterrà Azure Functions Core Tools. Se si preferisce non installare Node, vedere le altre opzioni di installazione nella <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Guida di riferimento a Core Tools</a>.

Eseguire il comando seguente per installare il pacchetto Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

Successivamente, <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">installare l’estensione Funzioni di Azure per Visual Studio Code</a>. Una volta installata l'estensione, fare clic sul logo di Azure nella barra delle attività. In **Azure: Funzioni** fare clic su **Accedi ad Azure…** e seguire le istruzioni visualizzate.

<br/>
### <a name="create-an-azure-functions-project"></a>Creare un progetto di Funzioni di Azure

Fare clic sull’icona **Crea nuovo progetto…** nel pannello **Azure: Funzioni**.

Verrà richiesto di scegliere una directory per l'app. Scegliere una directory vuota.

Verrà quindi richiesto di selezionare una lingua per il progetto. Scegliere {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Creare una funzione

Fare clic sull’icona **Crea funzione…** nel pannello **Azure: Funzioni**.

Verrà richiesto di scegliere un modello per la funzione. Per iniziare, è consigliabile usare il trigger HTTP.

<br/>
### <a name="run-your-function-project-locally"></a>Eseguire il progetto di funzione localmente

Per eseguire l’app per le funzioni, premere **F5**.

Il runtime restituirà un URL per qualsiasi funzione HTTP, che può essere copiato ed eseguito nella barra degli indirizzi del browser.

Per interrompere il debug, premere **MAIUSC+F5**.

<br/>
### <a name="deploy-your-code-to-azure"></a>Distribuire il codice in Azure

Fare clic sull’icona **Distribuisci in app per le funzioni…** (<ChevronUp/>) nel pannello **Azure: Funzioni**.

Quando viene richiesto di selezionare un'app per le funzioni, scegliere {functionAppName}.
