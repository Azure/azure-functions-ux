# 安裝相依性

開始之前，應[安裝 Java Developer Kit 版本 8](https://go.microsoft.com/fwlink/?linkid=2016706)。請確認 JAVA\_HOME 環境變數已設定為 JDK 的安裝位置。您也需要[安裝 Apache Maven 3.0 版或更新版本](https://go.microsoft.com/fwlink/?linkid=2016384)。

也應[安裝 Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195) (包含 npm)。您可藉此取得 Azure Functions Core Tools。如果您不想要安裝 Node，請至 [Core Tools 參考](https://go.microsoft.com/fwlink/?linkid=2016192)中參閱其他安裝選項。

執行下列命令，安裝 Core Tools 套件:

``` npm install -g azure-functions-core-tools ```

Core Tools 會使用到 [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373)，因此也應安裝該項目。

最後，[安裝 Azure CLI 2.0](https://go.microsoft.com/fwlink/?linkid=2016701)。完成安裝之後，請執行登入命令，並遵循畫面上的指示，確認已登入:

``` az login ```

<br/>
# 建立 Azure Functions 專案

在終端機視窗中或從命令提示字元，瀏覽至供專案使用的空白資料夾，然後執行下列命令:

``` mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false ```

<br/>
# 建立函式

建立專案預設會建立 HTTP 函式，因此您現在不需要為此步驟執行任何動作。若您稍後想要新增函式，請執行下列命令:

``` mvn azure-functions:add ```

Maven 會提示您選取新函式的範本，並進行自訂。

<br/>
# 在本機執行您的函式專案

輸入下列命令，執行您的函式應用程式:

``` mvn clean package mvn azure-functions:run ```

此執行階段會輸出所有 HTTP 函式的 URL，您可將其複製於瀏覽器的網址列中並加以執行。

若要停止偵錯，請在終端機中使用 **Ctrl-C**。

<br/>
# 將程式碼部署至 Azure

請使用下方的 \[完成並前往部署中心]**** 按鈕，瀏覽至部署中心，並完成應用程式的設定。如此會進入新的精靈，設定各種不同的部署選項。完成此流程之後，請使用您所設定的任何機制來觸發部署。
