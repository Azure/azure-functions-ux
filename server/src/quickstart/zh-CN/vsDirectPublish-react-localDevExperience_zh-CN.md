### <a name="install-dependencies"></a>安装依赖项

在开始之前，应<a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">安装 Visual Studio 2019</a>，并确保还安装了 Azure 开发工作负载。

安装 Visual Studio 后，请确保你有<a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">最新的 Azure Functions 工具</a>。

<br/>
### <a name="create-an-azure-functions-project"></a>创建 Azure Functions 项目

在 Visual Studio 中，从“文件”菜单中选择“新建” > “项目”。

在“新建项目”对话框中，选择“已安装”，展开“Visual C#” > “云”，选择“Azure Functions”，键入项目的“名称”，然后单击“确定”。 函数应用名称必须可以充当 C# 命名空间，因此请勿使用下划线、连字符或任何其他的非字母数字字符。

按照向导中的步骤选择和自定义模板。 建议入门用户选择 HTTP。 创建“确定”创建第一个函数。

<br/>
### <a name="create-a-function"></a>创建函数

创建项目会默认创建一个 HTTP 函数，因此当前步骤无需执行任何操作。 稍后，如果要添加新函数，请在“解决方案资源管理器”中右键单击该项目，然后选择“添加” > “新的 Azure 函数…”  

为函数命名并单击“添加”。 选择并自定义模板，然后单击“确定”。

<br/>
### <a name="run-your-function-project-locally"></a>在本地运行函数项目

按 F5 运行你的函数应用。

运行时将输出任何 HTTP 函数的 URL，可以在浏览器的地址栏中复制和运行该 URL。

若要停止调试，请按 **Shift + F5**。

<br/>
### <a name="deploy-your-code-to-azure"></a>将代码部署到 Azure

在“解决方案资源管理器”中右键单击该项目，然后选择“发布”。

对于发布目标，选择“Azure 函数应用”，然后选择“选择现有项”。 然后单击“发布”。

如果尚未将 Visual Studio 连接到 Azure 帐户，请选择“添加帐户...” 并遵照屏幕说明操作。

在“订阅”下，选择“{subscriptionName}”。 搜索“{functionAppName}”，然后在下面的部分中选择它。 。
