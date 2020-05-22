# Installer des dépendances

Avant de commencer, vous devez [installer Visual Studio 2019](https://go.microsoft.com/fwlink/?linkid=2016389) et vous assurer que la charge de travail de développement Azure est également installée.

Une fois Visual Studio installé, assurez-vous que vous disposez des [outils Azure Functions les plus récents](https://go.microsoft.com/fwlink/?linkid=2016394).

<br/>
# Créer un projet Azure Functions

Dans Visual Studio, sélectionnez **Nouveau** > **Projet** dans le menu **Fichier**.

Dans la boîte de dialogue **Nouveau projet**, sélectionnez **Installé**, développez **Visual C#** > **Cloud**, sélectionnez **Azure Functions**, saisissez un **Nom** pour votre projet, puis cliquez sur **OK**. Le nom de l’application de fonction doit être valide en tant qu’espace de noms C#. Par conséquent, n’utilisez pas de traits de soulignement, de traits d’union ou tout autre caractère non alphanumérique.

Suivez l’Assistant pour sélectionner et personnaliser un modèle. Nous vous recommandons d’utiliser un déclencheur HTTP pour la prise en main. Cliquez ensuite sur **OK** pour créer votre première fonction.

<br/>
# Créer une fonction

La création du projet crée une fonction HTTP par défaut. Vous n’avez donc rien à faire pour cette étape pour le moment. Plus tard, si vous souhaitez ajouter une nouvelle fonction, cliquez avec le bouton droit sur le projet dans l’**Explorateur de solutions** et sélectionnez **Ajouter** > **Nouvelle fonction Azure...**

Donnez un nom à votre fonction, puis cliquez sur **Ajouter**. Sélectionnez et personnalisez votre modèle, puis cliquez sur **OK**.

<br/>
# Exécuter votre projet de fonction localement

Appuyez sur **F5** pour exécuter votre application de fonction.

Le runtime génère une URL pour toutes les fonctions HTTP, qui peut être copiée et exécutée dans la barre d’adresse de votre navigateur.

Pour arrêter le débogage, appuyez sur **Maj + F5**.

<br/>
# Déployer votre code dans Azure

Utilisez le bouton **Terminer et accéder au centre de déploiement** ci-dessous pour accéder au centre de déploiement et terminer la configuration de votre application. Cela vous permettra d’accéder à un nouvel Assistant pour configurer une variété d’options de déploiement. À la fin de ce flux, déclenchez un déploiement à l’aide du mécanisme que vous avez configuré.
