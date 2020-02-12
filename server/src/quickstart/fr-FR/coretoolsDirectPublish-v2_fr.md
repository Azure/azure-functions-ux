### Installer des dépendances

Avant de commencer, vous devez <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">installer .NET Core 2.1</a>. Vous devez également <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installer Node.JS</a> qui comprend npm, qui vous permet d’obtenir Azure Functions Core Tools. Si vous préférez ne pas installer Node, consultez les autres options d’installation dans notre <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">documentation de référence Core Tools</a>.

Exécutez la commande suivante pour installer le package Core Tools :

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

<br/>
### Créer un projet Azure Functions

Dans la fenêtre de terminal ou à partir d’une invite de commandes, accédez à un dossier vide pour votre projet, puis exécutez la commande suivante :

<MarkdownHighlighter>func init</MarkdownHighlighter>

Vous serez également invité à choisir un runtime pour le projet. Sélectionnez {workerRuntime}.

<br/>
### Créer une fonction

Pour créer une fonction, exécutez la commande suivante :

<MarkdownHighlighter>func new</MarkdownHighlighter>

Vous êtes alors invité à choisir un modèle pour votre fonction. Nous vous recommandons d’utiliser un déclencheur HTTP pour la prise en main.

<br/>
### Exécuter votre projet de fonction localement

Exécutez la commande suivante pour démarrer votre application de fonction :

<MarkdownHighlighter>func start</MarkdownHighlighter>

Le runtime génère une URL pour toutes les fonctions HTTP, qui peut être copiée et exécutée dans la barre d’adresse de votre navigateur.

Pour arrêter le débogage, utilisez **Ctrl-C** dans le terminal.

<br/>
### Déployer votre code dans Azure

Pour publier votre projet Functions dans Azure, entrez la commande suivante :

<MarkdownHighlighter>func azure functionapp publish {functionAppName}</MarkdownHighlighter>

Vous pouvez être invité à vous connecter à Azure. Suivez les instructions à l’écran.
