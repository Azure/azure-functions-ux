# Install dependencies

Before you can get started, you should [install Visual Studio 2019](https://go.microsoft.com/fwlink/?linkid=2016389) and ensure that the Azure development workload is also installed.

Once Visual Studio is installed, make sure you have the [latest Azure Functions tools](https://go.microsoft.com/fwlink/?linkid=2016394).

<br/>
# Create an Azure Functions project

In Visual Studio, select **New** > **Project** from the **File** menu.

In the **New Project** dialog, select **Installed**, expand **Visual C#** > **Cloud**, select **Azure Functions**, type a **Name** for your project, and click **OK**. The function app name must be valid as a C# namespace, so don't use underscores, hyphens, or any other nonalphanumeric characters.

Follow the wizard to select and customize a template. We recommend HTTP for getting started. Then click **OK** to create your first function.

<br/>
# Create a function

Creating the project creates an HTTP function by default, so you don't have to do anything for this step right now. Later, if you want to add a new function, right-click on the project in **Solution Explorer** and select **Add** > **New Azure Function…**

Give your function a name and click **Add**. Select and customize your template, and then click **OK**.

<br/>
# Run your function project locally

Press **F5** to run your function app.

The runtime will output a URL for any HTTP functions, which can be copied and run in your browser's address bar.

To stop debugging, press **Shift + F5**.

<br/>
# Deploy your code to Azure

Use the **Finish and go to Deployment Center** button below to navigate to Deployment Center and finish setting up your app. This will take you through a new wizard to configure a variety of deployment options. After completing this flow, trigger a deployment using whichever mechanism you configured.
