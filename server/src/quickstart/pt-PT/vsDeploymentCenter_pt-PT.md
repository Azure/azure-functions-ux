# Instalar dependências

Antes de começar, deve [instalar o Visual Studio 2019](https://go.microsoft.com/fwlink/?linkid=2016389) e garantir que a carga de trabalho de desenvolvimento do Azure também está instalada.

Depois de instalar o Visual Studio, certifique-se de que tem as [ferramentas das Funções do Azure mais recentes](https://go.microsoft.com/fwlink/?linkid=2016394).

<br/>
# Criar um projeto de Funções do Azure

No Visual Studio, selecione **Novo** > **Projeto** no menu **Ficheiro**.

Na caixa de diálogo **Novo Projeto**, selecione **Instalado**, expanda **Visual C#** > **Cloud**, selecione **Funções do Azure**, introduza um **Nome** para o projeto e clique em **OK**. O nome da aplicação de funções tem de ser um espaço de nomes C# válido, pelo que não utilize carateres de sublinhado, hífenes ou quaisquer outros carateres não alfanuméricos.

Siga o assistente para selecionar e personalizar um modelo. Recomendamos HTTP para começar. Em seguida, clique em **OK** para criar a sua primeira função.

<br/>
# Criar uma função

A criação do projeto cria uma função HTTP por predefinição, pelo que não tem de fazer nada para este passo por agora. Mais tarde, se quiser adicionar uma nova função, clique com o botão direito do rato no projeto em **Explorador de Soluções** e selecione **Adicionar** > **Nova Função do Azure…**

Dê um nome à função e clique em **Adicionar**. Selecione e personalize o modelo e clique em **OK**.

<br/>
# Executar o projeto de funções localmente

Prima **F5** para executar a aplicação de funções.

O runtime irá gerar um URL para quaisquer funções HTTP, o qual pode ser copiado e executado na barra de endereço do browser.

Para parar a depuração, prima **Shift + F5**.

<br/>
# Implementar o código no Azure

Utilize o botão **Terminar e ir para o Centro de Implementação** abaixo para navegar para o Centro de Implementação e concluir a configuração da aplicação. Será direcionado para um novo assistente para configurar várias opções de implementação. Depois de concluir este fluxo, acione uma implementação com qualquer mecanismo que tenha configurado.
