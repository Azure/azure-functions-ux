### 依存関係のインストール

作業を開始する前に、<a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1 をインストールする</a>必要があります。また、Azure Functions Core Tools を取得するために、npm を含む <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS をインストールする</a>必要もあります。Node をインストールする必要がない場合は、<a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools リファレンス</a>にあるその他のインストール オプションをご覧ください。

次のコマンドを実行して、Core Tools パッケージをインストールします。

<MarkdownHighlighter> npm install -g azure-functions-core-tools</MarkdownHighlighter>

<br/>
### Azure Functions プロジェクトの作成

ターミナル ウィンドウまたはコマンド プロンプトで、プロジェクトの空のフォルダーに移動し、次のコマンドを実行します。

<MarkdownHighlighter> func init</MarkdownHighlighter>

また、プロジェクトのランタイムを選択するように求められます。{workerRuntime} を選択してください。

<br/>
### 関数の作成

関数を作成するには、次のコマンドを実行します。

<MarkdownHighlighter> func new</MarkdownHighlighter>

これにより、関数のテンプレートを選択するように求められます。手始めに HTTP トリガーを使用することをお勧めします。

<br/>
### 関数プロジェクトをローカルで実行する

次のコマンドを実行して、関数アプリを開始します。

<MarkdownHighlighter> func start</MarkdownHighlighter>

ランタイムにより、HTTP 関数の URL が出力されます。これをブラウザーのアドレス バーにコピーすれば、実行できます。

デバッグを停止するには、ターミナルで **Ctrl + C** キーを使用します。

<br/>
### コードを Azure にデプロイする

Functions プロジェクトを Azure に発行するには、次のコマンドを入力します。

<MarkdownHighlighter> func azure functionapp publish {functionAppName}</MarkdownHighlighter>

Azure へのサインインを求めるメッセージが表示される場合があります。画面の指示に従います。
