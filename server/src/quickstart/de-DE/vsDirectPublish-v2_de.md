### Installieren von Abhängigkeiten

Bevor Sie beginnen können, müssen Sie <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">Visual Studio 2017 installieren</a> und außerdem sicherstellen, dass die Workload für die Azure-Entwicklung installiert ist.

Vergewissern Sie sich nach der Installation von Visual Studio, dass Sie über die <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">aktuelle Version der Azure Functions-Tools</a> verfügen.

<br/>
### Erstellen eines Azure Functions-Projekts

Klicken Sie in Visual Studio im Menü **Datei** auf **Neu**> **Projekt**.

Erweitern Sie im Dialogfeld **Neues Projekt** unter **Installiert** den Eintrag **Visual C#** > **Cloud**, und wählen Sie **Azure Functions** aus. Geben Sie im Feld **Name** einen Namen für Ihr Projekt ein, und klicken Sie auf **OK**. Der Name der Funktions-App muss als C#-Namespace gültig sein. Verwenden Sie deshalb weder Unterstriche noch Bindestriche und keine anderen nicht alphanumerischen Zeichen.

Folgen Sie den Anweisungen des Assistenten, um eine Vorlage auszuwählen und anzupassen. Für den Einstieg wird eine HTTP-Funktion empfohlen. Klicken Sie anschließend auf **OK**, um Ihre erste Funktion zu erstellen.

<br/>
### Erstellen einer Funktion

Beim Erstellen des Projekts wird standardmäßig eine HTTP-Funktion erstellt, sodass Sie in diesem Schritt nichts weiter tun müssen. Wenn Sie später eine neue Funktion hinzufügen möchten, klicken Sie mit der rechten Maustaste im **Projektmappen-Explorer** auf das Projekt, und wählen Sie **Hinzufügen** > **Neue Azure-Funktion** aus.

Geben Sie einen Namen für Ihre Funktion an, und klicken Sie auf **Hinzufügen**. Wählen Sie Ihre Vorlage aus, und passen Sie sie an. Klicken Sie anschließend auf **OK**.

<br/>
### Lokale Ausführung Ihres Funktionsprojekts

Drücken Sie **F5**, um Ihre Funktions-App auszuführen.

Die Runtime gibt eine URL für beliebige HTTP-Funktionen aus, die Sie in die Adressleiste Ihres Browsers kopieren und ausführen können.

Drücken Sie **UMSCHALT+F5**, um das Debuggen zu beenden.

<br/>
### Bereitstellen Ihres Codes in Azure

Klicken Sie im **Projektmappen-Explorer** mit der rechten Maustaste auf das Projekt, und wählen Sie **Veröffentlichen** aus.

Wählen Sie als Veröffentlichungsziel „Azure Functions-App“ aus, und klicken Sie auf **Vorhandene auswählen**. Klicken Sie anschließend auf **Veröffentlichen**.

Wenn Sie Visual Studio noch nicht mit Ihrem Azure-Konto verknüpft haben, wählen Sie **Konto hinzufügen** aus, und folgen Sie den Anweisungen auf dem Bildschirm.

Wählen Sie unter **Abonnement** den Eintrag {subscriptionName} aus. Suchen Sie nach {functionAppName}, und wählen Sie die App im Abschnitt unten aus. Klicken Sie anschließend auf **OK**.
