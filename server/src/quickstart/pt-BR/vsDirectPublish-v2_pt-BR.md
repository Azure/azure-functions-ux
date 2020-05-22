### Instalar dependências

Antes de começar, você deve <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">instalar o Visual Studio 2019</a> e verificar se a carga de trabalho de desenvolvimento do Azure também está instalada.

Após instalar o Visual Studio, verifique se você tem as <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">ferramentas do Azure Functions mais recentes</a>.

<br/>
### Criar um projeto do Azure Functions

No Visual Studio, selecione **Novo** > **Projeto** no menu **Arquivo**.

Na caixa de diálogo **Novo Projeto**, selecione **Instalado**, expanda **Visual C#** > **Nuvem**, selecione **Azure Functions**, digite um **Nome** para o projeto e clique em **OK**. O nome do aplicativo de funções precisa ser válido como um namespace C#, portanto, não use sublinhados, hifens ou quaisquer outros caracteres não alfanuméricos.

Siga o assistente para selecionar e personalizar um modelo. Recomendamos o HTTP para começar. Em seguida, clique em **OK** para criar sua primeira função.

<br/>
### Criar uma função

A criação do projeto cria uma função HTTP por padrão, então você não precisa fazer nada para esta etapa no momento. Mais tarde, se quiser adicionar uma nova função, clique com o botão direito do mouse no projeto no **Gerenciador de Soluções** e selecione **Adicionar** > **Nova Função do Azure…**

Dê um nome à função e clique em **Adicionar**. Selecione e personalize seu modelo e clique em **OK**.

<br/>
### Executar seu projeto de função localmente

Pressione **F5** para executar seu aplicativo de funções.

O runtime produzirá uma URL para qualquer função HTTP, que poderá ser copiada e executada na barra de endereços do navegador.

Para interromper a depuração, pressione **Shift + F5**.

<br/>
### Implantar seu código no Azure

Clique com o botão direito do mouse no projeto **Gerenciador de Soluções** e selecione **Publicar**.

Para o destino de publicação, escolha Aplicativo de Funções do Azure e depois escolha **Selecionar Existente**. Em seguida, clique em **Publicar**.

Se você ainda não conectou o Visual Studio à sua conta do Azure, selecione **Adicionar uma conta…** e siga as instruções na tela.

Em **Assinatura**, selecione {subscriptionName}. Pesquise {functionAppName} e, em seguida, selecione-o na seção abaixo. Em seguida, clique em **OK**.
