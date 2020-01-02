# Instalación de dependencias

Antes de comenzar a trabajar, debe [instalar Visual Studio Code](https://go.microsoft.com/fwlink/?linkid=2016593). También debe [instalar Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195), que incluye npm, lo cual le permitirá obtener Azure Functions Core Tools. Si prefiere no instalar Node, consulte las demás opciones de instalación en nuestra [referencia de Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Ejecute el siguiente comando para instalar el paquete de Core Tools:

``` npm install -g azure-functions-core-tools ```

Core Tools usa [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373), así que debería instalar también esta plataforma.

A continuación, [instale la extensión de Azure Functions para Visual Studio Code](https://go.microsoft.com/fwlink/?linkid=2016800). Una vez instalada la extensión, haga clic en el logotipo de Azure, en la barra de actividades. En **Azure: Functions**, haga clic en **Iniciar sesión en Azure...** y siga las instrucciones que aparecerán en pantalla.

<br/>
# Creación de un proyecto de Azure Functions

Haga clic en el icono **Crear proyecto...**, en el panel **Azure: Functions**.

Se le pedirá que elija un directorio para la aplicación. Elija uno vacío.

A continuación, se le pedirá que seleccione un lenguaje para el proyecto. Elija {workerRuntime}.

<br/>
# Creación de una función

Haga clic en el icono **Crear función…**, en el panel **Azure: Functions**.

Se le pedirá que elija una plantilla para la función. Para comenzar, le recomendamos el desencadenador HTTP.

<br/>
# Ejecución del proyecto de función de forma local

Presione **F5** para ejecutar la aplicación de funciones.

El entorno de ejecución generará una dirección URL para las funciones HTTP que podrá copiar y ejecutar en la barra de direcciones del explorador.

Para detener la depuración, presione **Mayús + F5**.

<br/>
# Implementación del código en Azure

Haga clic en el icono **Implementar en aplicación de funciones...** (flecha arriba azul), en el panel **Azure: Functions**.

Cuando se le pida seleccionar una aplicación de funciones, elija {functionAppName}.
