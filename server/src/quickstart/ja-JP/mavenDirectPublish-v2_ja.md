### 依存関係のインストール

作業を開始する前に、<a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">Java Developer Kit バージョン 8 をインストールする</a>必要があります。JAVA\_HOME 環境変数が JDK のインストール場所に設定されていることを確認してください。また、<a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">Apache Maven バージョン 3.0 以降をインストールする</a>必要もあります。

また、npm を含む <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS</a> をインストールする必要もあります。これは、Azure Functions Core Tools を取得する方法です。Node をインストールする必要がない場合は、<a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools リファレンス</a>にあるその他のインストール オプションをご覧ください。

次のコマンドを実行して、Core Tools パッケージをインストールします。

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools では <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a> を使用するので、それをインストールする必要もあります。

最後に、<a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">Azure CLI 2.0 をインストール</a>します。このインストールが完了したら、次のログイン コマンドを実行してログインしていることを確認し、画面の指示に従います。

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### Azure Functions プロジェクトの作成

ターミナル ウィンドウまたはコマンド プロンプトで、プロジェクトの空のフォルダーに移動し、次のコマンドを実行します。

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### 関数の作成

プロジェクトを作成すると、既定で HTTP 関数が作成されるため、この手順では何もする必要はありません。後で新しい関数を追加する場合は、次のコマンドを実行します。

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven により、新しい関数のテンプレートを選択し、カスタマイズするように求めるメッセージが表示されます。

<br/>
### 関数プロジェクトをローカルで実行する

次のコマンドを入力して、関数アプリを実行します。

<MarkdownHighlighter>mvn clean package mvn azure-functions:run</MarkdownHighlighter>

ランタイムにより、HTTP 関数の URL が出力されます。これをブラウザーのアドレス バーにコピーすれば、実行できます。

デバッグを停止するには、ターミナルで **Ctrl + C** キーを使用します。

<br/>
### コードを Azure にデプロイする

Functions プロジェクトを Azure に発行するには、次のコマンドを入力します。

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

まだサインインしていない場合は、Azure にサインインするように求められることがあります。画面の指示に従います。
