### <a name="install-dependencies"></a>Instalar dependências

Antes de poder começar, deve <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">instalar o Visual Studio 2019</a> e certificar-se de que a carga de trabalho de desenvolvimento também é instalada.

Quando o Visual Studio estiver instalado, verifique se tem as <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">ferramentas mais recentes das Funções do Azure</a>.

<br/>
### <a name="create-an-azure-functions-project"></a>Criar um projeto das Funções do Azure

No Visual Studio, selecione **New** > **Project** (Novo Projeto) no menu **File** (Ficheiro).

Na caixa de diálogo **Novo Projeto**, selecione **Instalado**, expanda **Visual C#** > **Cloud**, selecione **Funções do Azure**, escreva um **Nome** para o projeto e clique em **OK**. O nome da aplicação de funções deve ser válido como um espaço de nomes C#. Portanto, não use sublinhados, hífenes ou outros carateres não alfanuméricos.

Siga o assistente para selecionar e personalizar um modelo. Recomendamos HTTP para começar. Em seguida, clique em **OK** para criar a sua primeira função.

<br/>
### <a name="create-a-function"></a>Criar uma função

A criação do projeto cria uma função HTTP por predefinição, pelo que, de momento, não precisa de fazer nada neste passo. Mais tarde, se quiser adicionar uma nova função, clique com o botão direito do rato no projeto em **Solution Explorer** (Explorador de Soluções) e selecione **Add** > **New Azure Function…** (Adicionar Nova Função do Azure)

Dê um nome à sua função e clique em **Add** (Adicionar). Selecione e personalize o seu modelo e, em seguida, clique em **OK**.

<br/>
### <a name="run-your-function-project-locally"></a>Executar o seu projeto de função localmente

Prima **F5** para executar a sua aplicação de funções.

O runtime irá produzir um URL para quaisquer funções HTTP, o qual pode ser copiado e executado na barra de endereço do browser.

Para parar a depuração, prima **Shift + F5**.

<br/>
### <a name="deploy-your-code-to-azure"></a>Implementar o seu código no Azure

Clique com o botão direito do rato no projeto em **Solution Explorer** (Explorador de Soluções) e selecione **Publish** (Publicar).

Para o destino de publicação, escolha a Aplicação de Funções do Azure e, em seguida, escolha **Select Existing** (Selecionar Existente). Em seguida, clique em **Publicar**.

Se ainda não tiver ligado o Visual Studio à sua conta do Azure, selecione **Add an account…** (Adicionar uma conta...) e siga as instruções apresentadas no ecrã.

Em **Subscription** (Subscrição), selecione {subscriptionName}. Procure {functionAppName} e, em seguida, selecione-o na secção abaixo. Em seguida, clique em **OK**.
