### <a name="install-dependencies"></a>安裝相依性

開始之前，您應該<a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">安裝 Node.js</a> (內含 npm)。 這就是您取得 Azure Functions Core Tools 的方法。 如果您不想要安裝 Node.js，請參閱 <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools 參考</a>中的其他安裝選項。

請執行下列命令來安裝 Core Tools 套件：

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>建立 Azure Functions 專案

在終端機視窗或命令提示字元中，瀏覽至專案的空資料夾，並執行下列命令：

<MarkdownHighlighter>func init</MarkdownHighlighter>

系統也會提示您選擇專案的執行階段。 選擇 {workerRuntime}。

<br/>
### <a name="create-a-function"></a>建立函式

若要建立函式，請執行下列命令：

<MarkdownHighlighter>func new</MarkdownHighlighter>

系統會提示您選擇函式的範本。 我們建議使用 HTTP 觸發程式來開始使用。

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>在本機執行您的函式專案

執行下列命令來開始您的函式應用程式：

<MarkdownHighlighter>func start</MarkdownHighlighter>

執行階段會輸出任何 HTTP 函式的 URL，您可以在瀏覽器的網址列中複製並執行這些函式。

若要停止偵錯，請在終端機中使用 **Ctrl-C**。

<br/>
### <a name="deploy-your-code-to-azure"></a>將程式碼部署至 Azure

若要將函式專案發佈至 Azure，請輸入下列命令：

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

系統會提示您登入 Azure。 遵循螢幕上的指示操作。
