# Instalace závislostí

Než budete moct začít pracovat, měli byste [nainstalovat .NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373). Kromě toho byste měli nainstalovat i [Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195), který zahrnuje npm. Tak získáte sadu Azure Functions Core Tools. Pokud Node nechcete instalovat, podívejte se na další možnosti instalace v [referenčních informacích sady Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Pomocí následujícího příkazu nainstalujte balíček Core Tools:

``` npm install -g azure-functions-core-tools ```

<br/>
# Vytvoření projektu Azure Functions

V okně terminálu nebo v příkazovém řádku přejděte na prázdnou složku vašeho projektu a spusťte následující příkaz:

``` func init ```

Kromě toho se zobrazí výzva, abyste pro projekt zvolili modul runtime. Zvolte {workerRuntime}.

<br/>
# Vytvoření funkce

Spusťte následující příkaz, aby se vytvořila funkce:

``` func new ```

Následně se vám zobrazí výzva, abyste zvolili šablonu pro svou funkci. Pro začátek doporučujeme trigger HTTP.

<br/>
# Místní spuštění projektu funkce

Spusťte následující příkaz, aby se spustila vaše aplikace funkcí:

``` func start ```

Modul runtime vypíše na výstup adresu URL pro všechny funkce HTTP, která se dá zkopírovat a použít v adresním řádku prohlížeče.

Pokud chcete zastavit ladění, použijte v terminálu **Ctrl-C**.

<br/>
# Nasazení kódu do Azure

Pomocí následujícího příkazu publikujte svůj projekt Functions do Azure:

``` func azure functionapp publish {functionAppName} ```

Možná se vám zobrazí výzva, abyste se přihlásili do Azure. Postupujte podle pokynů na obrazovce.
