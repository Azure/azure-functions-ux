# Instalowanie zależności

Przed rozpoczęciem należy [zainstalować program Visual Studio Code](https://go.microsoft.com/fwlink/?linkid=2016593). Należy również [zainstalować środowisko Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195), które zawiera menedżera npm, aby uzyskać narzędzia Azure Functions Core Tools. Jeśli nie chcesz instalować środowiska Node, zapoznaj się z innymi opcjami instalacji w [dokumentacji narzędzi Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Uruchom następujące polecenie, aby zainstalować pakiet Core Tools:

``` npm install -g azure-functions-core-tools ```

Narzędzia Core Tools wykorzystują platformę [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373) i dlatego to oprogramowanie także trzeba zainstalować.

Następnie [zainstaluj rozszerzenie usługi Azure Functions dla programu Visual Studio Code](https://go.microsoft.com/fwlink/?linkid=2016800). Po zainstalowaniu rozszerzenia kliknij logo platformy Azure na pasku działań. W obszarze **Azure: funkcje** kliknij pozycję **Zaloguj się do platformy Azure...** i postępuj zgodnie z instrukcjami wyświetlanymi na ekranie.

<br/>
# Tworzenie projektu usługi Azure Functions

Kliknij ikonę **Utwórz nowy projekt...** na panelu **Azure: funkcje**.

Zostanie wyświetlony monit o wybranie katalogu dla aplikacji. Wybierz pusty katalog.

Zostanie wtedy wyświetlony monit o wybranie języka dla projektu. Wybierz środowisko {workerRuntime}.

<br/>
# Tworzenie funkcji

Kliknij ikonę **Utwórz funkcję...** na panelu **Azure: funkcje**.

Zostanie wyświetlony monit o wybranie szablonu dla funkcji. Na początek zalecamy wybranie wyzwalacza protokołu HTTP.

<br/>
# Uruchamianie projektu funkcji w środowisku lokalnym

Naciśnij klawisz **F5**, aby uruchomić aplikację funkcji.

Środowisko uruchomieniowe wyświetli adres URL dla dowolnych funkcji HTTP, który można skopiować i uruchomić na pasku adresu przeglądarki.

Aby zatrzymać debugowanie, naciśnij klawisze **Shift + F5**.

<br/>
# Wdrażanie kodu na platformie Azure

Aby przejść do Centrum wdrażania i zakończyć konfigurowanie aplikacji, użyj przycisku **Zakończ i przejdź do Centrum wdrażania** poniżej. Spowoduje to przejście do nowego kreatora w celu skonfigurowania różnych opcji wdrażania. Po ukończeniu tego przepływu wyzwól wdrożenie przy użyciu dowolnego skonfigurowanego mechanizmu.
