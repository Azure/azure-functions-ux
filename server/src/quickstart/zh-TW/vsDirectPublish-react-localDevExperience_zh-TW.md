### <a name="install-dependencies"></a>安裝相依性

開始之前，您應該<a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">安裝 Visual Studio 2019</a>，並確定也已經安裝 Azure 開發工作負載。

安裝 Visual Studio 之後，確定您有<a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">最新的 Azure Functions 工具</a>。

<br/>
### <a name="create-an-azure-functions-project"></a>建立 Azure Functions 專案

在 Visual Studio 中，從 [檔案]  功能表中選取 [新增]   >  [專案]  。

在 [新增專案] 對話方塊中，選取 [已安裝]，展開 [Visual C#] >  [雲端]，選取 [Azure Functions]，輸入專案的 [名稱]，然後按一下 [確定]。 函式應用程式名稱必須是有效的 C# 命名空間，因此不會使用底線、連字號或任何其他非英數字元。

依照精靈的指示，選取和自訂範本。 我們建議使用 HTTP 來開始使用。 接著，按一下 [確定] 來建立您的第一個函式。

<br/>
### <a name="create-a-function"></a>建立函式

建立專案預設會建立的 HTTP 函式，因此您現在不需要為此步驟執行任何動作。 稍後，如果您想要新增新的函式，請以滑鼠右鍵按一下 [方案總管] 中的專案，然後選取 [新增] > [新的 Azure 函式...]

為您的函式命名，並按一下 [新增]。 選取並自訂您的範本，然後按一下 [確定]。

<br/>
### <a name="run-your-function-project-locally"></a>在本機執行您的函式專案

若要執行您的函式應用程式，請按 **F5**。

執行階段會輸出任何 HTTP 函式的 URL，您可以在瀏覽器的網址列中複製並執行這些函式。

若要停止偵錯，請按 **Shift + F5**。

<br/>
### <a name="deploy-your-code-to-azure"></a>將程式碼部署至 Azure

以滑鼠右鍵按一下 [方案總管] 中的專案，再選取 [發佈]。

針對您的發佈目標，選擇 [Azure Function 應用程式]，然後選擇 [選取現有項目]。 然後按一下 [發佈]。

如果您尚未將 Visual Studio 連線到您的 Azure 帳戶，請選取 [新增帳戶...] 並遵循螢幕上的指示操作。

在 [訂用帳戶] 底下，選取 {subscriptionName}。 搜尋 {functionAppName}，然後在下一區段中選取該名稱。 然後按一下 [確定] 。
