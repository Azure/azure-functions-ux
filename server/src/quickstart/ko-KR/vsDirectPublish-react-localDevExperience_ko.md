### <a name="install-dependencies"></a>종속성 설치

시작하려면 <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">Visual Studio 2019를 설치</a>해야 하며 Azure 개발 워크로드도 설치되었는지 확인해야 합니다.

Visual Studio가 설치되었으면 <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">최신 Azure Functions 도구</a>가 있는지 확인하세요.

<br/>
### <a name="create-an-azure-functions-project"></a>Azure Functions 프로젝트 만들기

Visual Studio의 **파일** 메뉴에서 **새로 만들기** > **프로젝트** 를 선택합니다.

**새 프로젝트** 대화 상자에서 **설치됨** 을 선택하고 **Visual C#** > **클라우드** 를 확장하고, **Azure Functions** 를 선택하고, 프로젝트에 대한 **이름** 을 입력하고, **확인** 을 클릭합니다. 함수 앱 이름은 C# 네임스페이스로 유효해야 하므로 밑줄, 하이픈 또는 기타 영숫자가 아닌 문자는 사용하지 마세요.

마법사에 따라 템플릿을 선택하고 사용자 지정합니다. HTTP를 사용하여 시작하는 것이 좋습니다. 그런 다음, **확인** 을 클릭하여 첫 번째 함수를 만듭니다.

<br/>
### <a name="create-a-function"></a>함수 만들기

프로젝트를 만들면 기본적으로 HTTP 함수가 만들어지므로 지금 이 단계에서 해야 할 일은 없습니다. 나중에 새 함수를 추가하려면 **솔루션 탐색기** 에서 프로젝트를 마우스 오른쪽 단추로 클릭하고 **추가** > **새 Azure 함수...** 를 선택합니다.

함수에 이름을 지정하고 **추가** 를 클릭합니다. 템플릿을 선택하고 사용자 지정한 다음, **확인** 을 클릭합니다.

<br/>
### <a name="run-your-function-project-locally"></a>로컬에서 함수 프로젝트 실행

함수 앱을 실행하려면 **F5** 키를 누릅니다.

런타임이 HTTP 함수의 URL을 출력하면 브라우저의 주소 표시줄에서 복사하여 실행할 수 있습니다.

디버깅을 중지하려면 **Shift + F5** 를 누릅니다.

<br/>
### <a name="deploy-your-code-to-azure"></a>Azure에 코드 배포

**솔루션 탐색기** 에서 프로젝트를 마우스 오른쪽 단추로 클릭하고 **게시** 를 선택합니다.

게시 대상에 Azure 함수 앱을 선택한 다음, **기존 항목 선택** 을 선택합니다. 그런 다음, **게시** 를 클릭합니다.

Visual Studio를 Azure 계정에 아직 연결하지 않았으면 **계정 추가...** 를 선택하고 화면에 나타나는 지침을 따릅니다.

**구독** 에서 {subscriptionName}을(를) 선택합니다. {functionAppName}을(를) 검색한 후 아래 섹션에서 해당 앱을 선택합니다. 그런 후 **OK** 를 클릭합니다.
