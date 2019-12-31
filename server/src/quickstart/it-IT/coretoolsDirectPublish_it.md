# Installare le dipendenze

Prima di iniziare, è necessario [installare .NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373). È anche necessario [installare Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195) che include npm, per ottenere Azure Functions Core Tools. Se si preferisce non installare Node, vedere le altre opzioni di installazione nelle [informazioni di riferimento su Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Eseguire il comando seguente per installare il pacchetto Core Tools:

``` npm install -g azure-functions-core-tools ```

<br/>
# Creare un progetto Funzioni di Azure

Nella finestra del terminale o da un prompt dei comandi, passare a una cartella vuota per il progetto ed eseguire questo comando:

``` func init ```

Verrà inoltre richiesto di scegliere un runtime per il progetto. Selezionare {workerRuntime}.

<br/>
# Creare una funzione

Per creare una funzione, eseguire questo comando:

``` func new ```

Verrà richiesto di scegliere un modello per la funzione. Per iniziare, è consigliabile usare il trigger HTTP.

<br/>
# Eseguire il progetto di funzione in locale

Per avviare l'app per le funzioni, eseguire questo comando:

``` func start ```

Il runtime genererà l'output di un URL per qualsiasi funzione HTTP, che può essere copiato ed eseguito nella barra degli indirizzi del browser.

Per arrestare il debug, usare **CTRL-C** nel terminale.

<br/>
# Distribuire il codice in Azure

Per pubblicare il progetto Funzioni in Azure, immettere il comando seguente:

``` func azure functionapp publish {functionAppName} ```

Potrebbe essere richiesto di eseguire l'accesso ad Azure. Seguire le istruzioni visualizzate.
