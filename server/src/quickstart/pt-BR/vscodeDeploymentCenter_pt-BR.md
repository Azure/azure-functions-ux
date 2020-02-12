# Instalar dependências

Antes de começar, você deve [instalar o Visual Studio Code](https://go.microsoft.com/fwlink/?linkid=2016593). Você também deve [instalar o Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195), que inclui o NPM e, dessa forma, obterá o Azure Functions Core Tools. Se preferir não instalar o Node, confira as outras opções de instalação na [referência do Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Execute o seguinte comando para instalar o pacote do Core Tools:

``` npm install -g azure-functions-core-tools ```

O Core Tools usa o [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373), portanto, você também deve instalá-lo.

Em seguida, [instale a extensão do Azure Functions para o Visual Studio Code](https://go.microsoft.com/fwlink/?linkid=2016800). Após instalar a extensão, clique no logotipo do Azure na barra de atividades. Em **Azure: Functions**, clique em **Entrar no Azure…** e siga as instruções na tela.

<br/>
# Criar um projeto do Azure Functions

Clique no ícone **Criar Novo Projeto…** no painel **Azure: Functions**.

Será solicitado que você escolha um diretório para seu aplicativo. Escolha um diretório vazio.

Em seguida, será solicitado que você selecione um idioma para seu projeto. Escolha {workerRuntime}.

<br/>
# Criar uma função

Clique no ícone **Criar Função…** no painel Azure**: Functions**.

Será solicitado que você escolha um modelo para sua função. Recomendamos o gatilho HTTP para começar.

<br/>
# Executar seu projeto de função localmente

Pressione **F5** para executar seu aplicativo de funções.

O runtime produzirá uma URL para qualquer função HTTP, que poderá ser copiada e executada na barra de endereços do navegador.

Para interromper a depuração, pressione **Shift + F5**.

<br/>
# Implantar seu código no Azure

Use o botão **Concluir e ir para a Centro de Implantação** abaixo para navegar até o Centro de Implantação e concluir a configuração do aplicativo. Um novo assistente guiará você para configurar uma variedade de opções de implantação. Após concluir esse fluxo, dispare uma implantação usando qualquer mecanismo que você configurou.
