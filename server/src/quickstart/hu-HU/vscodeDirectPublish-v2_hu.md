### Függőségek telepítése

Kezdés előtt telepítse a <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">Visual Studio Code</a>-ot. Érdemes <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">telepíteni a Node.JS</a>-t is, hiszen az magában foglalja az NPM-et, amelyen keresztül szert tehet az Azure Functions Core Tools eszközkészletre. Ha nem szeretné telepíteni a Node.JS-t, tekintse meg a további telepítési lehetőségeket a <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools-dokumentációban</a>.

Futtassa a következő parancsot a Core Tools-csomag telepítéséhez:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

A Core Tools a <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>-et használja, ezért azt is telepíteni kell.

Következő lépésként <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">telepítse az Azure Functions-bővítményt a Visual Studio Code-hoz</a>. Miután telepítette a bővítményt, kattintson az Azure-emblémára a tevékenységsávon. Az **Azure: a Functions** lehetőség alatt kattintson a **Bejelentkezés az Azure-ba...** elemre, és kövesse a képernyőn megjelenő utasításokat.

<br/>
### Azure Functions projekt létrehozása

Kattintson az **Új projekt létrehozása...** ikonra az **Azure: Functions** panelen.

A rendszer kérni fogja, hogy válasszon egy könyvtárat az alkalmazásnak. Válasszon ki egy üres könyvtárat.

A rendszer kérni fogja, hogy válassza ki a projekt nyelvét. Válassza a {workerRuntime} lehetőséget.

<br/>
### Függvény létrehozása

Kattintson az **Új függvény létrehozása...** ikonra az **Azure: Functions** panelen.

A rendszer kérni fogja, hogy válasszon egy sablont a függvényhez. Ha még csak ismerkedik a rendszerrel, a HTTP-triggert ajánlunk.

<br/>
### A függvényprojekt helyi futtatása

A függvényalkalmazás futtatásához nyomja meg az **F5** billentyűt.

A futtatókörnyezet minden HTTP-függvényhez kiad egy-egy URL-címet, amelyeket a böngésző címsorába másolhat és futtathat.

A hibakeresés leállításához nyomja le a **Shift + F5** billentyűkonfigurációt.

<br/>
### Kód üzembe helyezése az Azure-ban

Kattintson a **Üzembe helyezés függvényalkalmazásban...** (kék felfelé mutató nyíl) ikonra az** Azure: Functions** panelen.

Amikor a rendszer kéri, hogy válasszon egy függvényalkalmazást, válassza a {functionAppName} lehetőséget.
