const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv)).argv


var CSRFTOKEN = null;
var SESSIONID = null;
var soundDirectory = null;

const uploadFailSoundsDir = '\\fails';


var sounds = [], uploadFails = [];

async function upLoadSound(page, file){
  await page.goto('https://www.myinstants.com/new/', {
    waitUntil: 'load'
  });
  const input = await page.$('#id_sound')
  await input.uploadFile(file.path)
  await page.type('#id_name', file.newName); 
  await page.evaluate(() => {
    document.querySelector("#id_accept_terms").parentElement.click();
  });
  setTimeout(()=>page.click('input[type="submit"][value="Create"]'), 1000);//防止上傳到重覆檔案時繼續不了
  await page.waitForNavigation({
    waitUntil: 'domcontentloaded'
  });
  var url = new URL(await page.url());
  console.log(url.pathname, file);
  return url.pathname;
}

function getNewName(name){
  var stem = '』';
  var suffix = '大濕：『';
  var haveSuffix = name.match(/^.{2}：『/);
  if(haveSuffix){
    suffix = haveSuffix[0];
    name = name.match(new RegExp(`^${suffix}(.*?)${stem}`))[1];
  }
  name = name.replace(/\s/g, '_').replace(/\.mp3$/, '');
  return (haveSuffix || name.match(/^[\w\s_~]+$/))? `${suffix}${name}${stem}`: name;
}

(async () => {
  if(!argv.token){
    console.error('缺少參數 --token');
    return;
  }
  CSRFTOKEN = argv.token;
  
  if(!argv.sessionId){
    console.error('缺少參數 --sessionId');
    return;
  }
  SESSIONID = argv.sessionId;

  if(!argv.path){
    console.error('缺少參數 --path');
    return;
  }
  soundDirectory = argv.path;

  var files = await fs.readdirSync(soundDirectory)
  await Promise.all(files.map(async (item)=>{
    let type = await fs.statSync(soundDirectory + '\\' + item);
    if(type.isFile()){
      sounds.push({
        name: item,
        newName: getNewName(item),
        path: soundDirectory + '\\' + item
      })
    }
  }));
  const browser = await puppeteer.launch({
    executablePath:
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false // 無外殼的 Chrome，有更佳的效能
  });

  if (!fs.existsSync(soundDirectory + uploadFailSoundsDir)){
    fs.mkdirSync(soundDirectory + uploadFailSoundsDir);
  }

  const page = await browser.newPage();
  await page.setCookie({
    name: 'csrftoken',
    value: CSRFTOKEN,
    domain: 'www.myinstants.com'
  },
  {
    name: 'sessionid',
    value: SESSIONID,
    domain: 'www.myinstants.com'
  });
  for(let i = 0; i < sounds.length; i++){
    let resultPathname = await upLoadSound(page, sounds[i]);
    if(resultPathname != '/favorites/'){
      uploadFails.push(sounds[i]);
      await fs.renameSync(sounds[i].path, soundDirectory + uploadFailSoundsDir + '\\' + sounds[i].name);
      await page.reload({
        waitUntil: 'load'
      });
    }
  }
  console.log('這些聲音上傳失敗', uploadFails);
  await browser.close();
})();