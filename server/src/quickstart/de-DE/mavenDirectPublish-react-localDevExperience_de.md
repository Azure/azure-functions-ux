### <a name="install-dependencies"></a>Installieren von Abhängigkeiten

Als Erstes sollten Sie <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">Version 8 des Java Developer Kit installieren</a>. Stellen Sie sicher, dass die Umgebungsvariable „JAVA_HOME“ auf den Installationsspeicherort des JDK festgelegt wird. Sie müssen auch <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">Version 3.0 oder höher von Apache Maven installieren</a>.

Darüber hinaus sollten Sie die <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.js-Plattform installieren</a>, die npm enthält. Auf diese Weise erhalten Sie die Azure Functions Core Tools. Falls Sie Node nicht installieren möchten, können Sie sich die anderen Installationsoptionen in unserer <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools-Referenz</a> ansehen.

Führen Sie den folgenden Befehl aus, um das Core Tools-Paket zu installieren:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Da für die Core Tools <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a> genutzt wird, sollten Sie auch die Installation von .NET Core 2.1 durchführen.

<a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">Installieren Sie abschließend auch die Azure CLI 2.0</a>. Stellen Sie nach diesem Installationsvorgang sicher, dass Sie angemeldet sind, indem Sie den Anmeldebefehl ausführen und die Anleitung auf dem Bildschirm befolgen:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Erstellen eines Azure Functions-Projekts

Navigieren Sie im Terminalfenster oder an einer Eingabeaufforderung zu einem leeren Ordner Ihres Projekts, und führen Sie den folgenden Befehl aus:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>Erstellen einer Funktion

Bei der Erstellung des Projekts wird standardmäßig eine HTTP-Funktion erstellt. In diesem Schritt müssen Sie daher keine Aufgabe durchführen. Führen Sie den folgenden Befehl aus, falls Sie später eine neue Funktion hinzufügen möchten:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Sie werden von Maven aufgefordert, eine Vorlage für die neue Funktion auszuwählen und anzupassen.

<br/>
### <a name="run-your-function-project-locally"></a>Lokales Ausführen Ihres Funktionsprojekts

Geben Sie den folgenden Befehl ein, um Ihre Funktions-App auszuführen:

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

Die Runtime gibt eine URL für beliebige HTTP-Funktionen aus, die kopiert und in der Adressleiste Ihres Browsers ausgeführt werden kann.

Drücken Sie im Terminal die Tastenkombination **STRG+C**, um das Debuggen zu beenden.

<br/>
### <a name="deploy-your-code-to-azure"></a>Bereitstellen Ihres Codes in Azure

Geben Sie den folgenden Befehl ein, um Ihr Functions-Projekt in Azure zu veröffentlichen:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Unter Umständen werden Sie aufgefordert, sich bei Azure anzumelden, falls Sie diesen Schritt noch nicht ausgeführt haben. Folgen Sie den Anweisungen auf dem Bildschirm.
