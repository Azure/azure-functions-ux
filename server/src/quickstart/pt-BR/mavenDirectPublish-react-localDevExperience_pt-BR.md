### <a name="install-dependencies"></a>Instalar dependências

Para começar, você deve <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">instalar o Java Developer Kit, versão 8</a>. Verifique se a variável de ambiente JAVA_HOME está definida como o local de instalação do JDK. Você também precisará <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">instalar o Apache Maven, versão 3.0 ou posterior</a>.

Você também deve <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">instalar o Node.JS</a>, que inclui o npm. É assim que você obterá o Azure Functions Core Tools. Se você preferir não instalar o Node, consulte as outras opções de instalação em nossa <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referência do Core Tools</a>.

Execute o seguinte comando para instalar o pacote do Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

O Core Tools usa o <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, portanto, você também deve instalá-lo.

Por fim, <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">instale a CLI do Azure 2.0</a>. Após a instalação, verifique se você está conectado executando o comando de logon e seguindo as instruções da tela:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Criar um projeto do Azure Functions

Na janela do terminal ou em um prompt de comando, navegue até uma pasta vazia do seu projeto e execute o seguinte comando:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>Criar uma função

A criação do projeto cria uma função HTTP por padrão, de modo que você não precisa fazer nada para essa etapa no momento. Depois, se você quiser adicionar uma nova função, execute o seguinte comando:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

O Maven solicitará que você selecione e personalize um modelo para a nova função.

<br/>
### <a name="run-your-function-project-locally"></a>Executar seu projeto de função localmente

Insira o seguinte comando para executar seu aplicativo de funções:

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

O runtime produzirá uma URL para qualquer função HTTP, que pode ser copiada e executada na barra de endereços do navegador.

Para interromper a depuração, use **CTRL-C** no terminal.

<br/>
### <a name="deploy-your-code-to-azure"></a>Implantar seu código no Azure

Para publicar seu projeto do Functions no Azure, insira o seguinte comando:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Será solicitado que você entre no Azure caso ainda não tenha feito isso. Siga as instruções na tela.
