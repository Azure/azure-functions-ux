### Installare le dipendenze

Prima di iniziare, è necessario <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">installare Visual Studio 2019</a> e assicurarsi che sia installato anche il carico di lavoro di sviluppo di Azure.

Dopo aver installato Visual Studio, assicurarsi che siano presenti gli <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">strumenti di Funzioni di Azure più recenti</a>.

<br/>
### Creare un progetto Funzioni di Azure

In Visual Studio scegliere **Nuovo** > **Progetto** dal menu **File**.

Nella finestra di dialogo **Nuovo progetto** selezionare **Installato**, espandere **Visual C#** > **Cloud**, selezionare **Funzioni di Azure**, digitare un **Nome** per il progetto e fare clic su **OK**. Il nome dell'app per le funzioni deve essere uno spazio dei nomi C# valido, quindi non usare caratteri di sottolineatura, trattini o altri caratteri non alfanumerici.

Seguire la procedura guidata per selezionare e personalizzare un modello. Per iniziare, è consigliabile usare HTTP. Fare quindi clic su **OK** per creare la prima funzione.

<br/>
### Creare una funzione

Per impostazione predefinita, la creazione del progetto crea una funzione HTTP, quindi non è richiesto alcun intervento per questo passaggio in questo momento. Se successivamente si vuole aggiungere una nuova funzione, fare clic con il pulsante destro del mouse sul progetto in **Esplora soluzioni** e scegliere **Aggiungi** > **Nuova funzione di Azure…**

Assegnare un nome alla funzione e fare clic su **Aggiungi**. Selezionare e personalizzare il modello, quindi fare clic su **OK**.

<br/>
### Eseguire il progetto di funzione in locale

Premere **F5** per eseguire l'app per le funzioni.

Il runtime genererà l'output di un URL per qualsiasi funzione HTTP, che può essere copiato ed eseguito nella barra degli indirizzi del browser.

Per arrestare il debug, premere **MAIUSC + F5**.

<br/>
### Distribuire il codice in Azure

Fare clic con il pulsante destro del mouse sul progetto in **Esplora soluzioni** e selezionare **Pubblica**.

Per la destinazione di pubblicazione, scegliere App per le funzioni di Azure e quindi **Seleziona esistente**. Infine, fare clic su **Pubblica**.

Se non si è ancora provveduto a connettere Visual Studio all'account Azure, selezionare **Aggiungi un account...** e seguire le istruzioni visualizzate.

In **Sottoscrizione** selezionare {subscriptionName}. Cercare {functionAppName} e quindi selezionare il nome nella sezione seguente. Infine, fare clic su **OK**.
