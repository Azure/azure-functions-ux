### Instalowanie zależności

Przed rozpoczęciem należy <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">zainstalować oprogramowanie .NET Core 2.1</a>. Należy również <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">zainstalować środowisko Node.JS</a>, które zawiera menedżera npm, aby uzyskać narzędzia Azure Functions Core Tools. Jeśli nie chcesz instalować środowiska Node, zapoznaj się z innymi opcjami instalacji w <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">dokumentacji narzędzi Core Tools</a>.

Uruchom następujące polecenie, aby zainstalować pakiet Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

<br/>
### Tworzenie projektu usługi Azure Functions

W oknie terminalu lub z poziomu wiersza polecenia przejdź do pustego folderu dla projektu i uruchom następujące polecenie:

<MarkdownHighlighter>func init</MarkdownHighlighter>

Zostanie również wyświetlony monit o wybranie środowiska uruchomieniowego dla projektu. Wybierz środowisko {workerRuntime}.

<br/>
### Tworzenie funkcji

Aby utworzyć funkcję, uruchom następujące polecenie:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Spowoduje to wyświetlenie monitu o wybranie szablonu dla funkcji. Na początek zalecamy wybranie wyzwalacza protokołu HTTP.

<br/>
### Uruchamianie projektu funkcji w środowisku lokalnym

Uruchom następujące polecenie, aby uruchomić aplikację funkcji:

<MarkdownHighlighter>func start</MarkdownHighlighter>

Środowisko uruchomieniowe wyświetli adres URL dla dowolnych funkcji HTTP, który można skopiować i uruchomić na pasku adresu przeglądarki.

Aby zatrzymać debugowanie, naciśnij klawisze **Ctrl-C** w terminalu.

<br/>
### Wdrażanie kodu na platformie Azure

Aby opublikować projekt usługi Functions na platformie Azure, wprowadź następujące polecenie:

<MarkdownHighlighter>func azure functionapp publish {functionAppName}</MarkdownHighlighter>

Może zostać wyświetlony monit o zalogowanie się do platformy Azure. Postępuj zgodnie z instrukcjami wyświetlanymi na ekranie.
