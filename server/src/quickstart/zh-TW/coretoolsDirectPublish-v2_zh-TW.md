### 安裝相依性

開始之前，應<a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">安裝 .NET Core 2.1</a>。同時也應<a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">安裝 Node.JS</a> (包含 npm)，藉此取得 Azure Functions Core Tools。如果您不想要安裝 Node，請至 <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools 參考</a>中參閱其他安裝選項。

執行下列命令，安裝 Core Tools 套件:

</MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

<br/>
### 建立 Azure Functions 專案

在終端機視窗中或從命令提示字元，瀏覽至供專案使用的空白資料夾，然後執行下列命令:

</MarkdownHighlighter>func init</MarkdownHighlighter>

同時也會出現提示，要求您選擇專案的執行階段。選取 {workerRuntime}。

<br/>
### 建立函式

若要建立函式，請執行下列命令:

</MarkdownHighlighter>func new</MarkdownHighlighter>

隨即會出現提示，要求您選擇函式的範本。我們建議從 HTTP 觸發程序開始使用。

<br/>
### 在本機執行您的函式專案

執行下列命令，開始您的函式應用程式:

</MarkdownHighlighter>func start</MarkdownHighlighter>

此執行階段會輸出所有 HTTP 函式的 URL，您可將其複製於瀏覽器的網址列中並加以執行。

若要停止偵錯，請在終端機中使用 **Ctrl-C**。

<br/>
### 將程式碼部署至 Azure

若要將 Functions 專案發佈至 Azure，請輸入下列命令:

</MarkdownHighlighter>func azure functionapp publish {functionAppName}</MarkdownHighlighter>

可能會出現提示，要求您登入 Azure。請遵循畫面上的指示進行。
