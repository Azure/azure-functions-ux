# Install dependencies

Before you can get started, you should [install .NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373). You should also [install Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195) which includes npm, which is how you will obtain the Azure Functions Core Tools. If you prefer not to install Node, see the other installation options in our [Core Tools reference](https://go.microsoft.com/fwlink/?linkid=2016192).

Run the following command to install the Core Tools package:

```
npm install -g azure-functions-core-tools
```

<br/>
# Create an Azure Functions project

In the terminal window or from a command prompt, navigate to an empty folder for your project, and run the following command:

```
func init
```

You will also be prompted to choose a runtime for the project. Select {workerRuntime}

<br/>
# Create a function

To create a function, run the following command:

```
func new
```

This will prompt you to choose a template for your function. We recommend HTTP trigger for getting started.

<br/>
# Run your function project locally

Run the following command to start your function app:

```
func  start
```

The runtime will output a URL for any HTTP functions, which can be copied and run in your browser's address bar.

To stop debugging, use **Ctrl-C** in the terminal.

<br/>
# Deploy your code to Azure

To publish your Functions project into Azure, enter the following command:
```
func azure functionapp publish {functionAppName}
```

You may be prompted to sign into Azure. Follow the onscreen instructions.
