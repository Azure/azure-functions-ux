# Afhankelijkheden installeren

Voordat u aan de slag kunt, moet u [de Java Developer Kit, versie 8 installeren](https://go.microsoft.com/fwlink/?linkid=2016706). Zorg ervoor dat de omgevingsvariabele JAVA\_HOME wordt ingesteld op de installatielocatie van de JDK. U moet ook [Apache Maven versie 3.0 of hoger installeren](https://go.microsoft.com/fwlink/?linkid=2016384).

U moet ook [Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195) met NPM installeren. Hiermee verkrijgt u de Azure Functions Core Tools. Als u Node niet wilt installeren, raadpleegt u de overige installatieopties in het [referentiemateriaal voor Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Voer de volgende opdracht uit om het Core Tools-pakket te installeren:

``` npm install -g azure-functions-core-tools ```

Core Tools maakt gebruik van [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373). Dit moet u dus ook installeren.

[Installeer tot slot Azure CLI 2.0](https://go.microsoft.com/fwlink/?linkid=2016701). Nadat dit is geïnstalleerd, controleert u of u bent aangemeld door de aanmeldingsopdracht uit te voeren en de instructies op het scherm te volgen:

``` az login ```

<br/>
# Een Azure Functions-project maken

Ga in het terminalvenster of vanaf een opdrachtprompt naar een lege map voor uw project en voer de volgende opdracht uit:

``` mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false ```

<br/>
# Een functie maken

Als u het project maakt, wordt standaard een HTTP-functie gemaakt. U hoeft dus niets te doen voor deze stap. Als u later een nieuwe functie wilt toevoegen, voert u de volgende opdracht uit:

``` mvn azure-functions:add ```

U wordt door Maven gevraagd om een sjabloon voor de nieuwe functie te selecteren en aan te passen.

<br/>
# Uw functieproject lokaal uitvoeren

Typ de volgende opdracht om uw functie-app uit te voeren:

``` mvn clean package mvn azure-functions:run ```

Via de runtime wordt een URL uitgevoerd voor alle HTTP-functies. Deze URL kunt u kopiëren en uitvoeren in de adresbalk van uw browser.

Als u de foutopsporing wilt stoppen, gebruikt u **CTRL-C** in de terminal.

<br/>
# Uw code implementeren in Azure

Typ de volgende opdracht om uw Functions-project te publiceren in Azure:

``` mvn azure-functions:deploy ```

U wordt mogelijk gevraagd om u aan te melden bij Azure als u dat nog niet hebt gedaan. Volg de instructies op het scherm.
