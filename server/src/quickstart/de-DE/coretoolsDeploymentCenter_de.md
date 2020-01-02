# Installieren von Abhängigkeiten

Bevor Sie beginnen können, müssen Sie [.NET Core 2.1 installieren](https://go.microsoft.com/fwlink/?linkid=2016373). Außerdem sollten Sie [Node.JS installieren](https://go.microsoft.com/fwlink/?linkid=2016195), das npm umfasst. Über npm rufen Sie die Azure Functions Core Tools ab. Wenn Sie Node nicht installieren möchten, finden Sie weitere Installationsoptionen in der [Core Tools-Referenz](https://go.microsoft.com/fwlink/?linkid=2016192).

Führen Sie den folgenden Befehl aus, um das Core Tools-Paket zu installieren:

``` npm install -g azure-functions-core-tools ```

<br/>
# Erstellen eines Azure Functions-Projekts

Navigieren Sie im Terminalfenster oder von einer Eingabeaufforderung aus zu einem leeren Ordner für Ihr Projekt, und führen Sie den folgenden Befehl aus:

``` func init ```

Sie werden aufgefordert, eine Runtime für das Projekt auszuwählen. Wählen Sie {workerRuntime} aus.

<br/>
# Erstellen einer Funktion

Führen Sie zum Erstellen einer Funktion den folgenden Befehl aus:

``` func new ```

Hierdurch werden Sie aufgefordert, eine Vorlage für Ihre Funktion auszuwählen. Für den Einstieg wird ein HTTP-Trigger empfohlen.

<br/>
# Lokale Ausführung Ihres Funktionsprojekts

Führen Sie den folgenden Befehl aus, um Ihre Funktions-App zu starten:

``` func start ```

Die Runtime gibt eine URL für beliebige HTTP-Funktionen aus, die Sie in die Adressleiste Ihres Browsers kopieren und ausführen können.

Verwenden Sie zum Beenden des Debuggens im Terminal die Tastenkombination **STRG-C**.

<br/>
# Bereitstellen Ihres Codes in Azure

Klicken Sie auf die unten angezeigte Schaltfläche **Beenden und zum Bereitstellungscenter wechseln**, um zum Bereitstellungscenter zu navigieren und die Einrichtung Ihrer App abzuschließen. Sie werden durch einen neuen Assistenten geleitet, um verschiedene Bereitstellungsoptionen zu konfigurieren. Lösen Sie nach Abschluss der Konfiguration mit dem von Ihnen konfigurierten Mechanismus eine Bereitstellung aus.
