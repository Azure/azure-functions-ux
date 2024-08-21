### <a name="install-dependencies"></a>Függőségek telepítése

A kezdés előtt <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">telepítenie kell a Visual Studio Code-ot</a>. Emellett a <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS-t is telepítenie kell</a>, amely az npm-et is tartalmazza. Így szerezheti be az Azure Functions Core Toolst. Ha nem szeretné telepíteni a Node-ot, az egyéb telepítési lehetőségekről a <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools referenciadokumentációjában</a> tájékozódhat.

Futtassa az alábbi parancsot a Core Tools csomag telepítéséhez:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

Ezután <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">telepítse a Visual Studio Code Azure Functions-bővítményét</a>. Ha telepítette a bővítményt, kattintson a tevékenységsávon található Azure-emblémára. Az **Azure: Functions** alatt kattintson a **Bejelentkezés az Azure-ba...** elemre, és kövesse a képernyőn megjelenő utasításokat.

<br/>
### <a name="create-an-azure-functions-project"></a>Azure Functions-projekt létrehozása

Kattintson az **Új projekt létrehozása…** ikonra az **Azure: Functions** panelen.

A rendszer felkéri, hogy válasszon könyvtárat az alkalmazás számára. Válasszon egy üres könyvtárat.

Ezután a rendszer a projekt nyelvének megadására kéri. Válassza a(z) {workerRuntime} lehetőséget.

<br/>
### <a name="create-a-function"></a>Függvény létrehozása

Kattintson a **Függvény létrehozása…** ikonra az **Azure: Functions** panelen.

A rendszer felkéri, hogy válasszon sablont a függvényhez. A kezdéshez a HTTP-triggert javasoljuk.

<br/>
### <a name="run-your-function-project-locally"></a>A függvényprojekt helyi futtatása

A függvényalkalmazás futtatásához nyomja le az **F5** billentyűt.

A futtatókörnyezet minden HTTP-függvény esetében kiad egy URL-címet, amely a böngésző címsorába beillesztve futtatható.

A hibakeresés leállításához nyomja le a **Shift + F5** billentyűkombinációt.

<br/>
### <a name="deploy-your-code-to-azure"></a>Kód üzembe helyezése az Azure-ban

Kattintson az **Üzembe helyezés a függvényalkalmazásban…** (<ChevronUp/>) ikonra az **Azure: Functions** panelen.

Amikor a program a függvényalkalmazás kiválasztására kéri, válassza a következőt: {functionAppName}.
