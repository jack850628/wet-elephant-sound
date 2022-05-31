const puppeteer = require('puppeteer');
// import puppeteer from 'puppeteer'
const yargs = require('yargs/yargs')
// import yargs from 'yargs/yargs'
const { hideBin } = require('yargs/helpers')
// import { hideBin } from 'yargs/helpers'

// import {default as audios} from '../src/js/audios.mjs'
const audios = require('../src/js/audios')


const argv = yargs(hideBin(process.argv)).argv


var csrftoken = null;
var sessionId = null;


async function getNewUrl(page, data){
  let name = data.name;
  let b = await page.$(`[alt="Play ${name} sound"]`)

  if(!b){
    name = `大濕『${data.name}』`;
    b = await page.$(`[alt="Play ${name} sound"]`)
    if(!b){
      name = `大濕：『${data.name}』`;
      b = await page.$(`[alt="Play ${name} sound"]`)
      if(!b){
        name = `大濕：「${data.name}」`
        b = await page.$(`[alt="Play ${name} sound"]`)
        if(!b){
          name = `大濕：${data.name}`;
          b = await page.$(`[alt="Play ${name} sound"]`)
        }
      }
    }
  }

  if(!b){
    name = data.name.replace(/\s/g, '_');
    b = await page.$(`[alt="Play ${name} sound"]`)
    if(!b){
      name = `大濕：『${name}』`;
      b = await page.$(`[alt="Play ${name} sound"]`)
    }
  }

  if(!b && data.name.match(/^\w+/)){
    name = data.name.replace(/\s/g, '_');
    name = `大濕：『_${name}』`;
    b = await page.$(`[alt="Play ${name} sound"]`)
    if(!b){
      name = data.name.replace(/\s/g, '_');
      name = `大濕：『_${name}_』`;
      b = await page.$(`[alt="Play ${name} sound"]`)
    }
  }

  if(!b && data.name.match(/\d+$/)){
    let d = data.name.match(/(.+?)(\d+)$/);
    name = `${d[1]}_${d[2]}`;
    b = await page.$(`[alt="Play ${name} sound"]`)
    if(!b && data.name.match(/\d+$/)){
      name = data.name.replace(/\s/g, '_');
      b = await page.$(`[alt="Play ${name} sound"]`)
    }
  }

  if(!b && data.name.match(/^.+?\w+.*$/)){
    let d = data.name.match(/^(.+?)(\w+)(.*)$/);
    if(d[3])
      name = `${d[1]}_${d[2]}_${d[3]}`;
    else
      name = `${d[1]}_${d[2]}`;
    b = await page.$(`[alt="Play ${name} sound"]`)
  }

  if(!b){
    console.error(`聲音 ${data.name} 找不到`);
    return;
  }
  data.url = await page.evaluate(el => el.getAttribute('onclick').match(/play\('(.+?)'\)/)[1], b);
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

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: false // 無外殼的 Chrome，有更佳的效能
  });
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
  await page.setDefaultNavigationTimeout(0); 
  await page.goto('https://www.myinstants.com/en/favorites/', {
    waitUntil: 'load'
  });
  for(let g of audios){
      for(let a of g.datas){
        await getNewUrl(page, a);
      }
  }
  await browser.close();
  console.log('結束', JSON.stringify(audios));
})();