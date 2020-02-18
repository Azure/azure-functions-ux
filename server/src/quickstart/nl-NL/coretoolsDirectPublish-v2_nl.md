### Afhankelijkheden installeren

Voordat u aan de slag kunt, moet u <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1 installeren</a>. U moet ook <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS installeren</a>. Dit bevat NPM, waarmee u de Azure Functions Core Tools verkrijgt. Als u Node niet wilt installeren, raadpleegt u de overige installatieopties in het <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referentiemateriaal voor Core Tools</a>.

Voer de volgende opdracht uit om het Core Tools-pakket te installeren:

<MarkdownHighlighter> npm install -g azure-functions-core-tools</MarkdownHighlighter>

<br/>
### Een Azure Functions-project maken

Ga in het terminalvenster of vanaf een opdrachtprompt naar een lege map voor uw project en voer de volgende opdracht uit:

<MarkdownHighlighter> func init</MarkdownHighlighter>

U wordt ook gevraagd om een runtime voor het project te kiezen. Kies {workerRuntime}.

<br/>
### Een functie maken

Als u een functie wilt maken, voert u de volgende opdracht uit:

<MarkdownHighlighter> func new</MarkdownHighlighter>

Hiermee wordt u gevraagd een sjabloon voor uw functie te kiezen. Het wordt aanbevolen om in eerste instantie een HTTP-trigger te gebruiken.

<br/>
### Uw functieproject lokaal uitvoeren

Voer de volgende opdracht uit om uw functie-app te starten:

<MarkdownHighlighter> func start</MarkdownHighlighter>

Via de runtime wordt een URL uitgevoerd voor alle HTTP-functies. Deze URL kunt u kopiëren en uitvoeren in de adresbalk van uw browser.

Als u de foutopsporing wilt stoppen, gebruikt u **CTRL-C** in de terminal.

<br/>
### Uw code implementeren in Azure

Typ de volgende opdracht om uw Functions-project te publiceren in Azure:

<MarkdownHighlighter> func azure functionapp publish {functionAppName}</MarkdownHighlighter>

U wordt mogelijk gevraagd om u aan te melden bij Azure. Volg de instructies op het scherm.
