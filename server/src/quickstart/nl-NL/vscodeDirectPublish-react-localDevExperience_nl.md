### <a name="install-dependencies"></a>Afhankelijkheden installeren

Voordat u aan de slag kunt gaan, moet u <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">Visual Studio Code installeren</a>. Daarnaast moet u <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.js installeren</a>, wat npm omvat. Op deze manier kunt u Azure Functions Core Tools verkrijgen. Als u Node liever niet installeert, bekijkt u de andere installatieopties in onze <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">naslaginformatie voor Core Tools</a>.

Voer de volgende opdracht uit om het Core Tools-pakket te installeren:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">Installeer vervolgens de Azure Functions-extensie voor Visual Studio Code</a>. Zodra de extensie is geïnstalleerd, klikt u op het Azure-logo in de activiteitenbalk. Klik bij **Azure: Functions** op **Aanmelden bij Azure...** en volg de instructies op het scherm.

<br/>
### <a name="create-an-azure-functions-project"></a>Een Azure Functions-project maken

Klik op het pictogram **Nieuw Project maken…** in het paneel **Azure: Functions**.

U wordt gevraagd een map te kiezen voor de app. Kies een lege map.

Vervolgens wordt u gevraagd een taal te selecteren voor het project. Kies {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Een functie maken

Klik op het pictogram **Functie maken…** in het paneel **Azure: Functions**.

U wordt gevraagd om een sjabloon te kiezen voor de functie. U wordt aangeraden om aan de slag te gaan met HTTP.

<br/>
### <a name="run-your-function-project-locally"></a>Het functieproject lokaal uitvoeren

Druk op **F5** om de functie-app uit te voeren.

Tijdens runtime wordt een URL gegenereerd voor een willekeurige HTTP-functie. Deze URL kunt u kopiëren en uitvoeren in de adresbalk van de browser.

Als u wilt stoppen met fouten opsporen, drukt u op **Shift + F5**.

<br/>
### <a name="deploy-your-code-to-azure"></a>De code implementeren in Azure

Klik op het pictogram **Implementeren in functie-app…** (<ChevronUp/>) in het paneel **Azure: Functions**.

Wanneer u wordt gevraagd om een functie-app te selecteren, kiest u {functionAppName}.
