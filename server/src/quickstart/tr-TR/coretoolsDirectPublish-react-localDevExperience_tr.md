### <a name="install-dependencies"></a>Bağımlılıkları yükleme

Başlayabilmek için önce npm'yi içeren <a href="https://go.microsoft.com/fwlink/?linkid=2016195" target="_blank">Node.js'yi yüklemelisiniz</a>. Azure Functions Core Tools'u nasıl elde edeceğiniz aşağıda açıklanmıştır. Node.js'yi yüklememeyi tercih ediyorsanız <a href="https://go.microsoft.com/fwlink/?linkid=2016192" target="_blank">Core Tools başvurumuzda</a> diğer yükleme seçeneklerine bakın.

Core Tools paketini yüklemek için şu komutu çalıştırın:

<MarkdownHighlighter>npm install -g azure-functions-core-tools@4 --unsafe-perm true</MarkdownHighlighter>

<br/>
### <a name="create-an-azure-functions-project"></a>Azure İşlevleri projesi oluşturma

Terminal penceresinde veya komut isteminden projeniz için boş bir klasöre gidin ve aşağıdaki komutu çalıştırın:

<MarkdownHighlighter>func init</MarkdownHighlighter>

Ayrıca proje için çalışma zamanını da seçmeniz istenir. {workerRuntime} öğesini seçin.

<br/>
### <a name="create-a-function"></a>İşlev oluşturma

İşlev oluşturmak için aşağıdaki komutu çalıştırın:

<MarkdownHighlighter>func new</MarkdownHighlighter>

Bu aşamada işleviniz için şablon seçmeniz istenir. Başlangıç olarak HTTP tetikleyicisini öneririz.

<StackInstructions customStack={true}>To learn about how to create a custom handler that is invoked when this function executes, see the Azure Functions <a href="https://go.microsoft.com/fwlink/?linkid=2138621" target="_blank">Custom Handlers documentation</a>.</StackInstructions>

<br/>
### <a name="run-your-function-project-locally"></a>İşlev projenizi yerel olarak çalıştırma

İşlev uygulamanızı başlatmak için aşağıdaki komutu çalıştırın:

<MarkdownHighlighter>func start</MarkdownHighlighter>

Çalışma zamanı tüm HTTP işlevleri için çıkış olarak bir URL verir. Bu URL’yi tarayıcınızın adres çubuğuna kopyalayıp çalıştırabilirsiniz.

Hata ayıklamayı durdurmak için terminalde **Ctrl-C** tuşlarını kullanın.

<br/>
### <a name="deploy-your-code-to-azure"></a>Kodunuzu Azure’a dağıtma

İşlevler projenizi Azure'da yayımlamak için aşağıdaki komutu girin:

<MarkdownHighlighter slot={false}>func azure functionapp publish {functionAppName} <SlotComponent>--slot {slotName}</SlotComponent></MarkdownHighlighter>

Azure'da oturum açmanız istenebilir. Ekrandaki yönergeleri takip edin.
