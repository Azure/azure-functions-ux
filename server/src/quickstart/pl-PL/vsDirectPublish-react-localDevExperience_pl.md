### <a name="install-dependencies"></a>Instalowanie zależności

Przed rozpoczęciem należy <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">zainstalować program Visual Studio 2019</a> i upewnić się, że zainstalowano również deweloperski pakiet roboczy dla platformy Azure.

Po zainstalowaniu programu Visual Studio upewnij się, że masz <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">najnowsze narzędzia usługi Azure Functions</a>.

<br/>
### <a name="create-an-azure-functions-project"></a>Tworzenie projektu usługi Azure Functions

W programie Visual Studio wybierz pozycję **Nowy** > **Projekt** z menu **Plik**.

W oknie dialogowym **Nowy projekt** wybierz pozycję **Zainstalowane**, rozwiń węzeł **Visual C#** > **Chmura**, wybierz pozycję **Azure Functions**, wpisz **nazwę** swojego projektu, a następnie kliknij przycisk **OK**. Nazwa aplikacji funkcji musi być prawidłową nazwą przestrzeni nazw C#, dlatego nie należy używać znaków podkreślenia, łączników ani znaków innych niż alfanumeryczne.

Postępuj zgodnie z instrukcjami kreatora, aby wybrać i dostosować szablon. Aby rozpocząć, zalecamy korzystanie z protokołu HTTP. Następnie kliknij przycisk **OK**, aby utworzyć pierwszą funkcję.

<br/>
### <a name="create-a-function"></a>Tworzenie funkcji

Utworzenie projektu domyślnie powoduje utworzenie funkcji HTTP, więc teraz nie trzeba wykonywać żadnych czynności w tym kroku. Później, aby dodać nową funkcję, kliknij prawym przyciskiem myszy projekt w **Eksploratorze rozwiązań** i wybierz pozycję **Dodaj** > **Nowa funkcja platformy Azure...**

Nadaj funkcji nazwę i kliknij pozycję **Dodaj**. Wybierz i dostosuj szablon, a następnie kliknij przycisk **OK**.

<br/>
### <a name="run-your-function-project-locally"></a>Uruchamianie projektu funkcji lokalnie

Naciśnij klawisz **F5**, aby uruchomić aplikację funkcji.

Środowisko uruchomieniowe wyprowadzi adres URL dla wszystkich funkcji HTTP, które można skopiować i uruchomić na pasku adresu przeglądarki.

Aby zatrzymać debugowanie, naciśnij klawisze **Shift+F5**.

<br/>
### <a name="deploy-your-code-to-azure"></a>Wdrażanie kodu na platformie Azure

Kliknij prawym przyciskiem myszy projekt w **Eksploratorze rozwiązań** i wybierz pozycję **Opublikuj**.

Dla elementu docelowego publikowania wybierz aplikację funkcji platformy Azure, a następnie wybierz pozycję **Wybierz istniejące**. Następnie kliknij przycisk **Publikuj**.

Jeśli program Visual Studio nie został jeszcze połączony z kontem platformy Azure, wybierz pozycję **Dodaj konto...** i postępuj zgodnie z instrukcjami wyświetlanymi na ekranie.

W obszarze **Subskrypcja** wybierz pozycję {subscriptionName}. Wyszukaj aplikację {functionAppName}, a następnie wybierz ją w sekcji poniżej. Następnie kliknij przycisk **OK**.
