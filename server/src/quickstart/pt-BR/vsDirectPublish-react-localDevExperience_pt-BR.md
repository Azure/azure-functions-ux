### <a name="install-dependencies"></a>Instalar dependências

Para começar, você deve <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">instalar o Visual Studio 2019</a> e verificar se a carga de trabalho de desenvolvimento do Azure também está instalada.

Após o Visual Studio ser instalado, verifique se você tem as <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">ferramentas mais recentes do Azure Functions</a>.

<br/>
### <a name="create-an-azure-functions-project"></a>Criar um projeto do Azure Functions

No Visual Studio, selecione **Novo** > **Projeto** no menu **Arquivo**.

No diálogo **Novo Projeto**, selecione **Instalado**, expanda **Visual C#** > **Cloud**, selecione **Azure Functions**, digite um **Nome** para seu projeto e clique em **OK**. O nome do aplicativo de funções deve ser válido como um namespace do C# e, portanto, não use outros caracteres não alfanuméricos, hífens ou sublinhados.

Siga o assistente para selecionar e personalizar um modelo. Recomendamos o HTTP para começar. Em seguida, clique em **OK** para criar sua primeira função.

<br/>
### <a name="create-a-function"></a>Criar uma função

A criação do projeto cria uma função HTTP por padrão, de modo que você não precisa fazer nada para essa etapa no momento. Posteriormente, se você quiser adicionar uma nova função, clique com o botão direito do mouse no projeto no **Gerenciador de Soluções** e selecione **Adicionar** > **Nova Função do Azure…**

Forneça um nome à sua função e clique em **Adicionar**. Selecione e personalize seu modelo e clique em **OK**.

<br/>
### <a name="run-your-function-project-locally"></a>Executar seu projeto de função localmente

Pressione **F5** para executar seu aplicativo de funções.

O runtime produzirá uma URL para qualquer função HTTP, que pode ser copiada e executada na barra de endereços do navegador.

Para interromper a depuração, pressione **Shift + F5**.

<br/>
### <a name="deploy-your-code-to-azure"></a>Implantar seu código no Azure

Clique com o botão direito do mouse no projeto, no **Gerenciador de Soluções**, e selecione **Publicar**.

Para o destino de publicação, escolha Aplicativo de Funções do Azure e escolha **Selecionar Existente**. Em seguida, clique em **Publicar**.

Se você ainda não conectou o Visual Studio à sua conta do Azure, selecione **Adicionar uma conta…** e siga as instruções na tela.

Em **Assinatura**, selecione {subscriptionName}. Pesquise {functionAppName} e, em seguida, selecione-o na seção abaixo. Em seguida, clique em **OK**.
