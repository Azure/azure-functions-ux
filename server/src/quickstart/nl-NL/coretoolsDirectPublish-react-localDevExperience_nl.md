### <a name="install-dependencies"></a>Afhankelijkheden installeren

Voordat u aan de slag kunt gaan, moet u <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.js installeren</a>, wat npm omvat. Op deze manier kunt u Azure Functions Core Tools verkrijgen. Als u Node.js liever niet installeert, bekijkt u de andere installatieopties in onze <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">naslaginformatie voor Core Tools</a>.

Voer de volgende opdracht uit om het Core Tools-pakket te installeren:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Een Azure Functions-project maken

Ga in het terminalvenster of vanuit een opdrachtprompt naar een lege map voor het project, en voer de volgende opdracht uit:

<MarkdownHighlighter>func init</MarkdownHighlighter>

U wordt ook gevraagd om een runtime te kiezen voor het project. Selecteer {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Een functie maken

Voer de volgende opdracht uit om een functie te maken:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Hierna wordt u gevraagd om een sjabloon te kiezen voor de functie. U wordt aangeraden om aan de slag te gaan met HTTP.

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>Het functieproject lokaal uitvoeren

Voer de volgende opdracht uit om de functie-app te starten:

<MarkdownHighlighter>func start</MarkdownHighlighter>

Tijdens runtime wordt een URL gegenereerd voor een willekeurige HTTP-functie. Deze URL kunt u kopiëren en uitvoeren in de adresbalk van de browser.

Gebruik **Ctrl-C** in de terminal om de foutopsporing te stoppen.

<br/>
### <a name="deploy-your-code-to-azure"></a>De code implementeren in Azure

Als u het Functions-project wilt publiceren in Azure, voert u de volgende opdracht in:

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

U wordt mogelijk gevraagd u aan te melden bij Azure. Volg de instructies op het scherm.
