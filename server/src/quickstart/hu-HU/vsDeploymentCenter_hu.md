# Függőségek telepítése

Kezdés előtt [telepítse a Visual Studio 2019](https://go.microsoft.com/fwlink/?linkid=2016389)-et, és győződjön meg arról, hogy az Azure-fejlesztési számítási feladatok is telepítve vannak.

A Visual Studio telepítése után ellenőrizze, hogy rendelkezik-e a [legújabb Azure Functions-eszközökkel](https://go.microsoft.com/fwlink/?linkid=2016394).

<br/>
# Azure Functions projekt létrehozása

A Visual Studio **Fájl** menüjében válassza az **Új** > **Projekt** lehetőséget.

Az **Új projekt** párbeszédpanelen válassza a **Telepített**, lehetőséget, nyissa ki a **Visual C#** > **Cloud** menülistát, válassza az **Azure Functions** elemet, írja be a projekt **nevét**, majd kattintson az **OK** gombra. A függvényalkalmazás nevének C# névtérként is érvényesnek kell lennie, ezért ne használjon alulvonást, kötőjelet vagy más nem alfanumerikus karaktereket.

Kövesse a varázslót sablon kiválasztásához és testreszabásához. Ha még csak ismerkedik a rendszerrel, a HTTP-t ajánlunk. Ezután kattintson az **OK** gombra az első függvény létrehozásához.

<br/>
# Függvény létrehozása

A projekt létrehozásával alapértelmezés szerint létrehoz egy HTTP-függvényt is, így ennél a lépésnél most nincs további teendője. Ha a későbbiekben új függvényt szeretne hozzáadni, a **Megoldáskezelő**ben kattintson jobb egérgombbal a projektre, és válassza a **Hozzáadás** > **Új Azure-függvény...** lehetőséget.

Adjon nevet a függvénynek, majd kattintson a **Hozzáadás** elemre. A sablon kiválasztása és testreszabása után kattintson az **OK** gombra.

<br/>
# A függvényprojekt helyi futtatása

A függvényalkalmazás futtatásához nyomja meg az **F5** billentyűt.

A futtatókörnyezet minden HTTP-függvényhez kiad egy-egy URL-címet, amelyeket a böngésző címsorába másolhat és futtathat.

A hibakeresés leállításához nyomja le a **Shift + F5** billentyűkonfigurációt.

<br/>
# Kód üzembe helyezése az Azure-ban

Az alábbi **Befejezés és az Üzembe helyezési központ megnyitása** gombbal átléphet az Üzembe helyezési központba, ahol befejezheti az alkalmazás beállítását. Ez végigvezeti egy új varázslón a különböző üzembe helyezési lehetőségek konfigurálásához. A folyamat befejezése után indítson el egy üzembe helyezést az Ön által konfigurált mechanizmussal.
