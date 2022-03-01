### <a name="install-dependencies"></a>Instalar dependências

Para começar, você deve <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">instalar o Visual Studio Code</a>. Você também deve <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">instalar o Node.JS</a>, que inclui o npm. É assim que você obterá o Azure Functions Core Tools. Se você preferir não instalar o Node, consulte as outras opções de instalação em nossa <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referência do Core Tools</a>.

Execute o seguinte comando para instalar o pacote do Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

Em seguida, <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">instale a extensão do Azure Functions para Visual Studio Code</a>. Depois que a extensão for instalada, clique no logotipo do Azure na barra de atividades. Em **Azure: Functions**, clique em **Entrar no Azure...** e siga as instruções na tela.

<br/>
### <a name="create-an-azure-functions-project"></a>Criar um projeto do Azure Functions

Clique no ícone **Criar Novo Projeto…** no painel **Azure: Functions**.

Será solicitado que você escolha um diretório para seu aplicativo. Escolha um diretório vazio.

Em seguida, será solicitado que você selecione uma linguagem para o seu projeto. Escolha {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Criar uma função

Clique no ícone **Criar Função…** no painel **Azure: Functions**.

Será solicitado que você escolha um modelo para a sua função. Recomendamos o gatilho HTTP para começar.

<br/>
### <a name="run-your-function-project-locally"></a>Executar seu projeto de função localmente

Pressione **F5** para executar seu aplicativo de funções.

O runtime produzirá uma URL para qualquer função HTTP, que pode ser copiada e executada na barra de endereços do navegador.

Para interromper a depuração, pressione **Shift + F5**.

<br/>
### <a name="deploy-your-code-to-azure"></a>Implantar seu código no Azure

Clique no ícone **Implantar para aplicativo de funções…** (<ChevronUp/>) no painel **Azure: Functions**.

Quando for solicitada a seleção de um aplicativo de funções, escolha {functionAppName}.
