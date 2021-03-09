### <a name="install-dependencies"></a>Függőségek telepítése

A kezdés előtt <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">telepítenie kell a Java Developer Kit 8-as verzióját</a>. Győződjön meg arról, hogy a JAVA_HOME környezeti változó a JDK telepítési helyére van beállítva. Ezenkívül az <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">Apache Maven 3.0-s vagy újabb verzióját is telepítenie kell</a>.

Emellett a <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS-t is telepítenie kell</a>, amely az npm-et is tartalmazza. Így szerezheti be az Azure Functions Core Toolst. Ha nem szeretné telepíteni a Node-ot, az egyéb telepítési lehetőségekről a <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools referenciadokumentációjában</a> tájékozódhat.

Futtassa az alábbi parancsot a Core Tools csomag telepítéséhez:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

A Core Tools a <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a> keretrendszert használja, így ezt is telepítenie kell.

Végül <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">telepítse az Azure CLI 2.0</a> szolgáltatást. Ha telepítette, a bejelentkezési parancs futtatásával és a képernyőn megjelenő utasítások követésével győződjön meg arról, hogy be van jelentkezve:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Azure Functions-projekt létrehozása

A terminálablakban vagy a parancssorban lépjen a projekt egyik üres mappájához, és futtassa a következő parancsot:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>Függvény létrehozása

A projekt létrehozásával alapértelmezés szerint létrejön egy HTTP-függvény is, így ezzel a lépéssel jelenleg nincs teendője. Ha a későbbiekben egy új függvényt szeretne hozzáadni, futtassa a következő parancsot:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

A Maven arra kéri, hogy válassza ki és szabja testre az új függvény sablonját.

<br/>
### <a name="run-your-function-project-locally"></a>A függvényprojekt helyi futtatása

Írja be a következő parancsot a függvényalkalmazás futtatásához:

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

A futtatókörnyezet minden HTTP-függvény esetében kiad egy URL-címet, amely a böngésző címsorába beillesztve futtatható.

A hibakeresés leállításához használja a **Ctrl+C** billentyűparancsot a terminálban.

<br/>
### <a name="deploy-your-code-to-azure"></a>Kód üzembe helyezése az Azure-ban

A Functions-projekt Azure-beli közzétételéhez írja be az alábbi parancsot:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Ha még nem jelentkezett be az Azure-ba, a rendszer felszólítja a bejelentkezésre. Kövesse a képernyőn megjelenő utasításokat.
