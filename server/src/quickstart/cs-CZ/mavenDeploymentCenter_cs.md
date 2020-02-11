# Instalace závislostí

Než začnete, měli byste [nainstalovat sadu Java Developer Kit verze 8](https://go.microsoft.com/fwlink/?linkid=2016706). Ujistěte se, že se proměnná prostředí JAVA\_HOME nastaví na umístění instalace sady JDK. Navíc bude nutné [nainstalovat Apache Maven verze 3.0 nebo novější](https://go.microsoft.com/fwlink/?linkid=2016384).

K tomu byste měli [nainstalovat Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195), který obsahuje npm. Takto získáte sadu Azure Functions Core Tools. Pokud Node nechcete instalovat, podívejte se na další možnosti instalace v [referenčních informacích sady Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Pomocí následujícího příkazu nainstalujte balíček Core Tools:

``` npm install -g azure-functions-core-tools ```

Sada Core Tools používá architekturu [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373), proto byste měli nainstalovat i tu.

Nakonec [nainstalujte Azure CLI 2.0](https://go.microsoft.com/fwlink/?linkid=2016701). Až se nainstaluje, spusťte příkaz pro přihlášení a postupujte podle pokynů na obrazovce, abyste měli jistotu, že jste přihlášení:

``` az login ```

<br/>
# Vytvoření projektu Azure Functions

V okně terminálu nebo v příkazovém řádku přejděte na prázdnou složku vašeho projektu a spusťte následující příkaz:

``` mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false ```

<br/>
# Vytvoření funkce

Když se vytvoří projekt, vytvoří se standardně i funkce HTTP, proto pro tento krok není v tuto chvíli potřeba nic dělat. Později, pokud byste chtěli přidat novou funkci, spusťte tento příkaz:

``` mvn azure-functions:add ```

Maven vás vyzve, abyste vybrali a přizpůsobili šablonu pro novou funkci.

<br/>
# Místní spuštění projektu funkce

Zadejte následující příkaz, aby se spustila vaše aplikace funkcí:

``` mvn clean package mvn azure-functions:run ```

Modul runtime vypíše na výstup adresu URL pro všechny funkce HTTP, která se dá zkopírovat a použít v adresním řádku prohlížeče.

Pokud chcete zastavit ladění, použijte v terminálu **Ctrl-C**.

<br/>
# Nasazení kódu do Azure

Pomocí tlačítka **Dokončit a přejít na Deployment Center**, které najdete níže, přejděte na Deployment Center a dokončete nastavování své aplikace. Takto vás nový průvodce provede konfigurací různých možností nasazení. Až tento tok dokončíte, aktivujte nasazení pomocí nakonfigurovaného mechanismu.
