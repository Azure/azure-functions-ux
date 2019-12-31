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

Use el botón **Finalizar e ir al centro de implementación** que se muestra a continuación para ir al centro de implementación y finalizar la configuración de la aplicación. Se le guiará a través de un nuevo asistente para configurar diversas opciones de implementación. Después de completar este flujo, desencadene una implementación con el mecanismo que haya configurado.
