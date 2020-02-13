### Install dependencies

Before you can get started, you should <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">install Visual Studio Code</a>. You should also <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">install Node.JS</a> which includes npm, which is how you will obtain the Azure Functions Core Tools. If you prefer not to install Node, see the other installation options in our <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools reference</a>.

Run the following command to install the Core Tools package:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

The Core Tools make use of <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, so you should install that, too.

Next, <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">install the Azure Functions extension for Visual Studio Code</a>. Once the extension is installed, click on the Azure logo in the Activity Bar. Under **Azure: Functions**, click **Sign in to Azure...** and follow the on-screen instructions.

<br/>
### Create an Azure Functions project

Click the **Create New Project…** icon in the **Azure: Functions** panel.

You will be prompted to choose a directory for your app. Choose an empty directory.

You will then be prompted to select a language for your project. Choose {workerRuntime}.

<br/>
### Create a function

Click the **Create Function…** icon in the **Azure: Functions** panel.

You will be prompted to choose a template for your function. We recommend HTTP trigger for getting started.

<br/>
### Run your function project locally

Press **F5** to run your function app.

The runtime will output a URL for any HTTP functions, which can be copied and run in your browser's address bar.

To stop debugging, press **Shift + F5**.

<br/>
### Deploy your code to Azure

Click the **Deploy to Function App…** (<ChevronUp/>) icon in the **Azure: Functions** panel.

When prompted to select a function app, choose {functionAppName}.
