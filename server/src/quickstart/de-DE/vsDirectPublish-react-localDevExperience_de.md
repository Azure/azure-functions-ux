### <a name="install-dependencies"></a>Installieren von Abhängigkeiten

Als Erstes sollten Sie <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">Visual Studio 2019 installieren</a> und sicherstellen, dass auch die Workload „Azure-Entwicklung“ installiert ist.

Stellen Sie nach der Installation von Visual Studio sicher, dass Sie über die <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">aktuellen Azure Functions-Tools</a> verfügen.

<br/>
### <a name="create-an-azure-functions-project"></a>Erstellen eines Azure Functions-Projekts

Wählen Sie in Visual Studio im Menü **Datei** die Optionen **Neu** > **Projekt**.

Wählen Sie im Dialogfeld **Neues Projekt** die Option **Installiert**, erweitern Sie **Visual C#** > **Cloud**, und wählen Sie **Azure Functions** aus. Geben Sie unter **Name** einen Namen für Ihr Projekt ein, und klicken Sie auf **OK**. Der Name der Funktions-App muss als C#-Namespace gültig sein, verwenden Sie daher keine Unterstriche, Bindestriche oder andere nicht alphanumerische Zeichen.

Befolgen Sie die Anleitung im Assistenten, um eine Vorlage auszuwählen und anzupassen. Für den Einstieg empfehlen wir die Auswahl von „HTTP“. Klicken Sie anschließend auf **OK**, um Ihre erste Funktion zu erstellen.

<br/>
### <a name="create-a-function"></a>Erstellen einer Funktion

Bei der Erstellung des Projekts wird standardmäßig eine HTTP-Funktion erstellt. In diesem Schritt müssen Sie daher keine Aufgabe durchführen. Falls Sie später eine neue Funktion hinzufügen möchten, klicken Sie im **Projektmappen-Explorer** mit der rechten Maustaste auf das Projekt und wählen **Hinzufügen** > **Neue Azure-Funktion…** aus.

Geben Sie Ihrer Funktion einen Namen, und klicken Sie auf **Hinzufügen**. Wählen Sie Ihre Vorlage aus, passen Sie sie an, und klicken Sie dann auf **OK**.

<br/>
### <a name="run-your-function-project-locally"></a>Lokales Ausführen Ihres Funktionsprojekts

Drücken Sie **F5**, um Ihre Funktions-App auszuführen.

Die Runtime gibt eine URL für beliebige HTTP-Funktionen aus, die kopiert und in der Adressleiste Ihres Browsers ausgeführt werden kann.

Drücken Sie **UMSCHALT+F5**, um das Debuggen zu beenden.

<br/>
### <a name="deploy-your-code-to-azure"></a>Bereitstellen Ihres Codes in Azure

Klicken Sie im **Projektmappen-Explorer** mit der rechten Maustaste auf das Projekt, und wählen Sie **Veröffentlichen** aus.

Wählen Sie „Azure-Funktions-App“ als Veröffentlichungsziel und dann die Option **Vorhandene auswählen** aus. Dann wird auf **Veröffentlichen** geklickt.

Wählen Sie **Konto hinzufügen...** aus, falls Sie Visual Studio noch nicht mit Ihrem Azure-Konto verbunden haben. Befolgen Sie anschließend die Anleitung auf dem Bildschirm.

Wählen Sie unter **Abonnement** die Option „{subscriptionName}“ aus. Suchen Sie nach „{functionAppName}“, und wählen Sie die Option unten im Abschnitt aus. Klicken Sie dann auf **OK**.
