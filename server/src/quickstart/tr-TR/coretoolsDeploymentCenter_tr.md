# Bağımlılıkları yükleme

Başlamadan önce, [.NET Core 2.1’i yüklemeniz](https://go.microsoft.com/fwlink/?linkid=2016373) gerekir. Ayrıca Azure Functions Core Tools’u edinmenizi sağlayan npm’yi içeren [Node.JS’yi yüklemeniz](https://go.microsoft.com/fwlink/?linkid=2016195) gerekir. Node yüklememeyi tercih ederseniz, [Core Tools başvurumuzdaki](https://go.microsoft.com/fwlink/?linkid=2016192) diğer yükleme seçeneklerine bakın.

Core Tools paketini yüklemek için aşağıdaki komutu çalıştırın:

``` npm install -g azure-functions-core-tools ```

<br/>
# Azure İşlevleri projesi oluşturma

Terminal penceresinde veya bir komut isteminden, projeniz için boş bir klasöre gidin ve aşağıdaki komutu çalıştırın:

``` func init ```

Ayrıca proje için bir çalışma zamanı seçmeniz istenir. {workerRuntime} seçeneğini belirleyin.

<br/>
# İşlev oluşturma

İşlev oluşturmak için aşağıdaki komutu çalıştırın:

``` func new ```

İşleviniz için yeni bir şablon seçmeniz istenir. Başlangıç olarak HTTP tetikleyicisini öneririz.

<br/>
# İşlev projenizi yerel olarak çalıştırma

İşlev uygulamanızı başlatmak için aşağıdaki komutu çalıştırın:

``` func start ```

Çalışma zamanı, HTTP işlevleri için kopyalanabilen ve tarayıcınızın adres çubuğunda çalıştırılabilen bir URL çıkışı oluşturur.

Hata ayıklamayı durdurmak için, terminalde **Ctrl-C** işlevini kullanın.

<br/>
# Kodunuzu Azure’a dağıtma

Dağıtım Merkezi’ne gidip uygulamanızı ayarlamayı tamamlamak için, aşağıdaki **Bitir ve Dağıtım Merkezi'ne git** düğmesini kullanın. Bu, size çeşitli dağıtım seçeneklerini yapılandırabileceğiniz bir sihirbazda yol gösterir. Bu akışı tamamladıktan sonra, yapılandırdığınız mekanizmayı kullanarak bir dağıtım tetikleyin.
