### <a name="install-dependencies"></a>Afhankelijkheden installeren

Voordat u aan de slag kunt gaan, moet u <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">versie 8 van de Java Developer Kit installeren</a>. Zorg ervoor dat de omgevingsvariabele JAVA_HOME is ingesteld op de installatielocatie van de JDK. U moet ook <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">versie 3.0 of hoger van Apache Maven installeren</a>.

Daarnaast moet u <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.js installeren</a>, wat npm omvat. Op deze manier kunt u Azure Functions Core Tools verkrijgen. Als u Node liever niet installeert, bekijkt u de andere installatieopties in onze <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">naslaginformatie voor Core Tools</a>.

Voer de volgende opdracht uit om het Core Tools-pakket te installeren:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools maken gebruik van <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>. Installeer dit daarom ook.

Ten slotte moet u ook <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">Azure CLI 2.0</a> installeren. Zodra alles is geïnstalleerd, controleert u of u bent aangemeld door de opdracht voor aanmelden uit te voeren, en de instructies op het scherm te volgen:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Een Azure Functions-project maken

Ga in het terminalvenster of vanuit een opdrachtprompt naar een lege map voor het project, en voer de volgende opdracht uit:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>Een functie maken

Als u het project maakt, wordt standaard een HTTP-functie gemaakt. U hoeft voor deze stap dus op dit moment niets te doen. Als u later een nieuwe functie wilt toevoegen, voert u de volgende opdracht uit:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

U wordt in Maven gevraagd om een sjabloon te selecteren en aan te passen voor de nieuwe functie.

<br/>
### <a name="run-your-function-project-locally"></a>Het functieproject lokaal uitvoeren

Voer de volgende opdracht in om de functie-app uit te voeren:

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

Tijdens runtime wordt een URL gegenereerd voor een willekeurige HTTP-functie. Deze URL kunt u kopiëren en uitvoeren in de adresbalk van de browser.

Gebruik **Ctrl-C** in de terminal om de foutopsporing te stoppen.

<br/>
### <a name="deploy-your-code-to-azure"></a>De code implementeren in Azure

Als u het Functions-project wilt publiceren in Azure, voert u de volgende opdracht in:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Mogelijk wordt u gevraagd om u aan te melden bij Azure, als u dit nog niet hebt gedaan. Volg de instructies op het scherm.
