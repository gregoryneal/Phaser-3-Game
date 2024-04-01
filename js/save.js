import { PlayerClasses, GameModes } from "./definitions.js";

//each scene can create it's own save manager
export class SaveManager extends Phaser.Plugins.BasePlugin {

    //don't save anything other than numbers, strings, bools and stuff
    //dates can be stringified and parsed, array of primitives are fine
    //don't save functions at all, we would have to use eval to parse them back. yuck
    constructor(pluginManager) {
        super(pluginManager);

        this.maxSaves = 10;
        this.events = new Phaser.Events.EventEmitter();
        //this is the list of strings that are used to load individual save files
        //in local storage, we have no reference to the saves themselves until they are loaded.
        //note, changing these after the game goes live is a big mistake, don't ever change these for any reason starting right............................................now
        this.saves = ['wehavetojustmakeasuperlong1','sentencesothatnoneofthewords2','haveachancetomatchanotherkeythat3','maybeusedtosaveinlocalstorage4','byanotherappandthatsallfornowfolks5'];
        this.saveKey = 'saveFile888';
        //this object is one that is set when we call _parseSave()
        //we may not want to overwrite our cached save yet
        this.parsedSave;
        //what an empty save looks like, reference it don't copy and paste it
        this.emptySave = {
            key: "",
            currentLevel: 1, //the current level of the game reached, planned to go up to 30
            persistentUpgrades: [], //string array of persistent uprade keys
            resentment: 0, //integer, will determine how much damage player takes and how much damage they deal
            playerLevel: 1, //player level
            gameMode: GameModes.BOUNTY,
            stardust: 0, //more valuable currency, used for persistent upgrades and class unlocks, and in game upgrades
            scrap: 0, //shit currency, used for in game upgrades
            isBossModeUnlocked: false, //self explanatory
            class: PlayerClasses.SPACE_MARINE
        };

        this.cachedSave;
    }

    start() {}

    //will overwrite the old upgrades list with the new one
    applyPersistentUpgrades(upgradeList, overwrite = false) {
        if (this.cachedSave) {
            this.cachedSave.persistentUpgrades = upgradeList;
            this.events.emit('cachedSaveChanged', this.cachedSave);
        }

        this._pushSave();
    }
    
    isBossModeUnlocked() {
        if (this.cachedSave) return this.cachedSave.isBossModeUnlocked;
    }
    
    doesSavedGameExist() {
        let s = localStorage.getItem(this.saveKey);
        if (s) return true;
        else return false;
    }

    //will create a save for the first empty save slot, if all save slots are full it will return false.
    getFirstEmptySave() {
        this._pushSave(); //save the current loaded game first
        for (let i = 0; i < this.saves.length; i++) {
            let save = localStorage.getItem(this.saves[i]);
            if (!save) {
                //create a new save
                let newSave = this.emptySave;
                newSave.key = this.saves[i];
                //set the new save as the cached save (load the save)
                this.cachedSave = newSave;
                //return the new save
                return this.cachedSave;
            }
        }

        return false;
    }

    /*
    //tries to get a saved game, if none exists, returns false
    tryGetGameSave() {
        this.parsedSave = null;
        this._parseSave();

        if (this.parsedSave) {
            return this.parsedSave;
        } else {
            return false;
        }
    }*/   

    //try to get a save by key, if none exists, return false
    tryGetSave(key) {
        let save = localStorage.getItem(key);
        if (save) {
            return JSON.parse(save);
        } else return false;
    }

    //get all saved games in a list
    getAllSaves() {
        let saves = [];
        for(let i = 0; i < this.saves.length; i++) {
            let save = this.tryGetSave(this.saves[i]);
            if (save) {
                saves.push(save);
            }
        }

        return saves;
    }

    //get the currently loaded save (this.cachedSave) if it is null or undefined return false
    getCurrentSave() {
        if (this.cachedSave) {
            return this.cachedSave;
        } else return false;
    }

    //clear all game saves
    clearGameSaves() {
        for(let i = 0; i < this.saves.length; i++) {
            localStorage.removeItem(this.saves[i]);
        }
    }

    generateSaveKey() {
        let randNum = function() { return (Math.random() * 1000).toString().padStart(3, '0'); }
        let keyBase = "saveFile-092-";
        //we want a random 3 digit number but we also want to pad the start with 0
        //if it is less than 3 digits long, like 003, 010, 049, etc
        let num = randNum();
        while(this.saves.includes(keyBase + num)) num = randNum();

        return keyBase + num;
    }

    /*
    //returns the new save if saved successfully, false otherwise
    createNewSave(saveGame) {
        try {
            if (!saveGame) saveGame = this.emptySave;
            this.cachedSave = saveGame;
            this._pushSave();
            this.events.emit('newSaveCreated');
            return this.cachedSave;
        } catch (error) {
            return false;
        }
    }*/

    //tries to save the currently loaded cached save
    _pushSave() {
        if (this.cachedSave) {
            localStorage.setItem(this.cachedSave.key, JSON.stringify(this.cachedSave));
            this.events.emit('cachedSavePushed');
        }
    }

    //tries to load a save file from local storage and convert it to a readable object
    //will store in this.parsedSave until we decide to overwrite our cachedSave
    _parseSave(replaceCache = false) {
        let s = localStorage.getItem(this.saveKey);
        if (s) {
            let ps = JSON.parse(s);
            if (replaceCache) {
                this.cachedSave = ps;
            } else {
                this.parsedSave = ps;
            }
            this.events.emit('saveGamePulled', ps);
        }
    }

    printSaveGameToConsole() {
        if (this.cachedSave) {
            console.log(this.cachedSave);
        }
    }

    get persistentUpgrades() {
        if (this.cachedSave) return this.cachedSave.persistentUpgrades;
        else return false;
    }

    //current level the player has reached
    get currentLevel() {
        if (this.cachedSave) return this.cachedSave.currentLevel;
        else return 1;
    }

    get resentment() {
        if (this.cachedSave) return this.cachedSave.resentment;
        else return 0;
    }

    set resentment(value) {
        if (this.cachedSave) this.cachedSave.resentment = value;
    }

    get playerLevel() {
        if (this.cachedSave) return this.cachedSave.playerLevel;
        else return 1;
    }

    //tries to deduct currency from the player, will return false if the amount is too high
    //will return true AND it will deduct currency if the player has enough
    costPlayer(sdcost, sccost) {
        let s = this.getStardust();
        let c = this.getScrap();

        if (s >= sdcost && c >= sccost) {
            this.cachedSave.stardust -= sdcost;
            this.cachedSave.scrap -= sccost;
            this.events.emit('cachedSaveChanged', this.cachedSave);
            return true;
        }

        return false;
    }

    //stardust is the currency to buy persistent upgrades
    get stardust() {
        if (this.cachedSave) return this.cachedSave.stardust;
        else return 0;
    }

    //scrap is the currency to buy in game upgrades
    get scrap() {
        if (this.cachedSave) return this.cachedSave.scrap;
        else return 0;
    }

    //game mode: 
    // 0 -> BOUNTY mode, normal mode
    // 1 -> BOSS mode, "easy" mode
    get gameMode() {
        if (this.cachedSave) return this.cachedSave.gameMode;
    }
}