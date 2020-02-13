### Függőségek telepítése

Kezdés előtt <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">telepítse a Java Developer Kit 8-as verzióját</a>. Ügyeljen arra, hogy a JAVA\_HOME környezeti változót a JDK telepítési helyére állítsa be. Ezen kívül <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">telepítse az Apache Maven 3.0-ás vagy újabb verzióját</a>.

Érdemes <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">telepítenie a Node.JS-t</a> is, amely tartalmazza az NPM-et. Így szerezheti be a Azure Functions Core Tools eszközkészletet. Ha nem szeretné telepíteni a Node.JS-t, tekintse meg a további telepítési lehetőségeket a <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools-dokumentációban</a>.

Futtassa a következő parancsot a Core Tools-csomag telepítéséhez:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

A Core Tools a <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>-et használja, ezért azt is telepíteni kell.

Utolsó lépésként <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">telepítse az Azure CLI 2.0</a>-ás verzióját. Ha befejeződött a telepítés, győződjön meg róla, hogy be van jelentkezve. Ezt a bejelentkezési parancs futtatásával és a képernyőn megjelenő utasítások követésével teheti meg:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### Azure Functions projekt létrehozása

A terminálablakban vagy a parancssorban navigáljon egy üres mappára, amelybe a projektet helyezni szeretné, és futtassa a következő parancsot:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### Függvény létrehozása

A projekt létrehozásával alapértelmezés szerint létrehoz egy HTTP-függvényt is, így ennél a lépésnél most nincs további teendője. Ha a későbbiekben új függvényt szeretne hozzáadni, futtassa az alábbi parancsot:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

A Maven kérni fogja, hogy válasszon sablont az új függvénynek, és végezze el rajta a szükséges testreszabásokat.

<br/>
### A függvényprojekt helyi futtatása

A függvényalkalmazás futtatásához írja be a következő parancsot:

<MarkdownHighlighter>mvn clean package mvn azure-functions:run</MarkdownHighlighter>

A futtatókörnyezet minden HTTP-függvényhez kiad egy-egy URL-címet, amelyeket a böngésző címsorába másolhat és futtathat.

A hibakeresés leállításához használja a **CTRL-C** billentyűkombinációt a terminálon.

<br/>
### Kód üzembe helyezése az Azure-ban

A Functions-projekt Azure-ba való közzétételéhez írja be a következő parancsot:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Ha még nem jelentkezett be az Azure-ba, előfordulhat, hogy a rendszer megkéri erre. Kövesse a képernyőn megjelenő utasításokat.
