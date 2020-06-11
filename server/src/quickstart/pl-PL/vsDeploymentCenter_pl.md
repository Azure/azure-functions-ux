# Instalowanie zależności

Przed rozpoczęciem należy [zainstalować program Visual Studio 2019](https://go.microsoft.com/fwlink/?linkid=2016389) i upewnić się, że zainstalowany jest także pakiet roboczy projektowania platformy Azure.

Po zainstalowaniu programu Visual Studio upewnij się, że masz [najnowsze narzędzia usługi Azure Functions](https://go.microsoft.com/fwlink/?linkid=2016394).

<br/>
# Tworzenie projektu usługi Azure Functions

W programie Visual Studio wybierz pozycję **Nowy** > **Projekt** z menu **Plik**.

W oknie dialogowym **Nowy projekt** wybierz pozycję **Zainstalowane**, rozwiń węzeł **Visual C#** > **Chmura**, wybierz pozycję **Azure Functions**, wpisz **nazwę** dla projektu, a następnie kliknij przycisk **OK**. Nazwa aplikacji funkcji musi być prawidłowa jako przestrzeń nazw języka C#, dlatego nie należy używać podkreśleń, łączników ani innych znaków niealfanumerycznych.

Wybierz i dostosuj szablon, postępując zgodnie z instrukcjami kreatora. Na początek zalecamy wybranie protokołu HTTP. Następnie kliknij przycisk **OK**, aby utworzyć swoją pierwszą funkcję.

<br/>
# Tworzenie funkcji

Utworzenie projektu domyślnie powoduje utworzenie funkcji HTTP, więc nie trzeba wykonywać żadnych czynności w tym kroku. Później, jeśli zechcesz dodać nową funkcję, kliknij prawym przyciskiem myszy projekt w **Eksploratorze rozwiązań** i wybierz pozycję **Dodaj** > **Nowa funkcja platformy Azure...**

Nadaj funkcji nazwę i kliknij pozycję **Dodaj**. Wybierz i dostosuj szablon, a następnie kliknij przycisk **OK**.

<br/>
# Uruchamianie projektu funkcji w środowisku lokalnym

Naciśnij klawisz **F5**, aby uruchomić aplikację funkcji.

Środowisko uruchomieniowe wyświetli adres URL dla dowolnych funkcji HTTP, który można skopiować i uruchomić na pasku adresu przeglądarki.

Aby zatrzymać debugowanie, naciśnij klawisze **Shift + F5**.

<br/>
# Wdrażanie kodu na platformie Azure

Aby przejść do Centrum wdrażania i zakończyć konfigurowanie aplikacji, użyj przycisku **Zakończ i przejdź do Centrum wdrażania** poniżej. Spowoduje to przejście do nowego kreatora w celu skonfigurowania różnych opcji wdrażania. Po ukończeniu tego przepływu wyzwól wdrożenie przy użyciu dowolnego skonfigurowanego mechanizmu.
