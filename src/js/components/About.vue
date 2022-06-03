<template>
    <v-dialog :value="value" @input="oninput" width="600">
        <v-card>
            <v-card-title>
                <w-icon></w-icon>
                關於
            </v-card-title>
            <v-card-text>
                大濕之音 v{{VERSION}}
                <br/>
                作者：jack850628
                <br/>
                聲音來源：
                <a href="https://www.twitch.tv/h804232006" target="_bloak">仙界大濕</a>
                <a href="https://www.twitch.tv/magicgadra3" target="_bloak">嘎抓</a>
                <a href="https://www.twitch.tv/sum_91318" target="_bloak">桑尤姆</a>
                <a href="https://www.twitch.tv/jjg60205" target="_bloak">皮卡屁</a>
                <br/>
                原始碼:
                <a href="https://github.com/jack850628/wet-elephant-sound" target="_bloak">github</a>
                <br/>
                更多APP:
                <a href="https://jack850628.github.io/" target="_bloak">點這裡</a>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text  @click="oninput(false)">
                    關閉
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
const PACKAGE = require('../../../package.json');

export default {
    props: {
        value: {
            type: Boolean,
            default: false,
        }
    },
    data(){
        return {
            VERSION: PACKAGE.version,
        };
    },
    methods:{
        oninput(v){
            this.$emit('input', v);
        }
    }
}
</script>