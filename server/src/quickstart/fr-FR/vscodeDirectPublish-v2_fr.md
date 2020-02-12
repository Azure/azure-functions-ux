### Installer des dépendances

Avant de commencer, vous devez <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">installer Visual Studio Code</a>. Vous devez également <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installer Node.JS</a> qui comprend npm, qui vous permet d’obtenir Azure Functions Core Tools. Si vous préférez ne pas installer Node, consultez les autres options d’installation dans notre <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">documentation de référence Core Tools</a>.

Exécutez la commande suivante pour installer le package Core Tools :

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools utilise <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>. Vous devez donc l’installer également.

Ensuite, <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">installez l’extension Azure Functions pour Visual Studio Code</a>. Une fois l’extension installée, cliquez sur le logo Azure dans la barre d’activité. Sous **Azure : Functions**, cliquez sur **Se connecter à Azure...** et suivez les instructions à l’écran.

<br/>
### Créer un projet Azure Functions

Cliquez sur l’icône **Créer un projet...** dans le volet **Azure : Functions**.

Vous serez invité à sélectionner un répertoire pour votre application. Choisissez un répertoire vide.

Vous serez ensuite invité à sélectionner une langue pour votre projet. Choisissez {workerRuntime}.

<br/>
### Créer une fonction

Cliquez sur l’icône **Créer une fonction...** dans le volet **Azure : Functions**.

Vous serez invité à choisir un modèle pour votre fonction. Nous vous recommandons d’utiliser un déclencheur HTTP pour la prise en main.

<br/>
### Exécuter votre projet de fonction localement

Appuyez sur **F5** pour exécuter votre application de fonction.

Le runtime génère une URL pour toutes les fonctions HTTP, qui peut être copiée et exécutée dans la barre d’adresse de votre navigateur.

Pour arrêter le débogage, appuyez sur **Maj + F5**.

<br/>
### Déployer votre code dans Azure

Cliquez sur l’icône **Déployer sur l’application de fonction...** (flèche haut bleue) dans **Azure : Functions**.

Lorsque vous êtes invité à sélectionner une application de fonction, choisissez {functionAppName}.
