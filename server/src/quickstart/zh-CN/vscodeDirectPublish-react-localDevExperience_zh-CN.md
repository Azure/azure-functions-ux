### <a name="install-dependencies"></a>安装依赖项

在开始之前，应<a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">安装 Visual Studio Code</a>。 还应<a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">安装 Node.JS</a>（含 npm）。 这就是获取 Azure Functions Core Tools 的方法。 如果不想安装 Node，请参阅 <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools 参考</a>中的其他安装选项。

运行以下命令以安装 Core Tools 包：

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

接下来，<a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">安装 Visual Studio Code 的 Azure Functions 扩展</a>。 安装扩展后，单击活动栏中的 Azure 徽标。 在“Azure:Functions”下，单击“登录到 Azure...”并遵照屏幕说明操作。

<br/>
### <a name="create-an-azure-functions-project"></a>创建 Azure Functions 项目

单击“创建新项目…” 图标，该图标位于“Azure:Functions”面板。

系统将提示你为应用选择一个目录。 选择一个空目录。

然后，系统将提示你为项目选择语言。 选择 {workerRuntime}。

<br/>
### <a name="create-a-function"></a>创建函数

单击“创建函数…” 图标，该图标位于“Azure:Functions”面板。

系统将提示你为函数选择一个模板。 建议入门用户选择 HTTP 触发器。

<br/>
### <a name="run-your-function-project-locally"></a>在本地运行函数项目

按 F5 运行你的函数应用。

运行时将输出任何 HTTP 函数的 URL，可以在浏览器的地址栏中复制和运行该 URL。

若要停止调试，请按 **Shift + F5**。

<br/>
### <a name="deploy-your-code-to-azure"></a>将代码部署到 Azure

单击“部署到函数应用…” (<ChevronUp/>) 图标，该图标位于“Azure:Functions”面板。

当系统提示选择函数应用时，选择“{functionAppName}”。
