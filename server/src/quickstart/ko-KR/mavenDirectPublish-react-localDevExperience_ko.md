### <a name="install-dependencies"></a>종속성 설치

시작하려면 먼저 <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">Java Developer Kit 버전 8</a>을 설치해야 합니다. JAVA_HOME 환경 변수는 JDK 설치 위치로 설정해야 합니다. 또한 <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">Apache Maven 버전 3.0 이상을 설치</a>해야 합니다.

<a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.js</a>(npm 포함)도 설치해야 합니다. 이를 통해 Azure Functions Core Tools를 얻을 수 있습니다. Node를 설치하지 않으려는 경우에는 <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools 참조</a>의 다른 설치 옵션을 확인하세요.

다음 명령을 실행하여 Core Tools 패키지를 설치합니다.

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools는 <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>을 사용하므로 이 항목도 설치해야 합니다.

마지막으로, <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">Azure CLI 2.0을 설치</a>합니다. 이 설치가 완료되면 로그인 명령을 실행하고 화면의 지침에 따라 로그인해야 합니다.

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Azure Functions 프로젝트 만들기

터미널 창이나 명령 프롬프트에서 프로젝트의 빈 폴더로 이동하고 다음 명령을 실행합니다.

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>함수 만들기

프로젝트를 만들면 기본적으로 HTTP 함수가 만들어지므로 지금 이 단계에서 해야 할 일은 없습니다. 나중에 새 함수를 추가하려면 다음 명령을 실행합니다.

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven에서 새 기능의 템플릿을 선택하고 사용자 지정하라는 메시지를 표시합니다.

<br/>
### <a name="run-your-function-project-locally"></a>로컬에서 함수 프로젝트 실행

다음 명령을 입력하여 함수 앱을 실행합니다.

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

런타임이 HTTP 함수의 URL을 출력하면 브라우저의 주소 표시줄에서 복사하여 실행할 수 있습니다.

디버깅을 중지하려면 터미널에서 **Ctrl-C** 를 사용합니다.

<br/>
### <a name="deploy-your-code-to-azure"></a>Azure에 코드 배포

Functions 프로젝트를 Azure에 게시하려면 다음 명령을 입력합니다.

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

아직 로그인하지 않은 경우 Azure에 로그인하라는 메시지가 표시될 수 있습니다. 화면의 지시를 따릅니다.
