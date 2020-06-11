### Afhankelijkheden installeren

Voordat u aan de slag kunt, moet u <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">Visual Studio 2019 installeren</a> en controleren of de ontwikkelworkload van Azure ook is geïnstalleerd.

Nadat Visual Studio is geïnstalleerd, controleert u of u over de <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">meest recente Azure Functions-hulpprogramma's beschikt</a>.

<br/>
### Een Azure Functions-project maken

Selecteer in Visual Studio **New** > **Project** (Nieuw > Project) in het menu **File** (Bestand).

Selecteer in het dialoogvenster **New Project** (Nieuw project) de optie **Installed** (Geïnstalleerd), vouw **Visual C#** > **Cloud** uit, selecteer **Azure Functions**, typ een **naam** voor uw project en klik op **OK**. De naam van de functie-app moet een geldige C# naamruimte zijn. Gebruik daarom geen onderstrepingstekens, afbreekstreepjes of andere niet-alfanumerieke tekenreeksen.

Volg de wizard om een sjabloon te selecteren en aan te passen. Het wordt aanbevolen om in eerste instantie HTTP te gebruiken. Klik vervolgens op **OK** om uw eerste functie te maken.

<br/>
### Een functie maken

Als u het project maakt, wordt standaard een HTTP-functie gemaakt. U hoeft dus niets te doen voor deze stap. Als u later een nieuwe functie wilt toevoegen, klikt u met de rechtermuisknop op het project in **Solution Explorer** en selecteert u **Toevoegen** > **Nieuwe Azure-functie…**

Geef uw functie een naam en klik op **Toevoegen**. Selecteer uw sjabloon en pas deze aan en klik vervolgens op **OK**.

<br/>
### Uw functieproject lokaal uitvoeren

Druk op **F5** om uw functie-app uit te voeren.

Via de runtime wordt een URL uitgevoerd voor alle HTTP-functies. Deze URL kunt u kopiëren en uitvoeren in de adresbalk van uw browser.

Druk op **Shift + F5** om de foutopsporing te stoppen.

<br/>
### Uw code implementeren in Azure

Klik met de rechter muisknop op het project in **Solution Explorer** en selecteer **Publiceren**.

Kies als publicatiedoel Azure-functie-app en kies vervolgens **Bestaande selecteren**. Klik vervolgens op **Publiceren**.

Als u Visual Studio nog niet hebt verbonden met uw Azure-account, selecteert u **Een account toevoegen...** en volgt u de instructies op het scherm.

Selecteer {subscriptionName} onder **Abonnement**. Zoek naar {functionAppName} en selecteer deze in de onderstaande sectie. Klik vervolgens op **OK**.
