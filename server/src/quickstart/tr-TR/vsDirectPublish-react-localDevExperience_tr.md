### <a name="install-dependencies"></a>Bağımlılıkları yükleme

Başlayabilmek için önce <a href="https://go.microsoft.com/fwlink/?linkid=2016389" target="_blank">Visual Studio 2019'u yüklemeniz</a> ve Azure geliştirme iş yükünün de yüklü olduğundan emin olmanız gerekir.

Visual Studio yüklendikten sonra <a href="https://go.microsoft.com/fwlink/?linkid=2016394" target="_blank">en son Azure İşlevleri araçlarına</a> sahip olduğunuzdan emin olun.

<br/>
### <a name="create-an-azure-functions-project"></a>Azure İşlevleri projesi oluşturma

Visual Studio'da **Dosya** menüsünden **Yeni** > **Proje**’yi seçin.

**Yeni Proje** iletişim kutusunda **Yüklü**'yü seçin, **Visual C#** > **Bulut**'u genişletin, **Azure İşlevleri**'ni seçin, projeniz için bir **Ad** yazın ve **Tamam**'a tıklayın. İşlev uygulamasının adı, bir C# ad alanı olarak geçerli olmalıdır; bu nedenle alt çizgi, kısa çizgi veya alfasayısal olmayan herhangi bir karakter kullanmayın.

Şablonu seçmek ve özelleştirmek için sihirbazı izleyin. Başlangıç olarak HTTP kullanılmasını öneririz. Ardından **Tamam**'a tıklayarak ilk işlevinizi oluşturun.

<br/>
### <a name="create-a-function"></a>İşlev oluşturma

Proje oluşturulduğunda varsayılan olarak bir HTTP işlevi oluşturulur, dolayısıyla şu anda bu adım için hiçbir şey yapmanız gerekmez. Daha sonra yeni bir işlev eklemek isterseniz **Çözüm Gezgini**'nde projeye sağ tıklayın ve **Ekle** > **Yeni Azure İşlevi…** öğesini seçin.

İşlevinize bir ad verin ve **Ekle**'ye tıklayın. Şablonunuzu seçip özelleştirin ve ardından **Tamam**'a tıklayın.

<br/>
### <a name="run-your-function-project-locally"></a>İşlev projenizi yerel olarak çalıştırma

İşlev uygulamanız için **F5** tuşuna basın.

Çalışma zamanı tüm HTTP işlevleri için çıkış olarak bir URL verir. Bu URL’yi tarayıcınızın adres çubuğuna kopyalayıp çalıştırabilirsiniz.

Hata ayıklamayı durdurmak için **Shift + F5** tuşuna basın.

<br/>
### <a name="deploy-your-code-to-azure"></a>Kodunuzu Azure’a dağıtma

**Çözüm Gezgini**’nde projeye sağ tıklayın ve **Yayımla**’yı seçin.

Yayımlama hedefiniz olarak Azure İşlev Uygulaması'nı ve sonra da **Mevcut Olanı Seç** öğesini seçin. Ardından **Yayımla**’ya tıklayın.

Henüz Visual Studio'yu Azure hesabınıza bağlamadıysanız **Hesap ekle…** öğesini seçin ve ekrandaki yönergeleri izleyin.

**Abonelik**'in altında {subscriptionName} öğesini seçin. {functionAppName} öğesini arayın ve ardından aşağıdaki bölümde bunu seçin. Daha sonra, **Tamam**'a tıklayın.
