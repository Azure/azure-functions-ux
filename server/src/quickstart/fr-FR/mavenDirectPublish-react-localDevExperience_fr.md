### <a name="install-dependencies"></a>Installer des dépendances

Avant de pouvoir commencer, vous devez <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">installer le kit Java Developer Kit, version 8</a>. Veillez à définir la variable d’environnement JAVA_HOME sur l’emplacement d’installation du JDK. Vous devez également <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">installer Apache Maven, version 3.0 ou ultérieure</a>.

Vous devez aussi <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installer Node.JS</a> qui inclut npm. C’est ainsi que vous obtiendrez Azure Functions Core Tools. Si vous préférez ne pas installer Node, consultez les autres options d’installation dans nos <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">informations de référence sur Core Tools</a>.

Exécutez la commande suivante pour installer le package Core Tools :

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Les outils Core Tools utilisent <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, donc vous devez aussi l’installer.

Enfin, <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">installez l’interface Azure CLI 2.0</a>. Une fois cette installation terminée, vérifiez que vous êtes connecté en exécutant la commande login et en suivant les instructions à l’écran :

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Créer un projet Azure Functions

Dans la fenêtre du terminal ou à partir d’une invite de commandes, accédez à un dossier vide de votre projet et exécutez la commande suivante :

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>Créer une fonction

La création du projet crée une fonction HTTP par défaut, donc vous n’avez rien à faire dans cette étape pour le moment. Si vous souhaitez ajouter une nouvelle fonction ultérieurement, exécutez la commande suivante :

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven vous invite à sélectionner et à personnaliser un modèle pour la nouvelle fonction.

<br/>
### <a name="run-your-function-project-locally"></a>Exécuter votre projet de fonction localement

Entrez la commande suivante pour exécuter votre application de fonction :

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

Le runtime génère une URL pour toutes les fonctions HTTP, qui peuvent être copiées et exécutées dans la barre d’adresse de votre navigateur.

Pour arrêter le débogage, utilisez **Ctrl-C** dans le terminal.

<br/>
### <a name="deploy-your-code-to-azure"></a>Déployer votre code vers Azure

Pour publier votre projet Functions dans Azure, entrez la commande suivante :

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Si vous n’êtes pas encore connecté à Azure, vous serez invité à le faire. Suivez les instructions à l'écran.
