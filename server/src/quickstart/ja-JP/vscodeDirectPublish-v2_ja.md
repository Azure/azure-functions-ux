### 依存関係のインストール

作業を開始する前に、<a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">Visual Studio Code</a> をインストールする必要があります。また、Azure Functions Core Tools を取得するために、npm を含む <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS をインストールする</a>必要もあります。Node をインストールする必要がない場合は、<a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools リファレンス</a>にあるその他のインストール オプションをご覧ください。

次のコマンドを実行して、Core Tools パッケージをインストールします。

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools では <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a> を使用するので、それをインストールする必要もあります。

次に、<a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">Visual Studio Code 用の Azure Functions 拡張機能をインストール</a>します。拡張機能をインストールした後、アクティビティ バーの Azure ロゴをクリックします。**\[Azure:Functions**] の下で、**\[Azure にサインイン...]** をクリックして、画面の指示に従います。

<br/>
### Azure Functions プロジェクトの作成

**\[新しいプロジェクトの作成…]** アイコン (**\[Azure:Functions]** パネル内) をクリックします。

アプリのディレクトリを選択するように求められます。空のディレクトリを選択してください。

その後、プロジェクトの言語を選択するように求められます。{workerRuntime} を選択してください。

<br/>
### 関数の作成

**\[関数の作成…]** アイコン (**\[Azure:Functions]** パネル内) をクリックします。

関数のテンプレートを選択するように求められます。手始めに HTTP トリガーを使用することをお勧めします。

<br/>
### 関数プロジェクトをローカルで実行する

**F5** キーを押して、関数アプリを実行します。

ランタイムにより、HTTP 関数の URL が出力されます。これをブラウザーのアドレス バーにコピーすれば、実行できます。

デバッグを停止するには、**Shift + F5** キーを押します。

<br/>
### コードを Azure にデプロイする

**\[関数アプリにデプロイする]** (青い上向き矢印) アイコン (**\[Azure:Functions]** パネル内) をクリックします。

関数アプリの選択を求めるメッセージが表示されたら、"{functionAppName}" を選択します。
