### Installera beroenden

Innan du kan komma igång bör du <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">installera Java Developer Kit, version 8</a>. Se till att JAVA\_HOME-miljövariabeln ställs in på installationsplatsen för JDK. Du måste också <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">installera Apache Maven, version 3,0 eller senare</a>.

Du bör också <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installera Node. JS</a> som innehåller npm. Så här får du åtkomst till Azure Functions Core Tools. Om du inte vill installera noden kan du läsa andra installationsalternativ i <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referens om Core Tools</a>.

Kör följande kommando för att installera Core Tools-paketet:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Kärnverktygen använder <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2,1</a> så du bör installera det också.

Så här <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">installerar du Azure CLI 2.0</a>. När det är installerat kontrollerar du att du är inloggad genom att köra inloggningskommandot och följa anvisningarna på skärmen:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### Skapa ett Azure Functions-projekt

I terminalfönstret eller från en kommandotolk navigerar du till en tom mapp för projektet och kör följande kommando:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### Skapa en funktion

När du skapar projektet skapas en HTTP-funktion som standard, så du behöver inte göra något för det här steget just nu. Om du senare vill lägga till en ny funktion kör du följande kommando:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven kommer att uppmana dig att välja och anpassa en mall för den nya funktionen.

<br/>
### Kör ditt funktionsprojekt lokalt

Kör följande kommando för att starta din funktionsapp:

<MarkdownHighlighter>mvn clean package mvn azure-functions:run</MarkdownHighlighter>

Körningen kommer att skapa en URL för alla HTTP-funktioner som kan kopieras och köras i webbläsarens adressfält.

Använd **CTRL-C** i terminalen för att avbryta felsökningen.

<br/>
### Distribuera din kod till Azure

Om du vill publicera ett Functions-projekt i Azure anger du följande kommando:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Du kan uppmanas att logga in på Azure om du inte redan har gjort det. Följ anvisningarna på skärmen.
