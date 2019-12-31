# 依存関係のインストール

作業を開始する前に、[Java Developer Kit バージョン 8 をインストールする](https://go.microsoft.com/fwlink/?linkid=2016706)必要があります。JAVA\_HOME 環境変数が JDK のインストール場所に設定されていることを確認してください。また、[Apache Maven バージョン 3.0 以降をインストールする](https://go.microsoft.com/fwlink/?linkid=2016384)必要もあります。

また、npm を含む [Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195) をインストールする必要もあります。これは、Azure Functions Core Tools を取得する方法です。Node をインストールする必要がない場合は、[Core Tools リファレンス](https://go.microsoft.com/fwlink/?linkid=2016192)にあるその他のインストール オプションをご覧ください。

次のコマンドを実行して、Core Tools パッケージをインストールします。

``` npm install -g azure-functions-core-tools ```

Core Tools では [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373) を使用するので、それをインストールする必要もあります。

最後に、[Azure CLI 2.0 をインストール](https://go.microsoft.com/fwlink/?linkid=2016701)します。このインストールが完了したら、次のログイン コマンドを実行してログインしていることを確認し、画面の指示に従います。

``` az login ```

<br/>
# Azure Functions プロジェクトの作成

ターミナル ウィンドウまたはコマンド プロンプトで、プロジェクトの空のフォルダーに移動し、次のコマンドを実行します。

``` mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false ```

<br/>
# 関数の作成

プロジェクトを作成すると、既定で HTTP 関数が作成されるため、この手順では何もする必要はありません。後で新しい関数を追加する場合は、次のコマンドを実行します。

``` mvn azure-functions:add ```

Maven により、新しい関数のテンプレートを選択し、カスタマイズするように求めるメッセージが表示されます。

<br/>
# 関数プロジェクトをローカルで実行する

次のコマンドを入力して、関数アプリを実行します。

``` mvn clean package mvn azure-functions:run ```

ランタイムにより、HTTP 関数の URL が出力されます。これをブラウザーのアドレス バーにコピーすれば、実行できます。

デバッグを停止するには、ターミナルで **Ctrl + C** キーを使用します。

<br/>
# コードを Azure にデプロイする

下にある **\[終了して、デプロイ センターに移動する]** を使用してデプロイ センターに移動し、アプリの設定を完了します。これにより新しいウィザードが開始され、さまざまなデプロイ オプションを構成します。このフローを完了した後、構成したいずれかのメカニズムを使用してデプロイをトリガーします。
