### Instalace závislostí

Než začnete, měli byste <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">nainstalovat Visual Studio 2019</a> a ujistit se, že je nainstalovaná i úloha vývoje v Azure.

Až se sada Visual Studio nainstaluje, ujistěte se, že máte <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">nejnovější nástroje Azure Functions</a>.

<br/>
### Vytvoření projektu Azure Functions

V sadě Visual Studio vyberte v nabídce **Soubor** možnost **Nový** > **Projekt**.

V dialogovém okně **Nový projekt** vyberte **Nainstalováno**, rozbalte **Visual C#** > **Cloud**, vyberte **Azure Functions**, zadejte **Název** svého projektu a klikněte na **OK**. Název aplikace funkcí musí být platný jako obor názvů jazyka C#, proto nepoužívejte podtržítka, spojovníky ani žádné jiné znaky, které nejsou alfanumerické.

Pomocí průvodce vyberte a přizpůsobte nějakou šablonu. Pro začátek doporučujeme protokol HTTP. Pak klikněte na **OK**, aby se vytvořila vaše první funkce.

<br/>
### Vytvoření funkce

Když se vytvoří projekt, vytvoří se standardně i funkce HTTP, proto pro tento krok není v tuto chvíli potřeba nic dělat. Později, pokud budete chtít přidat novou funkci, kliknete pravým tlačítkem na projekt v **Průzkumníkovi řešení** a vyberete **Přidat** > **Nová funkce Azure Functions...**

Pojmenujte svou funkci a klikněte na **Přidat**. Vyberte a přizpůsobte svou šablonu a pak klikněte na **OK**.

<br/>
### Místní spuštění projektu funkce

Stiskněte **F5**, aby se spustila vaše aplikace funkcí.

Modul runtime vypíše na výstup adresu URL pro všechny funkce HTTP, která se dá zkopírovat a použít v adresním řádku prohlížeče.

Pokud chcete ladění ukončit, stiskněte **Shift+F5**.

<br/>
### Nasazení kódu do Azure

Klikněte pravým tlačítkem na projekt v **Průzkumníkovi řešení** a vyberte **Publikovat**.

Jako cíl publikování zvolte Aplikace Azure Function a pak zvolte **Vybrat existující**. Následně klikněte na **Publikovat**.

Pokud jste ještě nepropojili Visual Studio se svým účtem Azure, vyberte **Přidat účet...** a postupujte podle pokynů na obrazovce.

V části **Předplatné** vyberte {subscriptionName}. Vyhledejte {functionAppName} a pak tuto položku vyberte v části níže. Nakonec klikněte na **OK**.
