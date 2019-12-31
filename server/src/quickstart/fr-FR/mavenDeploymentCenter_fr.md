# Installer des dépendances

Avant de commencer, vous devez [installer le kit de développement Java, version 8](https://go.microsoft.com/fwlink/?linkid=2016706). Assurez-vous que la variable d’environnement JAVA\_HOME est définie sur l’emplacement d’installation du kit de développement Java. Vous devez également [installer Apache Maven, version 3.0 ou ultérieure](https://go.microsoft.com/fwlink/?linkid=2016384).

Vous devez également [installer Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195) qui comprend npm. C’est ainsi que vous obtiendrez Azure Functions Core Tools. Si vous préférez ne pas installer Node, consultez les autres options d’installation dans notre [documentation de référence Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Exécutez la commande suivante pour installer le package Core Tools :

``` npm install -g azure-functions-core-tools ```

Core Tools utilise [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373). Vous devez donc l’installer également.

Enfin, [installez Azure CLI 2.0](https://go.microsoft.com/fwlink/?linkid=2016701). Une fois l’installation terminée, vérifiez que vous êtes connecté en exécutant la commande de connexion et en suivant les instructions à l’écran :

``` az login ```

<br/>
# Créer un projet Azure Functions

Dans la fenêtre de terminal ou à partir d’une invite de commandes, accédez à un dossier vide pour votre projet, puis exécutez la commande suivante :

``` mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false ```

<br/>
# Créer une fonction

La création du projet crée une fonction HTTP par défaut. Vous n’avez donc rien à faire pour cette étape pour le moment. Plus tard, si vous souhaitez ajouter une nouvelle fonction, exécutez la commande suivante :

``` mvn azure-functions:add ```

Maven vous invite à sélectionner et à personnaliser un modèle pour la nouvelle fonction.

<br/>
# Exécuter votre projet de fonction localement

Entrez la commande suivante pour exécuter votre application de fonction :

``` mvn clean package mvn azure-functions:run ```

Le runtime génère une URL pour toutes les fonctions HTTP, qui peut être copiée et exécutée dans la barre d’adresse de votre navigateur.

Pour arrêter le débogage, utilisez **Ctrl-C** dans le terminal.

<br/>
# Déployer votre code dans Azure

Utilisez le bouton **Terminer et accéder au centre de déploiement** ci-dessous pour accéder au centre de déploiement et terminer la configuration de votre application. Cela vous permettra d’accéder à un nouvel Assistant pour configurer une variété d’options de déploiement. À la fin de ce flux, déclenchez un déploiement à l’aide du mécanisme que vous avez configuré.
