### <a name="install-dependencies"></a>Installera beroenden

Innan du börjar måste du <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">installera Visual Studio Code</a>. Du bör också <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installera Node.JS</a> som innehåller npm. Så här får du Azure Functions Core Tools. Om du inte vill installera Node kan du se andra installationsalternativ i vår <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools-referens</a>.

Kör följande kommando för att installera Core Tools-paketet:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

Installera sedan <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">Azure Functions-tillägget för Visual Studio Code</a>. När tillägget har installerats klickar du på Azure-logotypen i aktivitetsfältet. Under **Azure: Functions** klickar du på **Logga in på Azure...** och följer anvisningarna på skärmen.

<br/>
### <a name="create-an-azure-functions-project"></a>Skapa ett Azure Functions-projekt

Klicka på ikonen **Skapa nytt projekt…** på **Azure: Functions**-panelen.

Du uppmanas att välja en katalog för din app. Välj en tom katalog.

Du uppmanas sedan att välja ett språk för projektet. Välj {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Skapa en funktion

Klicka på ikonen **Skapa funktion…** på **Azure: Functions**-panelen.

Då uppmanas du att välja en mall för din funktion. Vi rekommenderar HTTP-utlösare för att komma igång.

<br/>
### <a name="run-your-function-project-locally"></a>Kör ditt funktionsprojekt lokalt

Tryck på **F5** för att köra funktionsappen.

Vid körningen matas en URL ut för alla HTTP-funktioner. Du kan kopiera och köra dessa i adressfältet i din webbläsare.

Tryck på **Skift + F5** för att stoppa felsökningen.

<br/>
### <a name="deploy-your-code-to-azure"></a>Distribuera din kod till Azure

Klicka på ikonen för att **distribuera till funktionsapp…** (<ChevronUp/>) på **Azure: Functions**-panelen.

När du uppmanas att välja en funktionsapp väljer du {functionAppName}.
