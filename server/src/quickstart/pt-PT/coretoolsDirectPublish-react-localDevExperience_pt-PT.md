### <a name="install-dependencies"></a>Instalar dependências

Antes de poder começar, deve <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">instalar o Node.js</a>, que inclui o npm. É assim que obterá o Azure Functions Core Tools. Se preferir não instalar o Node.js, veja as outras opções de instalação na nossa <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referência do Core Tools</a>.

Execute o seguinte comando para instalar o pacote do Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Criar um projeto das Funções do Azure

Na janela do terminal ou numa linha de comandos, navegue até uma pasta vazia do seu projeto e execute o seguinte comando:

<MarkdownHighlighter>func init</MarkdownHighlighter>

Também lhe será pedido que escolha um runtime para o projeto. Selecione {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Criar uma função

Para criar uma função, execute o seguinte comando:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Ser-lhe-á pedido que escolha um modelo para a sua função. Recomendamos o acionador HTTP para começar.

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>Executar o seu projeto de função localmente

Execute o seguinte comando para iniciar a sua aplicação de funções:

<MarkdownHighlighter>func start</MarkdownHighlighter>

O runtime irá produzir um URL para quaisquer funções HTTP, o qual pode ser copiado e executado na barra de endereço do browser.

Para parar a depuração, utilize **Ctrl-C** no terminal.

<br/>
### <a name="deploy-your-code-to-azure"></a>Implementar o seu código no Azure

Para publicar o seu projeto das Funções no Azure, introduza o seguinte comando:

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

Poderá ser-lhe pedido que inicie sessão no Azure. Siga as instruções no ecrã.
