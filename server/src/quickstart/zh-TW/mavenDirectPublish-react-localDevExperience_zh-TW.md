### <a name="install-dependencies"></a>安裝相依性

開始之前，您應該<a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">安裝 Java Developer Kit 第 8 版</a>。 請確定 JAVA_HOME 環境變數必須設定為 JDK 的安裝位置。 您也需要<a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">安裝 Apache Maven 3.0 版或更新版本</a>。

您也應該<a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">安裝 Node.JS</a> (內含 npm)。 這就是您取得 Azure Functions Core Tools 的方法。 如果您不想要安裝 Node，請參閱 <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools 參考</a>中的其他安裝選項。

請執行下列命令來安裝 Core Tools 套件：

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools 會使用 <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>，因此您也應該安裝該應用程式。

最後，請<a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">安裝 Azure CLI 2.0</a>。 安裝完成之後，請執行 login 命令並遵循螢幕上的指示操作，以確定您已登入：

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>建立 Azure Functions 專案

在終端機視窗或命令提示字元中，瀏覽至專案的空資料夾，並執行下列命令：

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>建立函式

建立專案預設會建立的 HTTP 函式，因此您現在不需要為此步驟執行任何動作。 稍後，如果您想要新增新的函式，請執行下列命令：

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven 會提示您選取和自訂新函式的範本。

<br/>
### <a name="run-your-function-project-locally"></a>在本機執行您的函式專案

輸入下列命令來執行您的函式應用程式：

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

執行階段會輸出任何 HTTP 函式的 URL，您可以在瀏覽器的網址列中複製並執行這些函式。

若要停止偵錯，請在終端機中使用 **Ctrl-C**。

<br/>
### <a name="deploy-your-code-to-azure"></a>將程式碼部署至 Azure

若要將函式專案發佈至 Azure，請輸入下列命令：

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

如果您尚未登入 Azure，系統可能會提示您登入 Azure。 遵循螢幕上的指示操作。
