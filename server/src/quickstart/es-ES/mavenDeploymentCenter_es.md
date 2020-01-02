# Instalación de dependencias

Antes de comenzar a trabajar, debe [instalar la versión 8 del kit de desarrolladores de Java](https://go.microsoft.com/fwlink/?linkid=2016706). Asegúrese de que la variable de entorno JAVA\_HOME se establezca en la ubicación de instalación del JDK. También necesitará [instalar la versión 3.0 u otra posterior de Apache Maven](https://go.microsoft.com/fwlink/?linkid=2016384) y

[Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195), que incluye npm. De este modo, podrá obtener Azure Functions Core Tools. Si prefiere no instalar Node, consulte las demás opciones de instalación en nuestra [referencia de Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Ejecute el siguiente comando para instalar el paquete de Core Tools:

``` npm install -g azure-functions-core-tools ```

Core Tools usa [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373), así que debería instalar también esta plataforma.

Por último, [instale la CLI 2.0 de Azure](https://go.microsoft.com/fwlink/?linkid=2016701). Una vez instalada, asegúrese de haber iniciado sesión ejecutando el comando de inicio de sesión y siguiendo las instrucciones que aparecerán en pantalla:

``` az login ```

<br/>
# Creación de un proyecto de Azure Functions

En la ventana de terminal o desde un símbolo del sistema, vaya a una carpeta vacía del proyecto y ejecute el siguiente comando:

``` mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false ```

<br/>
# Creación de una función

Al crear el proyecto, se crea una función HTTP de forma predeterminada, así que en este paso no hay que hacer nada más. Más adelante, si quiere agregar una nueva función, ejecute el siguiente comando:

``` mvn azure-functions:add ```

Maven le pedirá que seleccione y personalice una plantilla para la nueva función.

<br/>
# Ejecución del proyecto de función de forma local

Escriba el siguiente comando para ejecutar la aplicación de funciones:

``` mvn clean package mvn azure-functions:run ```

El entorno de ejecución generará una dirección URL para las funciones HTTP que podrá copiar y ejecutar en la barra de direcciones del explorador.

Para detener la depuración, use **Ctrl + C** en el terminal.

<br/>
# Implementación del código en Azure

Use el botón **Finalizar e ir al centro de implementación** que se muestra a continuación para ir al centro de implementación y finalizar la configuración de la aplicación. Se le guiará a través de un nuevo asistente para configurar diversas opciones de implementación. Después de completar este flujo, desencadene una implementación con el mecanismo que haya configurado.
