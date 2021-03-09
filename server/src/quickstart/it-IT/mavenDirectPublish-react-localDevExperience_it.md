### <a name="install-dependencies"></a>Installare le dipendenze

Prima di iniziare, è necessario <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">installare Java Developer Kit, versione 8</a>. Assicurarsi di impostare la variabile di ambiente JAVA_HOME sul percorso di installazione di JDK. Sarà anche necessario <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">installare Apache Maven, versione 3.0 o successiva</a>.

È necessario anche <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installare Node.JS</a>, che include npm. Questo è il modo in cui si otterrà Azure Functions Core Tools. Se si preferisce non installare Node, vedere le altre opzioni di installazione nella <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Guida di riferimento a Core Tools</a>.

Eseguire il comando seguente per installare il pacchetto Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools usa <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, quindi è necessario installare anche tale software.

Infine, <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">installare l'interfaccia della riga di comando di Azure 2.0</a>. Una volta installato, assicurarsi di aver eseguito l'accesso eseguendo il comando login e seguendo le istruzioni visualizzate:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Creare un progetto di Funzioni di Azure

Nella finestra del terminale o da un prompt dei comandi, passare a una cartella vuota del progetto ed eseguire questo comando:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>Creare una funzione

La creazione del progetto crea una funzione HTTP per impostazione predefinita, quindi al momento non è necessario eseguire alcuna operazione per questo passaggio. Successivamente, se si vuole aggiungere una nuova funzione, eseguire questo comando:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven chiederà di selezionare e personalizzare un modello per la nuova funzione.

<br/>
### <a name="run-your-function-project-locally"></a>Eseguire il progetto di funzione localmente

Immettere il comando seguente per eseguire l'app per le funzioni:

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

Il runtime restituirà un URL per qualsiasi funzione HTTP, che può essere copiato ed eseguito nella barra degli indirizzi del browser.

Per arrestare il debug, usare **CTRL+C** nel terminale.

<br/>
### <a name="deploy-your-code-to-azure"></a>Distribuire il codice in Azure

Per pubblicare il progetto di Funzioni in Azure, immettere il comando seguente:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Se non è già stato effettuato, potrebbe essere richiesto l'accesso ad Azure. Seguire le istruzioni visualizzate.
