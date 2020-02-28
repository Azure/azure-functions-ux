### Függőségek telepítése

Kezdés előtt telepítse a <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>-es verzióját. Érdemes <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">telepíteni a Node.JS</a>-t is, hiszen az magában foglalja az NPM-et, amelyen keresztül szert tehet az Azure Functions Core Tools eszközkészletre. Ha nem szeretné telepíteni a Node.JS-t, tekintse meg a további telepítési lehetőségeket a <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools-dokumentációban</a>.

Futtassa a következő parancsot a Core Tools-csomag telepítéséhez:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

<br/>
### Azure Functions projekt létrehozása

A terminálablakban vagy a parancssorban navigáljon egy üres mappára, amelybe a projektet helyezni szeretné, és futtassa a következő parancsot:

<MarkdownHighlighter>func init</MarkdownHighlighter>

A rendszer kérni fogja a projekt futtatókörnyezetének kiválasztását is. Válassza ki a {workerRuntime} lehetőséget.

<br/>
### Függvény létrehozása

Függvény létrehozásához futtassa a következő parancsot:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Ezután a rendszer kérni fogja, hogy válasszon egy sablont a függvényhez. Ha még csak ismerkedik a rendszerrel, a HTTP-triggert ajánlunk.

<br/>
### A függvényprojekt helyi futtatása

Futtassa a következő parancsot a függvényalkalmazás elindításához:

<MarkdownHighlighter>func start</MarkdownHighlighter>

A futtatókörnyezet minden HTTP-függvényhez kiad egy-egy URL-címet, amelyeket a böngésző címsorába másolhat és futtathat.

A hibakeresés leállításához használja a **CTRL-C** billentyűkombinációt a terminálon.

<br/>
### A kód üzembe helyezése az Azure-ban

A Functions-projekt Azure-ba való közzétételéhez írja be a következő parancsot:

<MarkdownHighlighter>func azure functionapp publish {functionAppName}</MarkdownHighlighter>

Előfordulhat, hogy a rendszer felszólítja, hogy jelentkezzen be az Azure-ba. Kövesse a képernyőn megjelenő utasításokat.
