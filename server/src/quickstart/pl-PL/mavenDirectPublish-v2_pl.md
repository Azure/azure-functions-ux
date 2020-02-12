### Instalowanie zależności

Przed rozpoczęciem należy <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">zainstalować zestaw Java Developer Kit w wersji 8</a>. Upewnij się, że zmienna środowiskowa JAVA\_HOME jest ustawiona na lokalizację instalacji zestawu JDK. Konieczne będzie także <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">zainstalowanie oprogramowania Apache Maven w wersji 3.0 lub nowszej</a>.

Należy również <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">zainstalować środowisko Node.JS</a>, które obejmuje menedżera npm. W ten sposób uzyskasz narzędzia Azure Functions Core Tools. Jeśli nie chcesz instalować środowiska Node, zapoznaj się z innymi opcjami instalacji w <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">dokumentacji narzędzi Core Tools</a>.

Uruchom następujące polecenie, aby zainstalować pakiet Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Narzędzia Core Tools wykorzystują platformę <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a> i dlatego to oprogramowanie także trzeba zainstalować.

Na koniec <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">zainstaluj interfejs wiersza polecenia platformy Azure w wersji 2.0</a>. Po instalacji upewnij się, że zalogowano się, uruchamiając polecenie login i postępując zgodnie z instrukcjami wyświetlanymi na ekranie:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### Tworzenie projektu usługi Azure Functions

W oknie terminalu lub z poziomu wiersza polecenia przejdź do pustego folderu dla projektu i uruchom następujące polecenie:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### Tworzenie funkcji

Utworzenie projektu domyślnie powoduje utworzenie funkcji HTTP, więc nie trzeba wykonywać żadnych czynności w tym kroku. Później, jeśli zechcesz dodać nową funkcję, uruchom następujące polecenie:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Oprogramowanie Maven wyświetli monit o wybranie i dostosowanie szablonu dla nowej funkcji.

<br/>
### Uruchamianie projektu funkcji w środowisku lokalnym

Wprowadź następujące polecenie, aby uruchomić aplikację funkcji:

<MarkdownHighlighter>mvn clean package mvn azure-functions:run</MarkdownHighlighter>

Środowisko uruchomieniowe wyświetli adres URL dla dowolnych funkcji HTTP, który można skopiować i uruchomić na pasku adresu przeglądarki.

Aby zatrzymać debugowanie, naciśnij klawisze **Ctrl-C** w terminalu.

<br/>
### Wdrażanie kodu na platformie Azure

Aby opublikować projekt usługi Functions na platformie Azure, wprowadź następujące polecenie:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Może zostać wyświetlony monit o zalogowanie się do platformy Azure, jeśli jeszcze tego nie zrobiono. Postępuj zgodnie z instrukcjami wyświetlanymi na ekranie.
