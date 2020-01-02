# Függőségek telepítése

Kezdés előtt telepítse a [Visual Studio Code](https://go.microsoft.com/fwlink/?linkid=2016593)-ot. Érdemes [telepíteni a Node.JS](https://go.microsoft.com/fwlink/?linkid=2016195)-t is, hiszen az magában foglalja az NPM-et, amelyen keresztül szert tehet az Azure Functions Core Tools eszközkészletre. Ha nem szeretné telepíteni a Node.JS-t, tekintse meg a további telepítési lehetőségeket a [Core Tools-dokumentációban](https://go.microsoft.com/fwlink/?linkid=2016192).

Futtassa a következő parancsot a Core Tools-csomag telepítéséhez:

``` npm install -g azure-functions-core-tools ```

A Core Tools a [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373)-et használja, ezért azt is telepíteni kell.

Következő lépésként [telepítse az Azure Functions-bővítményt a Visual Studio Code-hoz](https://go.microsoft.com/fwlink/?linkid=2016800). Miután telepítette a bővítményt, kattintson az Azure-emblémára a tevékenységsávon. Az **Azure: a Functions** lehetőség alatt kattintson a **Bejelentkezés az Azure-ba...** elemre, és kövesse a képernyőn megjelenő utasításokat.

<br/>
# Azure Functions projekt létrehozása

Kattintson az **Új projekt létrehozása...** ikonra az **Azure: Functions** panelen.

A rendszer kérni fogja, hogy válasszon egy könyvtárat az alkalmazásnak. Válasszon ki egy üres könyvtárat.

A rendszer kérni fogja, hogy válassza ki a projekt nyelvét. Válassza a {workerRuntime} lehetőséget.

<br/>
# Függvény létrehozása

Kattintson az **Új függvény létrehozása...** ikonra az **Azure: Functions** panelen.

A rendszer kérni fogja, hogy válasszon egy sablont a függvényhez. Ha még csak ismerkedik a rendszerrel, a HTTP-triggert ajánlunk.

<br/>
# A függvényprojekt helyi futtatása

A függvényalkalmazás futtatásához nyomja meg az **F5** billentyűt.

A futtatókörnyezet minden HTTP-függvényhez kiad egy-egy URL-címet, amelyeket a böngésző címsorába másolhat és futtathat.

A hibakeresés leállításához nyomja le a **Shift + F5** billentyűkonfigurációt.

<br/>
# Kód üzembe helyezése az Azure-ban

Az alábbi **Befejezés és az Üzembe helyezési központ megnyitása** gombbal átléphet az Üzembe helyezési központba, ahol befejezheti az alkalmazás beállítását. Ez végigvezeti egy új varázslón a különböző üzembe helyezési lehetőségek konfigurálásához. A folyamat befejezése után indítson el egy üzembe helyezést az Ön által konfigurált mechanizmussal.
