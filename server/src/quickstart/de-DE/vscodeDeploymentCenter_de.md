# Installieren von Abhängigkeiten

Bevor Sie beginnen können, müssen Sie [Visual Studio Code installieren](https://go.microsoft.com/fwlink/?linkid=2016593). Außerdem sollten Sie [Node.JS installieren](https://go.microsoft.com/fwlink/?linkid=2016195), das npm umfasst. Über npm rufen Sie die Azure Functions Core Tools ab. Wenn Sie Node nicht installieren möchten, finden Sie weitere Installationsoptionen in der [Core Tools-Referenz](https://go.microsoft.com/fwlink/?linkid=2016192).

Führen Sie den folgenden Befehl aus, um das Core Tools-Paket zu installieren:

``` npm install -g azure-functions-core-tools ```

Die Core Tools nutzen [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373), deshalb sollte auch diese Komponente installiert werden.

Als Nächstes [installieren Sie die Azure Functions-Erweiterung für Visual Studio Code](https://go.microsoft.com/fwlink/?linkid=2016800). Nach Installation der Erweiterung klicken Sie auf das Azure-Logo in der Aktivitätsleiste. Klicken Sie unter **Azure: Functions** auf **Bei Azure anmelden**, und folgen Sie den Anweisungen auf dem Bildschirm.

<br/>
# Erstellen eines Azure Functions-Projekts

Klicken Sie im Panel **Azure: Functions** auf das Symbol **Neues Projekt erstellen**.

Sie werden aufgefordert, ein Verzeichnis für Ihre App auszuwählen. Wählen Sie ein leeres Verzeichnis aus.

Anschließend werden Sie zur Auswahl einer Sprache für Ihr Projekt aufgefordert. Wählen Sie {workerRuntime} aus.

<br/>
# Erstellen einer Funktion

Klicken Sie im Panel **Azure: Functions** auf das Symbol **Funktion erstellen**.

Sie werden aufgefordert, eine Vorlage für Ihre Funktion auszuwählen. Für den Einstieg wird ein HTTP-Trigger empfohlen.

<br/>
# Lokale Ausführung Ihres Funktionsprojekts

Drücken Sie **F5**, um Ihre Funktions-App auszuführen.

Die Runtime gibt eine URL für beliebige HTTP-Funktionen aus, die Sie in die Adressleiste Ihres Browsers kopieren und ausführen können.

Drücken Sie **UMSCHALT+F5**, um das Debuggen zu beenden.

<br/>
# Bereitstellen Ihres Codes in Azure

Klicken Sie auf die unten angezeigte Schaltfläche **Beenden und zum Bereitstellungscenter wechseln**, um zum Bereitstellungscenter zu navigieren und die Einrichtung Ihrer App abzuschließen. Sie werden durch einen neuen Assistenten geleitet, um verschiedene Bereitstellungsoptionen zu konfigurieren. Lösen Sie nach Abschluss der Konfiguration mit dem von Ihnen konfigurierten Mechanismus eine Bereitstellung aus.
