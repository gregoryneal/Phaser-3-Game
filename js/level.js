import { BaseLevel, UIScene } from "./scenes.js";

//This class handles registering levels from data
//just like the upgrade managers
//should also handle transitions between scenes and levels
//TODO: Add a scene transition cover taht is just a blank screen with a loading sprite
//it will be triggered on scene transition and last until the new scene calls this.endcreate or something
export class LevelManager extends Phaser.Plugins.BasePlugin {
    constructor(manager) {
        super(manager);

        this.tutorialLevels = [];

        // a list of scene keys that are playable levels
        // they are in order, make sure these keys match
        //the level keys in the levels.json config file
        //anything in this list will be loaded as a level
        this.levels = [
            'level1',
        ];
        this.uiSceneKey = 'ui-scene';
        this.mainMenuSceneKey = 'main-menu-scene';
        this.levelsMap = new Map();
    }

    //every level is a base level, and when we transition to the level
    //this class is maybe responsible for setting up the initial spawn 
    init() {
        for (let i = 0; i < this.levels.length; i++) {
            let lvl = new BaseLevel(this.levels[i]);
            this.levelsMap.set(this.levels[i], lvl);

            this.game.scene.add(this.levels[i], lvl);
        }

        this.UILvl = new UIScene(this.uiSceneKey);
        this.game.scene.add(this.uiSceneKey, this.UILvl);
    }

    getNextLevel(key) {
        let i = this.levels.indexOf(key);
        if (i > -1 && i < this.levels.length-1) {
            return this.levels[i+1];
        }
        return false;
    }

    //currentScene is the scene object we are transitioning from
    //newSceneKey is the key of the scene we are transitioning to
    //data is optional object that will be given to the new scene
    //data should include which game level to start the player off with
    //keep sleep default to true because we assume we are transitioning
    //from the main menu to a level, so we want to sleep the main menu
    //calling transitionToMainMenu will set sleep=false so that it shuts down
    transitionToLevel(currentScene, newSceneKey, sleep=true, data={}) {
        //console.log(`Transitioning from ${currentScene.scene.key} to ${newSceneKey}!`);
        let newScene = this.levelsMap.get(newSceneKey).scene;
        //start the ui scene in parallel with the new scene
        /*newScene
        .launch(this.uiSceneKey, data);

        newScene.bringToTop(this.uiSceneKey);

        let started = currentScene.scene.transition({
            target: newSceneKey,
            duration: 400, 
            data: data,
            sleep: sleep,
            moveBelow: true,
        });*/

        //launch a UI scene FIRST then launch the level underneath it
        //do this so that the UI scene renders the COVER sizer before we
        //start rendering the scene background and scenery, etc. This prevents
        //weird pop in, and is more configurable, as we can configure the
        //sizer with a faux loading animation while we set everything up

        let started = currentScene.scene.transition({
            target: this.uiSceneKey,
            duration: 1000,
            data: {
                levelKey: newSceneKey,
            },
            sleep: sleep,
            moveBelow: true
        })

        if (started) {
            if (currentScene.shutdown && typeof currentScene.shutdown == 'function') {
                currentScene.shutdown();
            }
        }
        else {
            //close the opened ui scene
            //newScene.stop(this.uiSceneKey);
            console.log('scene transition was not started');
        }
    }

    transitionToMainMenu(scene, data={}) {
        this.transitionToLevel(scene, this.mainMenuSceneKey, false, data);
    }

    //launch a ui scene in parallel with the provided scene
    launchUIScene(scene, data={}) {        
        //launch the ui scene in parallel with this scene
        scene.scene
        .launch(this.uiSceneKey, data)
        .bringToTop(this.uiSceneKey); //render ui scene on top
        console.log("AALSK:J:FDLKJ");
    }

    closeCover() {
        if (this.UILvl) {
            this.UILvl.closeCover();
        }
    }

    isPointerOverGameUI() {
        if (this.UILvl) {
            return this.UILvl.isPointerOverUI();
        }
    }
}