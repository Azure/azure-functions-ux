### <a name="install-dependencies"></a>Instalar dependências

Antes de poder começar, deve <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">instalar o Visual Studio Code</a>. Também deve <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">instalar o Node.js</a>, que inclui o npm. É assim que obterá o Azure Functions Core Tools. Se preferir não instalar o Node, veja as outras opções de instalação na nossa <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referência do Core Tools</a>.

Execute o seguinte comando para instalar o pacote do Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

Em seguida, <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">instale a extensão das Funções do Azure para o Visual Studio Code</a>. Quando a extensão estiver instalada, clique no logótipo do Azure na Barra de Atividade. Em **Azure: Functions** (Azure: Funções), clique em **Sign in to Azure...** (Iniciar sessão no Azure...) e siga as instruções apresentadas no ecrã.

<br/>
### <a name="create-an-azure-functions-project"></a>Criar um projeto das Funções do Azure

Clique no ícone **Create New Project…** (Criar Novo Projeto...) no painel **Azure: Functions** (Azure: Funções).

Ser-lhe-á pedido que escolha um diretório para a sua aplicação. Escolha um diretório vazio.

Em seguida, ser-lhe-á pedido que selecione um idioma para o seu projeto. Escolha {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Criar uma função

Clique no ícone **Create Function…** (Criar Função...) no painel **Azure: Functions** (Azure: Funções).

Ser-lhe-á pedido que escolha um modelo para a sua função. Recomendamos o acionador HTTP para começar.

<br/>
### <a name="run-your-function-project-locally"></a>Executar o seu projeto de função localmente

Prima **F5** para executar a sua aplicação de funções.

O runtime irá produzir um URL para quaisquer funções HTTP, o qual pode ser copiado e executado na barra de endereço do browser.

Para parar a depuração, prima **Shift + F5**.

<br/>
### <a name="deploy-your-code-to-azure"></a>Implementar o seu código no Azure

Clique no ícone **Deploy to Function App…** (Implementar na Aplicação de Funções...) (<ChevronUp/>) no painel **Azure: Functions** (Azure: Funções).

Quando lhe for pedido que selecione uma aplicação de funções, escolha {functionAppName}.
