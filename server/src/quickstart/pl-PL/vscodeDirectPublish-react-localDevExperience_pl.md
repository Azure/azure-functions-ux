### <a name="install-dependencies"></a>Instalowanie zależności

Przed rozpoczęciem należy <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">zainstalować program Visual Studio Code</a>. Należy również <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">zainstalować środowisko Node.JS</a>, które obejmuje narzędzie npm. W ten sposób uzyskasz narzędzia Azure Functions Core Tools. Jeśli nie chcesz instalować środowiska Node, zapoznaj się z innymi opcjami instalacji w naszej <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">dokumentacji narzędzi Core Tools</a>.

Uruchom następujące polecenie, aby zainstalować pakiet narzędzi Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

Następnie <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">zainstaluj rozszerzenie usługi Azure Functions dla programu Visual Studio Code</a>. Po zainstalowaniu rozszerzenia kliknij logo platformy Azure na pasku działań. W obszarze **Azure: Functions** kliknij pozycję **Zaloguj się do platformy Azure...** i postępuj zgodnie z instrukcjami wyświetlanymi na ekranie.

<br/>
### <a name="create-an-azure-functions-project"></a>Tworzenie projektu usługi Azure Functions

Kliknij ikonę **Utwórz nowy projekt...** w panelu **Azure: Functions**.

Zostanie wyświetlony monit o wybranie katalogu dla aplikacji. Wybierz pusty katalog.

Następnie zostanie wyświetlony monit o wybranie języka dla projektu. Wybierz środowisko {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Tworzenie funkcji

Kliknij ikonę **Utwórz funkcję...** w panelu **Azure: Functions**.

Zostanie wyświetlony monit o wybranie szablonu dla funkcji. Aby rozpocząć, zalecamy korzystanie z wyzwalacza protokołu HTTP.

<br/>
### <a name="run-your-function-project-locally"></a>Uruchamianie projektu funkcji lokalnie

Naciśnij klawisz **F5**, aby uruchomić aplikację funkcji.

Środowisko uruchomieniowe wyprowadzi adres URL dla wszystkich funkcji HTTP, które można skopiować i uruchomić na pasku adresu przeglądarki.

Aby zatrzymać debugowanie, naciśnij klawisze **Shift+F5**.

<br/>
### <a name="deploy-your-code-to-azure"></a>Wdrażanie kodu na platformie Azure

Kliknij ikonę **Wdróż w aplikacji funkcji...** (<ChevronUp/>) w panelu **Azure: Functions**.

Po wyświetleniu monitu o wybranie aplikacji funkcji wybierz aplikację {functionAppName}.
