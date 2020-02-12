### Instalación de dependencias

Antes de comenzar a trabajar, debe <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">instalar NET Core 2.1</a>. También debe <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">instalar Node.JS</a>, que incluye npm, lo cual le permitirá obtener Azure Functions Core Tools. Si prefiere no instalar Node, consulte las demás opciones de instalación en nuestra <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referencia de Core Tools</a>.

Ejecute el siguiente comando para instalar el paquete de Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

<br/>
### Creación de un proyecto de Azure Functions

En la ventana de terminal o desde un símbolo del sistema, vaya a una carpeta vacía del proyecto y ejecute el siguiente comando:

<MarkdownHighlighter>func init</MarkdownHighlighter>

También se le pedirá que elija un entorno de ejecución para el proyecto. Elija {workerRuntime}.

<br/>
### Creación de una función

Para crear una función, ejecute el siguiente comando:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Se le pedirá que elija una plantilla para la función. Para comenzar, le recomendamos el desencadenador HTTP.

<br/>
### Ejecución del proyecto de función de forma local

Ejecute el siguiente comando para iniciar la aplicación de funciones:

<MarkdownHighlighter>func start</MarkdownHighlighter>

El entorno de ejecución generará una dirección URL para las funciones HTTP que podrá copiar y ejecutar en la barra de direcciones del explorador.

Para detener la depuración, use **Ctrl + C** en el terminal.

<br/>
### Implementación del código en Azure

Para publicar el proyecto de Functions en Azure, escriba el siguiente comando:

<MarkdownHighlighter>func azure functionapp publish {functionAppName}</MarkdownHighlighter>

Es posible que se le pida que inicie sesión en Azure. Siga las instrucciones que aparecerán en pantalla.
