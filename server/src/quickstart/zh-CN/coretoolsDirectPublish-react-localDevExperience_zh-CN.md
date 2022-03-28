### <a name="install-dependencies"></a>安装依赖项

在开始之前，应<a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">安装 Node.js</a>（含 npm）。 这就是获取 Azure Functions Core Tools 的方法。 如果不想安装 Node.js，请参阅 <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools 参考</a>中的其他安装选项。

运行以下命令以安装 Core Tools 包：

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>创建 Azure Functions 项目

在终端窗口中或在命令提示符下，导航到项目的空文件夹并运行以下命令：

<MarkdownHighlighter>func init</MarkdownHighlighter>

系统还会提示你为项目选择一个运行时。 选择“{workerRuntime}”。

<br/>
### <a name="create-a-function"></a>创建函数

若要创建函数，请运行以下命令：

<MarkdownHighlighter>func new</MarkdownHighlighter>

这将提示你为函数选择一个模板。 建议入门用户选择 HTTP 触发器。

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>在本地运行函数项目

运行以下命令以启动函数应用：

<MarkdownHighlighter>func start</MarkdownHighlighter>

运行时将输出任何 HTTP 函数的 URL，可以在浏览器的地址栏中复制和运行该 URL。

要停止调试，请在终端中按 Ctrl-C。

<br/>
### <a name="deploy-your-code-to-azure"></a>将代码部署到 Azure

要将“函数”项目发布到 Azure，请输入以下命令：

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

系统可能会提示你登录到 Azure。 按照屏幕上的说明操作。
