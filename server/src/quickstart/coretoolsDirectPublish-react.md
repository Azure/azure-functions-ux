### Install dependencies

Before you can get started, you should <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">install .NET Core 2.1</a>. You should also <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">install Node.JS</a> which includes npm, which is how you will obtain the Azure Functions Core Tools. If you prefer not to install Node, see the other installation options in our <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools reference</a>.

Run the following command to install the Core Tools package:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

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
