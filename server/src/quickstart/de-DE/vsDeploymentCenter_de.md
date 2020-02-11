# Installieren von Abhängigkeiten

Bevor Sie beginnen können, müssen Sie [Visual Studio 2017 installieren](https://go.microsoft.com/fwlink/?linkid=2016389) und außerdem sicherstellen, dass die Workload für die Azure-Entwicklung installiert ist.

Vergewissern Sie sich nach der Installation von Visual Studio, dass Sie über die [aktuelle Version der Azure Functions-Tools](https://go.microsoft.com/fwlink/?linkid=2016394) verfügen.

<br/>
# Erstellen eines Azure Functions-Projekts

Klicken Sie in Visual Studio im Menü **Datei** auf **Neu**> **Projekt**.

Erweitern Sie im Dialogfeld **Neues Projekt** unter **Installiert** den Eintrag **Visual C#** > **Cloud**, und wählen Sie **Azure Functions** aus. Geben Sie im Feld **Name** einen Namen für Ihr Projekt ein, und klicken Sie auf **OK**. Der Name der Funktions-App muss als C#-Namespace gültig sein. Verwenden Sie deshalb weder Unterstriche noch Bindestriche und keine anderen nicht alphanumerischen Zeichen.

Folgen Sie den Anweisungen des Assistenten, um eine Vorlage auszuwählen und anzupassen. Für den Einstieg wird eine HTTP-Funktion empfohlen. Klicken Sie anschließend auf **OK**, um Ihre erste Funktion zu erstellen.

<br/>
# Erstellen einer Funktion

Beim Erstellen des Projekts wird standardmäßig eine HTTP-Funktion erstellt, sodass Sie in diesem Schritt nichts weiter tun müssen. Wenn Sie später eine neue Funktion hinzufügen möchten, klicken Sie mit der rechten Maustaste im **Projektmappen-Explorer** auf das Projekt, und wählen Sie **Hinzufügen** > **Neue Azure-Funktion** aus.

Geben Sie einen Namen für Ihre Funktion an, und klicken Sie auf **Hinzufügen**. Wählen Sie Ihre Vorlage aus, und passen Sie sie an. Klicken Sie anschließend auf **OK**.

<br/>
# Lokale Ausführung Ihres Funktionsprojekts

Drücken Sie **F5**, um Ihre Funktions-App auszuführen.

Die Runtime gibt eine URL für beliebige HTTP-Funktionen aus, die Sie in die Adressleiste Ihres Browsers kopieren und ausführen können.

Drücken Sie **UMSCHALT+F5**, um das Debuggen zu beenden.

<br/>
# Bereitstellen Ihres Codes in Azure

Klicken Sie auf die unten angezeigte Schaltfläche **Beenden und zum Bereitstellungscenter wechseln**, um zum Bereitstellungscenter zu navigieren und die Einrichtung Ihrer App abzuschließen. Sie werden durch einen neuen Assistenten geleitet, um verschiedene Bereitstellungsoptionen zu konfigurieren. Lösen Sie nach Abschluss der Konfiguration mit dem von Ihnen konfigurierten Mechanismus eine Bereitstellung aus.
