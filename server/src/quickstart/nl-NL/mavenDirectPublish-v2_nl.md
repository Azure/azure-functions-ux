### Afhankelijkheden installeren

Voordat u aan de slag kunt, moet u <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">de Java Developer Kit, versie 8 installeren</a>. Zorg ervoor dat de omgevingsvariabele JAVA\_HOME wordt ingesteld op de installatielocatie van de JDK. U moet ook <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">Apache Maven versie 3.0 of hoger installeren</a>.

U moet ook <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS</a> met NPM installeren. Hiermee verkrijgt u de Azure Functions Core Tools. Als u Node niet wilt installeren, raadpleegt u de overige installatieopties in het <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referentiemateriaal voor Core Tools</a>.

Voer de volgende opdracht uit om het Core Tools-pakket te installeren:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools maakt gebruik van <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>. Dit moet u dus ook installeren.

<a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">Installeer tot slot Azure CLI 2.0</a>. Nadat dit is geïnstalleerd, controleert u of u bent aangemeld door de aanmeldingsopdracht uit te voeren en de instructies op het scherm te volgen:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### Een Azure Functions-project maken

Ga in het terminalvenster of vanaf een opdrachtprompt naar een lege map voor uw project en voer de volgende opdracht uit:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### Een functie maken

Als u het project maakt, wordt standaard een HTTP-functie gemaakt. U hoeft dus niets te doen voor deze stap. Als u later een nieuwe functie wilt toevoegen, voert u de volgende opdracht uit:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

U wordt door Maven gevraagd om een sjabloon voor de nieuwe functie te selecteren en aan te passen.

<br/>
### Uw functieproject lokaal uitvoeren

Typ de volgende opdracht om uw functie-app uit te voeren:

<MarkdownHighlighter>mvn clean package mvn azure-functions:run</MarkdownHighlighter>

Via de runtime wordt een URL uitgevoerd voor alle HTTP-functies. Deze URL kunt u kopiëren en uitvoeren in de adresbalk van uw browser.

Als u de foutopsporing wilt stoppen, gebruikt u **CTRL-C** in de terminal.

<br/>
### Uw code implementeren in Azure

Typ de volgende opdracht om uw Functions-project te publiceren in Azure:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

U wordt mogelijk gevraagd om u aan te melden bij Azure als u dat nog niet hebt gedaan. Volg de instructies op het scherm.
