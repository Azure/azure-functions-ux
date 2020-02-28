### Instalace závislostí

Než začnete, měli byste <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">nainstalovat sadu Java Developer Kit verze 8</a>. Ujistěte se, že se proměnná prostředí JAVA\_HOME nastaví na umístění instalace sady JDK. Navíc bude nutné <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">nainstalovat Apache Maven verze 3.0 nebo novější</a>.

K tomu byste měli <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">nainstalovat Node.JS</a>, který obsahuje npm. Takto získáte sadu Azure Functions Core Tools. Pokud Node nechcete instalovat, podívejte se na další možnosti instalace v <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referenčních informacích sady Core Tools</a>.

Pomocí následujícího příkazu nainstalujte balíček Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Sada Core Tools používá architekturu <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, proto byste měli nainstalovat i tu.

Nakonec <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">nainstalujte Azure CLI 2.0</a>. Až se nainstaluje, spusťte příkaz pro přihlášení a postupujte podle pokynů na obrazovce, abyste měli jistotu, že jste přihlášení:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### Vytvoření projektu Azure Functions

V okně terminálu nebo v příkazovém řádku přejděte na prázdnou složku vašeho projektu a spusťte následující příkaz:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### Vytvoření funkce

Když se vytvoří projekt, vytvoří se standardně i funkce HTTP, proto pro tento krok není v tuto chvíli potřeba nic dělat. Později, pokud byste chtěli přidat novou funkci, spusťte tento příkaz:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven vás vyzve, abyste vybrali a přizpůsobili šablonu pro novou funkci.

<br/>
### Místní spuštění projektu funkce

Zadejte následující příkaz, aby se spustila vaše aplikace funkcí:

<MarkdownHighlighter>mvn clean package mvn azure-functions:run</MarkdownHighlighter>

Modul runtime vypíše na výstup adresu URL pro všechny funkce HTTP, která se dá zkopírovat a použít v adresním řádku prohlížeče.

Pokud chcete zastavit ladění, použijte v terminálu **Ctrl-C**.

<br/>
### Nasazení kódu do Azure

Pomocí následujícího příkazu publikujte svůj projekt Functions do Azure:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Pokud ještě nejste přihlášení k Azure, může se vám zobrazit výzva, abyste se přihlásili. Postupujte podle pokynů na obrazovce.
