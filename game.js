function gLoad(vApp){
    const GAME_STATUS = {
        READY: 0,
        STARTING: 1,
        ENDED: 2
    };
    const STYLE_BLOCKS = document.getElementsByTagName('link')[0];
    const STYLE = document.createElement('style');
    STYLE.innerHTML = `
        .fixed{
            position: fixed !important;
            bottom 30px;
        }
    `;
    STYLE_BLOCKS.parentNode.insertBefore(STYLE, STYLE_BLOCKS);
    var status = GAME_STATUS.ENDED;
    var titleIcon = document.querySelector('#title-icon');
    var audioPlayQueueBar = this.document.querySelector('#audio-play-queue-bar');
    var p = audioPlayQueueBar.nextElementSibling.querySelector('p');
    var divInput = audioPlayQueueBar.nextElementSibling.querySelector('div.v-input');
    var divItemGroup = audioPlayQueueBar.nextElementSibling.querySelector('div.v-item-group');

    var gameSatrt = function(){
        audioPlayQueueBar.hidden = true;
        p.hidden = true;
        divInput.hidden = true;
        divItemGroup.hidden = true;

        vApp.searchString = '臭'

        titleIcon.classList.add('fixed');
    }

    titleIcon.addEventListener('click', function(){
        if(status == GAME_STATUS.ENDED){
            status = GAME_STATUS.READY;
            setTimeout(function(){
                gameSatrt();
            }, 1300);
        }
    });
}