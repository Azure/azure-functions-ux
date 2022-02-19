### <a name="install-dependencies"></a>Bağımlılıkları yükleme

Başlayabilmek için <a href="https://go.microsoft.com/fwlink/?linkid=2016706" target="_blank">Java Developer Kit, sürüm 8'i yüklemeniz</a> gerekir. JAVA_HOME ortam değişkeninin JDK’nin yükleme konumuna ayarlandığından emin olun. Ayrıca <a href="https://go.microsoft.com/fwlink/?linkid=2016384" target="_blank">Apache Maven, sürüm 3.0 veya üzerini de yüklemeniz</a> gerekir.

Ayrıca npm'yi içeren <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS'yi de yüklemeniz</a> gerekir. Azure Functions Core Tools'u nasıl elde edeceğiniz aşağıda açıklanmıştır. Node'u yüklememeyi tercih ediyorsanız <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools başvurumuzda</a> diğer yükleme seçeneklerine bakın.

Core Tools paketini yüklemek için şu komutu çalıştırın:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a>'i kullandığından bunu da yüklemelisiniz.

Son olarak <a href="https://go.microsoft.com/fwlink/?linkid=2016701" target="_blank">Azure CLI 2.0'ı yükleyin</a>. Bu yüklendikten sonra oturum açma komutunu çalıştırarak ve ekrandaki yönergeleri izleyerek oturum açtığınızdan emin olun:

<MarkdownHighlighter>az login</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Azure İşlevleri projesi oluşturma

Terminal penceresinde veya komut isteminden projeniz için boş bir klasöre gidin ve aşağıdaki komutu çalıştırın:

<MarkdownHighlighter>mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName={functionAppName} -DappRegion={region} -DresourceGroup={resourceGroup} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.{functionAppName} -DinteractiveMode=false</MarkdownHighlighter>

<br/>
### <a name="create-a-function"></a>İşlev oluşturma

Proje oluşturulduğunda varsayılan olarak bir HTTP işlevi oluşturulur, dolayısıyla şu anda bu adım için hiçbir şey yapmanız gerekmez. Daha sonra yeni bir işlev eklemek isterseniz aşağıdaki komutu çalıştırın:

<MarkdownHighlighter>mvn azure-functions:add</MarkdownHighlighter>

Maven yeni işlev için bir şablon seçip özelleştirmenizi ister.

<br/>
### <a name="run-your-function-project-locally"></a>İşlev projenizi yerel olarak çalıştırma

İşlev uygulamanızı çalıştırmak için aşağıdaki komutu girin:

<MarkdownHighlighter>mvn clean package</MarkdownHighlighter>
<MarkdownHighlighter>mvn azure-functions:run</MarkdownHighlighter>

Çalışma zamanı tüm HTTP işlevleri için çıkış olarak bir URL verir. Bu URL’yi tarayıcınızın adres çubuğuna kopyalayıp çalıştırabilirsiniz.

Hata ayıklamayı durdurmak için terminalde **Ctrl-C** tuşlarını kullanın.

<br/>
### <a name="deploy-your-code-to-azure"></a>Kodunuzu Azure’a dağıtma

İşlevler projenizi Azure'da yayımlamak için aşağıdaki komutu girin:

<MarkdownHighlighter>mvn azure-functions:deploy</MarkdownHighlighter>

Henüz yapmadıysanız Azure'da oturum açmanız istenebilir. Ekrandaki yönergeleri takip edin.
