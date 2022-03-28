### <a name="install-dependencies"></a>Instalar dependencias

Antes de comenzar, debe <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">instalar Node.js</a>, que incluye npm. Así es como obtendrá Azure Functions Core Tools. Si prefiere no instalar Node.js, consulte las otras opciones de instalación en la <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referencia de Core Tools</a>.

Ejecute el siguiente comando para instalar el paquete de Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Creación de un proyecto de Azure Functions

En la ventana de terminal o desde un símbolo del sistema, vaya a una carpeta vacía del proyecto y ejecute el siguiente comando:

<MarkdownHighlighter>func init</MarkdownHighlighter>

También se le pedirá que elija un entorno de ejecución para el proyecto. Seleccione {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Creación de una función

Para crear una función, ejecute el siguiente comando:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Se le pedirá que elija una plantilla para la función. Se recomienda el desencadenador HTTP para comenzar.

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>Ejecución del proyecto de función localmente

Ejecute el comando siguiente para iniciar la aplicación de funciones:

<MarkdownHighlighter>func start</MarkdownHighlighter>

El entorno de ejecución generará una dirección URL para todas las funciones HTTP, la cual se puede copiar y ejecutar en la barra de direcciones del explorador.

Para detener la depuración, use **Ctrl-C** en el terminal.

<br/>
### <a name="deploy-your-code-to-azure"></a>Implementación del código en Azure

Para publicar el proyecto de Functions en Azure, escriba el siguiente comando:

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

Es posible que se le pida que inicie sesión en Azure. Siga las instrucciones en pantalla.
