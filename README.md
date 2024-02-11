# wet-elephant-sound 大濕之音
[運行效果](https://jack850628.github.io/wet-elephant-sound/)

這些聲音是從我們的 圖奇最大甲台[仙界大濕](https://www.twitch.tv/h804232006)、圖奇最大下水道[嘎抓](https://www.twitch.tv/magicgadra3)、圖奇油鼠台[桑尤姆](https://www.twitch.tv/sum_91318)、圖奇烤布蕾台[皮卡屁](https://www.twitch.tv/jjg60205) 的實況中剪輯下來的。

this sound capture from live broadcast for [仙界大濕](https://www.twitch.tv/h804232006) and [嘎抓](https://www.twitch.tv/magicgadra3) and [桑尤姆](https://www.twitch.tv/sum_91318) and [皮卡屁](https://www.twitch.tv/jjg60205).

目前專案的所有聲音都是上傳至[Myinstants](https://www.myinstants.com/index/tw/)

## 新增聲音的步驟
#### 必須安裝
- node.js
- Chrome
#### 步驟
先將剪好的聲音依照分類放至到個別資料夾下，接著，在用隨便一個瀏覽器登入[Myinstants](https://www.myinstants.com/index/tw/)，登入後從瀏覽器的Cookie中取得 csrftoken 和 sessionId ，然後就可以使用 AutoUploadSoundToMyinstants 下的 AutoUpload.js 來進行自動上傳了。

在 cmd 或 bash 中切換至 AutoUploadSoundToMyinstants 資料夾下，
若第一次使用必須先執行
```
npm install
```
接著執行
```
node AutoUploadSoundToMyinstants\AutoUpload.js --token=<csrftoke> --sessionId=<sessionId> --idStartFrom <聲音檔的流水唯一ID起始值> --path=<要上傳的分類的聲音所在資料夾的絕對路徑>
```
其中參數中的 csrftoke 和 sessionId 都是從瀏覽器的 Cookie 中取得，而idStartFrom則是可以使用<a href="#id">這段程式碼取得</a>，沒設定的話預設值是0。

上傳過程中瀏覽器可能會在
```
https://www.myinstants.com/en/search/?name=
```
這個頁面將畫面滾動到最底部並且沒動靜一段時間，這時可能是腳本將網頁滾到畫面底部的速度太快了，來不及觸發網頁的聲音按鈕的資料載入，這時**請手動將網頁往滾回頂部腳本就會繼續執行了**。

腳本執行完後可以看到原本資料夾下的聲音沒了，取而代之的是 success 和 fails 這兩個資料夾。
- success: 上傳成功的聲音會被移往這裡。
- fails: 上傳失敗的聲音會被移往這裡。

另外console會顯以下資訊：
- 這些聲音上傳完成: 後面陣列裡的資料可以直接貼進<a href="#audios.js">audios.js</a>檔案裡。
- 這些聲音上傳完成但搜尋不到: 後面陣列裡所寫的檔案是表示檔案已經成功上傳到Myinstants，但是在最後搜尋聲音連結的部分失敗了，這就必須手動依照<a href="audios.js">這個格式</a>將聲音新增至audios.js檔中。
- 這些聲音上傳失敗: 後面陣列裡所寫的檔案是上傳失敗的檔案，並且檔案會被移置fails資料夾裡，可能需要將檔案改個名稱並從fails資料夾搬回上一層資料夾，然後在運行一次上傳腳本，或手動上傳來知道上傳失敗的原因。

聲音新增好後，在console中輸入
```
npm run build
```
重新建構腳本檔，建構完後可以直接用瀏覽器打開index.html查看結果，或使用簡易的http server程式，例如在console輸入
```
python -m http.server 8080
```
然後在瀏覽器輸入網址
```
http://localhost:8080
```
也可以看到結果。

### audios.js
在大濕之音中，所有的聲音都放在這個檔案中，在這個檔案中只有一個變數 audios ，這個變數是一個陣列，陣列中每一個項的內容為
```
{
      "name":"<分類名稱>",
      "datas":[
         {
            "name":"<聲音名稱>",
            "onMyinstantsName":"<聲音檔在上傳Myinstants所使用的名稱>"
            "url":"<聲音的相對連結>",
            "id":<聲音的id(必須是唯一的)>
         },
         ...
      ]
 }
```
其中
#### url
datas 下的 url 可以在[favorites](https://www.myinstants.com/uploaded/)頁面用 開發人員模式 中 Elements 分頁裡，去找到按紐的html代碼
```
<button class="small-button" onclick="play('<相對連結>', '<參數二>', '<參數三>')" title="Play xxx sound" type="button"></button>
```
其中， onclick 值中 play 函數的第一個字串參數就是該按鈕的"相對連結"。
#### id
datas 下的 id 必須是唯一的值，目前我是用從 0 開始的遞增值，當要上傳聲音時，想要知道下一個聲音該用哪一個 id 時可以用瀏覽器開啟 index.html 並在 開發人員模式 中 Console 分頁裡執行腳本
```
WES.audios.flatMap(i=>i.datas).length
```
執行後得到的數字就是下一個按鈕的 id ，這個 id 也是當要用 快速取得聲音.js 中腳本取得聲音時，要填入給 var id 的值。
#### onMyinstantsName
這是表示聲音檔在上傳Myinstants時，在Myinstants的上傳畫面中Name欄位所輸入的值，主要是用在當Myinstants將聲音檔案連結更換後，使用UpdateAudioSource.js更新audios.js中每個聲音檔的url欄位，因為部分聲音檔在上傳Myinstants時，名稱會與檔案名稱不同(例如在上傳hell world.mp3檔時，如果Name欄位是輸入hell world可能會上傳不上去，因此AutoUpload.js腳本會將Name欄位改成輸入hell_world來上傳)。
