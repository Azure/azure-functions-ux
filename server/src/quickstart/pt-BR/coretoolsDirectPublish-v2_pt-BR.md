### Instalar dependências

Antes de começar, você deve <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">instalar o .NET Core 2.1</a>. Você também deve <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">instalar o Node.JS</a>, que inclui o NPM e, dessa forma, obterá o Azure Functions Core Tools. Se preferir não instalar o Node, confira as outras opções de instalação na <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referência do Core Tools</a>.

Execute o seguinte comando para instalar o pacote do Core Tools:

<MarkdownHighlighter> npm install -g azure-functions-core-tools</MarkdownHighlighter>

<br/>
### Criar um projeto do Azure Functions

Na janela do terminal ou em um prompt de comando, navegue até uma pasta vazia do seu projeto e execute o seguinte comando:

<MarkdownHighlighter> func init</MarkdownHighlighter>

Também será solicitado que você escolha um runtime para o projeto. Selecione {workerRuntime}.

<br/>
### Criar uma função

Para criar uma função, execute o seguinte comando:

<MarkdownHighlighter> func new</MarkdownHighlighter>

Será solicitado que você escolha um modelo para sua função. Recomendamos o gatilho HTTP para começar.

<br/>
### Executar seu projeto de função localmente

Execute o seguinte comando para iniciar seu aplicativo de funções:

<MarkdownHighlighter> func start</MarkdownHighlighter>

O runtime produzirá uma URL para qualquer função HTTP, que poderá ser copiada e executada na barra de endereços do navegador.

Para interromper a depuração, use **Ctrl-C** no terminal.

<br/>
### Implantar seu código no Azure

Para publicar seu projeto do Functions no Azure, digite o seguinte comando:

<MarkdownHighlighter> func azure functionapp publish {functionAppName}</MarkdownHighlighter>

Você poderá ser solicitado a entrar no Azure. Siga as instruções na tela.
