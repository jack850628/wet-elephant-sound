import Vue from 'vue';
import vuetify from '@/plugins/vuetify';
// import audios from '@/js/audios';
const audios = require('@/js/audios')

import WIcom from '@/js/components/WIcon.vue';
import PlayController from '@/js/components/PlayController.vue';
import About from '@/js/components/About.vue';

Vue.component('w-icon', WIcom);
Vue.component('play-controller',PlayController);
Vue.component('about', About);

const SEARCH_PARAMS_1 = 'q', SEARCH_PARAMS_2 = 'i', SEARCH_PARAMS_3 = 's';

window.onload = function(){
    var searchParams = new URLSearchParams(location.search);
    var vApp = new Vue({
        el: '#app',
        vuetify,
        data: {
            audios: audios,
            about: false,
            audioPlayQueue: [

            ],

            image: '',
            soundImageTitle: '',

            share: false,
            shareLink: '',
        },
        methods: {
            shareButton(){
                this.shareLink = `${location.origin}${location.pathname}` + 
                                `?${SEARCH_PARAMS_1}=${btoa(JSON.stringify(this.audioPlayQueue.map(i => i.id)))}` + 
                                `&${SEARCH_PARAMS_2}=${this.image}` + 
                                `&${SEARCH_PARAMS_3}=${btoa(encodeURIComponent(this.soundImageTitle))}`//btoa不支援中文字編碼，因此先將文字用encodeURIComponent轉成%u開頭的形式後便可編碼。
                ;
                this.share = true;
            },
            copyLink(){
                navigator.clipboard.writeText(shareLink.value);
            },
            shareToCollection(){
                window.open(`/wet-elephant-sound-collection/?a=${btoa(this.shareLink)}&s=${btoa(encodeURIComponent(this.soundImageTitle))}`);
            },
        }
    });
    if(searchParams.get(SEARCH_PARAMS_1)){
        let array = JSON.parse(atob(searchParams.get(SEARCH_PARAMS_1)));
        let audioList = audios.flatMap(i => i.datas);
        vApp.$data.audioPlayQueue.push(...array.map(id => audioList.find(i => i.id == id)));
    }
    if(searchParams.get(SEARCH_PARAMS_2)){
        vApp.$data.image = searchParams.get(SEARCH_PARAMS_2);
    }
    if(searchParams.get(SEARCH_PARAMS_3)){
        vApp.$data.soundImageTitle = decodeURIComponent(atob(searchParams.get(SEARCH_PARAMS_3)));//btoa不支援中文字編碼，因此先將文字用encodeURIComponent轉成%u開頭的形式後便可編碼。
    }
}