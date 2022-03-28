### <a name="install-dependencies"></a>Instalar dependências

Para começar, você deve <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">instalar o Node.js</a>, que inclui o npm. É assim que você obterá o Azure Functions Core Tools. Se você preferir não instalar o Node.js, consulte as outras opções de instalação em nossa <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referência do Core Tools</a>.

Execute o seguinte comando para instalar o pacote do Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Criar um projeto do Azure Functions

Na janela do terminal ou em um prompt de comando, navegue até uma pasta vazia do seu projeto e execute o seguinte comando:

<MarkdownHighlighter>func init</MarkdownHighlighter>

Também será solicitado que você escolha um runtime para o projeto. Selecione {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Criar uma função

Para criar uma função, execute o seguinte comando:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Isso solicitará que você escolha um modelo para sua função. Recomendamos o gatilho HTTP para começar.

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>Executar seu projeto de função localmente

Execute o seguinte comando para iniciar seu aplicativo de funções:

<MarkdownHighlighter>func start</MarkdownHighlighter>

O runtime produzirá uma URL para qualquer função HTTP, que pode ser copiada e executada na barra de endereços do navegador.

Para interromper a depuração, use **CTRL-C** no terminal.

<br/>
### <a name="deploy-your-code-to-azure"></a>Implantar seu código no Azure

Para publicar seu projeto do Functions no Azure, insira o seguinte comando:

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

Talvez você receba uma solicitação para entrar no Azure. Siga as instruções na tela.
