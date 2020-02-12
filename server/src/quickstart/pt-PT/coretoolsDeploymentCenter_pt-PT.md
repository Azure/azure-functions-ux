# Instalar dependências

Antes de começar, deve [instalar o .NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373). Deve também [instalar o Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195), que inclui o NPM, a forma como obterá o Azure Functions Core Tools. Se preferir não instalar o Node, veja as outras opções de instalação na nossa [referência do Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Execute o seguinte comando para instalar o pacote do Core Tools:

``` npm install -g azure-functions-core-tools ```

<br/>
# Criar um projeto de Funções do Azure

Na janela de terminal ou numa linha de comandos, navegue para uma pasta vazia do projeto e execute o seguinte comando:

``` func init ```

Também lhe será pedido para escolher um runtime para o projeto. Selecione {workerRuntime}.

<br/>
# Criar uma função

Para criar uma função, execute o seguinte comando:

``` func new ```

Ser-lhe-á pedido para escolher um modelo para a função. Recomendamos o acionador HTTP para começar.

<br/>
# Executar o projeto de funções localmente

Execute o seguinte comando para iniciar a aplicação de funções:

``` func start ```

O runtime irá gerar um URL para quaisquer funções HTTP, o qual pode ser copiado e executado na barra de endereço do browser.

Para parar a depuração, utilize **CTRL-C** no terminal.

<br/>
# Implementar o código no Azure

Utilize o botão **Terminar e ir para o Centro de Implementação** abaixo para navegar para o Centro de Implementação e concluir a configuração da aplicação. Será direcionado para um novo assistente para configurar várias opções de implementação. Depois de concluir este fluxo, acione uma implementação com qualquer mecanismo que tenha configurado.
