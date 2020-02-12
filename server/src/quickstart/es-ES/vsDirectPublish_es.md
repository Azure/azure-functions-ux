# Instalación de dependencias

Antes de comenzar a trabajar, debe [instalar Visual Studio 2017](https://go.microsoft.com/fwlink/?linkid=2016389) y asegurarse de que también esté instalada la carga de trabajo de desarrollo de Azure.

Una vez instalado Visual Studio, asegúrese de que disponga de las [herramientas de Azure Functions más recientes](https://go.microsoft.com/fwlink/?linkid=2016394).

<br/>
# Creación de un proyecto de Azure Functions

En Visual Studio, seleccione **Nuevo** > **Proyecto** en el menú **Archivo**.

En el cuadro de diálogo **Nuevo proyecto**, seleccione **Instalado**, expanda **Visual C#** > **Nube**, seleccione **Azure Functions**, escriba un **nombre** para el proyecto y haga clic en **Aceptar**. El nombre de la aplicación de funciones debe ser válido como espacio de nombres de C#, por lo que no se permite el uso de guiones, guiones bajos ni ningún otro carácter no alfanumérico.

Siga los pasos del asistente para seleccionar y personalizar una plantilla. Para comenzar, le recomendamos usar HTTP. A continuación, haga clic en **Aceptar** para crear la primera función.

<br/>
# Creación de una función

Al crear el proyecto, se crea una función HTTP de forma predeterminada, así que en este paso no hay que hacer nada más. Más adelante, si quiere agregar una nueva función, haga clic con el botón derecho en el proyecto en el **Explorador de soluciones** y seleccione **Agregar** > **Nueva función de Azure...**

Asigne un nombre a la función y haga clic en **Agregar**. Seleccione la plantilla y personalícela y, a continuación, haga clic en **Aceptar**.

<br/>
# Ejecución del proyecto de función de forma local

Presione **F5** para ejecutar la aplicación de funciones.

El entorno de ejecución generará una dirección URL para las funciones HTTP que podrá copiar y ejecutar en la barra de direcciones del explorador.

Para detener la depuración, presione **Mayús + F5**.

<br/>
# Implementación del código en Azure

Haga clic con el botón derecho en el proyecto en el **Explorador de soluciones** y seleccione **Publicar**.

Para el destino de publicación, elija Aplicación de funciones de Azure y, a continuación, **Seleccionar existente**. Después, haga clic en **Publicar**.

Si aún no ha conectado Visual Studio con su cuenta de Azure, seleccione **Agregar una cuenta...** y siga las instrucciones que aparecerán en pantalla.

En **Suscripción**, seleccione {subscriptionName}. Busque {functionAppName} y, a continuación, selecciónelo en la sección siguiente. Después, haga clic en **Aceptar**.
