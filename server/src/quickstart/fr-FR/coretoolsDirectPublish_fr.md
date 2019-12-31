# Installer des dépendances

Avant de commencer, vous devez [installer .NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373). Vous devez également [installer Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195) qui comprend npm, qui vous permet d’obtenir Azure Functions Core Tools. Si vous préférez ne pas installer Node, consultez les autres options d’installation dans notre [documentation de référence Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Exécutez la commande suivante pour installer le package Core Tools :

``` npm install -g azure-functions-core-tools ```

<br/>
# Créer un projet Azure Functions

Dans la fenêtre de terminal ou à partir d’une invite de commandes, accédez à un dossier vide pour votre projet, puis exécutez la commande suivante :

``` func init ```

Vous serez également invité à choisir un runtime pour le projet. Sélectionnez {workerRuntime}.

<br/>
# Créer une fonction

Pour créer une fonction, exécutez la commande suivante :

``` func new ```

Vous êtes alors invité à choisir un modèle pour votre fonction. Nous vous recommandons d’utiliser un déclencheur HTTP pour la prise en main.

<br/>
# Exécuter votre projet de fonction localement

Exécutez la commande suivante pour démarrer votre application de fonction :

``` func start ```

Le runtime génère une URL pour toutes les fonctions HTTP, qui peut être copiée et exécutée dans la barre d’adresse de votre navigateur.

Pour arrêter le débogage, utilisez **Ctrl-C** dans le terminal.

<br/>
# Déployer votre code dans Azure

Pour publier votre projet Functions dans Azure, entrez la commande suivante :

``` func azure functionapp publish {functionAppName} ```

Vous pouvez être invité à vous connecter à Azure. Suivez les instructions à l’écran.
