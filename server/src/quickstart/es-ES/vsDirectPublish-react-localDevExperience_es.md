### <a name="install-dependencies"></a>Instalar dependencias

Antes de empezar, debe <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">instalar Visual Studio 2019</a> y asegurarse de que la carga de trabajo de desarrollo de Azure también esté instalada.

Una vez que Visual Studio esté instalado, asegúrese de que tiene las <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">herramientas de Azure Functions más recientes</a>.

<br/>
### <a name="create-an-azure-functions-project"></a>Creación de un proyecto de Azure Functions

En Visual Studio, seleccione **Nuevo** > **proyecto** en el menú **Archivo**.

En el cuadro de diálogo **Nuevo proyecto**, seleccione **Instalado**, expanda **Visual C#** > **Nube**, seleccione **Azure Functions**, escriba un **nombre** para el proyecto y haga clic en **Aceptar**. El nombre de la aplicación de función debe ser válido como espacio de nombres de C#, por lo que no debe usar guiones bajos, guiones u otros caracteres no alfanuméricos.

Siga las indicaciones del asistente para seleccionar y personalizar una plantilla. Se recomienda HTTP para comenzar. A continuación, haga clic en **Aceptar** para crear la primera función.

<br/>
### <a name="create-a-function"></a>Creación de una función

Al crear el proyecto, se crea una función HTTP de forma predeterminada, por lo que no tiene que hacer nada de este paso en este momento. Más adelante, si desea agregar una nueva función, haga clic con el botón derecho en el proyecto en el **Explorador de soluciones** y seleccione **Agregar** > **Nueva función de Azure...**

Asigne un nombre a la función y haga clic en **Agregar**. Seleccione y personalice la plantilla y, a continuación, haga clic en **Aceptar**.

<br/>
### <a name="run-your-function-project-locally"></a>Ejecución del proyecto de función localmente

Para ejecutar la aplicación de funciones, presione **F5**.

El entorno de ejecución generará una dirección URL para todas las funciones HTTP, la cual se puede copiar y ejecutar en la barra de direcciones del explorador.

Para detener la depuración, presione **Mayús + F5**.

<br/>
### <a name="deploy-your-code-to-azure"></a>Implementación del código en Azure

Desde el **Explorador de soluciones**, haga clic con el botón derecho en el proyecto y seleccione **Publicar**.

Como destino de publicación, elija una aplicación de funciones de Azure y, a continuación, elija **Seleccionar existente**. A continuación, haga clic en **Publicar**.

Si todavía no tiene conectado Visual Studio a la cuenta de Azure, seleccione **Agregar una cuenta...** y siga las instrucciones en pantalla.

En **Suscripción**, seleccione el {subscriptionName}. Busque {functionAppName} y, a continuación, selecciónelo en la sección siguiente. A continuación, haga clic en **Aceptar**.
