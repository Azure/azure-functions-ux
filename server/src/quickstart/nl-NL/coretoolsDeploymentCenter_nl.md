# Afhankelijkheden installeren

Voordat u aan de slag kunt, moet u [.NET Core 2.1 installeren](https://go.microsoft.com/fwlink/?linkid=2016373). U moet ook [Node.JS installeren](https://go.microsoft.com/fwlink/?linkid=2016195). Dit bevat NPM, waarmee u de Azure Functions Core Tools verkrijgt. Als u Node niet wilt installeren, raadpleegt u de overige installatieopties in het [referentiemateriaal voor Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Voer de volgende opdracht uit om het Core Tools-pakket te installeren:

``` npm install -g azure-functions-core-tools ```

<br/>
# Een Azure Functions-project maken

Ga in het terminalvenster of vanaf een opdrachtprompt naar een lege map voor uw project en voer de volgende opdracht uit:

``` func init ```

U wordt ook gevraagd om een runtime voor het project te kiezen. Kies {workerRuntime}.

<br/>
# Een functie maken

Als u een functie wilt maken, voert u de volgende opdracht uit:

``` func new ```

Hiermee wordt u gevraagd een sjabloon voor uw functie te kiezen. Het wordt aanbevolen om in eerste instantie een HTTP-trigger te gebruiken.

<br/>
# Uw functieproject lokaal uitvoeren

Voer de volgende opdracht uit om uw functie-app te starten:

``` func start ```

Via de runtime wordt een URL uitgevoerd voor alle HTTP-functies. Deze URL kunt u kopiëren en uitvoeren in de adresbalk van uw browser.

Als u de foutopsporing wilt stoppen, gebruikt u **CTRL-C** in de terminal.

<br/>
# Uw code implementeren in Azure

Gebruik de onderstaande knop **Voltooien en naar Deployment Center** om naar Deployment Center te gaan en het instellen van uw app te voltooien. Hiermee doorloopt u een nieuwe wizard voor het configureren van verschillende implementatieopties. Nadat deze stroom is voltooid, kunt u een implementatie activeren met het mechanisme dat u hebt geconfigureerd.
