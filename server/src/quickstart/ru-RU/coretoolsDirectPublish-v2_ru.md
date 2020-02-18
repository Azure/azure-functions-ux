### Установка зависимостей

Прежде чем приступить к работе, <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">установите .NET Core 2.1</a>. Также необходимо <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">установить среду Node.js</a>, включающую инструмент npm, который используется для получения Azure Functions Core Tools. Если вы не хотите устанавливать Node.js, см. другие варианты установки в нашей <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">справке по Core Tools</a>.

Чтобы установить пакет Core Tools, выполните следующую команду:

<MarkdownHighlighter> npm install -g azure-functions-core-tools</MarkdownHighlighter>

<br/>
### Создание проекта Функций Azure

В окне терминала или в командной строке перейдите в пустую папку своего проекта и выполните следующую команду:

<MarkdownHighlighter> func init</MarkdownHighlighter>

Вам также будет предложено выбрать среду выполнения для проекта. Выберите {workerRuntime}.

<br/>
### Создание функции

Чтобы создать функцию, выполните следующую команду:

<MarkdownHighlighter> func new</MarkdownHighlighter>

Вам будет предложено выбрать шаблон для своей функции. Для начала рекомендуем использовать триггер HTTP.

<br/>
### Запуск проекта функции в локальной среде

Чтобы запустить приложение-функцию, выполните следующую команду:

<MarkdownHighlighter> func start</MarkdownHighlighter>

Среда выполнения выведет для всех HTTP-функций URL-адрес, который можно скопировать и открыть в адресной строке браузера.

Чтобы отключить отладку, нажмите в терминале клавиши **CTRL+C**.

<br/>
### Развертывание кода в Azure

Чтобы опубликовать проект Функций в Azure, введите следующую команду:

<MarkdownHighlighter> func azure functionapp publish {functionAppName}</MarkdownHighlighter>

Возможно, появится запрос на вход в Azure. Следуйте указаниям на экране.
