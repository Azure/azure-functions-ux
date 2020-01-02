# Instalowanie zależności

Przed rozpoczęciem należy [zainstalować oprogramowanie .NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373). Należy również [zainstalować środowisko Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195), które zawiera menedżera npm, aby uzyskać narzędzia Azure Functions Core Tools. Jeśli nie chcesz instalować środowiska Node, zapoznaj się z innymi opcjami instalacji w [dokumentacji narzędzi Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Uruchom następujące polecenie, aby zainstalować pakiet Core Tools:

``` npm install -g azure-functions-core-tools ```

<br/>
# Tworzenie projektu usługi Azure Functions

W oknie terminalu lub z poziomu wiersza polecenia przejdź do pustego folderu dla projektu i uruchom następujące polecenie:

``` func init ```

Zostanie również wyświetlony monit o wybranie środowiska uruchomieniowego dla projektu. Wybierz środowisko {workerRuntime}.

<br/>
# Tworzenie funkcji

Aby utworzyć funkcję, uruchom następujące polecenie:

``` func new ```

Spowoduje to wyświetlenie monitu o wybranie szablonu dla funkcji. Na początek zalecamy wybranie wyzwalacza protokołu HTTP.

<br/>
# Uruchamianie projektu funkcji w środowisku lokalnym

Uruchom następujące polecenie, aby uruchomić aplikację funkcji:

``` func start ```

Środowisko uruchomieniowe wyświetli adres URL dla dowolnych funkcji HTTP, który można skopiować i uruchomić na pasku adresu przeglądarki.

Aby zatrzymać debugowanie, naciśnij klawisze **Ctrl-C** w terminalu.

<br/>
# Wdrażanie kodu na platformie Azure

Aby przejść do Centrum wdrażania i zakończyć konfigurowanie aplikacji, użyj przycisku **Zakończ i przejdź do Centrum wdrażania** poniżej. Spowoduje to przejście do nowego kreatora w celu skonfigurowania różnych opcji wdrażania. Po ukończeniu tego przepływu wyzwól wdrożenie przy użyciu dowolnego skonfigurowanego mechanizmu.
