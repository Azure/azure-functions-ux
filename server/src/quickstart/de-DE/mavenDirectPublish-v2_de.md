### Installieren von Abhängigkeiten

Bevor Sie beginnen können, müssen Sie <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">Version 8 des Java Developer Kit</a> installieren. Stellen Sie sicher, dass die Umgebungsvariable JAVA\_HOME auf den Installationsspeicherort des JDK festgelegt ist. Sie müssen außerdem <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">Apache Maven, Version 3.0 oder höher installieren</a>.

Ferner sollten Sie auch <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS</a> installieren, das npm umfasst. Über npm rufen Sie die Azure Functions Core Tools ab. Wenn Sie Node nicht installieren möchten, finden Sie weitere Installationsoptionen in der <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools-Referenz</a>.

Führen Sie den folgenden Befehl aus, um das Core Tools-Paket zu installieren:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Die Core Tools nutzen <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, deshalb sollte auch diese Komponente installiert werden.

Zuletzt installieren Sie die <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">Azure CLI 2.0</a>. Stellen Sie nach Abschluss der Installation sicher, dass Sie angemeldet sind. Führen Sie hierzu den Anmeldebefehl aus, und folgen Sie den Anweisungen auf dem Bildschirm:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### Erstellen eines Azure Functions-Projekts

Navigieren Sie im Terminalfenster oder von einer Eingabeaufforderung aus zu einem leeren Ordner für Ihr Projekt, und führen Sie den folgenden Befehl aus:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### Erstellen einer Funktion

Beim Erstellen des Projekts wird standardmäßig eine HTTP-Funktion erstellt, sodass Sie in diesem Schritt nichts weiter tun müssen. Wenn Sie später eine neue Funktion hinzufügen möchten, führen Sie den folgenden Befehl aus:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Sie werden von Maven aufgefordert, eine Vorlage für die neue Funktion auszuwählen und anzupassen.

<br/>
### Lokale Ausführung Ihres Funktionsprojekts

Geben Sie den folgenden Befehl ein, um Ihre Funktions-App auszuführen:

<MarkdownHighlighter>mvn clean package mvn azure-functions:run</MarkdownHighlighter>

Die Runtime gibt eine URL für beliebige HTTP-Funktionen aus, die Sie in die Adressleiste Ihres Browsers kopieren und ausführen können.

Verwenden Sie zum Beenden des Debuggens im Terminal die Tastenkombination **STRG-C**.

<br/>
### Bereitstellen Ihres Codes in Azure

Um Ihr Functions-Projekt in Azure zu veröffentlichen, geben Sie den folgenden Befehl ein:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Sofern noch nicht geschehen, werden Sie aufgefordert, sich bei Azure anzumelden. Folgen Sie den Anweisungen auf dem Bildschirm.
