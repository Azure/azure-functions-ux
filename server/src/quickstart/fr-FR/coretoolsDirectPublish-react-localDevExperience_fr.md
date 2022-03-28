### <a name="install-dependencies"></a>Installer des dépendances

Avant de pouvoir commencer, vous devez <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installer Node.js</a> qui comprend npm. C’est ainsi que vous obtiendrez Azure Functions Core Tools. Si vous préférez ne pas installer Node.js, consultez les autres options d’installation dans nos <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">informations de référence sur Core Tools</a>.

Exécutez la commande suivante pour installer le package Core Tools :

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Créer un projet Azure Functions

Dans la fenêtre du terminal ou à partir d’une invite de commandes, accédez à un dossier vide de votre projet et exécutez la commande suivante :

<MarkdownHighlighter>func init</MarkdownHighlighter>

Vous serez également invité à choisir un runtime pour le projet. Sélectionnez {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Créer une fonction

Exécutez la commande suivante pour créer une fonction :

<MarkdownHighlighter>func new</MarkdownHighlighter>

Vous êtes alors invité à choisir un modèle pour votre fonction. Nous recommandons le déclencheur HTTP pour démarrer.

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>Exécuter votre projet de fonction localement

Exécutez la commande suivante pour démarrer votre application de fonction :

<MarkdownHighlighter>func start</MarkdownHighlighter>

Le runtime génère une URL pour toutes les fonctions HTTP, qui peuvent être copiées et exécutées dans la barre d’adresse de votre navigateur.

Pour arrêter le débogage, utilisez **Ctrl-C** dans le terminal.

<br/>
### <a name="deploy-your-code-to-azure"></a>Déployer votre code vers Azure

Pour publier votre projet Functions dans Azure, entrez la commande suivante :

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

Vous serez peut-être invité à vous connecter à Azure. Suivez les instructions à l'écran.
