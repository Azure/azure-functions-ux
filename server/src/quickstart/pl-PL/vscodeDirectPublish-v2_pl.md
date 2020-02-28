### Instalowanie zależności

Przed rozpoczęciem należy <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">zainstalować program Visual Studio Code</a>. Należy również <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">zainstalować środowisko Node.JS</a>, które zawiera menedżera npm, aby uzyskać narzędzia Azure Functions Core Tools. Jeśli nie chcesz instalować środowiska Node, zapoznaj się z innymi opcjami instalacji w <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">dokumentacji narzędzi Core Tools</a>.

Uruchom następujące polecenie, aby zainstalować pakiet Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Narzędzia Core Tools wykorzystują platformę <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a> i dlatego to oprogramowanie także trzeba zainstalować.

Następnie <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">zainstaluj rozszerzenie usługi Azure Functions dla programu Visual Studio Code</a>. Po zainstalowaniu rozszerzenia kliknij logo platformy Azure na pasku działań. W obszarze **Azure: funkcje** kliknij pozycję **Zaloguj się do platformy Azure...** i postępuj zgodnie z instrukcjami wyświetlanymi na ekranie.

<br/>
### Tworzenie projektu usługi Azure Functions

Kliknij ikonę **Utwórz nowy projekt...** na panelu **Azure: funkcje**.

Zostanie wyświetlony monit o wybranie katalogu dla aplikacji. Wybierz pusty katalog.

Zostanie wtedy wyświetlony monit o wybranie języka dla projektu. Wybierz środowisko {workerRuntime}.

<br/>
### Tworzenie funkcji

Kliknij ikonę **Utwórz funkcję...** na panelu **Azure: funkcje**.

Zostanie wyświetlony monit o wybranie szablonu dla funkcji. Na początek zalecamy wybranie wyzwalacza protokołu HTTP.

<br/>
### Uruchamianie projektu funkcji w środowisku lokalnym

Naciśnij klawisz **F5**, aby uruchomić aplikację funkcji.

Środowisko uruchomieniowe wyświetli adres URL dla dowolnych funkcji HTTP, który można skopiować i uruchomić na pasku adresu przeglądarki.

Aby zatrzymać debugowanie, naciśnij klawisze **Shift + F5**.

<br/>
### Wdrażanie kodu na platformie Azure

Kliknij ikonę **Wdróż w aplikacji funkcji...** (niebieska strzałka w górę) na panelu **Azure: funkcje**.

Gdy zostanie wyświetlony monit o wybranie aplikacji funkcji, wybierz aplikację {functionAppName}.
