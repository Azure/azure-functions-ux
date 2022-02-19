### <a name="install-dependencies"></a>Instalowanie zależności

Przed rozpoczęciem należy <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">zainstalować zestaw Java Developer Kit w wersji 8</a>. Upewnij się, że dla zmiennej środowiskowej JAVA_HOME ustawiono lokalizację instalacji zestawu JDK. Należy również <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">zainstalować program Apache Maven w wersji 3.0 lub nowszej</a>.

Należy również <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">zainstalować środowisko Node.JS</a>, które obejmuje narzędzie npm. W ten sposób uzyskasz narzędzia Azure Functions Core Tools. Jeśli nie chcesz instalować środowiska Node, zapoznaj się z innymi opcjami instalacji w naszej <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">dokumentacji narzędzi Core Tools</a>.

Uruchom następujące polecenie, aby zainstalować pakiet narzędzi Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Narzędzia Core Tools używają platformy <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, dlatego też należy ją zainstalować.

<a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">Zainstaluj interfejs wiersza polecenia platformy Azure w wersji 2.0</a>. Po zainstalowaniu upewnij się, że jesteś zalogowanym użytkownikiem, uruchamiając polecenie logowania i postępując zgodnie z instrukcjami wyświetlanymi na ekranie:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Tworzenie projektu usługi Azure Functions

W oknie terminalu lub w wierszu polecenia przejdź do pustego folderu projektu i uruchom następujące polecenie:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>Tworzenie funkcji

Utworzenie projektu domyślnie powoduje utworzenie funkcji HTTP, więc teraz nie trzeba wykonywać żadnych czynności w tym kroku. Później, aby dodać nową funkcję, uruchom następujące polecenie:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

W programie Maven zostanie wyświetlony monit o wybranie i dostosowanie szablonu dla nowej funkcji.

<br/>
### <a name="run-your-function-project-locally"></a>Uruchamianie projektu funkcji lokalnie

Wprowadź następujące polecenie, aby uruchomić aplikację funkcji:

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

Środowisko uruchomieniowe wyprowadzi adres URL dla wszystkich funkcji HTTP, które można skopiować i uruchomić na pasku adresu przeglądarki.

Aby zatrzymać debugowanie, użyj klawiszy **Ctrl-C** w terminalu.

<br/>
### <a name="deploy-your-code-to-azure"></a>Wdrażanie kodu na platformie Azure

Aby opublikować projekt usługi Functions na platformie Azure, wprowadź następujące polecenie:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Może zostać wyświetlony monit o zalogowanie się do platformy Azure, jeśli jeszcze tego nie zrobiono. Wykonaj instrukcje wyświetlane na ekranie.
