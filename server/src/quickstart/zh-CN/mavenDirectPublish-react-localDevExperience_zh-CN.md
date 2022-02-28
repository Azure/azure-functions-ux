### <a name="install-dependencies"></a>安装依赖项

在开始之前，应<a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">安装 Java 开发人员工具包（版本 8）</a>。 确保 JAVA_HOME 环境变量设置为 JDK 的安装位置。 还需要<a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">安装 3.0 或更高版本的 Apache Maven</a>。

还应<a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">安装 Node.JS</a>（含 npm）。 这就是获取 Azure Functions Core Tools 的方法。 如果不想安装 Node，请参阅 <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools 参考</a>中的其他安装选项。

运行以下命令以安装 Core Tools 包：

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

由于 Core Tools 使用 <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>，因此你也应该安装它。

最后，<a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">安装 Azure CLI 2.0</a>。 安装后，请通过运行登录命令并按照屏幕上的说明操作来确保已登录：

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>创建 Azure Functions 项目

在终端窗口中或在命令提示符下，导航到项目的空文件夹并运行以下命令：

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>创建函数

创建项目会默认创建一个 HTTP 函数，因此当前步骤无需执行任何操作。 稍后，如果要添加新函数，请运行以下命令：

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven 将提示你为新函数选择和自定义模板。

<br/>
### <a name="run-your-function-project-locally"></a>在本地运行函数项目

输入以下命令以运行函数应用：

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

运行时将输出任何 HTTP 函数的 URL，可以在浏览器的地址栏中复制和运行该 URL。

要停止调试，请在终端中按 Ctrl-C。

<br/>
### <a name="deploy-your-code-to-azure"></a>将代码部署到 Azure

要将“函数”项目发布到 Azure，请输入以下命令：

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

如果尚未登录 Azure，系统可能会提示登录。 按照屏幕上的说明操作。
