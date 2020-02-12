### Instalar dependências

Antes de começar, você deve <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">instalar o Visual Studio Code</a>. Você também deve <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">instalar o Node.JS</a>, que inclui o NPM e, dessa forma, obterá o Azure Functions Core Tools. Se preferir não instalar o Node, confira as outras opções de instalação na <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referência do Core Tools</a>.

Execute o seguinte comando para instalar o pacote do Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

O Core Tools usa o <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, portanto, você também deve instalá-lo.

Em seguida, <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">instale a extensão do Azure Functions para o Visual Studio Code</a>. Após instalar a extensão, clique no logotipo do Azure na barra de atividades. Em **Azure: Functions**, clique em **Entrar no Azure…** e siga as instruções na tela.

<br/>
### Criar um projeto do Azure Functions

Clique no ícone **Criar Novo Projeto…** no painel **Azure: Functions**.

Será solicitado que você escolha um diretório para seu aplicativo. Escolha um diretório vazio.

Em seguida, será solicitado que você selecione um idioma para seu projeto. Escolha {workerRuntime}.

<br/>
### Criar uma função

Clique no ícone **Criar Função…** no painel Azure**: Functions**.

Será solicitado que você escolha um modelo para sua função. Recomendamos o gatilho HTTP para começar.

<br/>
### Executar seu projeto de função localmente

Pressione **F5** para executar seu aplicativo de funções.

O runtime produzirá uma URL para qualquer função HTTP, que poderá ser copiada e executada na barra de endereços do navegador.

Para interromper a depuração, pressione **Shift + F5**.

<br/>
### Implantar seu código no Azure

Clique no ícone **Implantar no Aplicativo de Funções…** (seta para cima azul) no painel **Azure: Functions**.

Quando for solicitado a selecionar um aplicativo de funções, escolha {functionAppName}.
