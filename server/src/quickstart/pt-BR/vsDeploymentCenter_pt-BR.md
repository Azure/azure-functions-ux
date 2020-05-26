# Instalar dependências

Antes de começar, você deve [instalar o Visual Studio 2019](https://go.microsoft.com/fwlink/?linkid=2016389) e verificar se a carga de trabalho de desenvolvimento do Azure também está instalada.

Após instalar o Visual Studio, verifique se você tem as [ferramentas do Azure Functions mais recentes](https://go.microsoft.com/fwlink/?linkid=2016394).

<br/>
# Criar um projeto do Azure Functions

No Visual Studio, selecione **Novo** > **Projeto** no menu **Arquivo**.

Na caixa de diálogo **Novo Projeto**, selecione **Instalado**, expanda **Visual C#** > **Nuvem**, selecione **Azure Functions**, digite um **Nome** para o projeto e clique em **OK**. O nome do aplicativo de funções precisa ser válido como um namespace C#, portanto, não use sublinhados, hifens ou quaisquer outros caracteres não alfanuméricos.

Siga o assistente para selecionar e personalizar um modelo. Recomendamos o HTTP para começar. Em seguida, clique em **OK** para criar sua primeira função.

<br/>
# Criar uma função

A criação do projeto cria uma função HTTP por padrão, então você não precisa fazer nada para esta etapa no momento. Mais tarde, se quiser adicionar uma nova função, clique com o botão direito do mouse no projeto no **Gerenciador de Soluções** e selecione **Adicionar** > **Nova Função do Azure…**

Dê um nome à função e clique em **Adicionar**. Selecione e personalize seu modelo e clique em **OK**.

<br/>
# Executar seu projeto de função localmente

Pressione **F5** para executar seu aplicativo de funções.

O runtime produzirá uma URL para qualquer função HTTP, que poderá ser copiada e executada na barra de endereços do navegador.

Para interromper a depuração, pressione **Shift + F5**.

<br/>
# Implantar seu código no Azure

Use o botão **Concluir e ir para a Centro de Implantação** abaixo para navegar até o Centro de Implantação e concluir a configuração do aplicativo. Um novo assistente guiará você para configurar uma variedade de opções de implantação. Após concluir esse fluxo, dispare uma implantação usando qualquer mecanismo que você configurou.
