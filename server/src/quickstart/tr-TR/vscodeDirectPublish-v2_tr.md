### Bağımlılıkları yükleme

Başlamadan önce, <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">Visual Studio Code’u yüklemeniz</a> gerekir. Ayrıca Azure Functions Core Tools’u edinmenizi sağlayan npm’yi içeren <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS’yi yüklemeniz</a> gerekir. Node yüklememeyi tercih ederseniz, <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools başvurumuzdaki</a> diğer yükleme seçeneklerine bakın.

Core Tools paketini yüklemek için aşağıdaki komutu çalıştırın:

<MarkdownHighlighter>npm install -g azure-functions-core-tools</MarkdownHighlighter>

Core Tools <a href="https://go.microsoft.com/fwlink/?linkid=2016373" target="_blank">.NET Core 2.1</a> kullandığından, sizin de bunu yüklemeniz gerekir.

Daha sonra, <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">Visual Studio Code için Azure İşlevleri uzantısını yükleyin</a>. Uzantı yüklendiğinde, Etkinlik Çubuğu’nda Azure logosuna tıklayın. **Azure: İşlevler** altında, **Azure oturumu açın...** seçeneğine tıklayın ve ekrandaki yönergeleri izleyin.

<br/>
### Azure İşlevleri projesi oluşturma

**Yeni Proje Oluştur…** simgesine tıklayın (**Azure: İşlevler** panelinde).

Uygulamanız için bir dizin seçmeniz istenir. Boş bir dizin seçin.

Ardından projeniz için bir dil seçmeniz istenir. {workerRuntime} seçeneğini belirleyin.

<br/>
### İşlev oluşturma

**İşlev Oluştur…** simgesine tıklayın (**Azure: İşlevler** panelinde).

İşleviniz için bir şablon seçmeniz istenir. Başlangıç olarak HTTP tetikleyicisini öneririz.

<br/>
### İşlev projenizi yerel olarak çalıştırma

İşlev uygulamanızı çalıştırmak için **F5** tuşuna basın.

Çalışma zamanı, HTTP işlevleri için kopyalanabilen ve tarayıcınızın adres çubuğunda çalıştırılabilen bir URL çıkışı oluşturur.

Hata ayıklamayı durdurmak için, **Shift + F5** tuşlarına basın.

<br/>
### Kodunuzu Azure’a dağıtma

**İşlev Uygulamasına Dağıt…** (mavi yukarı ok) simgesine tıklayın (**Azure: İşlevler** panelinde).

Bir işlev uygulaması seçmeniz istendiğinde, {functionAppName} seçeneğini belirleyin.
