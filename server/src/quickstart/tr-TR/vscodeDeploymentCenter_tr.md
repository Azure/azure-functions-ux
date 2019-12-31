# Bağımlılıkları yükleme

Başlamadan önce, [Visual Studio Code’u yüklemeniz](https://go.microsoft.com/fwlink/?linkid=2016593) gerekir. Ayrıca Azure Functions Core Tools’u edinmenizi sağlayan npm’yi içeren [Node.JS’yi yüklemeniz](https://go.microsoft.com/fwlink/?linkid=2016195) gerekir. Node yüklememeyi tercih ederseniz, [Core Tools başvurumuzdaki](https://go.microsoft.com/fwlink/?linkid=2016192) diğer yükleme seçeneklerine bakın.

Core Tools paketini yüklemek için aşağıdaki komutu çalıştırın:

``` npm install -g azure-functions-core-tools ```

Core Tools [.NET Core 2.1](https://go.microsoft.com/fwlink/?linkid=2016373) kullandığından, sizin de bunu yüklemeniz gerekir.

Daha sonra, [Visual Studio Code için Azure İşlevleri uzantısını yükleyin](https://go.microsoft.com/fwlink/?linkid=2016800). Uzantı yüklendiğinde, Etkinlik Çubuğu’nda Azure logosuna tıklayın. **Azure: İşlevler** altında, **Azure oturumu açın...** seçeneğine tıklayın ve ekrandaki yönergeleri izleyin.

<br/>
# Azure İşlevleri projesi oluşturma

**Yeni Proje Oluştur…** simgesine tıklayın (**Azure: İşlevler** panelinde).

Uygulamanız için bir dizin seçmeniz istenir. Boş bir dizin seçin.

Ardından projeniz için bir dil seçmeniz istenir. {workerRuntime} seçeneğini belirleyin.

<br/>
# İşlev oluşturma

**İşlev Oluştur…** simgesine tıklayın (**Azure: İşlevler** panelinde).

İşleviniz için bir şablon seçmeniz istenir. Başlangıç olarak HTTP tetikleyicisini öneririz.

<br/>
# İşlev projenizi yerel olarak çalıştırma

İşlev uygulamanızı çalıştırmak için **F5** tuşuna basın.

Çalışma zamanı, HTTP işlevleri için kopyalanabilen ve tarayıcınızın adres çubuğunda çalıştırılabilen bir URL çıkışı oluşturur.

Hata ayıklamayı durdurmak için, **Shift + F5** tuşlarına basın.

<br/>
# Kodunuzu Azure’a dağıtma

Dağıtım Merkezi’ne gidip uygulamanızı ayarlamayı tamamlamak için, aşağıdaki **Bitir ve Dağıtım Merkezi'ne git** düğmesini kullanın. Bu, size çeşitli dağıtım seçeneklerini yapılandırabileceğiniz bir sihirbazda yol gösterir. Bu akışı tamamladıktan sonra, yapılandırdığınız mekanizmayı kullanarak bir dağıtım tetikleyin.
