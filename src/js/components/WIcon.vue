<template>
    <v-img src="./images/兆元192.png" max-height="40" max-width="40" :class="{shake: shake}" @click="doShake"></v-img>
</template>
<script>
export default {
    methods: {
        doShake(){
            this.shake = true;
            this.tee.play();
        }
    },
    data(){
        return {
            shake: false,
            tee: null,
        };
    },
    mounted(){
        this.tee = new Audio('https://www.myinstants.com/media/sounds/m_fixed_WfYbRzx.mp3');
        this.tee.addEventListener('ended', () =>{
            this.shake = false;
        });
    }
}
</script>
<style scoped>
    .shake{
        animation: shake 0.35s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
</style>