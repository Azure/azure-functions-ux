# Instalar dependências

Antes de começar, você deve [instalar o Java Developer Kit, versão 8](https://go.microsoft.com/fwlink/?linkid=2016706). Verifique se a variável de ambiente JAVA\_HOME está definida como o local de instalação do JDK. Você também precisará [instalar o Apache Maven, versão 3.0 ou superior](https://go.microsoft.com/fwlink/?linkid=2016384).

Você também deve [instalar o Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195), que inclui o NPM. É assim que você obterá o Azure Functions Core Tools. Se preferir não instalar o Node, confira as outras opções de instalação na [referência do Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Execute o seguinte comando para instalar o pacote do Core Tools:

``` npm install -g azure-functions-core-tools ```

O Core Tools usa o [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373), portanto, você também deve instalá-lo.

Por fim, [instale a CLI do Azure 2.0](https://go.microsoft.com/fwlink/?linkid=2016701). Após a instalação, verifique se você está conectado executando o comando de logon e seguindo as instruções da tela:

``` az login ```

<br/>
# Criar um projeto do Azure Functions

Na janela do terminal ou em um prompt de comando, navegue até uma pasta vazia do seu projeto e execute o seguinte comando:

``` mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false ```

<br/>
# Criar uma função

A criação do projeto cria uma função HTTP por padrão, então você não precisa fazer nada para esta etapa no momento. Mais tarde, se quiser adicionar uma nova função, execute o seguinte comando:

``` mvn azure-functions:add ```

O Maven solicitará que você selecione e personalize um modelo para a nova função.

<br/>
# Executar seu projeto de função localmente

Digite o seguinte comando para executar seu aplicativo de funções:

``` mvn clean package mvn azure-functions:run ```

O runtime produzirá uma URL para qualquer função HTTP, que poderá ser copiada e executada na barra de endereços do navegador.

Para interromper a depuração, use **Ctrl-C** no terminal.

<br/>
# Implantar seu código no Azure

Para publicar seu projeto do Functions no Azure, digite o seguinte comando:

``` mvn azure-functions:deploy ```

Você poderá ser solicitado a entrar no Azure se ainda não tiver feito isso. Siga as instruções na tela.
