### <a name="install-dependencies"></a>依存関係のインストール

作業を開始する前に、npm を含む <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">node.js をインストール</a>する必要があります。 この方法で、Azure Functions Core Tools を取得します。 Node.js をインストールしない場合は、<a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools のリファレンス</a>で他のインストール オプションを参照してください。

次のコマンドを実行して、Core Tools パッケージをインストールします。

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Azure Functions プロジェクトを作成する

ターミナル ウィンドウまたはコマンド プロンプトで、プロジェクトの空のフォルダーに移動し、次のコマンドを実行します。

<MarkdownHighlighter>func init</MarkdownHighlighter>

また、プロジェクトのランタイムを選択するように求められます。 {workerRuntime} を選択します。

<br/>
### <a name="create-a-function"></a>関数を作成する

関数を作成するには、次のコマンドを実行します。

<MarkdownHighlighter>func new</MarkdownHighlighter>

関数のテンプレートを選択するように求められます。 作業の開始用として、HTTP トリガーをお勧めします。

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>関数プロジェクトをローカルで実行する

次のコマンドを実行して、関数アプリを開始します。

<MarkdownHighlighter>func start</MarkdownHighlighter>

HTTP 関数の URL が出力されます。これをブラウザーのアドレス バーにコピーして実行できます。

デバッグを停止するには、ターミナルで **Ctrl + C** を使用します。

<br/>
### <a name="deploy-your-code-to-azure"></a>コードを Azure にデプロイする

Functions プロジェクトを Azure に発行するには、次のコマンドを入力します。

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

Azure へのサインインを求めるメッセージが表示される場合があります。 画面の指示に従います。
