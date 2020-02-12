### 安装依赖项

开始之前，应<a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">安装 Java 开发人员工具包版本 8</a>。请确保将 JAVA\_HOME 环境变量设置为 JDK 的安装位置。还需要<a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">安装 Apache Maven 版本 3.0 或更高版本</a>。

还应<a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">安装 Node.JS</a>（其中包括 npm）。这是获取 Azure Functions Core Tools 的方式。如果不想安装 Node，请参阅 <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools 参考</a>中的其他安装选项。

运行以下命令以安装 Core Tools 包：

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools 使用 <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>，因此你也应该安装该工具。

最后，<a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">安装 Azure CLI 2.0</a>。安装此工具后，请通过运行登录命令并按照屏幕上的说明进行操作来确保你已登录：

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### 创建 Azure Functions 项目

在终端窗口中或在命令提示符下，导航到项目的空文件夹，然后运行以下命令：

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### 创建函数

默认情况下，创建项目会创建 HTTP 函数，因此现在无需执行任何操作。稍后，如果要添加新函数，请运行以下命令：

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven 将提示你为新函数选择和自定义模板。

<br/>
### 在本地运行函数项目

输入以下命令以运行函数应用：

<MarkdownHighlighter>mvn clean package mvn azure-functions:run</MarkdownHighlighter>

该运行时将为任何 HTTP 函数输出 URL，可以在浏览器的地址栏中复制和运行该 URL。

若要停止调试，请在终端使用 Ctrl-C****。

<br/>
### 将代码部署到 Azure

若要将 Functions 项目发布到 Azure 中，请输入以下命令：

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

如果你尚未登录 Azure，系统可能会提示你登录。按照屏幕上的说明进行操作。
