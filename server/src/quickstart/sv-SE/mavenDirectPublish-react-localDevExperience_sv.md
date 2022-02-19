### <a name="install-dependencies"></a>Installera beroenden

Innan du börjar måste du <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">installera Java Developer Kit, version 8</a>. Se till att miljövariabeln JAVA_HOME är inställd på JDK-installationsplatsen. Du måste också <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">installera Apache Maven, version 3.0 eller senare</a>.

Du bör också <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installera Node.JS</a> som innehåller npm. Så här skaffar du Azure Functions Core Tools. Om du inte vill installera Node kan du se andra installationsalternativ i vår <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools-referens</a>.

Kör följande kommando för att installera Core Tools-paketet:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools använder <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, så du bör även installera det.

Slutligen <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">installerar du Azure CLI 2.0</a>. När det är installerat kontrollerar du att du är inloggad genom att köra inloggningskommandot och följa anvisningarna på skärmen:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Skapa ett Azure Functions-projekt

I terminalfönstret eller från en kommandotolk navigerar du till en tom mapp för projektet och kör följande kommando:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>Skapa en funktion

När du skapar projektet skapas en HTTP-funktion som standard, så du behöver inte göra något just nu för det här steget. Om du vill lägga till en ny funktion senare kör du följande kommando:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven uppmanar dig att välja och anpassa en mall för den nya funktionen.

<br/>
### <a name="run-your-function-project-locally"></a>Kör ditt funktionsprojekt lokalt

Ange följande kommando för att köra funktionsappen:

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

Vid körningen matas en URL ut för alla HTTP-funktioner. Du kan kopiera och köra dessa i adressfältet i din webbläsare.

Använd **Ctrl-C** i terminalen för att stoppa felsökningen.

<br/>
### <a name="deploy-your-code-to-azure"></a>Distribuera din kod till Azure

Om du vill publicera ditt Functions-projekt i Azure anger du följande kommando:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Du kan uppmanas att logga in på Azure om du inte redan har gjort det. Följ anvisningarna på skärmen.
