### <a name="install-dependencies"></a>安裝相依性

開始之前，您應該<a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">安裝 Visual Studio Code</a>。 您也應該<a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">安裝 Node.JS</a> (內含 npm)。 這就是您取得 Azure Functions Core Tools 的方法。 如果您不想要安裝 Node，請參閱 <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools 參考</a>中的其他安裝選項。

請執行下列命令來安裝 Core Tools 套件：

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

接著，<a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">安裝適用於 Visual Studio Code 的 Azure Functions 擴充功能</a>。 安裝擴充功能之後，按一下 [活動列] 中的 Azure 標誌。 在 [Azure:Functions] 下，按一下 [登入 Azure...] 並遵循畫面上的指示進行。

<br/>
### <a name="create-an-azure-functions-project"></a>建立 Azure Functions 專案

按一下 [建立新專案...] 圖示，位於 [Azure:Functions] 面板中。

系統會提示您選擇應用程式的目錄。 選擇空目錄。

系統會提示您選取專案的語言。 選擇 {workerRuntime}。

<br/>
### <a name="create-a-function"></a>建立函式

按一下 [建立 Function…] 圖示，位於 [Azure:Functions] 面板中。

系統會提示您選擇函式的範本。 我們建議使用 HTTP 觸發程式來開始使用。

<br/>
### <a name="run-your-function-project-locally"></a>在本機執行您的函式專案

若要執行您的函式應用程式，請按 **F5**。

執行階段會輸出任何 HTTP 函式的 URL，您可以在瀏覽器的網址列中複製並執行這些函式。

若要停止偵錯，請按 **Shift + F5**。

<br/>
### <a name="deploy-your-code-to-azure"></a>將程式碼部署至 Azure

按一下 [部署至函式應用程式...] (<ChevronUp/>) 圖示，位於 [Azure:Functions] 面板中。

當系統提示您選取函式應用程式時，請選擇 {functionAppName}。
