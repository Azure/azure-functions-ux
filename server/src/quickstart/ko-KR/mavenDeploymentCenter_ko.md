# 종속성 설치

시작하려면 먼저 [Java Developer Kit 버전 8을 설치](https://go.microsoft.com/fwlink/?linkid=2016706)해야 합니다. JAVA\_HOME 환경 변수가 JDK의 설치 위치로 설정되어 있는지 확인합니다. [Apache Maven 버전 3.0 이상을 설치](https://go.microsoft.com/fwlink/?linkid=2016384)해야 합니다.

또한 npm을 포함하는 [Node.JS를 설치](https://go.microsoft.com/fwlink/?linkid=2016195)해야 합니다. 이를 통해 Azure Functions Core Tools를 얻을 수 있습니다. Node를 설치하지 않으려면 [Core Tools 참조](https://go.microsoft.com/fwlink/?linkid=2016192)에서 다른 설치 옵션을 참조하세요.

다음 명령을 실행하여 Core Tools 패키지를 설치합니다.

``` npm install -g azure-functions-core-tools ```

Core Tools는 [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373)을 활용하므로 이를 설치해야 합니다.

마지막으로 [Azure CLI 2.0을 설치](https://go.microsoft.com/fwlink/?linkid=2016701)합니다. 설치가 완료되면 login 명령을 실행하고 다음 화면의 지침을 따라 로그인해야 합니다.

``` az login ```

<br/>
# Azure Functions 프로젝트 생성

터미널 창이나 명령 프롬프트에서 프로젝트에 관한 빈 폴더로 이동하고 다음 명령을 실행합니다.

``` mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false ```

<br/>
# 함수 만들기

프로젝트를 만들면 기본적으로 HTTP 함수가 만들어지므로 지금은 이 단계에서 무언가를 할 필요가 없습니다. 나중에 새 함수를 추가하려면 다음 명령을 실행합니다.

``` mvn azure-functions:add ```

Maven에 새 함수에 관한 템플릿을 선택하고 사용자 지정하라는 메시지가 표시됩니다.

<br/>
# 로컬에서 함수 프로젝트 실행

함수 앱을 실행하려면 다음 명령을 입력합니다.

``` mvn clean package mvn azure-functions:run ```

런타임에서 HTTP 함수에 대해 URL을 출력하며, 이를 브라우저의 주소 표시줄에 복사하여 실행할 수 있습니다.

디버깅을 중지하려면 터미널에서 **Ctrl+C**를 누릅니다.

<br/>
# Azure에 코드 배포

아래에 있는 **완료하고 배포 센터로 이동** 단추를 사용하여 배포 센터로 이동한 다음 앱 설정을 완료합니다. 이렇게 하면 다양한 배포 옵션을 구성하는 새 마법사를 사용할 수 있습니다. 이 흐름을 완료한 후 구성한 메커니즘을 사용하여 배포를 트리거합니다.
