### <a name="install-dependencies"></a>Instalar dependencias

Antes de comenzar, debe <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">instalar Visual Studio Code</a>. También debe <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">instalar Node.js</a>, que incluye npm. Así es como obtendrá Azure Functions Core Tools. Si prefiere no instalar Node.js, consulte las otras opciones de instalación en la <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referencia de Core Tools</a>.

Ejecute el siguiente comando para instalar el paquete de Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

A continuación, <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">instale la extensión de Azure Functions para Visual Studio Code</a>. Una vez instalada la extensión, haga clic en el logotipo de Azure en la barra de actividades. En **Azure Functions**, haga clic en **Iniciar sesión en Azure…** y siga las instrucciones en pantalla.

<br/>
### <a name="create-an-azure-functions-project"></a>Creación de un proyecto de Azure Functions

Haga clic en el icono **Crear proyecto...** del panel de **Azure Functions**.

Se le pedirá que elija un directorio para la aplicación. Seleccione un directorio vacío.

A continuación, se le pedirá que seleccione un idioma para el proyecto. Elija {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Creación de una función

Haga clic en el icono **Crear función...** del panel de **Azure Functions**.

Se le pedirá que elija una plantilla para la función. Se recomienda el desencadenador HTTP para comenzar.

<br/>
### <a name="run-your-function-project-locally"></a>Ejecución del proyecto de función localmente

Para ejecutar la aplicación de funciones, presione **F5**.

El entorno de ejecución generará una dirección URL para todas las funciones HTTP, la cual se puede copiar y ejecutar en la barra de direcciones del explorador.

Para detener la depuración, presione **Mayús + F5**.

<br/>
### <a name="deploy-your-code-to-azure"></a>Implementación del código en Azure

Haga clic en el icono **Deploy to Function App...** (Implementar en la aplicación de funciones...) (<ChevronUp/>) del panel de **Azure Functions**.

Cuando se le pida que seleccione una aplicación de funciones, elija {functionAppName}.
