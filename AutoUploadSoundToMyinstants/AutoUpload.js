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
var idStartFrom = 0;



var sounds = [], uploadFails = [], uploadSuccess = [];
var searched = [], searchNotFind = [];

async function upLoadSound(page, file){
  await page.goto('https://www.myinstants.com/en/new/', {
    waitUntil: 'load'
  });
  const input = await page.$('#id_sound')
  await input.uploadFile(file.path)
  await page.type('#id_name', file.newName); 
  await page.evaluate(() => {
    document.querySelector("#id_accept_terms").click();
  });
  setTimeout(()=>{
    // page.click('button[type="submit"]');
    page.evaluate(() => {
      document.querySelector('button[type="submit"]').click();
    });
  }, 1000);//防止上傳到重覆檔案時繼續不了
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
  var haveSuffix = name.match(/^.+?：『/);
  if(haveSuffix){
    suffix = haveSuffix[0];
    name = name.match(new RegExp(`^${suffix}(.*?)${stem}`))[1];
  }
  name = name.replace(/\s/g, '_').replace(/\.mp3$/, '');
  return (haveSuffix || name.match(/^[\w\s_~]+$/))? `${suffix}${name}${stem}`: name;
}

async function searchSound(page, file, id){
  const searchBox = await page.$('#searchbar input[type="search"]');
  const form = await page.$('#searchbar');
  await searchBox.type(file.newName.padEnd(2));
  await Promise.all([
    await form.evaluate(form => form.submit()),
    page.waitForNavigation({waitUntil: 'load'})
  ]);

  const loading = await page.$('#loading');
  do{
    await page.evaluate(() => {
      window.scrollTo(0, window.document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);
  }while(await loading.evaluate(el => el.style.display != 'none'));

  const soundButton = await page.$(`button[title="Play ${file.newName} sound"]`) 
  if(soundButton){
    console.log('搜尋到', file);
    searched.push({
      name: file.displayName,
      onMyinstantsName: file.newName,
      url: await page.evaluate(el => el.getAttribute('onclick').match(/.+?\('(.*?)',.*?\)/)[1], soundButton),
      id: id
    });
    return true;
  }else{
    console.log('沒搜尋到', file);
    searchNotFind.push(file);
    return false;
  }
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

  if(argv.idStartFrom){
    idStartFrom = argv.idStartFrom
  }

  var files = await fs.readdirSync(soundDirectory)
  await Promise.all(files.map(async (item)=>{
    let type = await fs.statSync(soundDirectory + '\\' + item);
    if(type.isFile()){
      sounds.push({
        name: item,
        displayName: item.replace(/\.mp3$/, ''),
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
  await page.setDefaultNavigationTimeout(0); 
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
  let resultPathname = '';
  for(let i = 0; i < sounds.length; i++){
    resultPathname = await upLoadSound(page, sounds[i]);
    if(resultPathname != '/en/favorites/'){
      uploadFails.push(sounds[i]);
      await fs.renameSync(sounds[i].path, soundDirectory + UPLOAD_FAIL_SOUNDS_DIR + '\\' + sounds[i].name);
      await page.reload({
        waitUntil: 'load'
      });
    }else{
      uploadSuccess.push(sounds[i]);
      await fs.renameSync(sounds[i].path, soundDirectory + UPLOAD_SUCCESS_SOUNDS_DIR + '\\' + sounds[i].name);
    }
  }
  if(resultPathname != '/en/favorites/'){
    await page.goto('https://www.myinstants.com/en/favorites/', {
      waitUntil: 'load'
    });
  }
  for(let sound of uploadSuccess){
    if(await searchSound(page, sound, idStartFrom)) idStartFrom++;
  }
  console.log('這些聲音上傳完成', searched);
  console.log('這些聲音上傳完成但搜尋不到', searchNotFind);
  console.log('這些聲音上傳失敗', uploadFails);
  await browser.close();
})();