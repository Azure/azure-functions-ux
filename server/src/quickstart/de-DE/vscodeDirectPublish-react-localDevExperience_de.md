### <a name="install-dependencies"></a>Installieren von Abhängigkeiten

Als Erstes sollten Sie <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">Visual Studio Code installieren</a>. Darüber hinaus sollten Sie die <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.js-Plattform installieren</a>, die npm enthält. Auf diese Weise erhalten Sie die Azure Functions Core Tools. Falls Sie Node nicht installieren möchten, können Sie sich die anderen Installationsoptionen in unserer <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools-Referenz</a> ansehen.

Führen Sie den folgenden Befehl aus, um das Core Tools-Paket zu installieren:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">Installieren Sie anschließend die Azure Functions-Erweiterung für Visual Studio Code</a>. Klicken Sie nach der Installation der Erweiterung in der Aktivitätsleiste auf das Azure-Logo. Klicken Sie unter **Azure: Functions** auf **Bei Azure anmelden...** , und befolgen Sie die Anleitung auf dem Bildschirm.

<br/>
### <a name="create-an-azure-functions-project"></a>Erstellen eines Azure Functions-Projekts

Klicken Sie auf das Symbol **Neues Projekt erstellen…** im Bereich **Azure: Functions**.

Sie werden aufgefordert, ein Verzeichnis für Ihre App auszuwählen. Wählen Sie ein leeres Verzeichnis aus.

Anschließend werden Sie aufgefordert, eine Sprache für Ihr Projekt auszuwählen. Wählen Sie „{workerRuntime}“ aus.

<br/>
### <a name="create-a-function"></a>Erstellen einer Funktion

Klicken Sie auf das Symbol **Funktion erstellen…** im Bereich **Azure: Functions**.

Sie werden aufgefordert, eine Vorlage für Ihre Funktion auszuwählen. Für den Einstieg empfehlen wir die Auswahl von „HTTP-Trigger“.

<br/>
### <a name="run-your-function-project-locally"></a>Lokales Ausführen Ihres Funktionsprojekts

Drücken Sie **F5**, um Ihre Funktions-App auszuführen.

Die Runtime gibt eine URL für beliebige HTTP-Funktionen aus, die kopiert und in der Adressleiste Ihres Browsers ausgeführt werden kann.

Drücken Sie **UMSCHALT+F5**, um das Debuggen zu beenden.

<br/>
### <a name="deploy-your-code-to-azure"></a>Bereitstellen Ihres Codes in Azure

Klicken Sie auf das Symbol **Für Funktions-App bereitstellen…** (<ChevronUp/>) im Bereich **Azure: Functions**.

Wählen Sie „{functionAppName}“ aus, wenn Sie zum Auswählen einer Funktions-App aufgefordert werden.
