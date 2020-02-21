### Instalar dependências

Antes de começar, deve <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">instalar o .NET Core 2.1</a>. Deve também <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">instalar o Node.JS</a>, que inclui o NPM, a forma como obterá o Azure Functions Core Tools. Se preferir não instalar o Node, veja as outras opções de instalação na nossa <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referência do Core Tools</a>.

Execute o seguinte comando para instalar o pacote do Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

<br/>
### Criar um projeto de Funções do Azure

Na janela de terminal ou numa linha de comandos, navegue para uma pasta vazia do projeto e execute o seguinte comando:

<MarkdownHighlighter>func init</MarkdownHighlighter>

Também lhe será pedido para escolher um runtime para o projeto. Selecione {workerRuntime}.

<br/>
### Criar uma função

Para criar uma função, execute o seguinte comando:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Ser-lhe-á pedido para escolher um modelo para a função. Recomendamos o acionador HTTP para começar.

<br/>
### Executar o projeto de funções localmente

Execute o seguinte comando para iniciar a aplicação de funções:

<MarkdownHighlighter>func start</MarkdownHighlighter>

O runtime irá gerar um URL para quaisquer funções HTTP, o qual pode ser copiado e executado na barra de endereço do browser.

Para parar a depuração, utilize **CTRL-C** no terminal.

<br/>
### Implementar o código no Azure

Para publicar o seu projeto de Funções no Azure, introduza o seguinte comando:

<MarkdownHighlighter>func azure functionapp publish {functionAppName}</MarkdownHighlighter>

Pode ser-lhe pedido para iniciar sessão no Azure. Siga as instruções no ecrã.
