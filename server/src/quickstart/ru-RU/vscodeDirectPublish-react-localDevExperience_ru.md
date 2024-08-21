### <a name="install-dependencies"></a>Установка зависимостей

Прежде чем приступить к работе, <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">установите Visual Studio Code</a>. Кроме того, установите <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.js</a> с пакетом npm. После этого в вашем распоряжении будет набор Azure Functions Core Tools. Если вы предпочитаете не устанавливать Node, ознакомьтесь с другими вариантами установки в нашем <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">справочнике по Core Tools</a>.

Выполните следующую команду, чтобы установить пакет Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

Затем <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">установите расширение Функций Azure для Visual Studio Code</a>. После установки расширения щелкните логотип Azure на панели действий. В разделе **Azure: Functions** (Azure: Функции) щелкните ссылку **Войти в Azure...** и следуйте инструкциям на экране.

<br/>
### <a name="create-an-azure-functions-project"></a>Создание проекта Функций Azure

Щелкните значок **Создать проект…** на панели **Azure: Functions** (Azure: Функции).

Вам будет предложено выбрать каталог для приложения. Выберите пустой каталог.

Затем вам будет предложено выбрать язык для проекта. Выберите {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Создание функции

Щелкните значок **Создать функцию…** на панели **Azure: Functions** (Azure: Функции).

Вам будет предложено выбрать шаблон для функции. Рекомендуем использовать триггер HTTP для начала работы.

<br/>
### <a name="run-your-function-project-locally"></a>Запуск проекта функции в локальной среде

Чтобы запустить приложение-функцию, нажмите клавишу **F5**.

Среда выполнения выводит URL-адрес для любых функций HTTP, которые можно скопировать и запустить в адресной строке браузера.

Нажмите клавиши **SHIFT+F5**, чтобы остановить отладку.

<br/>
### <a name="deploy-your-code-to-azure"></a>Развертывание кода в Azure

Щелкните значок **Deploy to Function App…** (Развернуть в приложение-функцию…) (<ChevronUp/>) на панели **Azure: Functions** (Azure: Функции).

При появлении запроса на выбор приложения-функции выберите {functionAppName}.
