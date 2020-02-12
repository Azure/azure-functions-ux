### Bağımlılıkları yükleme

Başlamadan önce, <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1’i yüklemeniz</a> gerekir. Ayrıca Azure Functions Core Tools’u edinmenizi sağlayan npm’yi içeren <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS’yi yüklemeniz</a> gerekir. Node yüklememeyi tercih ederseniz, <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools başvurumuzdaki</a> diğer yükleme seçeneklerine bakın.

Core Tools paketini yüklemek için aşağıdaki komutu çalıştırın:

<MarkdownHighlighter> npm install -g azure-functions-core-tools</MarkdownHighlighter>

<br/>
### Azure İşlevleri projesi oluşturma

Terminal penceresinde veya bir komut isteminden, projeniz için boş bir klasöre gidin ve aşağıdaki komutu çalıştırın:

<MarkdownHighlighter> func init</MarkdownHighlighter>

Ayrıca proje için bir çalışma zamanı seçmeniz istenir. {workerRuntime} seçeneğini belirleyin.

<br/>
### İşlev oluşturma

İşlev oluşturmak için aşağıdaki komutu çalıştırın:

<MarkdownHighlighter> func new</MarkdownHighlighter>

İşleviniz için yeni bir şablon seçmeniz istenir. Başlangıç olarak HTTP tetikleyicisini öneririz.

<br/>
### İşlev projenizi yerel olarak çalıştırma

İşlev uygulamanızı başlatmak için aşağıdaki komutu çalıştırın:

<MarkdownHighlighter> func start</MarkdownHighlighter>

Çalışma zamanı, HTTP işlevleri için kopyalanabilen ve tarayıcınızın adres çubuğunda çalıştırılabilen bir URL çıkışı oluşturur.

Hata ayıklamayı durdurmak için, terminalde **Ctrl-C** işlevini kullanın.

<br/>
### Kodunuzu Azure’a dağıtma

İşlevler projenizi Azure’a yayımlamak için, aşağıdaki komutu girin:

<MarkdownHighlighter> func azure functionapp publish {functionAppName}</MarkdownHighlighter>

Azure’da oturum açmanız istenebilir Ekrandaki yönergeleri izleyin.
