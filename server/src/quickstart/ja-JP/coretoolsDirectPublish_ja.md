# 依存関係のインストール

作業を開始する前に、[.NET Core 2.1 をインストールする](https://go.microsoft.com/fwlink/?linkid=2016373)必要があります。また、Azure Functions Core Tools を取得するために、npm を含む [Node.JS をインストールする](https://go.microsoft.com/fwlink/?linkid=2016195)必要もあります。Node をインストールする必要がない場合は、[Core Tools リファレンス](https://go.microsoft.com/fwlink/?linkid=2016192)にあるその他のインストール オプションをご覧ください。

次のコマンドを実行して、Core Tools パッケージをインストールします。

``` npm install -g azure-functions-core-tools ```

<br/>
# Azure Functions プロジェクトの作成

ターミナル ウィンドウまたはコマンド プロンプトで、プロジェクトの空のフォルダーに移動し、次のコマンドを実行します。

``` func init ```

また、プロジェクトのランタイムを選択するように求められます。{workerRuntime} を選択してください。

<br/>
# 関数の作成

関数を作成するには、次のコマンドを実行します。

``` func new ```

これにより、関数のテンプレートを選択するように求められます。手始めに HTTP トリガーを使用することをお勧めします。

<br/>
# 関数プロジェクトをローカルで実行する

次のコマンドを実行して、関数アプリを開始します。

``` func start ```

ランタイムにより、HTTP 関数の URL が出力されます。これをブラウザーのアドレス バーにコピーすれば、実行できます。

デバッグを停止するには、ターミナルで **Ctrl + C** キーを使用します。

<br/>
# コードを Azure にデプロイする

Functions プロジェクトを Azure に発行するには、次のコマンドを入力します。

``` func azure functionapp publish {functionAppName} ```

Azure へのサインインを求めるメッセージが表示される場合があります。画面の指示に従います。
