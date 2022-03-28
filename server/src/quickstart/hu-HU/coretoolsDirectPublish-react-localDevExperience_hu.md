### <a name="install-dependencies"></a>Függőségek telepítése

A kezdés előtt <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">telepítenie kell a Node.js</a>-t, amely tartalmazza az npm-et. Így szerezheti be az Azure Functions Core Toolst. Ha nem szeretné telepíteni a Node.js-t, az egyéb telepítési lehetőségekről a <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools referenciadokumentációjában</a> tájékozódhat.

Futtassa az alábbi parancsot a Core Tools csomag telepítéséhez:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Azure Functions-projekt létrehozása

A terminálablakban vagy a parancssorban lépjen a projekt egyik üres mappájához, és futtassa a következő parancsot:

<MarkdownHighlighter>func init</MarkdownHighlighter>

Ezután futtatókörnyezetet is választania kell a projekthez. Válassza a(z) {workerRuntime} lehetőséget.

<br/>
### <a name="create-a-function"></a>Függvény létrehozása

Függvény létrehozásához futtassa az alábbi parancsot:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Ekkor sablont kell választania a függvényhez. A kezdéshez a HTTP-triggert javasoljuk.

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>A függvényprojekt helyi futtatása

Futtassa a következő parancsot a függvényalkalmazás elindításához:

<MarkdownHighlighter>func start</MarkdownHighlighter>

A futtatókörnyezet minden HTTP-függvény esetében kiad egy URL-címet, amely a böngésző címsorába beillesztve futtatható.

A hibakeresés leállításához használja a **Ctrl+C** billentyűparancsot a terminálban.

<br/>
### <a name="deploy-your-code-to-azure"></a>Kód üzembe helyezése az Azure-ban

A Functions-projekt Azure-beli közzétételéhez írja be az alábbi parancsot:

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

Lehet, hogy a rendszer arra kéri, hogy jelentkezzen be az Azure-ba. Kövesse a képernyőn megjelenő utasításokat.
