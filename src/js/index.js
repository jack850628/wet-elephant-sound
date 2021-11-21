import Vue from 'vue';
import vuetify from '@/plugins/vuetify';
import audios from '@/js/audios';

import WIcom from '@/js/components/WIcon.vue';
import PlayController from '@/js/components/PlayController.vue';
import About from '@/js/components/About.vue';

const SOUND_SOURCE = 'https://www.myinstants.com';
const SEARCH_PARAMS_1 = 'q', SEARCH_PARAMS_2 = 'i', SEARCH_PARAMS_3 = 's';
const IMAGE_SOURCE_HOST_FOR_SOUND_IMAGE = [
    'i.imgur.com',
    'imgur.com',
]

audios.flatMap(i => i.datas).forEach(i => {
    i.nameForScarch = i.name.match(/^(?:.*?：)?『?(.+?)\d*』?$/)[1].toUpperCase();
});

Vue.component('w-icon', WIcom);
Vue.component('play-controller',PlayController);
Vue.component('about', About);
window.onload = function(){
    var searchParams = new URLSearchParams(location.search);

    var vApp = new Vue({
        el: '#app',
        vuetify,
        data: {
            audio: null,

            body: null,
            audioPlayQueueBar: null,
            audioPlayQueueBarInvisible: false,
            audioPlayQueueBarToFiexd: false,
            audioPlayQueueBarHeight: 0,

            audios: audios,
            audioPlayQueue: [

            ],

            about: false,

            searchString: '',
            searchResaultButtons: [],

            share: false,
            shareLink: '',

            deferredPrompt: null,

            createSoundImage: false,
            soundImageLink: '',
            imageSourceLink: '',
            imageSourceLinkError: '',
            image: '',
            soundImageTitle: '',
            soundImageTitleError: null,
            
            showMenu: false,
            itemByShowMenu: null,
            menuX: 0,
            menuY: 0,
        },
        methods: {
            play(url){
                this.audioPlayer.src = SOUND_SOURCE + url;
                this.audioPlayer.play();
            },
            preview(audioData){
                if(this.timeoutId == null){
                    this.timeoutId = setTimeout(() => {
                        this.timeoutId = null;
                        audioData.url && this.play(audioData.url);
                    }, 500);
                }else{
                    clearTimeout(this.timeoutId);
                    this.timeoutId = null;
                    this.audioPlayQueue.push(audioData);
                }
            },
            shareButton(){
                this.shareLink = `${location.origin}${location.pathname}?${SEARCH_PARAMS_1}=${btoa(JSON.stringify(this.audioPlayQueue.map(i => i.id)))}`;
                this.share = true;
            },
            copyLink(){
                shareLink.select();
                document.execCommand("copy");
            },

            goToSoundImage(){
                this.createSoundImage = false;
                window.open(
                    `${location.origin}${location.pathname}soundImage.html` + 
                    `?${SEARCH_PARAMS_1}=${btoa(JSON.stringify(this.audioPlayQueue.map(i => i.id)))}` + 
                    `&${SEARCH_PARAMS_2}=${this.image}` + 
                    `&${SEARCH_PARAMS_3}=${btoa(escape(this.soundImageTitle))}`//btoa不支援中文字編碼，因此先將文字用escape轉成%u開頭的形式後便可編碼。
                    , "_blank"
                );
                this.imageSourceLink = '';
                this.soundImageTitle = '';
            },

            contextMenu(event, item){
                event.preventDefault();
                this.itemByShowMenu = item;
                this.showMenu = false;
                this.menuX = event.clientX;
                this.menuY = event.clientY;
                this.$nextTick(() => {
                    this.showMenu = true;
                });
            },
            contextMenuItemClick(event, index){
                switch(index){
                    case 0:
                        window.open(
                            SOUND_SOURCE + this.itemByShowMenu.url
                            , "_blank"
                        );
                        break;
                }
            },

            mainScroll(event){
                if(this.body.scrollTop > this.audioPlayQueueBar.offsetHeight){
                    this.audioPlayQueueBarInvisible = true;
                }else{
                    this.audioPlayQueueBarInvisible = false;
                }
            },
            dropDownAudioPlayQueueBar(){
                this.audioPlayQueueBarToFiexd = !this.audioPlayQueueBarToFiexd;
            },

            goToCollection(){
                window.open('/wet-elephant-sound-collection/');
            },
            shareToCollection(){
                window.open(`/wet-elephant-sound-collection/?a=${btoa(this.shareLink)}`);
            },

            async install(){
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
            }
        },
        watch:{
            imageSourceLink(value){
                try{
                    let url = new URL(value);
                    
                    if(!IMAGE_SOURCE_HOST_FOR_SOUND_IMAGE.find(i => i == url.host)){
                        this.imageSourceLinkError = '只允許imgur.com的連結';
                        this.image = '';
                    }else{
                        this.image = url.pathname.substr(1) + '.png';
                        this.imageSourceLinkError = null;
                    }
                }catch(e){
                    this.imageSourceLinkError = '無效連結';
                    this.image = '';
                }
            },
            soundImageTitle(value){
                this.soundImageTitleError = value.length > 50? '超過50個字': null;
            },
            audioPlayQueueBarToFiexd(value){
                value && (this.audioPlayQueueBarHeight = this.audioPlayQueueBar.offsetHeight);
            },
            searchString(str){
                this.searchResaultButtons.splice(0);
                if(str.match(/^\s*$/)) return;
                str = str.toUpperCase();
                this.searchResaultButtons.push(...audios.flatMap(i => i.datas).filter(i => {
                    return i.nameForScarch.indexOf(str) > -1 || str.indexOf(i.nameForScarch) > -1
                }));
            }
        },
        mounted(){
            this.audioPlayer = new Audio();
            this.body = document.querySelector('body');
            this.audioPlayQueueBar = document.querySelector('#audio-play-queue-bar');

            document.addEventListener('scroll', this.mainScroll);

            //gLoad(this);
        }
    });
    if(searchParams.get(SEARCH_PARAMS_1)){
        let array = JSON.parse(atob(searchParams.get(SEARCH_PARAMS_1)));
        let audioList = audios.flatMap(i => i.datas);
        vApp.$data.audioPlayQueue.push(...array.map(id => audioList.find(i => i.id == id)));
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        vApp.$data.deferredPrompt = e;
    });
}
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.bundle.js', { scope: './' });
    // .then(function(reg) {
    //     console.log('Registration succeeded. Scope is ' + reg.scope);
    // }).catch(function(error) {
    //     // registration failed
    //     console.log('Registration failed with ' + error);
    // });


}