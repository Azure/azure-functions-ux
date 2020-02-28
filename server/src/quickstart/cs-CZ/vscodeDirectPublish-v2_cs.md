### Instalace závislostí

Než budete moct začít pracovat, měli byste <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">nainstalovat Visual Studio Code</a>. Kromě toho byste měli nainstalovat i <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS</a>, který zahrnuje npm. Tak získáte sadu Azure Functions Core Tools. Pokud Node nechcete instalovat, podívejte se na další možnosti instalace v <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referenčních informacích sady Core Tools</a>.

Pomocí následujícího příkazu nainstalujte balíček Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Sada Core Tools používá architekturu <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, proto byste měli nainstalovat i tu.

Dále <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">nainstalujte rozšíření Azure Functions pro Visual Studio Code</a>. Až se rozšíření nainstaluje, klikněte na logo Azure na panelu aktivit. V části **Azure: Functions** klikněte na **Přihlásit k Azure...** a postupujte podle pokynů na obrazovce.

<br/>
### Vytvoření projektu Azure Functions

Klikněte na ikonu **Vytvořit nový projekt...** na panelu **Azure: Functions**.

Zobrazí se výzva, abyste zvolili adresář pro svou aplikaci. Zvolte prázdný adresář.

Pak se zobrazí výzva, abyste pro svůj projekt zvolili jazyk. Zvolte {workerRuntime}.

<br/>
### Vytvoření funkce

Klikněte na ikonu **Vytvořit funkci...** na panelu **Azure: Functions**.

Zobrazí se výzva, abyste zvolili šablonu pro svou funkci. Pro začátek doporučujeme trigger HTTP.

<br/>
### Místní spuštění projektu funkce

Stiskněte **F5**, aby se spustila vaše aplikace funkcí.

Modul runtime vypíše na výstup adresu URL pro všechny funkce HTTP, která se dá zkopírovat a použít v adresním řádku prohlížeče.

Pokud chcete ladění ukončit, stiskněte **Shift+F5**.

<br/>
### Nasazení kódu do Azure

Klikněte na ikonu **Nasadit do aplikace funkcí...** (modrá šipka nahoru) na panelu **Azure: Functions**.

Až se zobrazí výzva, abyste vybrali aplikaci funkcí, zvolte {functionAppName}.
