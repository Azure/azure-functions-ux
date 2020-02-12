# 安装依赖项

开始之前，应[安装 Java 开发人员工具包版本 8](https://go.microsoft.com/fwlink/?linkid=2016706)。请确保将 JAVA\_HOME 环境变量设置为 JDK 的安装位置。还需要[安装 Apache Maven 版本 3.0 或更高版本](https://go.microsoft.com/fwlink/?linkid=2016384)。

还应[安装 Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195)（其中包括 npm）。这是获取 Azure Functions Core Tools 的方式。如果不想安装 Node，请参阅 [Core Tools 参考](https://go.microsoft.com/fwlink/?linkid=2016192)中的其他安装选项。

运行以下命令以安装 Core Tools 包：

``` npm install -g azure-functions-core-tools ```

Core Tools 使用 [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373)，因此你也应该安装该工具。

最后，[安装 Azure CLI 2.0](https://go.microsoft.com/fwlink/?linkid=2016701)。安装此工具后，请通过运行登录命令并按照屏幕上的说明进行操作来确保你已登录：

``` az login ```

<br/>
# 创建 Azure Functions 项目

在终端窗口中或在命令提示符下，导航到项目的空文件夹，然后运行以下命令：

``` mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false ```

<br/>
# 创建函数

默认情况下，创建项目会创建 HTTP 函数，因此现在无需执行任何操作。稍后，如果要添加新函数，请运行以下命令：

``` mvn azure-functions:add ```

Maven 将提示你为新函数选择和自定义模板。

<br/>
# 在本地运行函数项目

输入以下命令以运行函数应用：

``` mvn clean package mvn azure-functions:run ```

该运行时将为任何 HTTP 函数输出 URL，可以在浏览器的地址栏中复制和运行该 URL。

若要停止调试，请在终端使用 Ctrl-C****。

<br/>
# 将代码部署到 Azure

使用下面的“完成后，请转到部署中心”按钮，导航到部署中心并完成应用设置****。这将引导你完成配置各种部署选项的新向导。完成此流程后，使用你配置的任何机制触发部署。
