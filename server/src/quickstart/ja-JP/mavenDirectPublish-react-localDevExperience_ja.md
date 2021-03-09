### <a name="install-dependencies"></a>依存関係のインストール

開始する前に、<a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">Java Developer Kit バージョン 8</a> をインストールする必要があります。 JAVA_HOME 環境変数が JDK のインストール場所に設定されていることを確認してください。 また、<a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">Apache Maven バージョン3.0 以降</a>をインストールする要があります。

npm を含む <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS のインストール</a>も必要です。 この方法で、Azure Functions Core Tools を取得します。 Node をインストールしない場合は、<a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools のリファレンス</a>で他のインストール オプションを参照してください。

次のコマンドを実行して、Core Tools パッケージをインストールします。

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools は <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a> を使用するため、これもインストールする必要があります。

最後に、<a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">Azure CLI 2.0 をインストール</a>します。 このインストールが完了したら、ログインしていることを確認します。そのためには、login コマンドを実行し、画面の指示に従います。

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Azure Functions プロジェクトを作成する

ターミナル ウィンドウまたはコマンド プロンプトで、プロジェクトの空のフォルダーに移動し、次のコマンドを実行します。

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>関数を作成する

プロジェクトを作成すると、既定で HTTP 関数が作成されるため、この時点ではこの手順について何もする必要はありません。 後で、新しい関数を追加する場合は、次のコマンドを実行します。

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

新しい関数のテンプレートを選択し、カスタマイズするように求めるメッセージが表示されます。

<br/>
### <a name="run-your-function-project-locally"></a>関数プロジェクトをローカルで実行する

次のコマンドを入力して、関数アプリを実行します。

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

HTTP 関数の URL が出力されます。これをブラウザーのアドレス バーにコピーして実行できます。

デバッグを停止するには、ターミナルで **Ctrl + C** を使用します。

<br/>
### <a name="deploy-your-code-to-azure"></a>コードを Azure にデプロイする

Functions プロジェクトを Azure に発行するには、次のコマンドを入力します。

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Azure にまだサインインしていない場合は、これを促すメッセージが表示されます。 画面の指示に従います。
