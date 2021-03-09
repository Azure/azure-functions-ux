### <a name="install-dependencies"></a>Instalace závislostí

Než začnete, měli byste si nainstalovat <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">Visual Studio 2019</a> a ujistit se, že máte nainstalovanou i sadu funkcí Azure Development.

Jakmile je Visual Studio nainstalované, přesvědčte se, že máte <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">nejnovější nástroje Azure Functions</a>.

<br/>
### <a name="create-an-azure-functions-project"></a>Vytvoření projektu služby Azure Functions

V sadě Visual Studio zvolte v nabídce **Soubor** možnost **Nový** > **Projekt**.

V dialogovém okně **Nový projekt** vyberte **Nainstalované**, rozbalte uzel **Visual C#** > **Cloud**, vyberte **Azure Functions**, zadejte **název** vašeho projektu a klikněte na **OK**. Název aplikace funkcí musí být platný jako obor názvů C#, takže nepoužívejte podtržítka, pomlčky nebo jiné nealfanumerické znaky.

Postupujte podle pokynů průvodce, vyberte šablonu a upravte ji. Pro začátek doporučujeme použít HTTP. Potom kliknutím na **OK** vytvořte svou první funkci.

<br/>
### <a name="create-a-function"></a>Vytvoření funkce

Při vytváření projektu se ve výchozím nastavení vytvoří funkce HTTP, takže pro tento krok nemusíte teď nic dělat. Pokud později budete chtít přidat novou funkci, klikněte pravým tlačítkem na projekt v **Průzkumníku řešení** a vyberte **Přidat** > **Nová funkce Azure Functions...**

Pojmenujte tuto funkci a klikněte na **Přidat**. Vyberte šablonu, upravte ji a klikněte na **OK**.

<br/>
### <a name="run-your-function-project-locally"></a>Místní spuštění projektu funkcí

Stisknutím klávesy **F5** spusťte aplikaci funkcí.

Výstupem modulu runtime pro libovolnou funkci HTTP bude adresa URL, kterou je možné zkopírovat a spustit v adresním řádku prohlížeče.

Pokud chcete zastavit ladění, stiskněte **Shift + F5**.

<br/>
### <a name="deploy-your-code-to-azure"></a>Nasazení kódu do Azure

V **Průzkumníku řešení** klikněte pravým tlačítkem na projekt a vyberte **Publikovat**.

Jako cíl publikování vyberte Azure Function App a pak vyberte **Vybrat existující**. Potom klikněte na **Publikovat**.

Pokud jste ještě nepřipojili Visual Studio k účtu Azure, vyberte **Přidat účet...** a postupujte podle pokynů na obrazovce.

V části **Předplatné** vyberte {subscriptionName}. Vyhledejte aplikaci funkcí {functionAppName} a vyberte ji v následující sekci. Pak klikněte na **OK**.
