### <a name="install-dependencies"></a>依存関係のインストール

作業を開始する前に、<a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">Visual Studio Code をインストール</a>する必要があります。 npm を含む <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS のインストール</a>も必要です。 この方法で、Azure Functions Core Tools を取得します。 Node をインストールしない場合は、<a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools のリファレンス</a>で他のインストール オプションを参照してください。

次のコマンドを実行して、Core Tools パッケージをインストールします。

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

次に、<a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">Visual Studio Code 用 Azure Functions 拡張機能をインストール</a>します。 拡張機能がインストールされたら、アクティビティ バーの Azure のロゴをクリックします。 **[Azure:関数]** で、 **[Azure にサインイン]** をクリックし、画面の指示に従います。

<br/>
### <a name="create-an-azure-functions-project"></a>Azure Functions プロジェクトを作成する

**[新しいプロジェクトの作成]** アイコンを **[Azure:関数]** パネルでクリックします。

アプリのディレクトリを選択するように求められます。 空のディレクトリを選択します。

その後、プロジェクトの言語を選択するように求められます。 {workerRuntime} を選択します。

<br/>
### <a name="create-a-function"></a>関数を作成する

**[関数の作成]** アイコンを **[Azure:関数]** パネルでクリックします。

関数のテンプレートを選択するように求められます。 作業の開始用として、HTTP トリガーをお勧めします。

<br/>
### <a name="run-your-function-project-locally"></a>関数プロジェクトをローカルで実行する

関数アプリを実行するには、**F5** キーを押します。

HTTP 関数の URL が出力されます。これをブラウザーのアドレス バーにコピーして実行できます。

デバッグを停止するには、**Shift キーを押しながら F5 キー** を押します。

<br/>
### <a name="deploy-your-code-to-azure"></a>コードを Azure にデプロイする

**[Deploy to Function App…]** \(Function App へのデプロイ\) (<ChevronUp/>) アイコンを **[Azure:関数]** パネルでクリックします。

関数アプリの選択を求めるメッセージが表示されたら、{functionAppName} を選択します。
