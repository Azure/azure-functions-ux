# Függőségek telepítése

Kezdés előtt [telepítse a Java Developer Kit 8-as verzióját](https://go.microsoft.com/fwlink/?linkid=2016706). Ügyeljen arra, hogy a JAVA\_HOME környezeti változót a JDK telepítési helyére állítsa be. Ezen kívül [telepítse az Apache Maven 3.0-ás vagy újabb verzióját](https://go.microsoft.com/fwlink/?linkid=2016384).

Érdemes [telepítenie a Node.JS-t](https://go.microsoft.com/fwlink/?linkid=2016195) is, amely tartalmazza az NPM-et. Így szerezheti be a Azure Functions Core Tools eszközkészletet. Ha nem szeretné telepíteni a Node.JS-t, tekintse meg a további telepítési lehetőségeket a [Core Tools-dokumentációban](https://go.microsoft.com/fwlink/?linkid=2016192).

Futtassa a következő parancsot a Core Tools-csomag telepítéséhez:

``` npm install -g azure-functions-core-tools ```

A Core Tools a [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373)-et használja, ezért azt is telepíteni kell.

Utolsó lépésként [telepítse az Azure CLI 2.0](https://go.microsoft.com/fwlink/?linkid=2016701)-ás verzióját. Ha befejeződött a telepítés, győződjön meg róla, hogy be van jelentkezve. Ezt a bejelentkezési parancs futtatásával és a képernyőn megjelenő utasítások követésével teheti meg:

``` az login ```

<br/>
# Azure Functions projekt létrehozása

A terminálablakban vagy a parancssorban navigáljon egy üres mappára, amelybe a projektet helyezni szeretné, és futtassa a következő parancsot:

``` mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false ```

<br/>
# Függvény létrehozása

A projekt létrehozásával alapértelmezés szerint létrehoz egy HTTP-függvényt is, így ennél a lépésnél most nincs további teendője. Ha a későbbiekben új függvényt szeretne hozzáadni, futtassa az alábbi parancsot:

``` mvn azure-functions:add ```

A Maven kérni fogja, hogy válasszon sablont az új függvénynek, és végezze el rajta a szükséges testreszabásokat.

<br/>
# A függvényprojekt helyi futtatása

A függvényalkalmazás futtatásához írja be a következő parancsot:

``` mvn clean package mvn azure-functions:run ```

A futtatókörnyezet minden HTTP-függvényhez kiad egy-egy URL-címet, amelyeket a böngésző címsorába másolhat és futtathat.

A hibakeresés leállításához használja a **CTRL-C** billentyűkombinációt a terminálon.

<br/>
# Kód üzembe helyezése az Azure-ban

Az alábbi **Befejezés és az Üzembe helyezési központ megnyitása** gombbal átléphet az Üzembe helyezési központba, ahol befejezheti az alkalmazás beállítását. Ez végigvezeti egy új varázslón a különböző üzembe helyezési lehetőségek konfigurálásához. A folyamat befejezése után indítson el egy üzembe helyezést az Ön által konfigurált mechanizmussal.
