# Installera beroenden

Innan du kan komma igång bör du [installera Visual Studio 2019](https://go.microsoft.com/fwlink/?linkid=2016389) och se till att arbetsbelastningen Azure Development också är installerad.

När Visual Studio har installerats kontrollerar du att du har [de senaste Azure Functions-verktygen](https://go.microsoft.com/fwlink/?linkid=2016394).

<br/>
# Skapa ett Azure Functions-projekt

I Visual Studio väljer du **Nytt** > **Project** från **Arkiv**-menyn.

I dialogrutan **Nytt projekt** väljer du **Installerade**. Expandera **Visual C#** > **Moln**, välj 0**Azure Functions**, skriv ett **Namn** för projektet och klicka på **OK**. Namnet på funktionsappen måste vara giltigt som C#-namnområde, så använd inte understreck, bindestreck eller andra tecken som inte är alfanumeriska.

Följ guiden för att välja och anpassa en mall. Vi rekommenderar HTTP för att komma igång. Skapa din första funktion genom att klicka på **OK**.

<br/>
# Skapa en funktion

När du skapar projektet skapas en HTTP-funktion som standard, så du behöver inte göra något för det här steget just nu. Om du senare vill lägga till en ny funktion högerklickar du på projektet i **Solution Explorer** och väljer **Lägg till** > **Ny Azure-funktion...**

Ge funktionen ett namn och klicka på **Lägg till**. Välj och anpassa din mall och klicka sedan på **OK**.

<br/>
# Kör ditt funktionsprojekt lokalt

Tryck på **F5** för att köra din funktionsapp.

Körningen kommer att skapa en URL för alla HTTP-funktioner som kan kopieras och köras i webbläsarens adressfält.

Stoppa felsökningen genom att trycka på **Shift + F5**.

<br/>
# Distribuera din kod till Azure

Använd knappen **Slutför och gå till distributionscenter** nedan för att gå till distributionscenter och slutföra konfigurationen av appen. Detta leder dig genom en ny guide för att konfigurera flera olika distributionsalternativ. När du har slutfört det här flödet utlöser du en distribution med den mekanism som du har konfigurerat.
