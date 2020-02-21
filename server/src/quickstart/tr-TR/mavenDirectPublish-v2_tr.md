### Bağımlılıkları yükleme

Başlamadan önce, <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">Java Developer Kit, sürüm 8’i yüklemeniz</a> gerekir. JAVA\_HOME ortam değişkeninin, JDK’nin yükleme konumuna ayarlandığından emin olun. Ayrıca <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">Apache Maven, sürüm 3.0 veya üzerini yüklemeniz</a> gerekir.

Npm’yi içeren <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS’yi de yüklemeniz</a> gerekir. Azure Functions Core Tools’u bu şekilde edineceksiniz. Node yüklememeyi tercih ederseniz, <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools başvurumuzdaki</a> diğer yükleme seçeneklerine bakın.

Core Tools paketini yüklemek için aşağıdaki komutu çalıştırın:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a> kullandığından, sizin de bunu yüklemeniz gerekir.

Son olarak, <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">Azure CLI 2.0’ı yükleyin</a>. Bu yüklendikten sonra, oturum açma komutunu çalıştırıp ekrandaki yönergeleri izleyerek oturum açtığınızdan emin olun:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### Azure İşlevleri projesi oluşturma

Terminal penceresinde veya bir komut isteminden, projeniz için boş bir klasöre gidin ve aşağıdaki komutu çalıştırın:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### İşlev oluşturma

Projeyi oluşturmak varsayılan olarak bir HTTP işlevi oluşturur, bu nedenle bu adım için herhangi bir işlem yapmanız gerekmez. Daha sonra, yeni bir işlev eklemek isterseniz, aşağıdaki komutu çalıştırın:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven, yeni işlev için bir şablon seçip özelleştirmenizi ister.

<br/>
### İşlev projenizi yerel olarak çalıştırma

İşlev uygulamanızı çalıştırmak için aşağıdaki komutu girin:

<MarkdownHighlighter>mvn clean package mvn azure-functions:run</MarkdownHighlighter>

Çalışma zamanı, HTTP işlevleri için kopyalanabilen ve tarayıcınızın adres çubuğunda çalıştırılabilen bir URL çıkışı oluşturur.

Hata ayıklamayı durdurmak için, terminalde **Ctrl-C** işlevini kullanın.

<br/>
### Kodunuzu Azure’a dağıtma

İşlevler projenizi Azure’a yayımlamak için, aşağıdaki komutu girin:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Henüz oturum açmadıysanız, Azure oturumu açmanız istenebilir. Ekrandaki yönergeleri izleyin.
