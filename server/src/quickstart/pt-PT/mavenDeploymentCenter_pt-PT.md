# Instalar dependências

Antes de começar, deve [instalar o Java Developer Kit, versão 8](https://go.microsoft.com/fwlink/?linkid=2016706). Certifique-se de que a variável de ambiente JAVA\_HOME é definida como localização de instalação do JDK. Também terá de [instalar o Apache Maven, versão 3.0 ou superior](https://go.microsoft.com/fwlink/?linkid=2016384).

Também deverá [instalar o Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195), que inclui o NPM. Esta é a forma como obterá o Azure Functions Core Tools. Se preferir não instalar o Node, veja as outras opções de instalação na nossa [referência do Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Execute o seguinte comando para instalar o pacote do Core Tools:

``` npm install -g azure-functions-core-tools ```

O Core Tools utiliza o [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373), pelo que deve também instalá-lo.

Por fim, [instale a CLI do Azure 2.0](https://go.microsoft.com/fwlink/?linkid=2016701). Após a instalação, certifique-se de que tem sessão iniciada ao executar o comando de início de sessão e ao seguir as instruções no ecrã:

``` az login ```

<br/>
# Criar um projeto de Funções do Azure

Na janela de terminal ou numa linha de comandos, navegue para uma pasta vazia do projeto e execute o seguinte comando:

``` mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false ```

<br/>
# Criar uma função

A criação do projeto cria uma função HTTP por predefinição, pelo que não tem de fazer nada para este passo por agora. Mais tarde, se quiser adicionar uma nova função, execute o seguinte comando:

``` mvn azure-functions:add ```

O Maven irá pedir-lhe para selecionar e personalizar um modelo para a nova função.

<br/>
# Executar o projeto de funções localmente

Introduza o seguinte comando para executar a aplicação de funções:

``` mvn clean package mvn azure-functions:run ```

O runtime irá gerar um URL para quaisquer funções HTTP, o qual pode ser copiado e executado na barra de endereço do browser.

Para parar a depuração, utilize **CTRL-C** no terminal.

<br/>
# Implementar o código no Azure

Utilize o botão **Terminar e ir para o Centro de Implementação** abaixo para navegar para o Centro de Implementação e concluir a configuração da aplicação. Será direcionado para um novo assistente para configurar várias opções de implementação. Depois de concluir este fluxo, acione uma implementação com qualquer mecanismo que tenha configurado.
