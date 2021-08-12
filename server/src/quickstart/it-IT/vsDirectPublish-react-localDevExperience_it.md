### <a name="install-dependencies"></a>Installare le dipendenze

Prima di iniziare, è necessario <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">installare Visual Studio 2019</a> e assicurarsi che sia installato anche il carico di lavoro Sviluppo di Azure.

Dopo l’installazione di Visual Studio, assicurarsi di avere gli <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">strumenti di Funzioni di Azure più recenti</a>.

<br/>
### <a name="create-an-azure-functions-project"></a>Creare un progetto di Funzioni di Azure

In Visual Studio selezionare **Nuovo** > **Progetto** dal menu **File**.

Nella finestra di dialogo **Nuovo progetto** selezionare **Installato**, espandere **Visual C#** > **Cloud**, selezionare **Funzioni di Azure**, digitare un **nome** per il progetto e fare clic su **OK**. Il nome dell'app per le funzioni deve essere valido come spazio dei nomi C#, quindi non usare caratteri di sottolineatura, trattini o altri caratteri non alfanumerici.

Seguire la procedura guidata per selezionare e personalizzare un modello. Per iniziare, è consigliabile usare HTTP. Fare quindi clic su **OK** per creare la prima funzione.

<br/>
### <a name="create-a-function"></a>Creare una funzione

La creazione del progetto crea una funzione HTTP per impostazione predefinita, quindi al momento non è necessario eseguire alcuna operazione per questo passaggio. In seguito, se si vuole aggiungere una nuova funzione, fare clic con il pulsante destro del mouse sul progetto in **Esplora soluzioni** e selezionare **Aggiungi** > **Nuova funzione di Azure…**

Assegnare un nome alla funzione e fare clic su **Aggiungi**. Selezionare e personalizzare il modello e quindi fare clic su **OK**.

<br/>
### <a name="run-your-function-project-locally"></a>Eseguire il progetto di funzione localmente

Per eseguire l’app per le funzioni, premere **F5**.

Il runtime restituirà un URL per qualsiasi funzione HTTP, che può essere copiato ed eseguito nella barra degli indirizzi del browser.

Per interrompere il debug, premere **MAIUSC+F5**.

<br/>
### <a name="deploy-your-code-to-azure"></a>Distribuire il codice in Azure

Fare clic con il pulsante destro del mouse sul progetto in **Esplora soluzioni** e scegliere **Pubblica**.

Per la destinazione di pubblicazione, scegliere App per le funzioni di Azure e quindi scegliere **Seleziona esistente**. Fare quindi clic su **Pubblica**.

Se Visual Studio non è ancora stato connesso al proprio account di Azure, selezionare **Aggiungi un account…** e seguire le istruzioni visualizzate sullo schermo.

In **Sottoscrizione** selezionare {subscriptionName}. Cercare {functionAppName} e quindi selezionarlo nella sezione seguente. Fare quindi clic su **OK**.
