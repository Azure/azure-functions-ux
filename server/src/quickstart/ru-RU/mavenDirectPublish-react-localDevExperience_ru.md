### <a name="install-dependencies"></a>Установка зависимостей

Прежде чем приступить к работе, <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">установите комплект разработчика Java (JDK) версии 8</a>. Обязательно присвойте переменной среды JAVA_HOME расположение установки JDK. Вам также потребуется <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">установить Apache Maven 3.0 или более поздней версии</a>.

Кроме того, установите <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.js</a> с пакетом npm. После этого в вашем распоряжении будет набор Azure Functions Core Tools. Если вы предпочитаете не устанавливать Node, ознакомьтесь с другими вариантами установки в нашем <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">справочнике по Core Tools</a>.

Выполните следующую команду, чтобы установить пакет Core Tools:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Набор Core Tools использует <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>, поэтому вам нужно установить и это решение.

Наконец, <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">установите Azure CLI 2.0</a>. После установки обязательно войдите систему, выполнив команду входа и следуя инструкциям на экране:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Создание проекта Функций Azure

В окне терминала или из командной строки перейдите к пустой папке для проекта и выполните следующую команду:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>Создание функции

При создании проекта по умолчанию создается функция HTTP, поэтому на этом этапе не нужно выполнять никаких действий. Затем, если вы хотите добавить новую функцию, выполните следующую команду:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

В Maven вам будет предложено выбрать и настроить шаблон для новой функции.

<br/>
### <a name="run-your-function-project-locally"></a>Запуск проекта функции в локальной среде

Введите следующую команду для запуска приложения-функции:

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

Среда выполнения выводит URL-адрес для любых функций HTTP, которые можно скопировать и запустить в адресной строке браузера.

Чтобы остановить отладку, нажмите клавиши **CTRL+C** в окне терминала.

<br/>
### <a name="deploy-your-code-to-azure"></a>Развертывание кода в Azure

Чтобы опубликовать проект Функций в Azure, введите следующую команду:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Возможно, вам будет предложено войти в Azure, если вы еще не сделали этого. Следуйте инструкциям на экране.
