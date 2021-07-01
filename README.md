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
node AutoUploadSoundToMyinstants\AutoUpload.js --token=<csrftoke> --sessionId=<sessionId> --path=<要上傳的分類的聲音所在資料夾的絕對路徑>
```
其中參數中的 csrftoke 和 sessionId 都是從瀏覽器的 Cookie 中取得。

運行完後可以看到原本資料夾下的聲音沒了，取而代之的是 success 和 fails 這兩個資料夾。
- success 上傳成功的聲音會被移往這裡
- fails 上傳失敗的聲音會被移往這裡

若在fails中有上傳失敗的聲音的話，請手動上傳來知道上傳失敗的原因。

上傳完成後，用瀏覽器登入 Myinstants 並前往[favorites](https://www.myinstants.com/favorites/)頁面，接者打開瀏覽器的 開發人員工具 並切換到 Console 分頁，然後，將 快速取得聲音.js 裡的腳本複製貼上到 Console 中但不要執行，接者切換到 Elements 分頁，找到新上傳的聲音按鈕的前一個按鈕(若沒有，就選擇第一個按鈕，那麼第一個聲音就必須手動取得連結)並找到該按鈕的
```
<div class="instant">
```
並對該 div 按滑鼠右鍵選擇 copy > copy selector 複製下按鈕的 css selector，接者切換回到 Console 頁面，將剛剛複製的 css selector 去取代將腳本中 var div 的
```
#content > div:nth-child(2) > div:nth-child(507)
```
接著將 var id 的 504 改為 0 ，接著就可以按下 enter 執行了。

執行完後就會得到一段 json 字串，將 json 字串複製下來貼到隨便一個 json format網站(例如：[jsonformatter](https://jsonformatter.curiousconcept.com/#))將 json 字串整理一下，接著就可以將 json 字串貼到 audios.js 中了。

### audios.js
在大濕之音中，所有的聲音都放在這個檔案中，在這個檔案中只有一個變數 audios ，這個變數是一個陣列，陣列中每一個項的內容為
```
{
      "name":"<分類名稱>",
      "datas":[
         {
            "name":"<聲音名稱>",
            "url":"<聲音的相對連結>",
            "id":<聲音的id(必須是唯一的)>
         },
         ...
      ]
 }
```
其中
#### url
datas 下的 url 可以在[favorites](https://www.myinstants.com/favorites/)頁面用 開發人員模式 中 Elements 分頁裡，去找到按紐的
```
<div class="small-button" onmousedown="play('<相對連結>')"></div>
```
其中， onmousedown 值中 play 函數的字串參數就是該按鈕的 相對連結 。
#### id
datas 下的 id 必須是唯一的值，目前我是用從 0 開始的遞增值，當要上傳聲音時，想要知道下一個聲音該用哪一個 id 時可以用瀏覽器開啟 index.html 並在 開發人員模式 中 Console 分頁裡執行腳本
```
audios.flatMap(i=>i.datas).length
```
執行後得到的數字就是下一個按鈕的 id ，這個 id 也是當要用 快速取得聲音.js 中腳本取得聲音時，要填入給 var id 的值。
