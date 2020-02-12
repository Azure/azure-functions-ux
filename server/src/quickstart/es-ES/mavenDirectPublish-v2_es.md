### Instalación de dependencias

Antes de comenzar a trabajar, debe <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">instalar la versión 8 del kit de desarrolladores de Java</a>. Asegúrese de que la variable de entorno JAVA\_HOME se establezca en la ubicación de instalación del JDK. También necesitará <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">instalar la versión 3.0 u otra posterior de Apache Maven</a> y

<a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS</a>, que incluye npm. De este modo, podrá obtener Azure Functions Core Tools. Si prefiere no instalar Node, consulte las demás opciones de instalación en nuestra <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">referencia de Core Tools</a>.

Ejecute el siguiente comando para instalar el paquete de Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools usa <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, así que debería instalar también esta plataforma.

Por último, <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">instale la CLI 2.0 de Azure</a>. Una vez instalada, asegúrese de haber iniciado sesión ejecutando el comando de inicio de sesión y siguiendo las instrucciones que aparecerán en pantalla:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### Creación de un proyecto de Azure Functions

En la ventana de terminal o desde un símbolo del sistema, vaya a una carpeta vacía del proyecto y ejecute el siguiente comando:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### Creación de una función

Al crear el proyecto, se crea una función HTTP de forma predeterminada, así que en este paso no hay que hacer nada más. Más adelante, si quiere agregar una nueva función, ejecute el siguiente comando:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven le pedirá que seleccione y personalice una plantilla para la nueva función.

<br/>
### Ejecución del proyecto de función de forma local

Escriba el siguiente comando para ejecutar la aplicación de funciones:

<MarkdownHighlighter>mvn clean package mvn azure-functions:run</MarkdownHighlighter>

El entorno de ejecución generará una dirección URL para las funciones HTTP que podrá copiar y ejecutar en la barra de direcciones del explorador.

Para detener la depuración, use **Ctrl + C** en el terminal.

<br/>
### Implementación del código en Azure

Para publicar el proyecto de Functions en Azure, escriba el siguiente comando:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Es posible que se le pida iniciar sesión en Azure, si aún no lo ha hecho. Siga las instrucciones que aparecerán en pantalla.
