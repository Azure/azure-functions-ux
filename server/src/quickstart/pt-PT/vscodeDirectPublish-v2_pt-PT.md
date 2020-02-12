### Instalar dependências

Antes de começar, deve <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">instalar o Visual Studio Code</a>. Deve também <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">instalar o Node.JS</a>, que inclui o NPM, a forma como obterá o Azure Functions Core Tools. Se preferir não instalar o Node, veja as outras opções de instalação na nossa <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referência do Core Tools</a>.

Execute o seguinte comando para instalar o pacote do Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

O Core Tools utiliza o <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, pelo que deve também instalá-lo.

Em seguida, <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">instale a extensão Funções do Azure para Visual Studio Code</a>. Após a instalação da extensão, clique no logótipo do Azure na Barra de Atividade. Em **Azure: Funções**, clique em **Iniciar sessão no Azure...** e siga as instruções no ecrã.

<br/>
### Criar um projeto de Funções do Azure

Clique no ícone **Criar Novo Projeto...** no painel **Azure: Funções**.

Ser-lhe-á pedido para escolher um diretório para a aplicação. Escolha um diretório vazio.

Em seguida, ser-lhe-á pedido para selecionar um idioma para o projeto. Escolha {workerRuntime}.

<br/>
### Criar uma função

Clique no ícone **Criar Função...** no painel **Azure: Funções**.

Ser-lhe-á pedido para escolher um modelo para a função. Recomendamos o acionador HTTP para começar.

<br/>
### Executar o projeto de funções localmente

Prima **F5** para executar a aplicação de funções.

O runtime irá gerar um URL para quaisquer funções HTTP, o qual pode ser copiado e executado na barra de endereço do browser.

Para parar a depuração, prima **Shift + F5**.

<br/>
### Implementar o código no Azure

Clique no ícone **Implementar na Aplicação de Funções...** (seta para cima azul) no painel **Azure: Funções**.

Quando lhe for pedido para selecionar uma aplicação de funções, escolha {functionAppName}.
