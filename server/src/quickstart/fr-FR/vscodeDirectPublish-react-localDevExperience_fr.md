### <a name="install-dependencies"></a>Installer des dépendances

Avant de pouvoir commencer, vous devez <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">installer Visual Studio Code</a>. Vous devez aussi <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">installer Node.JS</a> qui inclut npm. C’est ainsi que vous obtiendrez Azure Functions Core Tools. Si vous préférez ne pas installer Node, consultez les autres options d’installation dans nos <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">informations de référence sur Core Tools</a>.

Exécutez la commande suivante pour installer le package Core Tools :

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

Ensuite, <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">installez l’extension Azure Functions pour Visual Studio Code</a>. Une fois l’extension installée, cliquez sur le logo Azure dans la barre d’activité. Sous **Azure : Fonctions**, cliquez sur **Se connecter à Azure...** et suivez les instructions à l’écran.

<br/>
### <a name="create-an-azure-functions-project"></a>Créer un projet Azure Functions

Cliquez sur l’icône **Créer un projet…** dans le panneau **Azure : Fonctions**.

Vous êtes invité à choisir un répertoire pour votre application. Choisissez un répertoire vide.

Vous êtes ensuite invité à sélectionner un langage pour votre projet. Choisissez {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Créer une fonction

Cliquez sur l’icône **Créer une fonction…** dans le panneau **Azure : Fonctions**.

Vous êtes invité à choisir un modèle pour votre fonction. Nous recommandons le déclencheur HTTP pour démarrer.

<br/>
### <a name="run-your-function-project-locally"></a>Exécuter votre projet de fonction localement

Pour exécuter votre application de fonction, appuyez sur **F5**.

Le runtime génère une URL pour toutes les fonctions HTTP, qui peuvent être copiées et exécutées dans la barre d’adresse de votre navigateur.

Pour arrêter le débogage, appuyez sur **MAJ + F5**.

<br/>
### <a name="deploy-your-code-to-azure"></a>Déployer votre code vers Azure

Cliquez sur l’icône **Déploy to Function App…** (<ChevronUp/>) dans le panneau **Azure : Fonctions**.

Lorsque vous êtes invité à sélectionner une application de fonction, choisissez {functionAppName}.
