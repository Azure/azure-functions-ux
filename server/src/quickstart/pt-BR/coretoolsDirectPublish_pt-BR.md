# Instalar dependências

Antes de começar, você deve [instalar o .NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373). Você também deve [instalar o Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195), que inclui o NPM e, dessa forma, obterá o Azure Functions Core Tools. Se preferir não instalar o Node, confira as outras opções de instalação na [referência do Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Execute o seguinte comando para instalar o pacote do Core Tools:

``` npm install -g azure-functions-core-tools ```

<br/>
# Criar um projeto do Azure Functions

Na janela do terminal ou em um prompt de comando, navegue até uma pasta vazia do seu projeto e execute o seguinte comando:

``` func init ```

Também será solicitado que você escolha um runtime para o projeto. Selecione {workerRuntime}.

<br/>
# Criar uma função

Para criar uma função, execute o seguinte comando:

``` func new ```

Será solicitado que você escolha um modelo para sua função. Recomendamos o gatilho HTTP para começar.

<br/>
# Executar seu projeto de função localmente

Execute o seguinte comando para iniciar seu aplicativo de funções:

``` func start ```

O runtime produzirá uma URL para qualquer função HTTP, que poderá ser copiada e executada na barra de endereços do navegador.

Para interromper a depuração, use **Ctrl-C** no terminal.

<br/>
# Implantar seu código no Azure

Para publicar seu projeto do Functions no Azure, digite o seguinte comando:

``` func azure functionapp publish {functionAppName} ```

Você poderá ser solicitado a entrar no Azure. Siga as instruções na tela.
