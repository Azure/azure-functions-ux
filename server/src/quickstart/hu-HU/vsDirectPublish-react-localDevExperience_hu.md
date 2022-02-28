### <a name="install-dependencies"></a>Függőségek telepítése

A kezdés előtt <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">telepítenie kell a Visual Studio 2019-et</a>, és meg kell győződnie arról, hogy az Azure-fejlesztési tevékenységprofil szintén telepítve van.

Ha telepítette a Visual Studiót, győződjön meg arról, hogy rendelkezik a <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">legújabb Azure Functions-eszközökkel</a>.

<br/>
### <a name="create-an-azure-functions-project"></a>Azure Functions-projekt létrehozása

A Visual Studio **Fájl** menüjében válassza az **Új** > **Projekt** lehetőséget.

Az **Új projekt** párbeszédpanelen válassza a **Telepítve** elemet, bontsa ki a **Visual C#** > **Felhő** csomópontot, válassza az **Azure Functions** lehetőséget, írja be a projekt **Nevét**, majd kattintson az **OK** gombra. A függvényalkalmazás nevének egy C#-névtérként is érvényesnek kell lennie, ezért ne használjon aláhúzásjeleket, kötőjeleket vagy más nem alfanumerikus karaktereket.

Kövesse a varázsló utasításait a sablon kiválasztásához és testreszabásához. A kezdéshez a HTTP-t javasoljuk. Ezután kattintson az **OK** gombra az első függvénye létrehozásához.

<br/>
### <a name="create-a-function"></a>Függvény létrehozása

A projekt létrehozásával alapértelmezés szerint létrejön egy HTTP-függvény is, így ezzel a lépéssel jelenleg nincs teendője. Ha a későbbiekben új függvényt szeretne hozzáadni, a **Megoldáskezelőben** kattintson a jobb gombbal a projektre, majd válassza a **Hozzáadás** > **Új Azure-függvény…** lehetőséget.

Nevezze el a függvényt, és kattintson a **Hozzáadás** gombra. Válassza ki és szabja testre a sablont, majd kattintson az **OK** gombra.

<br/>
### <a name="run-your-function-project-locally"></a>A függvényprojekt helyi futtatása

A függvényalkalmazás futtatásához nyomja le az **F5** billentyűt.

A futtatókörnyezet minden HTTP-függvény esetében kiad egy URL-címet, amely a böngésző címsorába beillesztve futtatható.

A hibakeresés leállításához nyomja le a **Shift + F5** billentyűkombinációt.

<br/>
### <a name="deploy-your-code-to-azure"></a>Kód üzembe helyezése az Azure-ban

A **Megoldáskezelőben** kattintson a jobb gombbal a projektre, majd válassza a **Közzététel** lehetőséget.

Közzétételi célként válassza az Azure Function Appot, majd kattintson a **Meglévő kiválasztása** elemre. Ezután kattintson a **Közzététel** lehetőségre.

Ha még nem csatlakoztatta a Visual Studiót az Azure-fiókjához, válassza a **Fiók hozzáadása…** lehetőséget, és kövesse a képernyőn megjelenő utasításokat.

Az **Előfizetés** alatt válassza ki a következőt: {subscriptionName}. Keressen a(z) {functionAppName} kifejezésre, majd válassza ki a lenti területen. Ezután kattintson az **OK** gombra.
