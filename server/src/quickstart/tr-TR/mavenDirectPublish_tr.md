# Bağımlılıkları yükleme

Başlamadan önce, [Java Developer Kit, sürüm 8’i yüklemeniz](https://go.microsoft.com/fwlink/?linkid=2016706) gerekir. JAVA\_HOME ortam değişkeninin, JDK’nin yükleme konumuna ayarlandığından emin olun. Ayrıca [Apache Maven, sürüm 3.0 veya üzerini yüklemeniz](https://go.microsoft.com/fwlink/?linkid=2016384) gerekir.

Npm’yi içeren [Node.JS’yi de yüklemeniz](https://go.microsoft.com/fwlink/?linkid=2016195) gerekir. Azure Functions Core Tools’u bu şekilde edineceksiniz. Node yüklememeyi tercih ederseniz, [Core Tools başvurumuzdaki](https://go.microsoft.com/fwlink/?linkid=2016192) diğer yükleme seçeneklerine bakın.

Core Tools paketini yüklemek için aşağıdaki komutu çalıştırın:

``` npm install -g azure-functions-core-tools ```

Core Tools [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373) kullandığından, sizin de bunu yüklemeniz gerekir.

Son olarak, [Azure CLI 2.0’ı yükleyin](https://go.microsoft.com/fwlink/?linkid=2016701). Bu yüklendikten sonra, oturum açma komutunu çalıştırıp ekrandaki yönergeleri izleyerek oturum açtığınızdan emin olun:

``` az login ```

<br/>
# Azure İşlevleri projesi oluşturma

Terminal penceresinde veya bir komut isteminden, projeniz için boş bir klasöre gidin ve aşağıdaki komutu çalıştırın:

``` mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false ```

<br/>
# İşlev oluşturma

Projeyi oluşturmak varsayılan olarak bir HTTP işlevi oluşturur, bu nedenle bu adım için herhangi bir işlem yapmanız gerekmez. Daha sonra, yeni bir işlev eklemek isterseniz, aşağıdaki komutu çalıştırın:

``` mvn azure-functions:add ```

Maven, yeni işlev için bir şablon seçip özelleştirmenizi ister.

<br/>
# İşlev projenizi yerel olarak çalıştırma

İşlev uygulamanızı çalıştırmak için aşağıdaki komutu girin:

``` mvn clean package mvn azure-functions:run ```

Çalışma zamanı, HTTP işlevleri için kopyalanabilen ve tarayıcınızın adres çubuğunda çalıştırılabilen bir URL çıkışı oluşturur.

Hata ayıklamayı durdurmak için, terminalde **Ctrl-C** işlevini kullanın.

<br/>
# Kodunuzu Azure’a dağıtma

İşlevler projenizi Azure’a yayımlamak için, aşağıdaki komutu girin:

``` mvn azure-functions:deploy ```

Henüz oturum açmadıysanız, Azure oturumu açmanız istenebilir. Ekrandaki yönergeleri izleyin.
