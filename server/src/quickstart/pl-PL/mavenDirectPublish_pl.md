# Instalowanie zależności

Przed rozpoczęciem należy [zainstalować zestaw Java Developer Kit w wersji 8](https://go.microsoft.com/fwlink/?linkid=2016706). Upewnij się, że zmienna środowiskowa JAVA\_HOME jest ustawiona na lokalizację instalacji zestawu JDK. Konieczne będzie także [zainstalowanie oprogramowania Apache Maven w wersji 3.0 lub nowszej](https://go.microsoft.com/fwlink/?linkid=2016384).

Należy również [zainstalować środowisko Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195), które obejmuje menedżera npm. W ten sposób uzyskasz narzędzia Azure Functions Core Tools. Jeśli nie chcesz instalować środowiska Node, zapoznaj się z innymi opcjami instalacji w [dokumentacji narzędzi Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Uruchom następujące polecenie, aby zainstalować pakiet Core Tools:

``` npm install -g azure-functions-core-tools ```

Narzędzia Core Tools wykorzystują platformę [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373) i dlatego to oprogramowanie także trzeba zainstalować.

Na koniec [zainstaluj interfejs wiersza polecenia platformy Azure w wersji 2.0](https://go.microsoft.com/fwlink/?linkid=2016701). Po instalacji upewnij się, że zalogowano się, uruchamiając polecenie login i postępując zgodnie z instrukcjami wyświetlanymi na ekranie:

``` az login ```

<br/>
# Tworzenie projektu usługi Azure Functions

W oknie terminalu lub z poziomu wiersza polecenia przejdź do pustego folderu dla projektu i uruchom następujące polecenie:

``` mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false ```

<br/>
# Tworzenie funkcji

Utworzenie projektu domyślnie powoduje utworzenie funkcji HTTP, więc nie trzeba wykonywać żadnych czynności w tym kroku. Później, jeśli zechcesz dodać nową funkcję, uruchom następujące polecenie:

``` mvn azure-functions:add ```

Oprogramowanie Maven wyświetli monit o wybranie i dostosowanie szablonu dla nowej funkcji.

<br/>
# Uruchamianie projektu funkcji w środowisku lokalnym

Wprowadź następujące polecenie, aby uruchomić aplikację funkcji:

``` mvn clean package mvn azure-functions:run ```

Środowisko uruchomieniowe wyświetli adres URL dla dowolnych funkcji HTTP, który można skopiować i uruchomić na pasku adresu przeglądarki.

Aby zatrzymać debugowanie, naciśnij klawisze **Ctrl-C** w terminalu.

<br/>
# Wdrażanie kodu na platformie Azure

Aby opublikować projekt usługi Functions na platformie Azure, wprowadź następujące polecenie:

``` mvn azure-functions:deploy ```

Może zostać wyświetlony monit o zalogowanie się do platformy Azure, jeśli jeszcze tego nie zrobiono. Postępuj zgodnie z instrukcjami wyświetlanymi na ekranie.
