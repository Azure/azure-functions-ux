### Установка зависимостей

Прежде чем приступить к работе, <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">установите Java Developer Kit (JDK) версии 8</a>. Место установки JDK должно быть назначено переменной среды JAVA\_HOME. Вам также потребуется <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">установить Apache Maven версии 3.0 или выше</a>.

Кроме того, нужно <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">установить среду Node.js</a>, включающую инструмент npm. Он позволит вам получить инструменты Azure Functions Core Tools. Если вы не хотите устанавливать Node.js, см. другие варианты установки в нашей <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">справке по Core Tools</a>.

Чтобы установить пакет Core Tools, выполните следующую команду:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools использует платформу <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, поэтому нужно установить и ее тоже.

Наконец, <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">установите Azure CLI 2.0</a>. После установки войдите в систему, выполнив команду login ниже и следуя указаниям на экране:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### Создание проекта Функций Azure

В окне терминала или в командной строке перейдите в пустую папку своего проекта и выполните следующую команду:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### Создание функции

По умолчанию при создании проекта создается функция HTTP, поэтому никаких действий для этого шага сейчас выполнять не нужно. Если позже вы захотите добавить новую функцию, выполните следующую команду:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven попросит вас выбрать и настроить шаблон для новой функции.

<br/>
### Запуск проекта функции в локальной среде

Чтобы запустить приложение-функцию, введите следующую команду:

<MarkdownHighlighter>mvn clean package mvn azure-functions:run</MarkdownHighlighter>

Среда выполнения выведет для всех HTTP-функций URL-адрес, который можно скопировать и открыть в адресной строке браузера.

Чтобы отключить отладку, нажмите в терминале клавиши **CTRL+C**.

<br/>
### Развертывание кода в Azure

Чтобы опубликовать проект Функций в Azure, введите следующую команду:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Если вы еще не вошли в Azure, вам будет предложено сделать это. Следуйте указаниям на экране.
