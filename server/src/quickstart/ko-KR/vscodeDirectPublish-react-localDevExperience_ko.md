### <a name="install-dependencies"></a>종속성 설치

시작하려면 <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">Visual Studio Code를 설치</a>해야 합니다. <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.js</a>(npm 포함)도 설치해야 합니다. 이를 통해 Azure Functions Core Tools를 얻을 수 있습니다. Node를 설치하지 않으려는 경우에는 <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools 참조</a>의 다른 설치 옵션을 확인하세요.

다음 명령을 실행하여 Core Tools 패키지를 설치합니다.

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

다음으로, <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">Visual Studio Code용 Azure Functions 확장을 설치</a>합니다. 확장이 설치되면 작업 표시줄에서 Azure 로고를 클릭합니다. **Azure: Functions** 에서 **Azure에 로그인...** 을 클릭하고 화면의 지침을 따릅니다.

<br/>
### <a name="create-an-azure-functions-project"></a>Azure Functions 프로젝트 만들기

**새 프로젝트 만들기...** 아이콘을 클릭합니다. 이는 **Azure: Functions** 패널에 있습니다.

앱의 디렉터리를 선택하라는 메시지가 표시됩니다. 빈 디렉터리를 선택합니다.

그러면 프로젝트의 언어를 선택하라는 메시지가 표시됩니다. {workerRuntime}을(를) 선택합니다.

<br/>
### <a name="create-a-function"></a>함수 만들기

**함수 만들기…** 아이콘을 클릭합니다. 이는 **Azure: Functions** 패널에 있습니다.

그러면 함수의 템플릿을 선택하라는 메시지가 표시됩니다. HTTP 트리거를 사용하여 시작하는 것이 좋습니다.

<br/>
### <a name="run-your-function-project-locally"></a>함수 프로젝트를 로컬에서 실행

함수 앱을 실행하려면 **F5** 키를 누릅니다.

런타임이 HTTP 함수의 URL을 출력하면 브라우저의 주소 표시줄에서 복사하여 실행할 수 있습니다.

디버깅을 중지하려면 **Shift + F5** 를 누릅니다.

<br/>
### <a name="deploy-your-code-to-azure"></a>Azure에 코드 배포

**함수 앱에 배포...** (<ChevronUp/>) 아이콘을 클릭합니다. 이는 **Azure: Functions** 패널에 있습니다.

함수 앱을 선택하라는 메시지가 표시되면 {functionAppName}을(를) 선택합니다.
