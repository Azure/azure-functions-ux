### <a name="install-dependencies"></a>Bağımlılıkları yükleme

Başlamadan önce <a href="https://go.microsoft.com/fwlink/?linkid=2016593" target="_blank">Visual Studio Code'u yüklemelisiniz</a>. Ayrıca npm'yi içeren <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.JS'yi de yüklemeniz</a> gerekir. Azure Functions Core Tools'u nasıl elde edeceğiniz aşağıda açıklanmıştır. Node'u yüklememeyi tercih ediyorsanız <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools başvurumuzda</a> diğer yükleme seçeneklerine bakın.

Core Tools paketini yüklemek için şu komutu çalıştırın:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

Ardından <a href="https://go.microsoft.com/fwlink/?linkid=2016800" target="_blank">Visual Studio Code için Azure İşlevleri uzantısını yükleyin</a>. Uzantı yüklendikten sonra Etkinlik Çubuğundaki Azure logosuna tıklayın. **Azure: İşlevler**'in altında **Azure'da oturum aç...** seçeneğine tıklayın ve ekrandaki yönergeleri izleyin.

<br/>
### <a name="create-an-azure-functions-project"></a>Azure İşlevleri projesi oluşturma

**Azure: İşlevler** panelinde **Yeni Proje Oluştur...** simgesine tıklayın.

Uygulamanız için dizin seçmeniz istenir. Boş bir dizin seçin.

Ardından projeniz için bir dil seçersiniz. {workerRuntime} öğesini seçin.

<br/>
### <a name="create-a-function"></a>İşlev oluşturma

**Azure: İşlevler** panelinde **İşlev Oluştur...** simgesine tıklayın.

İşleviniz için şablon seçmeniz istenir. Başlangıç olarak HTTP tetikleyicisini öneririz.

<br/>
### <a name="run-your-function-project-locally"></a>İşlev projenizi yerel olarak çalıştırma

İşlev uygulamanız için **F5** tuşuna basın.

Çalışma zamanı tüm HTTP işlevleri için çıkış olarak bir URL verir. Bu URL’yi tarayıcınızın adres çubuğuna kopyalayıp çalıştırabilirsiniz.

Hata ayıklamayı durdurmak için **Shift + F5** tuşuna basın.

<br/>
### <a name="deploy-your-code-to-azure"></a>Kodunuzu Azure’a dağıtma

**Azure: İşlevler** panelinde <ChevronUp/> simgesine (**İşlev Uygulamasına Dağıt**) tıklayın.

İşlev uygulamasını seçmeniz istendiğinde {functionAppName} öğesini seçin.
