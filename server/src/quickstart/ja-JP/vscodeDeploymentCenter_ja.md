# 依存関係のインストール

作業を開始する前に、[Visual Studio Code](https://go.microsoft.com/fwlink/?linkid=2016593) をインストールする必要があります。また、Azure Functions Core Tools を取得するために、npm を含む [Node.JS をインストールする](https://go.microsoft.com/fwlink/?linkid=2016195)必要もあります。Node をインストールする必要がない場合は、[Core Tools リファレンス](https://go.microsoft.com/fwlink/?linkid=2016192)にあるその他のインストール オプションをご覧ください。

次のコマンドを実行して、Core Tools パッケージをインストールします。

``` npm install -g azure-functions-core-tools ```

Core Tools では [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373) を使用するので、それをインストールする必要もあります。

次に、[Visual Studio Code 用の Azure Functions 拡張機能をインストール](https://go.microsoft.com/fwlink/?linkid=2016800)します。拡張機能をインストールした後、アクティビティ バーの Azure ロゴをクリックします。**\[Azure:Functions**] の下で、**\[Azure にサインイン...]** をクリックして、画面の指示に従います。

<br/>
# Azure Functions プロジェクトの作成

**\[新しいプロジェクトの作成…]** アイコン (**\[Azure:Functions]** パネル内) をクリックします。

アプリのディレクトリを選択するように求められます。空のディレクトリを選択してください。

その後、プロジェクトの言語を選択するように求められます。{workerRuntime} を選択してください。

<br/>
# 関数の作成

**\[関数の作成…]** アイコン (**\[Azure:Functions]** パネル内) をクリックします。

関数のテンプレートを選択するように求められます。手始めに HTTP トリガーを使用することをお勧めします。

<br/>
# 関数プロジェクトをローカルで実行する

**F5** キーを押して、関数アプリを実行します。

ランタイムにより、HTTP 関数の URL が出力されます。これをブラウザーのアドレス バーにコピーすれば、実行できます。

デバッグを停止するには、**Shift + F5** キーを押します。

<br/>
# コードを Azure にデプロイする

下にある **\[終了して、デプロイ センターに移動する]** を使用してデプロイ センターに移動し、アプリの設定を完了します。これにより新しいウィザードが開始され、さまざまなデプロイ オプションを構成します。このフローを完了した後、構成したいずれかのメカニズムを使用してデプロイをトリガーします。
