### Instalace závislostí

Než budete moct začít pracovat, měli byste <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">nainstalovat .NET Core 2.1</a>. Kromě toho byste měli nainstalovat i <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS</a>, který zahrnuje npm. Tak získáte sadu Azure Functions Core Tools. Pokud Node nechcete instalovat, podívejte se na další možnosti instalace v <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referenčních informacích sady Core Tools</a>.

Pomocí následujícího příkazu nainstalujte balíček Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

<br/>
### Vytvoření projektu Azure Functions

V okně terminálu nebo v příkazovém řádku přejděte na prázdnou složku vašeho projektu a spusťte následující příkaz:

<MarkdownHighlighter>func init</MarkdownHighlighter>

Kromě toho se zobrazí výzva, abyste pro projekt zvolili modul runtime. Zvolte {workerRuntime}.

<br/>
### Vytvoření funkce

Spusťte následující příkaz, aby se vytvořila funkce:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Následně se vám zobrazí výzva, abyste zvolili šablonu pro svou funkci. Pro začátek doporučujeme trigger HTTP.

<br/>
### Místní spuštění projektu funkce

Spusťte následující příkaz, aby se spustila vaše aplikace funkcí:

<MarkdownHighlighter>func start</MarkdownHighlighter>

Modul runtime vypíše na výstup adresu URL pro všechny funkce HTTP, která se dá zkopírovat a použít v adresním řádku prohlížeče.

Pokud chcete zastavit ladění, použijte v terminálu **Ctrl-C**.

<br/>
### Nasazení kódu do Azure

Pomocí následujícího příkazu publikujte svůj projekt Functions do Azure:

<MarkdownHighlighter>func azure functionapp publish {functionAppName}</MarkdownHighlighter>

Možná se vám zobrazí výzva, abyste se přihlásili do Azure. Postupujte podle pokynů na obrazovce.
