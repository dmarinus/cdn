
var queu = [
    {building: 'wood', level: 5}, {building: 'stone', level: 5},{building: 'iron', level: 5},{building: 'storage', level: 5}, {building: 'farm', level: 5},
    {building: 'wood', level: 6}, {building: 'stone', level: 6},{building: 'iron', level: 6},{building: 'storage', level: 6}, {building: 'farm', level: 6},
    {building: 'wood', level: 7}, {building: 'stone', level: 7},{building: 'iron', level: 7},{building: 'storage', level: 7}, {building: 'farm', level: 7},
    {building: 'wood', level: 8}, {building: 'stone', level: 8},{building: 'iron', level: 8},{building: 'storage', level: 8}, {building: 'farm', level: 8},
    {building: 'wood', level: 9}, {building: 'stone', level: 9},{building: 'iron', level: 9},{building: 'storage', level: 9}, {building: 'farm', level: 9},
    {building: 'wood', level: 10}, {building: 'stone', level: 10},{building: 'iron', level: 10},{building: 'storage', level: 10}, {building: 'farm', level: 10},
    {building: 'wood', level: 11}, {building: 'stone', level: 11},{building: 'iron', level: 11},{building: 'storage', level: 11}, {building: 'farm', level: 11},
    {building: 'wood', level: 12}, {building: 'stone', level: 12},{building: 'iron', level: 12},{building: 'storage', level: 12}, {building: 'farm', level: 12},
    {building: 'wood', level: 13}, {building: 'stone', level: 13},{building: 'iron', level: 13},{building: 'storage', level: 13}, {building: 'farm', level: 13},
    {building: 'wood', level: 14}, {building: 'stone', level: 14},{building: 'iron', level: 14},{building: 'storage', level: 14}, {building: 'farm', level: 14},
    {building: 'wood', level: 15}, {building: 'stone', level: 15},{building: 'iron', level: 15},{building: 'storage', level: 15}, {building: 'farm', level: 15},
    {building: 'wood', level: 16}, {building: 'stone', level: 16},{building: 'iron', level: 16},{building: 'storage', level: 16}, {building: 'farm', level: 16},
    {building: 'wood', level: 17}, {building: 'stone', level: 17},{building: 'iron', level: 17},{building: 'storage', level: 17}, {building: 'farm', level: 17},
    {building: 'wood', level: 18}, {building: 'stone', level: 18},{building: 'iron', level: 18},{building: 'storage', level: 18}, {building: 'farm', level: 18},
    {building: 'wood', level: 19}, {building: 'stone', level: 19},{building: 'iron', level: 19},{building: 'storage', level: 19}, {building: 'farm', level: 19},
    {building: 'wood', level: 20}, {building: 'stone', level: 20},{building: 'iron', level: 20},{building: 'storage', level: 20}, {building: 'farm', level: 20},
    {building: 'main', level: 15}, {building: 'wall', level: 10}, {building: 'barracks', level: 10},
    {building: 'wood', level: 21}, {building: 'stone', level: 21},{building: 'iron', level: 21},{building: 'storage', level: 21}, {building: 'farm', level: 21},
    {building: 'wood', level: 22}, {building: 'stone', level: 22},{building: 'iron', level: 22},{building: 'storage', level: 22}, {building: 'farm', level: 22},
    {building: 'wood', level: 23}, {building: 'stone', level: 23},{building: 'iron', level: 23},{building: 'storage', level: 23}, {building: 'farm', level: 23},
    {building: 'wood', level: 24}, {building: 'stone', level: 24},{building: 'iron', level: 24},{building: 'storage', level: 24}, {building: 'farm', level: 24},
    {building: 'wood', level: 25}, {building: 'stone', level: 25},{building: 'iron', level: 25},{building: 'storage', level: 25}, {building: 'farm', level: 25},
    {building: 'main', level: 20}, {building: 'wall', level: 15}, {building: 'barracks', level: 15},
    {building: 'wood', level: 26}, {building: 'stone', level: 26},{building: 'iron', level: 26},{building: 'storage', level: 26}, {building: 'farm', level: 26},
    {building: 'wood', level: 27}, {building: 'stone', level: 27},{building: 'iron', level: 27},{building: 'storage', level: 27}, {building: 'farm', level: 27},
    {building: 'wood', level: 28}, {building: 'stone', level: 28},{building: 'iron', level: 28},{building: 'storage', level: 28}, {building: 'farm', level: 28},
    {building: 'wood', level: 29}, {building: 'stone', level: 29},{building: 'iron', level: 29},{building: 'storage', level: 29}, {building: 'farm', level: 29},
    {building: 'wood', level: 30}, {building: 'stone', level: 30},{building: 'iron', level: 30},{building: 'storage', level: 30}, {building: 'farm', level: 30},
    {building: 'wall', level: 20}, {building: 'smith', level: 20}, {building: 'market', level: 10}, {building: 'barracks', level: 25}, {building: 'stable', level: 20}, {building: 'academy', level: 1},{building: 'workshop', level: 5}
    ];
    
const processQueue = () => {
    if(queu.length == 0){
        console.log('READY!!!');
        clearInterval(interval);
        return;
    }

    var upgradeButton = document.querySelectorAll("a[data-building='" + queu[0].building + "']")[0];

    if(!upgradeButton){
        console.log('upgradeButton for ' +  queu[0].building + ' not found');
        queu.shift();
        processQueue();
        return;
    }

    var level = upgradeButton.getAttribute('data-level-next');
    if(level > queu[0].level){
        console.log( queu[0].building + ' is already level ' +  queu[0].level );
        queu.shift();
        processQueue();
        return;
    }

    if(upgradeButton.style.display == 'none'){
        console.log('Waiting to upgrade ' + queu[0].building);
        return;
    }

    upgradeButton.click();
    console.log(queu[0].building + 'added to upgrade queue!');
}

var interval = setInterval(processQueue,2000);

