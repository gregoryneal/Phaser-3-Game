//each scene can create it's own save manager
export class SaveManager extends Phaser.Plugins.BasePlugin {

    //don't save anything other than numbers, strings, bools and stuff
    //dates can be stringified and parsed, array of primitives are fine
    //don't save functions at all, we would have to use eval to parse them back. yuck
    constructor(pluginManager) {
        super(pluginManager);

        this.events = new Phaser.Events.EventEmitter();
        this.saveKey = 'saveFile888';
        //this object is one that is set when we call _parseSave()
        //we may not want to overwrite our cached save yet
        this.parsedSave;
        //what an empty save looks like, reference it don't copy and paste it
        this.emptySave = {
            currentLevel: 1, //the current level of the game reached, planned to go up to 30
            persistentUpgrades: [], //string array of persistent uprade keys
            resentment: 0, //integer, will determine how much damage player takes and how much damage they deal
            playerLevel: 1, //player level
            gameMode: 0, //0: bounty mode, 1: boss mode
            stardust: 0, //more valuable currency, used for persistent upgrades and class unlocks, and in game upgrades
            scrap: 0, //shit currency, used for in game upgrades
            isBossModeUnlocked: false, //self explanatory
        };
    }

    start() {        
        this.cachedSave = this.tryGetGameSave();
        this.events.emit('cachedSaveChanged', this.cachedSave);
    }

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

    //tries to get a saved game, if none exists, returns false
    tryGetGameSave() {
        this._parseSave();

        if (this.parsedSave) {
            return this.parsedSave;
        } else {
            return false;
        }
    }    

    clearGameSave() {
        localStorage.clear();
    }

    //returns true if saved successfully, false otherwise
    createNewSave(saveGame) {
        try {
            this.cachedSave = saveGame;
            this._pushSave();
            return true;
        } catch (error) {
            return false;
        }
    }

    //tries to save the cached save
    _pushSave() {
        if (this.cachedSave) {
            localStorage.setItem(this.saveKey, JSON.stringify(this.cachedSave));
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

    // we save a list of persistent upgrades as a comma delimited list of strings
    // this includes everything, since all persistent upgrades should have a unique key
    getPersistentUpgrades() {
        if (this.cachedSave) return this.cachedSave.persistentUpgrades;
        else return false;
    }
    
    //current level the player has reached
    getCurrentLevel() {
        if (this.cachedSave) return this.cachedSave.currentLevel;
        else return 1;
    }

    getResentment() {
        if (this.cachedSave) return this.cachedSave.resentment;
        else return 0;
    }

    getPlayerLevel() {
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
    getStardust() {
        if (this.cachedSave) return this.cachedSave.stardust;
        else return 0;
    }

    //scrap is the currency to buy in game upgrades
    getScrap() {
        if (this.cachedSave) return this.cachedSave.scrap;
        else return 0;
    }

    //game mode: 
    // 0 -> BOUNTY mode, normal mode
    // 1 -> BOSS mode, "easy" mode
    getGameMode() {
        if (this.cachedSave) return this.cachedSave.gameMode;
    }

    getGameModeText() {
        let mode = this.getGameMode();
        let text = "";
        switch(mode) {
            case 0:
                text = "Bounty";
                break;
            case 1:
                text = "Boss";
                break;
            default:
                break;
        }
        return text;
    }
}