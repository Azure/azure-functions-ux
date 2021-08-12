### Install dependencies

Before you can get started, you should <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">install the Java Developer Kit, version 8</a>. Make sure that the JAVA_HOME environment variable gets set to the install location of the JDK. You will also need to <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">install Apache Maven, version 3.0 or above</a>.

You should also <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">install Node.JS</a> which includes npm. This is how you will obtain the Azure Functions Core Tools. If you prefer not to install Node, see the other installation options in our <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools reference</a>.

Run the following command to install the Core Tools package:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

The Core Tools make use of <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, so you should install that, too.

Lastly, <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">install the Azure CLI 2.0</a>. Once this is installed, make sure you are logged in by running the login command and following the onscreen instructions:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### Create an Azure Functions project

In the terminal window or from a command prompt, navigate to an empty folder for your project, and run the following command:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### Create a function

Creating the project creates an HTTP function by default, so you don't have to do anything for this step right now. Later, if you want to add a new function, run the following command:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven will prompt you to select and customize a template for the new function.

<br/>
### Run your function project locally

Enter the following command to run your function app:

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

The runtime will output a URL for any HTTP functions, which can be copied and run in your browser's address bar.

To stop debugging, use **Ctrl-C** in the terminal.

<br/>
### Deploy your code to Azure

To publish your Functions project into Azure, enter the following command:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

You may be prompted to sign into Azure if you have not already. Follow the onscreen instructions.
