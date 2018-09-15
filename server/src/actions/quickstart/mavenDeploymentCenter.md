# Install dependencies

Before you can get started, you should [install the Java Developer Kit, version 8](https://go.microsoft.com/fwlink/?linkid=2016706). Make sure that the JAVA_HOME environment variable gets set to the install location of the JDK. You will also need to [install Apache Maven, version 3.0 or above](https://go.microsoft.com/fwlink/?linkid=2016384).

You should also [install Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195) which includes npm. This is how you will obtain the Azure Functions Core Tools. If you prefer not to install Node, see the other installation options in our [Core Tools reference](https://go.microsoft.com/fwlink/?linkid=2016192).

Run the following command to install the Core Tools package:

```
npm install -g azure-functions-core-tools
```

Lastly, [install the Azure CLI 2.0](https://go.microsoft.com/fwlink/?linkid=2016701). Once this is installed, make sure you are logged in by running the login command and following the onscreen instructions:

```
az login
```

<br/>
# Create an Azure Functions project

In the terminal window or from a command prompt, navigate to an empty folder for your project, and run the following command:

```
mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false
```

<br/>
# Create a function

Creating the project creates an HTTP function by default, so you don't have to do anything for this step right now. Later, if you want to add a new function, run the following command:

```
mvn azure-functions:add
```

Maven will prompt you to select and customize a template for the new function.

<br/>
# Run your function project locally

Enter the following command to run your function app:

```
mvn clean package 
mvn azure-functions:run
```

The runtime will output a URL for any HTTP functions, which can be copied and run in your browser's address bar.

To stop debugging, use **Ctrl-C** in the terminal.

<br/>
# Deploy your code to Azure

Use the button below to navigate to Deployment Center and finish setting up your app. This will take you through a new wizard to configure a variety of deployment options. After completing this flow, trigger a deployment using whichever mechanism you configured.