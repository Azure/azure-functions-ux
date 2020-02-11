# 종속성 설치

시작하려면 [Visual Studio Code를 설치](https://go.microsoft.com/fwlink/?linkid=2016593)해야 합니다. 또한 Azure Functions Core Tools를 가져오는 방식인 npm을 포함하는 [Node.JS를 설치](https://go.microsoft.com/fwlink/?linkid=2016195)해야 합니다. Node를 설치하지 않으려면 [Core Tools 참조](https://go.microsoft.com/fwlink/?linkid=2016192)에서 다른 설치 옵션을 참조하세요.

다음 명령을 실행하여 Core Tools 패키지를 설치합니다.

``` npm install -g azure-functions-core-tools ```

Core Tools는 [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373)을 활용하므로 이를 설치해야 합니다.

다음으로 [Visual Studio Code에 관한 Azure Functions 확장 프로그램을 설치](https://go.microsoft.com/fwlink/?linkid=2016800)합니다. 확장 프로그램이 설치되면 작업 표시줄에서 Azure 로고를 클릭합니다. **Azure: Functions**에서 **Azure에 로그인...**을 클릭한 다음 화면의 지시를 따릅니다.

<br/>
# Azure Functions 프로젝트 생성

**새 프로젝트 만들기…** 아이콘을 **Azure: Functions** 패널에서 클릭합니다.

앱에 관한 디렉터리를 선택하라는 메시지가 표시됩니다. 빈 디렉터리를 선택합니다.

그러면 프로젝트에 관한 언어를 선택하라는 메시지가 표시됩니다. {workerRuntime}을(를) 선택합니다.

<br/>
# 함수 만들기

**함수 만들기…** 아이콘을 **Azure: Functions** 패널에서 클릭합니다.

함수에 관한 템플릿을 선택하라는 메시지가 표시됩니다. 시작 시 HTTP 트리거를 권장합니다.

<br/>
# 로컬에서 함수 프로젝트 실행

**F5**를 눌러 함수 앱을 실행합니다.

런타임에서 HTTP 함수에 대해 URL을 출력하며, 이를 브라우저의 주소 표시줄에 복사하여 실행할 수 있습니다.

디버깅을 중지하려면 **Shift + F5**를 누릅니다.

<br/>
# Azure에 코드 배포

아래에 있는 **완료하고 배포 센터로 이동** 단추를 사용하여 배포 센터로 이동한 다음 앱 설정을 완료합니다. 이렇게 하면 다양한 배포 옵션을 구성하는 새 마법사를 사용할 수 있습니다. 이 흐름을 완료한 후 구성한 메커니즘을 사용하여 배포를 트리거합니다.
