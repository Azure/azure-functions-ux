# Установка зависимостей

Прежде чем приступить к работе, [установите Java Developer Kit (JDK) версии 8](https://go.microsoft.com/fwlink/?linkid=2016706). Место установки JDK должно быть назначено переменной среды JAVA\_HOME. Вам также потребуется [установить Apache Maven версии 3.0 или выше](https://go.microsoft.com/fwlink/?linkid=2016384).

Кроме того, нужно [установить среду Node.js](https://go.microsoft.com/fwlink/?linkid=2016195), включающую инструмент npm. Он позволит вам получить инструменты Azure Functions Core Tools. Если вы не хотите устанавливать Node.js, см. другие варианты установки в нашей [справке по Core Tools](https://go.microsoft.com/fwlink/?linkid=2016192).

Чтобы установить пакет Core Tools, выполните следующую команду:

``` npm install -g azure-functions-core-tools ```

Core Tools использует платформу [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373), поэтому нужно установить и ее тоже.

Наконец, [установите Azure CLI 2.0](https://go.microsoft.com/fwlink/?linkid=2016701). После установки войдите в систему, выполнив команду login ниже и следуя указаниям на экране:

``` az login ```

<br/>
# Создание проекта Функций Azure

В окне терминала или в командной строке перейдите в пустую папку своего проекта и выполните следующую команду:

``` mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false ```

<br/>
# Создание функции

По умолчанию при создании проекта создается функция HTTP, поэтому никаких действий для этого шага сейчас выполнять не нужно. Если позже вы захотите добавить новую функцию, выполните следующую команду:

``` mvn azure-functions:add ```

Maven попросит вас выбрать и настроить шаблон для новой функции.

<br/>
# Запуск проекта функции в локальной среде

Чтобы запустить приложение-функцию, введите следующую команду:

``` mvn clean package mvn azure-functions:run ```

Среда выполнения выведет для всех HTTP-функций URL-адрес, который можно скопировать и открыть в адресной строке браузера.

Чтобы отключить отладку, нажмите в терминале клавиши **CTRL+C**.

<br/>
# Развертывание кода в Azure

Нажмите ниже кнопку **Завершить и перейти в центр развертывания**, чтобы открыть центр развертывания и завершить настройку приложения. Будет открыт новый мастер для настройки различных параметров развертывания. Завершив работу с мастером, активируйте развертывание с помощью любого настроенного вами механизма.
