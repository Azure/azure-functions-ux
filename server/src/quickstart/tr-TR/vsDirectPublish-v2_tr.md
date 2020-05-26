### Bağımlılıkları yükleme

Başlamadan önce, <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">Visual Studio 2019’yi yüklemeniz</a> ve Azure geliştirme iş yükünün de yüklenmiş olduğundan emin olmanız gerekir.

Visual Studio yüklendiğinde, <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">en yeni Azure İşlevleri araçlarına</a> sahip olduğunuzdan emin olun.

<br/>
### Azure İşlevleri projesi oluşturma

Visual Studio’da, **Dosya** menüsünden **Yeni** > **Proje** seçeneğini belirleyin.

**Yeni Proje** iletişim kutusunda, **Yüklenen**’i seçin, **Visual C#** > **Bulut** seçeneğini genişletin, **Azure İşlevleri**’ni seçin, projeniz için bir **Ad** yazın ve **Tamam**’a tıklayın. İşlev adının geçerli bir C# ad alanı olması gerekir, bu nedenle alt çizgiler, kısa çizgiler veya diğer alfasayısal olmayan karakterleri kullanmayın.

Bir şablonu seçip özelleştirmek için sihirbazı izleyin. Başlangıç olarak HTTP’yi öneririz. Ardından ilk işlevinizi oluşturmak için **Tamam**’a tıklayın.

<br/>
### İşlev oluşturma

Projeyi oluşturmak varsayılan olarak bir HTTP işlevi oluşturur, bu nedenle bu adım için herhangi bir işlem yapmanız gerekmez. Daha sonra, yeni bir işlev eklemek isterseniz, **Çözüm Gezgini**’nde bir projeye sağ tıklayın ve **Ekle** > **Yeni Azure İşlevi…** seçeneğini belirleyin.

İşlevinize bir ad verin ve **Ekle** seçeneğine tıklayın. Şablonunuzu seçip özelleştirin ve ardından **Tamam**’a tıklayın.

<br/>
### İşlev projenizi yerel olarak çalıştırma

İşlev uygulamanızı çalıştırmak için **F5** tuşuna basın.

Çalışma zamanı, HTTP işlevleri için kopyalanabilen ve tarayıcınızın adres çubuğunda çalıştırılabilen bir URL çıkışı oluşturur.

Hata ayıklamayı durdurmak için, **Shift + F5** tuşlarına basın.

<br/>
### Kodunuzu Azure’a dağıtma

**Çözüm Gezgini**’nde projeye sağ tıklayın ve ardından **Yayımla** seçeneğini belirleyin.

Yayımlama hedefi olarak Azure İşlev Uygulaması’nı seçin ve ardından **Mevcut Olanı Seç** öğesini seçin. Ardından **Yayımla**’ya tıklayın.

Azure hesabınıza bir Visual Studio bağlamadıysanız, **Bir hesap ekleyin…** seçeneğini belirleyin ve ekrandaki yönergeleri izleyin.

**Abonelikler** altında, {subscriptionName} seçeneğini belirleyin. {functionAppName} seçeneğini arayın ve aşağıdaki bölümde bu seçeneği belirleyin. Ardından **Tamam**’a tıklayın.
