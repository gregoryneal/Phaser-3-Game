import { MainMenu, PreloadScene, UIScene, LevelOne } from './scenes.js';
import { SaveManager } from './save.js';
import { InGameUpgradeManager, PersistentUpgradeManager } from './upgrade.js';
import { LevelManager } from './level.js';
import { EnemyManager } from './enemy.js';
import { Player } from './player.js';
import { SpawnManager } from './spawn.js';

/* NOTE ON ANIMATIONS:
-importing animations from aseprite files uses the tag name defined in the aseprite file as the animation keys
-make sure to export animations in the format of {title}-{tag} where title is the file name without the path or file type
 and tag is the tag name for each animation in the file
-make sure to export png and json data with the same name as the key you plan to assign it in the game
-when you search for specific tags in javascript, make sure to use an animation key that looks like {title}-{filename} from above
*/

$(window).on('load', function (event) {

    const config = {
        type: Phaser.AUTO,
        parent: 'game-wrapper',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        //width: screenDim[0],
        //height: screenDim[1],
        scene: [
            PreloadScene, 
            MainMenu,
            UIScene,
            //LevelOne,
        ],
        pixelArt: true,
        hidePhaser: true,
        dom: {
            createContainer: false,
        },
        //disableContextMenu: true,
        physics: {
            arcade: {
                gravity: {
                    y: 0,
                },
                debug: true,
            }, 
            matter: {
                gravity: {
                    y: 0,
                },
                debug: {
                    showBody: true,
                    showStaticBody: true,
                }
            },
            default: "arcade"
        },
        plugins: {
            global: [
                { key: 'SaveManager', plugin: SaveManager, start: true, mapping: 'saveManager' },
                { key: 'PersistentUpgradeManager', plugin: PersistentUpgradeManager, start: true, mapping: 'persistentUpgradeManager' },
                { key: 'LevelManager', plugin: LevelManager, start: true, mapping: 'levelManager' },
            ],
            scene: [
                { key: 'EnemyManager', plugin: EnemyManager, start: false, mapping: 'enemyManager' },
                { key: 'PlayerManager', plugin: Player, start: false, mapping: 'player' },
                { key: 'SpawnManager', plugin: SpawnManager, start: false, mapping: 'spawnManager' },
                { key: 'InGameUpgradeManager', plugin: InGameUpgradeManager, start: true, mapping: 'inGameUpgradeManager' },
            ]
        }
    }

    var game;
    //var game = new Phaser.Game(config);

    //play the game when we click the button
    //on(events, selector, data, handler); data is event.data object
    $('#pizzapartybutton').on('click', null, {game: game, config: config}, function(event){

        //remove buttons and play game
        $("#daboisbutton").fadeOut(400);
        $("#pizzapartybutton").fadeOut(400, function() {
            event.data.game = new Phaser.Game(event.data.config);
        });        
    });
});

