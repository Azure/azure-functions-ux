### Installare le dipendenze

Prima di iniziare, è necessario <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">installare Java Developer Kit, versione 8</a>. Assicurarsi che la variabile di ambiente JAVA\_HOME sia impostata sul percorso di installazione di JDK. Sarà inoltre necessario <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">installare Apache Maven, versione 3.0 o successiva</a>.

È anche necessario <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installare Node.JS</a> che include npm, per ottenere Azure Functions Core Tools. Se si preferisce non installare Node, vedere le altre opzioni di installazione nelle <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">informazioni di riferimento su Core Tools</a>.

Eseguire il comando seguente per installare il pacchetto Core Tools:

<MarkdownHighlighter> npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools fa uso di <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a> che deve quindi essere installato.

Infine, <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">installare l'interfaccia della riga di comando di Azure 2.0</a>. Al termine dell'installazione, assicurarsi di aver eseguito l'accesso usando il comando di accesso e seguendo le istruzioni visualizzate:

<MarkdownHighlighter> az login</MarkdownHighlighter>

<br/>
### Creare un progetto Funzioni di Azure

Nella finestra del terminale o da un prompt dei comandi, passare a una cartella vuota per il progetto ed eseguire questo comando:

<MarkdownHighlighter> mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### Creare una funzione

Per impostazione predefinita, la creazione del progetto crea una funzione HTTP, quindi non è richiesto alcun intervento per questo passaggio in questo momento. In seguito, per aggiungere una nuova funzione, eseguire questo comando:

<MarkdownHighlighter> mvn azure-functions:add</MarkdownHighlighter>

Maven richiederà di selezionare e personalizzare un modello per la nuova funzione.

<br/>
### Eseguire il progetto di funzione in locale

Per eseguire l'app per le funzioni, immettere questo comando:

<MarkdownHighlighter> mvn clean package mvn azure-functions:run</MarkdownHighlighter>

Il runtime genererà l'output di un URL per qualsiasi funzione HTTP, che può essere copiato ed eseguito nella barra degli indirizzi del browser.

Per arrestare il debug, usare **CTRL-C** nel terminale.

<br/>
### Distribuire il codice in Azure

Per pubblicare il progetto Funzioni in Azure, immettere il comando seguente:

<MarkdownHighlighter> mvn azure-functions:deploy</MarkdownHighlighter>

Potrebbe essere richiesto di eseguire l'accesso ad Azure, se non lo si è già fatto. Seguire le istruzioni visualizzate.
