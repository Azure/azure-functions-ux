### <a name="install-dependencies"></a>Установка зависимостей

Прежде чем приступить к работе, <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">установите Node.js</a> с пакетом npm. После этого в вашем распоряжении будет набор Azure Functions Core Tools. Если вы предпочитаете не устанавливать Node.js, ознакомьтесь с другими вариантами установки в нашем <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">справочнике по Core Tools</a>.

Выполните следующую команду, чтобы установить пакет Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Создание проекта Функций Azure

В окне терминала или из командной строки перейдите к пустой папке для проекта и выполните следующую команду:

<MarkdownHighlighter>func init</MarkdownHighlighter>

Кроме того, вам будет предложено выбрать среду выполнения для проекта. Выберите {workerRuntime}.

<br/>
### <a name="create-a-function"></a>Создание функции

Чтобы создать функцию, выполните следующую команду:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Вам будет предложено выбрать шаблон для функции. Рекомендуем использовать триггер HTTP для начала работы.

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>Запуск проекта функции в локальной среде

Выполните следующую команду для запуска приложения-функции:

<MarkdownHighlighter>func start</MarkdownHighlighter>

Среда выполнения выводит URL-адрес для любых функций HTTP, которые можно скопировать и запустить в адресной строке браузера.

Чтобы остановить отладку, нажмите клавиши **CTRL+C** в окне терминала.

<br/>
### <a name="deploy-your-code-to-azure"></a>Развертывание кода в Azure

Чтобы опубликовать проект Функций в Azure, введите следующую команду:

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

Возможно, вам будет предложено войти в Azure. Следуйте инструкциям на экране.
