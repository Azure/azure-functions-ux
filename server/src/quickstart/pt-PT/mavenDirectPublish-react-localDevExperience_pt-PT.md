### <a name="install-dependencies"></a>Instalar dependências

Antes de poder começar, deve <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">instalar o Java Development Kit, versão 8</a>. Certifique-se de que a variável de ambiente do JAVA_HOME é definida para a localização de instalação do JDK. Também precisará de <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">instalar o Apache Maven, versão 3.0 ou superior</a>.

Também deve <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">instalar o Node.js</a>, que inclui o npm. É assim que obterá o Azure Functions Core Tools. Se preferir não instalar o Node, veja as outras opções de instalação na nossa <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referência do Core Tools</a>.

Execute o seguinte comando para instalar o pacote do Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

O Core Tools utiliza o <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, pelo que também o deve instalar.

Por fim, <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">instale a CLI do Azure 2.0</a>. Quando esta estiver instalada, certifique-se de que tem a sessão iniciada ao executar o comando de início de sessão e ao seguir as instruções apresentadas no ecrã:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Criar um projeto das Funções do Azure

Na janela do terminal ou numa linha de comandos, navegue até uma pasta vazia do seu projeto e execute o seguinte comando:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>Criar uma função

A criação do projeto cria uma função HTTP por predefinição, pelo que, de momento, não precisa de fazer nada neste passo. Mais tarde, se quiser adicionar uma nova função, execute o seguinte comando:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

O Maven irá pedir-lhe que selecione e personalize um modelo para a nova função.

<br/>
### <a name="run-your-function-project-locally"></a>Executar o seu projeto de função localmente

Introduza o seguinte comando para executar a sua aplicação de funções:

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

O runtime irá produzir um URL para quaisquer funções HTTP, o qual pode ser copiado e executado na barra de endereço do browser.

Para parar a depuração, utilize **Ctrl-C** no terminal.

<br/>
### <a name="deploy-your-code-to-azure"></a>Implementar o seu código no Azure

Para publicar o seu projeto das Funções no Azure, introduza o seguinte comando:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Poderá ser-lhe pedido que inicie sessão no Azure caso ainda não o tenha feito. Siga as instruções no ecrã.
