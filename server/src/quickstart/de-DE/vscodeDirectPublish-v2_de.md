### Installieren von Abhängigkeiten

Bevor Sie beginnen können, müssen Sie <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">Visual Studio Code installieren</a>. Außerdem sollten Sie <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS installieren</a>, das npm umfasst. Über npm rufen Sie die Azure Functions Core Tools ab. Wenn Sie Node nicht installieren möchten, finden Sie weitere Installationsoptionen in der <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools-Referenz</a>.

Führen Sie den folgenden Befehl aus, um das Core Tools-Paket zu installieren:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Die Core Tools nutzen <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, deshalb sollte auch diese Komponente installiert werden.

Als Nächstes <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">installieren Sie die Azure Functions-Erweiterung für Visual Studio Code</a>. Nach Installation der Erweiterung klicken Sie auf das Azure-Logo in der Aktivitätsleiste. Klicken Sie unter **Azure: Functions** auf **Bei Azure anmelden**, und folgen Sie den Anweisungen auf dem Bildschirm.

<br/>
### Erstellen eines Azure Functions-Projekts

Klicken Sie im Panel **Azure: Functions** auf das Symbol **Neues Projekt erstellen**.

Sie werden aufgefordert, ein Verzeichnis für Ihre App auszuwählen. Wählen Sie ein leeres Verzeichnis aus.

Anschließend werden Sie zur Auswahl einer Sprache für Ihr Projekt aufgefordert. Wählen Sie {workerRuntime} aus.

<br/>
### Erstellen einer Funktion

Klicken Sie im Panel **Azure: Functions** auf das Symbol **Funktion erstellen**.

Sie werden aufgefordert, eine Vorlage für Ihre Funktion auszuwählen. Für den Einstieg wird ein HTTP-Trigger empfohlen.

<br/>
### Lokale Ausführung Ihres Funktionsprojekts

Drücken Sie **F5**, um Ihre Funktions-App auszuführen.

Die Runtime gibt eine URL für beliebige HTTP-Funktionen aus, die Sie in die Adressleiste Ihres Browsers kopieren und ausführen können.

Drücken Sie **UMSCHALT+F5**, um das Debuggen zu beenden.

<br/>
### Bereitstellen Ihres Codes in Azure

Klicken Sie im Panel **Azure: Functions** auf das Symbol **In Functions-App bereitstellen** (blauer Pfeil nach oben).

Wählen Sie bei Aufforderung zur Auswahl einer Funktions-App {functionAppName} aus.
