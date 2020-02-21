# Instalace závislostí

Než budete moct začít pracovat, měli byste [nainstalovat Visual Studio Code](https://go.microsoft.com/fwlink/?linkid=2016593). Kromě toho byste měli nainstalovat i [Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195), který zahrnuje npm. Tak získáte sadu Azure Functions Core Tools. Pokud Node nechcete instalovat, podívejte se na další možnosti instalace v [referenčních informacích sady Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Pomocí následujícího příkazu nainstalujte balíček Core Tools:

``` npm install -g azure-functions-core-tools ```

Sada Core Tools používá architekturu [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373), proto byste měli nainstalovat i tu.

Dále [nainstalujte rozšíření Azure Functions pro Visual Studio Code](https://go.microsoft.com/fwlink/?linkid=2016800). Až se rozšíření nainstaluje, klikněte na logo Azure na panelu aktivit. V části **Azure: Functions** klikněte na **Přihlásit k Azure...** a postupujte podle pokynů na obrazovce.

<br/>
# Vytvoření projektu Azure Functions

Klikněte na ikonu **Vytvořit nový projekt...** na panelu **Azure: Functions**.

Zobrazí se výzva, abyste zvolili adresář pro svou aplikaci. Zvolte prázdný adresář.

Pak se zobrazí výzva, abyste pro svůj projekt zvolili jazyk. Zvolte {workerRuntime}.

<br/>
# Vytvoření funkce

Klikněte na ikonu **Vytvořit funkci...** na panelu **Azure: Functions**.

Zobrazí se výzva, abyste zvolili šablonu pro svou funkci. Pro začátek doporučujeme trigger HTTP.

<br/>
# Místní spuštění projektu funkce

Stiskněte **F5**, aby se spustila vaše aplikace funkcí.

Modul runtime vypíše na výstup adresu URL pro všechny funkce HTTP, která se dá zkopírovat a použít v adresním řádku prohlížeče.

Pokud chcete ladění ukončit, stiskněte **Shift+F5**.

<br/>
# Nasazení kódu do Azure

Klikněte na ikonu **Nasadit do aplikace funkcí...** (modrá šipka nahoru) na panelu **Azure: Functions**.

Až se zobrazí výzva, abyste vybrali aplikaci funkcí, zvolte {functionAppName}.
