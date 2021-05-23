const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv)).argv

const UPLOAD_FAIL_SOUNDS_DIR = '\\fails';
const UPLOAD_SUCCESS_SOUNDS_DIR = '\\success';

var csrftoken = null;
var sessionId = null;
var soundDirectory = null;



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
  csrftoken = argv.token;
  
  if(!argv.sessionId){
    console.error('缺少參數 --sessionId');
    return;
  }
  sessionId = argv.sessionId;

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
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false // 無外殼的 Chrome，有更佳的效能
  });

  if (!fs.existsSync(soundDirectory + UPLOAD_FAIL_SOUNDS_DIR)){
    fs.mkdirSync(soundDirectory + UPLOAD_FAIL_SOUNDS_DIR);
  }
  if (!fs.existsSync(soundDirectory + UPLOAD_SUCCESS_SOUNDS_DIR)){
    fs.mkdirSync(soundDirectory + UPLOAD_SUCCESS_SOUNDS_DIR);
  }

  const page = await browser.newPage();
  await page.setCookie({
    name: 'csrftoken',
    value: csrftoken,
    domain: 'www.myinstants.com'
  },
  {
    name: 'sessionid',
    value: sessionId,
    domain: 'www.myinstants.com'
  });
  for(let i = 0; i < sounds.length; i++){
    let resultPathname = await upLoadSound(page, sounds[i]);
    if(resultPathname != '/favorites/'){
      uploadFails.push(sounds[i]);
      await fs.renameSync(sounds[i].path, soundDirectory + UPLOAD_FAIL_SOUNDS_DIR + '\\' + sounds[i].name);
      await page.reload({
        waitUntil: 'load'
      });
    }else
      await fs.renameSync(sounds[i].path, soundDirectory + UPLOAD_SUCCESS_SOUNDS_DIR + '\\' + sounds[i].name);
  }
  console.log('這些聲音上傳失敗', uploadFails);
  await browser.close();
})();