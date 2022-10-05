<template>
    <div id="play-controller">
        <p v-if="showQueue" style="margin-bottom: 0px;">提示：對播放序列中的按鈕，拖曳可以排序，點一下可以移除，按右鍵可以下載語音。</p>
        <div id="hint">
            <span v-if="audioPlayQueue.length == 0">播放序列</span>
            <draggable id="draggable" v-if="showQueue" v-model="audioPlayQueue">
                <v-btn dark elevation="3" v-for="(item, k) in audioPlayQueue" :key="k" :class="{button: true, 'play-item': k == playIndex}" @click="removeQueueItem(k)" @touchstart="queueButtonTouchDown(item)" @touchmove="queueButtonTouchMove(item)" @touchend="queueButtonTouchUp(item, k)" @contextmenu="!item.second? contextMenu($event, item): ()=>{}" :disabled="playing">{{item.name}}</v-btn>
            </draggable>
        </div>
        <div style="margin-bottom: 15px;">
            <v-btn dark elevation="3" @click="playButton" :disabled="playing">
                <v-icon>mdi-play</v-icon>
                <span>播放</span>
            </v-btn>
            <v-btn dark elevation="3" @click="smoothPlayButton" :disabled="playing">
                <v-icon>mdi-play</v-icon>
                <span>流暢播放</span>
            </v-btn>
            <v-btn dark elevation="3" @click="stop">
                <v-icon>mdi-stop</v-icon>
                <span>停止</span>
            </v-btn>
            <v-btn dark elevation="3" @click="showValuePanel = true">
                <v-icon>mdi-volume-high</v-icon>
                <span>音量</span>
            </v-btn>
            <v-btn v-if="showClean" dark elevation="3" @click="clearButton" :disabled="playing">
                <v-icon>mdi-delete</v-icon>
                <span>清空</span>
            </v-btn>
            <v-btn v-if="showDownload" dark elevation="3" @click="downloadAudioButton" :disabled="playing">
                <v-icon>mdi-download</v-icon>
                <span>下載</span>
            </v-btn>
            <slot>

            </slot>
        </div>

        <v-menu v-model="showMenu" :position-x="menuX" :position-y="menuY" absolute offset-y>
            <v-list>
                <v-list-item @click="contextMenuItemClick($event, 0)">
                    <v-list-item-title v-text="'下載語音'"></v-list-item-title>
                </v-list-item>
                <v-list-item @click="contextMenuItemClick($event, 1)">
                    <v-list-item-title v-text="'複製一個'"></v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
        
        <v-dialog v-model="downloading" width="600" persistent>
            <v-card>
                <v-card-title>
                    下載中
                </v-card-title>
                <v-progress-linear v-model="downloadScheduleValue" :indeterminate="downloadScheduleValue == 0" rounded height="20">
                    <strong>{{downloadScheduleValue}}%</strong>
                </v-progress-linear>
                <v-card-actions>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showValuePanel" width="600">
            <v-card>
                <v-card-title>
                    <v-icon>mdi-volume-high</v-icon>
                    音量
                </v-card-title>
                <br>
                <v-card-text>
                    <v-slider v-model="audioVolume" :min="0" :max="100" prepend-icon="mdi-volume-high">
                        <template v-slot:append>
                            <span style="width: 30px">{{audioVolume}}</span>
                        </template>
                    </v-slider>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="showValuePanel = false">
                        關閉
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import draggable from 'vuedraggable';
import {playByteArray, stopByteArray, downloadAudio, setValue} from '@/js/smoothPlay';

const SOUND_SOURCE = 'https://www.myinstants.com';
const SOUND_SOURCE_2 = 'https://wet-elephant-sound-audio-get.myonedriveindex.workers.dev';

export default {
    components: {
        draggable,
    },
    props: {
        value: {
            type: Array,
            default: () => [],
        },
        showQueue: {
            type: Boolean,
            default: true
        },
        showDownload: {
            type: Boolean,
            default: true
        },
        showClean: {
            type: Boolean,
            default: true
        }
    },
    methods: {
        checkAudioPlayQueue(){
            if(this.playing && this.playIndex + 1 < this.audioPlayQueue.length){
                let audio = this.audioPlayQueue[++this.playIndex];
                if(audio.second){
                    this.delayId = setTimeout(() => {
                        this.delayId = null;
                        this.checkAudioPlayQueue();
                    }, audio.second);
                }else if(audio.url){
                    this.play(audio.url);
                }
            }else{
                this.stop();
            }
        },
        play(url){
            this.audioPlayer.src = SOUND_SOURCE + url;
            this.audioPlayer.volume = this.audioVolume / 100;
            this.audioPlayer.play();
        },
        playButton(){
            if(this.audioPlayQueue.length > 0){
                this.playing = true;
                this.checkAudioPlayQueue();
            }
        },
        smoothPlayButton(){
            if(this.audioPlayQueue.length > 0){
                this.playing = true;
                this.prepareAudios().then((arrayBuffers) => {
                    playByteArray(arrayBuffers, (index) => this.playIndex = index, this.stop);
                });
            }
        },
        stop(){
            this.playing = false;
            this.playIndex = -1;
            if(this.delayId){
                this.delayId = null;
                clearTimeout(this.delayId);
            }
            this.audioPlayer.pause();
            stopByteArray();
        },
        clearButton(){
            this.audioPlayQueue.splice(0, this.audioPlayQueue.length);
        },
        removeQueueItem(index){
            this.audioPlayQueue.splice(index, 1);
        },
        queueButtonTouchDown(item){
            item.toTouchDelete = true;
            item.touchTimePoint = Date.now();
        },
        queueButtonTouchMove(item){
            item.toTouchDelete = false;
        },
        queueButtonTouchUp(item, key){
            if(item.toTouchDelete && Date.now() - item.touchTimePoint < 300)
                this.removeQueueItem(key);
        },
        downloadAudioButton(){
            if(this.audioPlayQueue.length > 0){
                this.downloading = true;
                this.prepareAudios().then((arrayBuffers) => {
                    downloadAudio(arrayBuffers, (scheduleValue) => {
                        if(scheduleValue != 100){
                            this.downloadScheduleValue = scheduleValue;
                        }else{
                            this.downloadScheduleValue = 0;
                            this.downloading = false;
                        }
                    });
                }).catch(e => {
                    this.downloading = false;
                    console.log(e)
                });
            }
        },
        prepareAudios(){
            return new Promise((resolve, reject) => {
                var process = [];
                for(let audio of this.audioPlayQueue){
                    if(audio.arrayBuffer) continue;
                    process.push(
                        fetch((audio.second? '': SOUND_SOURCE_2) + audio.url)
                            .then(response => response.blob())
                            .then(blob => blob.arrayBuffer())
                            .then(audioBuffer => audio.arrayBuffer = audioBuffer)
                    );
                }
                Promise.all(process)
                    .then((p) => resolve(this.audioPlayQueue.map(a => a.arrayBuffer)))
                    .catch(e => reject(e));
            });
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
                case 1:
                    this.audioPlayQueue.push(this.itemByShowMenu);
                    break;
            }
        },
    },
    watch:{
        audioPlayQueue(v){
            this.$emit('input', v);
        },
        audioVolume(v){
            setValue(v / 100);
            this.$emit('change-volume', v);
            localStorage.setItem('audioVolume', v);
        }
    },
    data(){
        return {
            audioPlayer: null,

            audioPlayQueue: this.value,

            timeoutId: null,
            delayId: null,
            playing: false,
            playIndex: -1,

            downloading: false,
            downloadScheduleValue: 0,

            showMenu: false,
            itemByShowMenu: null,
            menuX: 0,
            menuY: 0,

            showValuePanel: false,
            audioVolume: null,
        };
    },
    mounted(){
        this.audioPlayer = new Audio();
        this.audioPlayer.onended = this.checkAudioPlayQueue;
        this.audioVolume = localStorage.audioVolume? parseFloat(localStorage.audioVolume): 50;
    }
}
</script>
<style scoped>
    #play-controller{
        overflow: auto;
        max-height: 100%;
        display: flex;
        flex-direction: column;
    }
    #draggable{
        margin-top: 15px; 
        margin-bottom: 15px;
        min-height: 40px;
        flex: 0; 
        overflow: auto;
        overscroll-behavior: contain;
        background-color: #ffffff26;
    }
    #hint{
        position: relative;
    }
    #hint > span{
        color: #cdcdcd;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
    }
    .play-item.v-btn.v-btn--disabled.v-btn--has-bg{
        background-color: orange !important;
        color: white !important;
    }
</style>