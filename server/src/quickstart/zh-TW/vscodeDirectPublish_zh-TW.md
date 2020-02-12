# 安裝相依性

開始之前，應[安裝 Visual Studio Code](https://go.microsoft.com/fwlink/?linkid=2016593)。同時也應[安裝 Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195) (包含 npm)，藉此取得 Azure Functions Core Tools。如果您不想要安裝 Node，請至 [Core Tools 參考](https://go.microsoft.com/fwlink/?linkid=2016192)中參閱其他安裝選項。

執行下列命令，安裝 Core Tools 套件:

``` npm install -g azure-functions-core-tools ```

Core Tools 會使用到 [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373)，因此也應安裝該應用程式。

接著請[為 Visual Studio Code 安裝 Azure Functions 延伸模組](https://go.microsoft.com/fwlink/?linkid=2016800)。安裝該延伸模組之後，按一下活動列中的 Azure 標誌。在 \[Azure:Functions]**** 下，按一下 \[登入 Azure ...]****，然後依照畫面上的指示進行。

<br/>
# 建立 Azure Functions 專案

在 \[Azure: Functions] ****面板中，按一下**建立新專案...**圖示。

隨即會出現提示，要求您選擇應用程式的目錄。請選擇空的目錄。

接著會出現提示，要求您選取專案的語言。請選擇 {workerRuntime}。

<br/>
# 建立函式

在 \[Azure: Functions] ****面板中，按一下**建立函式...**圖示。

隨即會出現提示，要求您選擇函式的範本。我們建議從 HTTP 觸發程序開始使用。

<br/>
# 在本機執行您的函式專案

按下 **F5** 以執行函式應用程式。

此執行階段會輸出所有 HTTP 函式的 URL，您可將其複製於瀏覽器的網址列中並加以執行。

若要停止偵錯，請按 **Shift + F5**。

<br/>
# 將程式碼部署至 Azure

在 \[Azure: Functions] ****面板中，按一下**部署至函式應用程式…**圖示 (藍色向上鍵)。

出現提示，要求您選取函式應用程式時，請選擇 {functionAppName}。
