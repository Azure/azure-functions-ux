# Afhankelijkheden installeren

Voordat u aan de slag kunt, moet u [Visual Studio Code installeren](https://go.microsoft.com/fwlink/?linkid=2016593). U moet ook [Node.JS installeren](https://go.microsoft.com/fwlink/?linkid=2016195). Dit bevat NPM, waarmee u de Azure Functions Core Tools verkrijgt. Als u Node niet wilt installeren, raadpleegt u de overige installatieopties in het [referentiemateriaal voor Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Voer de volgende opdracht uit om het Core Tools-pakket te installeren:

``` npm install -g azure-functions-core-tools ```

Core Tools maakt gebruik van [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373). Dit moet u dus ook installeren.

[Installeer vervolgens de Azure Functions-uitbreiding voor Visual Studio Code](https://go.microsoft.com/fwlink/?linkid=2016800). Zodra de uitbreiding is geïnstalleerd, klikt u op het Azure-logo op de activiteitenbalk. Onder **Azure: Functions** klikt u op **Aanmelden bij Azure...** en volgt u de instructies op het scherm.

<br/>
# Een Azure Functions-project maken

Klik op het pictogram **Nieuw project maken...** in het paneel **Azure: Functions**.

U wordt gevraagd een map voor uw app te kiezen. Kies een lege map.

Vervolgens wordt u gevraagd een taal voor uw project te selecteren. Kies {workerRuntime}.

<br/>
# Een functie maken

Klik op het pictogram **Functie maken...** in het paneel **Azure: Functions**.

U wordt gevraagd een sjabloon voor uw functie te kiezen. Het wordt aanbevolen om in eerste instantie een HTTP-trigger te gebruiken.

<br/>
# Uw functieproject lokaal uitvoeren

Druk op **F5** om uw functie-app uit te voeren.

Via de runtime wordt een URL uitgevoerd voor alle HTTP-functies. Deze URL kunt u kopiëren en uitvoeren in de adresbalk van uw browser.

Druk op **Shift + F5** om de foutopsporing te stoppen.

<br/>
# Uw code implementeren in Azure

Klik op het pictogram **Implementeren naar functie-app...** (blauwe pijl-omhoog) in het paneel **Azure: Functions**.

Wanneer u wordt gevraagd om een functie-app te selecteren, kiest u {functionAppName}.
