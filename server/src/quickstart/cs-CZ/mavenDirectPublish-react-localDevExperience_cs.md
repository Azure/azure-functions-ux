### <a name="install-dependencies"></a>Instalace závislostí

Než začnete, měli byste si <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">nainstalovat Java Developer Kit verze 8</a>. Zkontrolujte, že se proměnná prostředí JAVA_HOME nastavení na umístění instalace sady JDK. Musíte také <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">nainstalovat Apache Maven verze 3.0 nebo novější</a>.

Měli byste také <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">nainstalovat modul Node.JS</a>, který zahrnuje npm. Tímto postupem získáte Azure Functions Core Tools. Pokud dáváte přednost tomu neinstalovat Node, projděte si další možnosti instalace v <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referencích k nástrojům Core Tools</a>.

Spuštěním následujícího příkazu nainstalujte balíček Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Nástroje Core Tools využívají modul <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, takže byste si ho měli také nainstalovat.

Nakonec nainstalujte <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">Azure CLI 2.0</a>. Po dokončení instalace spusťte příkaz pro přihlášení, postupujte podle pokynů na obrazovce a ujistěte se, že jste přihlášeni:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Vytvoření projektu služby Azure Functions

V okně terminálu nebo na příkazovém řádku přejděte do prázdné složky pro váš projekt a spusťte následující příkaz:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>Vytvoření funkce

Při vytváření projektu se ve výchozím nastavení vytvoří funkce HTTP, takže pro tento krok nemusíte teď nic dělat. Pokud později budete chtít přidat novou funkci, spusťte následující příkaz:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven zobrazí výzvu k výběru a přizpůsobení šablony pro novou funkci.

<br/>
### <a name="run-your-function-project-locally"></a>Místní spuštění projektu funkcí

Zadáním následujícího příkaz spustíte vaši aplikaci funkcí:

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

Výstupem modulu runtime pro libovolnou funkci HTTP bude adresa URL, kterou je možné zkopírovat a spustit v adresním řádku prohlížeče.

Pokud chcete zastavit ladění, použijte na terminálu **Ctrl+C**.

<br/>
### <a name="deploy-your-code-to-azure"></a>Nasazení kódu do Azure

Pokud chcete projekt Functions publikovat do Azure, zadejte následující příkaz:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Může se zobrazit výzva k přihlášení do Azure, pokud jste to ještě neučinili. Postupujte podle pokynů na obrazovce.
