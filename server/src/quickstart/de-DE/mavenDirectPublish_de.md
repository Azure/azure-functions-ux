# Installieren von Abhängigkeiten

Bevor Sie beginnen können, müssen Sie [Version 8 des Java Developer Kit](https://go.microsoft.com/fwlink/?linkid=2016706) installieren. Stellen Sie sicher, dass die Umgebungsvariable JAVA\_HOME auf den Installationsspeicherort des JDK festgelegt ist. Sie müssen außerdem [Apache Maven, Version 3.0 oder höher installieren](https://go.microsoft.com/fwlink/?linkid=2016384).

Ferner sollten Sie auch [Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195) installieren, das npm umfasst. Über npm rufen Sie die Azure Functions Core Tools ab. Wenn Sie Node nicht installieren möchten, finden Sie weitere Installationsoptionen in der [Core Tools-Referenz](https://go.microsoft.com/fwlink/?linkid=2016192).

Führen Sie den folgenden Befehl aus, um das Core Tools-Paket zu installieren:

``` npm install -g azure-functions-core-tools ```

Die Core Tools nutzen [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373), deshalb sollte auch diese Komponente installiert werden.

Zuletzt installieren Sie die [Azure CLI 2.0](https://go.microsoft.com/fwlink/?linkid=2016701). Stellen Sie nach Abschluss der Installation sicher, dass Sie angemeldet sind. Führen Sie hierzu den Anmeldebefehl aus, und folgen Sie den Anweisungen auf dem Bildschirm:

``` az login ```

<br/>
# Erstellen eines Azure Functions-Projekts

Navigieren Sie im Terminalfenster oder von einer Eingabeaufforderung aus zu einem leeren Ordner für Ihr Projekt, und führen Sie den folgenden Befehl aus:

``` mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false ```

<br/>
# Erstellen einer Funktion

Beim Erstellen des Projekts wird standardmäßig eine HTTP-Funktion erstellt, sodass Sie in diesem Schritt nichts weiter tun müssen. Wenn Sie später eine neue Funktion hinzufügen möchten, führen Sie den folgenden Befehl aus:

``` mvn azure-functions:add ```

Sie werden von Maven aufgefordert, eine Vorlage für die neue Funktion auszuwählen und anzupassen.

<br/>
# Lokale Ausführung Ihres Funktionsprojekts

Geben Sie den folgenden Befehl ein, um Ihre Funktions-App auszuführen:

``` mvn clean package mvn azure-functions:run ```

Die Runtime gibt eine URL für beliebige HTTP-Funktionen aus, die Sie in die Adressleiste Ihres Browsers kopieren und ausführen können.

Verwenden Sie zum Beenden des Debuggens im Terminal die Tastenkombination **STRG-C**.

<br/>
# Bereitstellen Ihres Codes in Azure

Um Ihr Functions-Projekt in Azure zu veröffentlichen, geben Sie den folgenden Befehl ein:

``` mvn azure-functions:deploy ```

Sofern noch nicht geschehen, werden Sie aufgefordert, sich bei Azure anzumelden. Folgen Sie den Anweisungen auf dem Bildschirm.
