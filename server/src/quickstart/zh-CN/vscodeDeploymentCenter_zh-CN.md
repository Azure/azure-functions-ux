# 安装依赖项

开始之前，应[安装 Visual Studio Code](https://go.microsoft.com/fwlink/?linkid=2016593)。还应[安装 Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195)（其中包括 npm），这是获取 Azure Functions Core Tools 的方式。如果不想安装 Node，请参阅 [Core Tools 参考](https://go.microsoft.com/fwlink/?linkid=2016192)中的其他安装选项。

运行以下命令以安装 Core Tools 包：

``` npm install -g azure-functions-core-tools ```

Core Tools 使用 [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373)，因此你也应该安装该工具。

接下来，[为 Visual Studio Code 安装 Azure Functions 扩展](https://go.microsoft.com/fwlink/?linkid=2016800)。安装扩展后，单击活动栏中的 Azure 徽标。在“Azure：****Functions”下，单击“登录 Azure...”，然后按照屏幕上的说明进行操作****。

<br/>
# 创建 Azure Functions 项目

****在“Azure: Functions”面板中单击“创建新项目…”****图标。

系统会提示你为应用选择目录。选择空目录。

然后，系统会提示你为项目选择语言。选择 {workerRuntime}。

<br/>
# 创建函数

****在“Azure: Functions”面板中单击“创建函数…”****图标。

系统会提示你为函数选择模板。建议开始时使用 HTTP 触发器。

<br/>
# 在本地运行函数项目

按 F5 以运行函数应用****。

该运行时将为任何 HTTP 函数输出 URL，可以在浏览器的地址栏中复制和运行该 URL。

若要停止调试，请按 Shift + F5****。

<br/>
# 将代码部署到 Azure

使用下面的“完成后，请转到部署中心”按钮，导航到部署中心并完成应用设置****。这将引导你完成配置各种部署选项的新向导。完成此流程后，使用你配置的任何机制触发部署。
