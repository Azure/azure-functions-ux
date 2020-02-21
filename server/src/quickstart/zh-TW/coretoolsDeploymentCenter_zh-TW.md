# 安裝相依性

開始之前，應[安裝 .NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373)。同時也應[安裝 Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195) (包含 npm)，藉此取得 Azure Functions Core Tools。如果您不想要安裝 Node，請至 [Core Tools 參考](https://go.microsoft.com/fwlink/?linkid=2016192)中參閱其他安裝選項。

執行下列命令，安裝 Core Tools 套件:

``` npm install -g azure-functions-core-tools ```

<br/>
# 建立 Azure Functions 專案

在終端機視窗中或從命令提示字元，瀏覽至供專案使用的空白資料夾，然後執行下列命令:

``` func init ```

同時也會出現提示，要求您選擇專案的執行階段。選取 {workerRuntime}。

<br/>
# 建立函式

若要建立函式，請執行下列命令:

``` func new ```

隨即會出現提示，要求您選擇函式的範本。我們建議從 HTTP 觸發程序開始使用。

<br/>
# 在本機執行您的函式專案

執行下列命令，開始您的函式應用程式:

``` func start ```

此執行階段會輸出所有 HTTP 函式的 URL，您可將其複製於瀏覽器的網址列中並加以執行。

若要停止偵錯，請在終端機中使用 **Ctrl-C**。

<br/>
# 將程式碼部署至 Azure

請使用下方的 \[完成並前往部署中心]**** 按鈕，瀏覽至部署中心，並完成應用程式的設定。如此會進入新的精靈，設定各種不同的部署選項。完成此流程之後，請使用您所設定的任何機制來觸發部署。
