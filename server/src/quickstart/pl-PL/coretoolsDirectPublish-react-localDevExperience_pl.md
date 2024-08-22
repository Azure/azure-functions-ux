### <a name="install-dependencies"></a>Instalowanie zależności

Przed rozpoczęciem należy <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">zainstalować środowisko Node.js</a>, które obejmuje narzędzie npm. W ten sposób uzyskasz narzędzia Azure Functions Core Tools. Jeśli nie chcesz instalować środowiska Node.js, zapoznaj się z innymi opcjami instalacji w naszej <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">dokumentacji narzędzi Core Tools</a>.

Uruchom następujące polecenie, aby zainstalować pakiet narzędzi Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Tworzenie projektu usługi Azure Functions

W oknie terminalu lub w wierszu polecenia przejdź do pustego folderu projektu i uruchom następujące polecenie:

<MarkdownHighlighter>func init</MarkdownHighlighter>

Zostanie również wyświetlony monit o wybranie środowiska uruchomieniowego dla projektu. Wybierz środowisko {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Tworzenie funkcji

Aby utworzyć funkcję, uruchom następujące polecenie:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Spowoduje to wyświetlenie monitu o wybranie szablonu dla funkcji. Aby rozpocząć, zalecamy korzystanie z wyzwalacza protokołu HTTP.

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>Uruchamianie projektu funkcji lokalnie

Uruchom następujące polecenie, aby uruchomić aplikację funkcji:

<MarkdownHighlighter>func start</MarkdownHighlighter>

Środowisko uruchomieniowe wyprowadzi adres URL dla wszystkich funkcji HTTP, które można skopiować i uruchomić na pasku adresu przeglądarki.

Aby zatrzymać debugowanie, użyj klawiszy **Ctrl-C** w terminalu.

<br/>
### <a name="deploy-your-code-to-azure"></a>Wdrażanie kodu na platformie Azure

Aby opublikować projekt usługi Functions na platformie Azure, wprowadź następujące polecenie:

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

Może zostać wyświetlony monit o zalogowanie się do platformy Azure. Wykonaj instrukcje wyświetlane na ekranie.
