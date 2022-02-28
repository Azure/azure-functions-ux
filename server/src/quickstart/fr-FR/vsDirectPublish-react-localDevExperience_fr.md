### <a name="install-dependencies"></a>Installer des dépendances

Avant de pouvoir commencer, vous devez <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">installer Visual Studio 2019</a> et vérifier que la charge de travail de développement Azure est également installée.

Une fois que Visual Studio est installé, veillez à disposer des <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">derniers outils Azure Functions</a>.

<br/>
### <a name="create-an-azure-functions-project"></a>Créer un projet Azure Functions

Dans Visual Studio, sélectionnez **Nouveau** > **Projet** dans le menu **Fichier**.

Dans la boîte de dialogue **Nouveau projet**, sélectionnez **Installé**, développez **Visual C#** > **Cloud**, sélectionnez **Azure Functions**, tapez un **Nom** pour votre projet, puis cliquez sur **OK**. Le nom d’application de la fonction doit être valide en tant qu’espace de noms C#, afin de ne pas utiliser des traits d’union, des traits de soulignement ou d’autres caractères non alphanumériques.

Suivez l’Assistant pour sélectionner et personnaliser un modèle. Nous vous recommandons le protocole HTTP pour démarrer. Cliquez ensuite sur **OK** pour créer votre première fonction.

<br/>
### <a name="create-a-function"></a>Créer une fonction

La création du projet crée une fonction HTTP par défaut, donc vous n’avez rien à faire dans cette étape pour le moment. Plus tard, si vous souhaitez ajouter une nouvelle fonction, cliquez avec le bouton droit sur le projet dans **Explorateur de solutions** et sélectionnez **Ajouter** > **Nouvelle fonction Azure…**

Donnez un nom à votre fonction, puis cliquez sur **Ajouter**. Sélectionnez et personnalisez votre modèle, puis cliquez sur **OK**.

<br/>
### <a name="run-your-function-project-locally"></a>Exécuter votre projet de fonction localement

Pour exécuter votre application de fonction, appuyez sur **F5**.

Le runtime génère une URL pour toutes les fonctions HTTP, qui peuvent être copiées et exécutées dans la barre d’adresse de votre navigateur.

Pour arrêter le débogage, appuyez sur **MAJ + F5**.

<br/>
### <a name="deploy-your-code-to-azure"></a>Déployer votre code vers Azure

Cliquez avec le bouton droit sur le projet dans **l’Explorateur de solutions**, puis sélectionnez **Publier**.

Pour votre cible de publication, choisissez Application de fonction Azure, puis **Sélectionner existant**. Cliquez ensuite sur **Publier**.

Si vous n’avez pas encore connecté Visual Studio à votre compte Azure, sélectionnez **Ajouter un compte…** et suivez les instructions à l’écran.

Sous **Abonnement**, sélectionnez {subscriptionName}. Recherchez {functionAppName}, puis sélectionnez-la dans la section ci-dessous. Cliquez ensuite sur **OK**.
