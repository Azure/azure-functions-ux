### <a name="install-dependencies"></a>Instalace závislostí

Než začnete, měli byste si <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">nainstalovat modul Node.js</a>, který zahrnuje npm. Tímto postupem získáte Azure Functions Core Tools. Pokud dáváte přednost tomu neinstalovat Node.js, projděte si další možnosti instalace v <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referencích k nástrojům Core Tools</a>.

Spuštěním následujícího příkazu nainstalujte balíček Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Vytvoření projektu služby Azure Functions

V okně terminálu nebo na příkazovém řádku přejděte do prázdné složky pro váš projekt a spusťte následující příkaz:

<MarkdownHighlighter>func init</MarkdownHighlighter>

Zobrazí se také výzva k výběru modulu runtime pro tento projekt. Vyberte {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Vytvoření funkce

Pokud chcete vytvořit funkci, spusťte následující příkaz:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Zobrazí se výzva k výběru šablony pro vaši funkci. Pro začátek doporučujeme použít trigger HTTP.

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>Místní spuštění projektu funkcí

Spuštěním následujícího příkaz spustíte vaši aplikaci funkcí:

<MarkdownHighlighter>func start</MarkdownHighlighter>

Výstupem modulu runtime pro libovolnou funkci HTTP bude adresa URL, kterou je možné zkopírovat a spustit v adresním řádku prohlížeče.

Pokud chcete zastavit ladění, použijte na terminálu **Ctrl+C**.

<br/>
### <a name="deploy-your-code-to-azure"></a>Nasazení kódu do Azure

Pokud chcete projekt Functions publikovat do Azure, zadejte následující příkaz:

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

Může se zobrazit výzva k přihlášení do Azure. Postupujte podle pokynů na obrazovce.
