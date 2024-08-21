### <a name="install-dependencies"></a>종속성 설치

시작하려면 npm을 포함하는 <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.js를 설치</a>해야 합니다. 이를 통해 Azure Functions Core Tools를 얻을 수 있습니다. Node.js를 설치하지 않으려는 경우에는 <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools 참조</a>의 다른 설치 옵션을 확인하세요.

다음 명령을 실행하여 Core Tools 패키지를 설치합니다.

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Azure Functions 프로젝트 만들기

터미널 창이나 명령 프롬프트에서 프로젝트의 빈 폴더로 이동하고 다음 명령을 실행합니다.

<MarkdownHighlighter>func init</MarkdownHighlighter>

프로젝트의 런타임을 선택하라는 메시지도 표시됩니다. {workerRuntime}을(를) 선택합니다.

<br/>
### <a name="create-a-function"></a>함수 만들기

함수를 만들려면 다음 명령을 실행합니다.

<MarkdownHighlighter>func new</MarkdownHighlighter>

그러면 함수의 템플릿을 선택하라는 메시지가 표시됩니다. HTTP 트리거를 사용하여 시작하는 것이 좋습니다.

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>로컬에서 함수 프로젝트 실행

다음 명령을 실행하여 함수 앱을 시작합니다.

<MarkdownHighlighter>func start</MarkdownHighlighter>

런타임이 HTTP 함수의 URL을 출력하면 브라우저의 주소 표시줄에서 복사하여 실행할 수 있습니다.

디버깅을 중지하려면 터미널에서 **Ctrl-C** 를 사용합니다.

<br/>
### <a name="deploy-your-code-to-azure"></a>Azure에 코드 배포

Functions 프로젝트를 Azure에 게시하려면 다음 명령을 입력합니다.

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

Azure에 로그인하라는 메시지가 표시될 수 있습니다. 화면의 지시를 따릅니다.
