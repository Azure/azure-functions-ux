# 종속성 설치

시작하려면 먼저 [.NET Core 2.1을 설치](https://go.microsoft.com/fwlink/?linkid=2016373)해야 합니다. 또한 Azure Functions Core Tools를 가져오는 방식인 npm을 포함하는 [Node.JS를 설치](https://go.microsoft.com/fwlink/?linkid=2016195)해야 합니다. Node를 설치하지 않으려면 [Core Tools 참조](https://go.microsoft.com/fwlink/?linkid=2016192)에서 다른 설치 옵션을 참조하세요.

다음 명령을 실행하여 Core Tools 패키지를 설치합니다.

``` npm install -g azure-functions-core-tools ```

<br/>
# Azure Functions 프로젝트 생성

터미널 창이나 명령 프롬프트에서 프로젝트에 관한 빈 폴더로 이동하고 다음 명령을 실행합니다.

``` func init ```

프로젝트에 관한 런타임을 선택하라는 메시지도 표시됩니다. {workerRuntime}을(를) 선택합니다.

<br/>
# 함수 만들기

함수를 만들려면 다음 명령을 실행합니다.

``` func new ```

함수에 관한 템플릿을 선택하라는 메시지가 표시됩니다. 시작 시 HTTP 트리거를 권장합니다.

<br/>
# 로컬에서 함수 프로젝트 실행

다음 명령을 실행하여 함수 앱을 시작합니다.

``` func start ```

런타임에서 HTTP 함수에 대해 URL을 출력하며, 이를 브라우저의 주소 표시줄에 복사하여 실행할 수 있습니다.

디버깅을 중지하려면 터미널에서 **Ctrl+C**를 누릅니다.

<br/>
# Azure에 코드 배포

Functions 프로젝트를 Azure에 게시하려면 다음 명령을 입력합니다.

``` func azure functionapp publish {functionAppName} ```

Azure에 로그인하라는 메시지가 표시될 수 있습니다. 화면의 지침을 따릅니다.
