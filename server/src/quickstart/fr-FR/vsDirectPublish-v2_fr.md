### Installer des dépendances

Avant de commencer, vous devez <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">installer Visual Studio 2019</a> et vous assurer que la charge de travail de développement Azure est également installée.

Une fois Visual Studio installé, assurez-vous que vous disposez des <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">outils Azure Functions les plus récents</a>.

<br/>
### Créer un projet Azure Functions

Dans Visual Studio, sélectionnez **Nouveau** > **Projet** dans le menu **Fichier**.

Dans la boîte de dialogue **Nouveau projet**, sélectionnez **Installé**, développez **Visual C#** > **Cloud**, sélectionnez **Azure Functions**, saisissez un **Nom** pour votre projet, puis cliquez sur **OK**. Le nom de l’application de fonction doit être valide en tant qu’espace de noms C#. Par conséquent, n’utilisez pas de traits de soulignement, de traits d’union ou tout autre caractère non alphanumérique.

Suivez l’Assistant pour sélectionner et personnaliser un modèle. Nous vous recommandons d’utiliser un déclencheur HTTP pour la prise en main. Cliquez ensuite sur **OK** pour créer votre première fonction.

<br/>
### Créer une fonction

La création du projet crée une fonction HTTP par défaut. Vous n’avez donc rien à faire pour cette étape pour le moment. Plus tard, si vous souhaitez ajouter une nouvelle fonction, cliquez avec le bouton droit sur le projet dans l’**Explorateur de solutions** et sélectionnez **Ajouter** > **Nouvelle fonction Azure...**

Donnez un nom à votre fonction, puis cliquez sur **Ajouter**. Sélectionnez et personnalisez votre modèle, puis cliquez sur **OK**.

<br/>
### Exécuter votre projet de fonction localement

Appuyez sur **F5** pour exécuter votre application de fonction.

Le runtime génère une URL pour toutes les fonctions HTTP, qui peut être copiée et exécutée dans la barre d’adresse de votre navigateur.

Pour arrêter le débogage, appuyez sur **Maj + F5**.

<br/>
### Déployer votre code dans Azure

Cliquez avec le bouton droit sur le projet dans l’**Explorateur de solutions** et sélectionnez **Publier**.

Pour votre cible de publication, choisissez Application de fonction Azure, puis choisissez **Sélectionner**. Cliquez ensuite sur **Publier**.

Si vous n’avez pas encore connecté Visual Studio à votre compte Azure, sélectionnez **Ajouter un compte...** et suivez les instructions à l’écran.

Sous **Abonnement**, sélectionnez {subscriptionName}. Recherchez l’application {functionAppName}, puis sélectionnez-la dans la section ci-dessous. Cliquez ensuite sur **OK**.
