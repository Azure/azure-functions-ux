### <a name="install-dependencies"></a>Instalar dependencias

Antes de empezar, debe <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">instalar el kit para desarrolladores de Java, versión 8</a>. Asegúrese de que la variable de entorno JAVA_HOME esté establecida en la ubicación de instalación del kit para desarrolladores de Java (JDK). También tendrá que <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">instalar Apache Maven, versión 3.0 o superior</a>.

También debe <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">instalar Node.js</a>, que incluye npm. Así es como obtendrá Azure Functions Core Tools. Si prefiere no instalar Node.js, consulte las otras opciones de instalación en la <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referencia de Core Tools</a>.

Ejecute el siguiente comando para instalar el paquete de Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools utiliza <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, por lo que debe instalarlo también.

Por último, <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">instale la CLI de Azure 2.0</a>. Una vez instalada, para asegurarse de que ha iniciado sesión ejecute el comando login y siga las instrucciones en pantalla:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Creación de un proyecto de Azure Functions

En la ventana de terminal o desde un símbolo del sistema, vaya a una carpeta vacía del proyecto y ejecute el siguiente comando:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>Creación de una función

Al crear el proyecto, se crea una función HTTP de forma predeterminada, por lo que no tiene que hacer nada de este paso en este momento. Más adelante, si desea agregar una nueva función, ejecute el siguiente comando:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven le pedirá que seleccione y personalice una plantilla para la nueva función.

<br/>
### <a name="run-your-function-project-locally"></a>Ejecución del proyecto de función localmente

Escriba el comando siguiente para ejecutar la aplicación de funciones:

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

El entorno de ejecución generará una dirección URL para todas las funciones HTTP, la cual se puede copiar y ejecutar en la barra de direcciones del explorador.

Para detener la depuración, use **Ctrl-C** en el terminal.

<br/>
### <a name="deploy-your-code-to-azure"></a>Implementación del código en Azure

Para publicar el proyecto de Functions en Azure, escriba el siguiente comando:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Es posible que se le pida que inicie sesión en Azure si aún no lo ha hecho. Siga las instrucciones en pantalla.
