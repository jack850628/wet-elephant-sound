id = 504;
data = [];
document.querySelectorAll('#content > div:nth-child(2) > div:nth-child(507) ~ .instant').forEach((i)=>{
    data.push({
        name: i.querySelector('.instant-link').innerText,
        url: i.querySelector('.small-button').getAttribute('onmousedown').match(/.+?\('(.*?)'\)/)[1],
        id: id++
    })
});
alert(JSON.stringify(data));