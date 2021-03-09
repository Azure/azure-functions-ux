### <a name="install-dependencies"></a>Afhankelijkheden installeren

Voordat u aan de slag kunt gaan, moet u <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">Visual Studio 2019 installeren</a>, en ervoor zorgen dat de Azure ontwikkelworkload ook is geïnstalleerd.

Zodra Visual Studio is geïnstalleerd, zorgt ervoor dat u beschikt over de <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">nieuwste Azure Functions-hulpprogramma's</a>.

<br/>
### <a name="create-an-azure-functions-project"></a>Een Azure Functions-project maken

Selecteer **Nieuw** > **Project** in het menu **Bestand** in Visual Studio.

Selecteer **Geïnstalleerd** in het dialoogvenster **Nieuw project**, breid **Visual C#** > **Cloud** uit, selecteer **Azure Functions**, typ een **Naam** voor uw project en klik op **OK**. De functie-appnaam moet geldig zijn als een C#-naamruimte. Gebruik dus geen onderstrepingstekens, afbreekstreepjes of andere niet-alfanumerieke tekens.

Volg de wizard om een sjabloon te selecteren en aan te passen. U wordt aangeraden om aan de slag te gaan met HTTP. Klik vervolgens op **OK** om uw eerste functie maken.

<br/>
### <a name="create-a-function"></a>Een functie maken

Als u het project maakt, wordt standaard een HTTP-functie gemaakt. U hoeft voor deze stap dus op dit moment niets te doen. Als u later een nieuwe functie wilt toevoegen, klikt u met de rechtermuisknop op **Solution Explorer**, en selecteert u **Toevoegen** > **Nieuwe Azure-functie …**

Geef de functie een naam en klik op **Toevoegen**. Selecteer de sjabloon en pas deze aan. Klik vervolgens op **OK**.

<br/>
### <a name="run-your-function-project-locally"></a>Het functieproject lokaal uitvoeren

Druk op **F5** om de functie-app uit te voeren.

Tijdens runtime wordt een URL gegenereerd voor een willekeurige HTTP-functie. Deze URL kunt u kopiëren en uitvoeren in de adresbalk van de browser.

Als u wilt stoppen met fouten opsporen, drukt u op **Shift + F5**.

<br/>
### <a name="deploy-your-code-to-azure"></a>De code implementeren in Azure

Klik in **Solution Explorer** met de rechtermuisknop op het project, en selecteer **Publiceren**.

Kies als publicatiedoel de Azure-functie-app, en kies vervolgens **Bestaande selecteren**. Klik vervolgens op **Publiceren**.

Als u Visual Studio nog niet hebt verbonden met uw Azure-account, selecteert u **Een account toevoegen…** en Volgt u de instructies op het scherm.

Bij **Abonnement** selecteert u {subscriptionName}. Zoek naar {functionAppName} en selecteer deze vervolgens in de onderstaande sectie. Klik vervolgens op **OK**.
