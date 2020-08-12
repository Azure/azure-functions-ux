### Install dependencies

Before you can get started, you should <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">install Node.js</a> which includes npm. This is how you will obtain the Azure Functions Core Tools. If you prefer not to install Node.js, see the other installation options in our <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools reference</a>.

Run the following command to install the Core Tools package:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@3 --unsafe-perm true</MarkdownHighlighter>

<br/>
### Create an Azure Functions project

In the terminal window or from a command prompt, navigate to an empty folder for your project, and run the following command:

<MarkdownHighlighter>func init</MarkdownHighlighter>

You will also be prompted to choose a runtime for the project. Select {workerRuntime}.

<br/>
### Create a function

To create a function, run the following command:

<MarkdownHighlighter>func new</MarkdownHighlighter>

This will prompt you to choose a template for your function. We recommend HTTP trigger for getting started.

To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.

<br/>
### Run your function project locally

Run the following command to start your function app:

<MarkdownHighlighter>func start</MarkdownHighlighter>

The runtime will output a URL for any HTTP functions, which can be copied and run in your browser's address bar.

To stop debugging, use **Ctrl-C** in the terminal.

<br/>
### Deploy your code to Azure

To publish your Functions project into Azure, enter the following command:

<MarkdownHighlighter>func azure functionapp publish {functionAppName}</MarkdownHighlighter>

You may be prompted to sign into Azure. Follow the onscreen instructions.
