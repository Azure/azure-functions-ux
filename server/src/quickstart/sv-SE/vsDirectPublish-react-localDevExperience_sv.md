### <a name="install-dependencies"></a>Installera beroenden

Innan du börjar måste du <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">installera Visual Studio 2019</a> och kontrollera att även arbetsbelastningen Azure-utveckling är installerad.

När du har installerat Visual Studio kontrollerar du att du har de <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">senaste Azure Functions-verktygen</a>.

<br/>
### <a name="create-an-azure-functions-project"></a>Skapa ett Azure Functions-projekt

Välj **Nytt** > **Projekt** på **Arkiv**-menyn i Visual Studio.

I dialogrutan **Nytt projekt** väljer du **Installerat**, expanderar **Visual C#** > **Cloud**, väljer **Azure Functions**, skriver ett **namn** för projektet och klickar sedan på **OK**. Funktionsappens namn måste vara ett giltigt C#-namnområde. Du kan inte använda understreck, bindestreck eller andra icke-alfanumeriska tecken.

Följ guiden för att välja och anpassa en mall. Vi rekommenderar HTTP för att komma igång. Klicka sedan på **OK** för att skapa din första funktion.

<br/>
### <a name="create-a-function"></a>Skapa en funktion

När du skapar projektet skapas en HTTP-funktion som standard, så du behöver inte göra något just nu för det här steget. Om du senare vill lägga till en ny funktion högerklickar du på projektet i **Solution Explorer** och väljer **Lägg till** > **Ny Azure-funktion...**

Ge funktionen ett namn och klicka på **Lägg till**. Välj och anpassa din mall. Kicka sedan på **OK**.

<br/>
### <a name="run-your-function-project-locally"></a>Kör ditt funktionsprojekt lokalt

Tryck på **F5** för att köra funktionsappen.

Vid körningen matas en URL ut för alla HTTP-funktioner. Du kan kopiera och köra dessa i adressfältet i din webbläsare.

Tryck på **Skift + F5** för att stoppa felsökningen.

<br/>
### <a name="deploy-your-code-to-azure"></a>Distribuera din kod till Azure

Högerklicka på projektet i **Solution Explorer** och välj **Publicera**.

Välj Azure-funktionsapp som publiceringsmål och välj sedan **Välj befintlig**. Klicka sedan på **Publicera**.

Om du inte redan har anslutit Visual Studio till ditt Azure-konto väljer du **Lägg till ett konto...** och följer anvisningarna på skärmen.

Välj {subscriptionName} i fältet **Prenumeration**. Sök efter {functionAppName} och välj det sedan i avsnittet nedan. Klicka sedan på **OK**.
