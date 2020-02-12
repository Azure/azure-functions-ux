### 安装依赖项

开始之前，应<a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">安装 .NET Core 2.1</a>。还应<a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">安装 Node.JS</a>（其中包括 npm），这是获取 Azure Functions Core Tools 的方式。如果不想安装 Node，请参阅 <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools 参考</a>中的其他安装选项。

运行以下命令以安装 Core Tools 包：

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

<br/>
### 创建 Azure Functions 项目

在终端窗口中或在命令提示符下，导航到项目的空文件夹，然后运行以下命令：

<MarkdownHighlighter>func init</MarkdownHighlighter>

系统还会提示你为项目选择运行时。选择 {workerRuntime}。

<br/>
### 创建函数

若要创建函数，请运行以下命令：

<MarkdownHighlighter>func new</MarkdownHighlighter>

系统会提示你为函数选择模板。建议开始时使用 HTTP 触发器。

<br/>
### 在本地运行函数项目

运行以下命令以启动函数应用：

<MarkdownHighlighter>func start</MarkdownHighlighter>

该运行时将为任何 HTTP 函数输出 URL，可以在浏览器的地址栏中复制和运行该 URL。

若要停止调试，请在终端使用 Ctrl-C****。

<br/>
### 将代码部署到 Azure

若要将 Functions 项目发布到 Azure 中，请输入以下命令：

<MarkdownHighlighter>func azure functionapp publish {functionAppName}</MarkdownHighlighter>

系统可能会提示你登录 Azure。按照屏幕上的说明进行操作。
