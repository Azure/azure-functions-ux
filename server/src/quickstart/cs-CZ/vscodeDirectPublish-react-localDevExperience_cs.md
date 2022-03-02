### <a name="install-dependencies"></a>Instalace závislostí

Než začnete, měli byste si <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">nainstalovat Visual Studio Code</a>. Měli byste také <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">nainstalovat modul Node.JS</a>, který zahrnuje npm. Tímto postupem získáte Azure Functions Core Tools. Pokud dáváte přednost tomu neinstalovat Node, projděte si další možnosti instalace v <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referencích k nástrojům Core Tools</a>.

Spuštěním následujícího příkazu nainstalujte balíček Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

Potom <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">nainstalujte rozšíření Azure Functions pro Visual Studio Code</a>. Po dokončení instalace tohoto rozšíření klikněte na logo Azure na panelu aktivit. V části **Azure: Functions** klikněte na **Přihlásit se k Azure...** a postupujte podle pokynů na obrazovce.

<br/>
### <a name="create-an-azure-functions-project"></a>Vytvoření projektu služby Azure Functions

Klikněte na ikonu **Vytvořit nový projekt...** na panelu **Azure: Funkce**.

Zobrazí se výzva k výběru adresáře pro vaši aplikaci. Zvolte prázdný adresář.

Potom se zobrazí výzva k výběru jazyka pro váš projekt. Zvolte {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Vytvoření funkce

Klikněte na **Vytvořit funkci...** na panelu **Azure: Funkce**.

Zobrazí se výzva k výběru šablony pro vaši funkci. Pro začátek doporučujeme použít trigger HTTP.

<br/>
### <a name="run-your-function-project-locally"></a>Místní spuštění projektu funkcí

Stisknutím klávesy **F5** spusťte aplikaci funkcí.

Výstupem modulu runtime pro libovolnou funkci HTTP bude adresa URL, kterou je možné zkopírovat a spustit v adresním řádku prohlížeče.

Pokud chcete zastavit ladění, stiskněte **Shift + F5**.

<br/>
### <a name="deploy-your-code-to-azure"></a>Nasazení kódu do Azure

Klikněte na **Nasadit do aplikace funkcí...** (<ChevronUp/>) na panelu **Azure: Funkce**.

Po zobrazení výzvy k výběru aplikace funkcí zvolte {functionAppName}.
