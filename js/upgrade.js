import { GatlingBeamPool, GrenadeDropPool, MeteorImpactPool } from './playerspells.js';
import { setUpgradeValueOnGameObject } from './helper.js';

//defines in game upgrades to the player, spell pool and spell properties
class Upgrade {
    constructor(name) { //defines which spell this upgrade is for, or spell 
        this.name = name;
        this.isPoolUpgrade = false; //set this to true for upgrades that should affect properties of the spellpool and not the grouped spell obejcts
        this.isPlayerUpgrade = false;
        this.upgradeTextureKey = 'default-upgrade-image'; //this gets loaded into the upgrade image frame on load, it should be an image file located in images/upgrades/
        this.upgradeDescription = 'You need to set the description of this upgrade in upgrade.js';
        this.upgradeStat = 'Stat description';
        this.finalStatValue = '10'; //the final value of the stat for display purposes
        this.propertyValue = ''; //the property value to set when giving this upgrade to something
        this.persistentKey = ''; //the key that maps to this same value (if any) from the persistent upgrade manager
        this.stat; //the final value of the stat for internal usage and merging
        this.cost = 50;
    }

    //upgradeKey is the key for the persistent upgrade object
    adjustStatValue(upgradeKey) {
        if (!this.persistentUpgradeManager) return;
        //this.persistentUpgradeManager is set upon creation of the upgrade, a little hacky i know, but in my defense fuck u buddy
        let v = this.persistentUpgradeManager.getCurrentUpgradeValue(upgradeKey);
        if (v) {
            this.stat += v;
        }
    }

    //call this when we first apply the upgrade
    //target should be a spellpool object or the player
    applyUpgrade(target) {
        if (this.propertyValue == '' || this.persistentKey == '' || !this.stat || !target) {
            console.error(`bruh there's an error inside Upgrade.applyUpgrade:`);
            console.log(`this.propertyValue = ${this.propertyValue}`);
            console.log(`this.persistentKey = ${this.persistentKey}`);
            console.log(`this.stat = ${this.stat}`);
            console.log(`target = ${target}`);
            return;
        }
        setUpgradeValueOnGameObject(target, this.propertyValue, this.stat, this.persistentKey);
    }

    //call this if we remove the upgrade
    //reverse all changes from apply
    remove(target) {}

    //call this every time the spell hits something
    //enemy: what we hit, should be enemy class but maybe we change later
    //baseDamage: how much damage the spell does normally, be careful
    //about using this in conjunction with apply, if you apply a mod
    //to attack damage or something and then in here apply a percentage on hit
    //you might want to calculate that percentage increase without using 
    //using the modifier, so you could subtract that first before doing the 
    //calculation
    //
    //also be careful that you dont add multiple effects from the same upgrade
    //tree, like if an onhit damage-1 adds 5 damage on hit, then damage-2 makes it 7
    //damage on hit, then make sure we don't apply damage-1 and damage-2
    //or simply make each additional upgrade additive and not the final value
    //this isn't necessarily the best because we don't want to call onHit 5000 times 
    //once for each individual upgrade the player has, we really just want a single
    //upgrade for each stat that applies the values when we want them (onhit or on apply etc)
    //but also that we can update the values for as the player gets more upgrades
    //that way we have fewer objects to deal with
    onHit(enemy, baseDamage) {}
}

//this class upgrades an upgrade so we can have only a single instance
//when we want to give a player an upgrade that has additional upgrades
//for instance if we have damage-1 on gatlingbeam and we want to upgrade
//to damage-2 we give damage-1, damage-2 and gatlingbeam to this class
//and merge them all into damage-1, which should already be applied

//todo: find a benefit for this that would improve game design idk
class MergeUpgrades {

    mergeSpellUpgrade(originalUpgrade, newUpgrade, spellPool) {
        //make the stat values the same
        originalUpgrade.stat = newUpgrade.stat; 
        //reapply to player
    }

    mergePlayerUpgrade(originalUpgrade, newUpgrade, player) {

    }

    mergeSpellPools(originalSpellPool, newSpellPool, player) {

    }
}

class SpellPoolUpgrade extends Upgrade {
    constructor(name) {
        super(name);
        this.isPoolUpgrade = true;
    }
}

class PlayerUpgrade extends Upgrade {
    constructor(name) {
        super(name);
        this.isPlayerUpgrade = true;
    }
}

//player upgrades

class SpeedUpgrade extends PlayerUpgrade {
    constructor(name, speed) {
        super(name);
        this.stat = speed;
        this.upgradeStat = 'Speed';
        this.finalStatValue = this.stat.toString();
        
        this.propertyValue = 'speed';
        this.persistentKey = 'player-speed';
    }
}

//spell upgrades

class PassthroughUpgrade extends Upgrade {
    constructor(name, passThroughValue) {
        super(name);
        this.stat = passThroughValue;
        this.upgradeStat = 'Spell Passthrough';
        this.finalStatValue = this.stat.toString();

        this.propertyValue = 'passThroughValue';
        this.persistentKey = 'spell-passthrough';
    }
}

class FireRateUpgrade extends SpellPoolUpgrade {
    constructor(name, firingSpeed) {
        super(name);
        this.isPoolUpgrade = true;
        this.stat = firingSpeed;
        this.upgradeStat = 'Fire Rate';
        this.finalStatValue = this.stat.toString();     

        this.propertyValue = 'spellTimer';
        this.persistentKey = 'spellpool-firerate';
    }
}

class SpellCountUpgrade extends SpellPoolUpgrade {
    constructor(name, spellCount) {
        super(name);
        this.isPoolUpgrade = true;
        this.stat = spellCount;
        this.upgradeStat = "Spell Count";
        this.finalStatValue = this.stat.toString();

        this.propertyValue = 'baseSpellCount';
        this.persistentKey = 'spellpool-spellcount';
    }
}

class DamageRadiusUpgrade extends Upgrade {
    constructor(name, damageRadius) {
        super(name);
        this.stat = damageRadius;
        this.upgradeStat = 'Damage Radius';
        this.finalStatValue = this.stat.toString();
        
        this.propertyValue = 'damageRadius';
        this.persistentKey = 'spell-damageradius';
    }
}

class DamageUpgrade extends Upgrade {
    constructor(name, damage) {
        super(name);
        this.stat = damage;
        this.upgradeStat = "Damage";
        this.finalStatValue = this.stat.toString();
        
        this.propertyValue = 'damage';
        this.persistentKey = 'spell-damage';
    }
}


//this class is used to give a spell to a player via a spell upgrade
class NewSpellUpgrade extends Upgrade {
    constructor(target) {
        super();
        this.player = target;
    }

    applyUpgrade(newSpellKey, newSpell) {
        if (!this.player.spells.has(newSpellKey)) this.player.spells.set(newSpellKey, newSpell);
    }
}

//controls persistent player upgrades, saving, storing, etc.
//is a plugin so it doesn't need a reference to the scene
export class PersistentUpgradeManager extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
        
        //when we replace an upgrade, we store the replaced upgrade here for reference

        this.retiredUpgrades = new Map(); 
        //maps a readable key value to the current upgrade of it's type, when we get a new upgrade
        //we replace the old upgrade, and the readable key only ever refers to one upgrade at a time (of its type)
        //for example when we upgrade from hp-1 to hp-2 we replace the current value at currentUpgradesMap.get('hp') with this.allUpgrades.get('hp-2')
        this.currentUpgradesMap = new Map(); 
        this.currentUpgradesKeyMap = new Map(); //maps an upgrade key that refers to an upgrade object to a readable upgrade key that gets used in currentUpgrades map
        this.allUpgrades = new Map(); //all possible upgrade keys mapped to the instantiated upgrade objects
        this.baseUpgrades = []; //starting upgrades, all the 0 upgrades
        this.nextUpgrades = new Map(); //maps an upgrade key with a list of upgrade keys that become available to unlock subsequently

        this.events = new Phaser.Events.EventEmitter();
    }

    init() {
        //use this.pluginManager.get('SaveManager') to get the save manager plugin

        this.saveManager = this.pluginManager.get('SaveManager', false);
        this.loadCurrentUpgradesFromSave();
        this.create();
    }

    loadCurrentUpgradesFromSave() {
        //initialize state, load save data from local storage, etc
        let p = this.saveManager.cachedSave;

        //current upgrade keys, when we get a new key that maps to an upgrade of the same class as this one, remove it's key from the currentUpgrades array
        if(p) {
            this.currentUpgrades = p.persistentUpgrades;

        } else {
            this.currentUpgrades = [];
        }
    }

    //returns the numerical value of the stored upgrade
    //key is a readable upgrade key, will get the current upgrade
    //using a key like 'hp', 'hp/s', etc
    getCurrentUpgradeValue(key) {
        if (this.currentUpgradesMap.has(key)) {
            let u = this.currentUpgradesMap.get(key);
            if (u.statValue) return u.statValue;
        }

        return false;
    }

    //checks if the player can afford an upgrade
    //returns the upgrade object if they can afford, false if not
    canAfford(key) {
        //key should be persistent upgrade
        let sd = this.saveManager.getStardust();
        let sc = this.saveManager.getScrap();

        if (this.allUpgrades.has(key)) {
            let u = this.allUpgrades.get(key);
            if (sd >= u.sdcost && sc >= u.sccost) {
                return u;
            }
        }

        return false;
    }

    upgradeIsApplied(key) {
        let gkey = this.convertUpgradeKeyToGenericKey(key);
        if (this.currentUpgradesMap.has(gkey) && this.allUpgrades.has(key)) {
            if (this.currentUpgradesMap.get(gkey) == this.allUpgrades.get(key)) {
                return true;
            }            
        }

        return false;
    }

    //returns the upgrade if successfully purchased
    //fires a new upgrade event
    tryPurchaseUpgrade(key) {
        if (this.upgradeIsApplied(key)) return;
        let u = this.canAfford(key);
        if (this.saveManager.costPlayer(u.sdcost, u.sccost)) {
            this.applyUpgrade(u);
            this.events.emit('newUpgrade', u);

            return u;
        }

        return false;
    }


    //get a list of all upgrades and their current unlock state
    //grouped by generic upgrade key
    //return an array of unlock states
    //returns:  [{
    //              genericKey: 'hp',
    //              unlocks: [{key: 'hp-1', unlocked: true, upgrade: Object}, {key: 'hp-2', unlocked: true, upgrade: Object}, ...]
    //          }, ...]
    //note even though we only hold one persistent upgrade per generic key at a time
    //we will set unlocked to true for all upgrades that are also in retiredUpgrades
    //so taht they will have an unlocked icon displayed for them
    getUnlockList() {
        //reload the save file from the cached save
        this.loadCurrentUpgradesFromSave();

        let list = [];
        this.recurseListLookForUnlocks(this.baseUpgrades, list);

        return list;
    }

    //recursive function that will look through a list
    //if the current key is defined in nextUpgrades it 
    recurseListLookForUnlocks(listToSearch, listToAppend) {
        for (var i = 0; i < listToSearch.length; i++) {
            let upgrade = this.allUpgrades.get(listToSearch[i]);
            let unlocked = false;
            let gkey = this.convertUpgradeKeyToGenericKey(listToSearch[i]);
            //if we are currently using this upgrade, or have unlocked it previously
            if (this.currentUpgrades.includes(listToSearch[i]) || this.retiredUpgrades.has(listToSearch[i])) unlocked = true;

            let listItem = listToAppend.find((obj) => obj.genericKey == gkey);
            if (listItem) {
                listItem.unlocks.push({key: listToSearch[i], unlocked: unlocked, upgrade: upgrade});
            } else {
                listToAppend.push({genericKey: gkey, unlocks: [{key: listToSearch[i], unlocked: unlocked, upgrade: upgrade}]});                
            }

            if (this.nextUpgrades.has(listToSearch[i])) {
                this.recurseListLookForUnlocks(this.nextUpgrades.get(listToSearch[i]), listToAppend);
            }
        }
    }

    //create all upgrades
    create() {
        this.allUpgrades
        //base hp
        .set('hp-1', new HPPersistentUpgrade(this, 'hp-1', 110))
        .set('hp-2', new HPPersistentUpgrade(this, 'hp-2', 120))
        //hp regen per second
        .set('hps-1', new HPSPersistentUpgrade(this, 'hps-1', 1))
        .set('hps-2', new HPSPersistentUpgrade(this, 'hps-2', 1.2))
        .set('hps-3', new HPSPersistentUpgrade(this, 'hps-3', 1.3))
        .set('hps-4', new HPSPersistentUpgrade(this, 'hps-4', 1.4))
        .set('hps-5', new HPSPersistentUpgrade(this, 'hps-5', 1.5))
        //damage for all weapon types equally, flat amount
        .set('damage-1', new DamagePersistentUpgrade(this, 'damage-1', 1)) 
        .set('damage-2', new DamagePersistentUpgrade(this, 'damage-2', 2));

        this.nextUpgrades
        .set('hp-1', ['hp-2'])
        .set('hps-1', ['hps-2'])
        .set('hps-2', ['hps-3'])
        .set('hps-3', ['hps-4'])
        .set('hps-4', ['hps-5'])
        .set('damage-1', ['damage-2']);

        //these will not be unlocked initially, they will define the initial unlock
        //and subsequent unlock keys will be given by this.nextUpgrades.get(this.baseUpgrades[n]) which returns a list of new upgrades
        this.baseUpgrades = ['hp-1', 'hps-1', 'damage-1'];

        //make sure all unique keys end up in 
        //one and only one of the value arrays
        //in this map, make sure they are in order as well
        //because we hackily use this to setup the
        //retired upgrades in a few lines
        this.currentUpgradesKeyMap
        .set('hp', ['hp-1', 'hp-2'])
        .set('hps', ['hps-1', 'hps-2', 'hps-3', 'hps-4', 'hps-5'])
        .set('damage', ['damage-1', 'damage-2']);


        //load the currentUpgrades list (already loaded from localStorage) into a map of persistent upgrade objects and storing the name using a key from readableUpgradeKeyMap
        for(var i = 0; i < this.currentUpgrades.length; i++) {
            let gkey = this.convertUpgradeKeyToGenericKey(this.currentUpgrades[i]); //generic key of the current upgrade
            let cu = this.allUpgrades.get(this.currentUpgrades[i]); //the upgrade that we are adding to the map
            this.currentUpgradesMap.set(gkey, cu);

            //setup retiredupgrades based on loaded upgrade map
            //any upgrade before the current one with a given generic key should be "retired"
            //mostly so it shows up with the correct icon in the upgrade stat page
            let genericKeyMappingValues = this.currentUpgradesKeyMap.get(gkey);
            let upgradeKeyMapIndex = genericKeyMappingValues.indexOf(this.currentUpgrades[i]);
            for (var j = 0; j < genericKeyMappingValues.length; j++) {
                if (j < upgradeKeyMapIndex) {
                    //retired upgrades
                    this.retiredUpgrades.set(genericKeyMappingValues[j], this.allUpgrades.get(genericKeyMappingValues[j]));
                } else {
                    //locked or current upgrades
                }
            }
        }
    }

    //key is an upgrade key like 'hp-1', and it gets converted to something like 'hp'
    //based on the mapping in currentUpgradesKeyMap
    convertUpgradeKeyToGenericKey(key) {
        for (const [k, v] of this.currentUpgradesKeyMap) {
            if (v.includes(key)) return k;
        }

        return false;
    }

    //we assume you have already checked this.upgradeIsApplied()
    applyUpgrade(upgrade) {
        let id = this.convertUpgradeKeyToGenericKey(upgrade.key);
        if (!id) {
            console.error(`Upgrade key: ${upgrade.key} not present within <Persistent Upgrade Manager>.currentUpgradesKeyMap, fix immediately.`);
            return;
        }

        if (this.currentUpgradesMap.has(id)) this.retiredUpgrades.set(upgrade.key, upgrade);

        //if the upgrade exists in the currentUpgradesMap we need to replace it with this new one
        //if it doesn't exist we need to add it
        this.currentUpgradesMap.set(id, upgrade);
        this.currentUpgrades.push(upgrade.key);
        //boom done

        this.save();
    }

    //save the current upgrades to the save manager
    save() {
        this.saveManager.applyPersistentUpgrades(this.currentUpgrades);
    }
}

//difference between persistent upgrade and upgrade is that 
//we apply a persistent upgrade to all spell pools or spells
//that have the property, not just the one spell or pool
class PersistentUpgrade {
    constructor(manager, key, statValue, stardustCost=100, scrapCost=100) {
        this.key = key; //identifier key for individual upgrades like 'hp-1', etc
        this.statValue = statValue; //numerical stat value
        this.manager = manager; //the persistentupgrademanager instance
        this.propertyValue = ''; //the property that we are altering
        this.valueDescription = ''; //a property name that reads well in the shop

        this.isPlayerUpgrade = false;
        this.isPoolUpgrade = false;
        this.isSpellUpgrade = false;

        this.description = ''; //description for the upgrade shop
        this.sdcost = stardustCost; //cost in stardust
        this.sccost = scrapCost; //cost in scrap, these are cumulative

        this.positiveChangeIndicator = '+'; //how to indicate this value is or will change in a beneficial way to the player
        this.negativeChangeIndicator = '-'; 
    }

    setCost(stardust, scrap) {
        this.sdcost = stardust;
        this.sccost = scrap;
    }

    applyUpgrade() {
        this.manager.applyUpgrade(this);
    }
}

class PersistentSpellPoolUpgrade extends PersistentUpgrade {
    constructor(manager, key, statValue, stardustCost=100, scrapCost=100) {
        super(manager, key, statValue, stardustCost, scrapCost);
        this.isPoolUpgrade = true;
    }
}

class PersistentSpellUpgrade extends PersistentUpgrade {
    constructor(manager, key, statValue, stardustCost=100, scrapCost=100) {
        super(manager, key, statValue, stardustCost, scrapCost);
        this.isSpellUpgrade = true;
    }
}

class PersistentPlayerUpgrade extends PersistentUpgrade {
    constructor(manager, key, statValue, stardustCost=100, scrapCost=100) {
        super(manager, key, statValue, stardustCost, scrapCost);
        this.isPlayerUpgrade = true;
    }
}

class HPPersistentUpgrade extends PersistentPlayerUpgrade {
    constructor(manager, key, statValue, stardustCost=100, scrapCost=100) {
        super(manager, key, statValue, stardustCost, scrapCost);

        this.propertyValue = 'baseHP';
        this.description = 'increase the amount of hit points you have';
        this.valueDescription = 'health';
    }
}

//health regen per second
class HPSPersistentUpgrade extends PersistentPlayerUpgrade {
    constructor(manager, key, statValue, stardustCost=100, scrapCost=100) {
        super(manager, key, statValue, stardustCost, scrapCost);

        this.propertyValue = 'baseHPS';
        this.description = 'regenerate your health over time';
        this.valueDescription = 'health per second';
    }
}

class DamagePersistentUpgrade extends PersistentSpellUpgrade {
    constructor(manager, key, statValue, stardustCost=100, scrapCost=100) {
        super(manager, key, statValue, stardustCost, scrapCost);

        this.propertyValue = 'damage';
        this.description = 'base damage for all weapons';
        this.valueDescription = 'damage';
    }
}


//this class controls upgrades for
//the player stats
//the player's available spellpools
//the player's spellpool's spells
//the reason spellpool and spell upgrades can't be consolidated
//is that spellpools control the spell fire rate, so it's pretty much
//only to upgrade that stat. 

//the way upgrades work is that there are a list of base upgrades
//of each type (spell, spellpool and player), and each of those 
//upgrades has a list of further upgrades beyond.

//the spell upgrades can be applied to either a spell or a spellpool, that
//is specified in the Upgrade class itself, so we can apply an upgrade
//to a spellpool and it can be responsible for checking if it is for itself
//or the grouped spells. 

//this class is only responsible for applying spells and maintaining a
//master list of each spell applied to everything, spellpools and the player
//can also maintain a separate list by which they go off of to update the effects
//each frame
export class InGameUpgradeManager extends Phaser.Plugins.ScenePlugin {

    constructor(scene, manager) {
        super(scene, manager);

        //these map keys to actual class instances
        //-------------------------------
        //these upgrades only apply to the player
        //and affects its stats like crit change, speed
        //etc
        this.allPlayerUpgrades = new Map();
        //these upgrades apply to spell or spellpool objects
        //and affect spell properties like fire rate, damage etc
        //each key maps to an object like 
        //upgradeKey -> Upgrade 
        this.allSpellUpgrades = new Map();
        //these are basically all the weapons the player can have
        //it is a bit different than the other upgrades so take care here
        this.allSpellPools = new Map();
        //--------------------------------

        // a list of the first upgrades that are available to the player
        // these are NOT unlocked right away
        this.basePlayerUpgrades = [];
        // maps a spellPoolKey to a list of upgrade keys that are available for this spellpool
        // maps all spellPools to base upgrades, if the spell pool doesn't have an entry here, you
        // will not be able to upgrade it in game
        // spellPoolKey -> [upgrade1, upgrade2, ...]
        this.baseSpellUpgrades = new Map();
        //a list of spell pools that are available to unlock right away
        this.baseSpellPools = [];

        // a map from player upgrade keys to a list of the next upgrades
        this.nextPlayerUpgrades = new Map();
        this.nextSpellUpgrades = new Map();
        this.nextSpellPools = new Map();

        // currently applied upgrades
        this.currentPlayerUpgrades = new Map();
        // this one maps a spellPoolKey to a list of spellUpgradeKeys that are applied to it
        // spellPoolKey -> [spellUpgrade1, spellUpgrade2, spellUpgrade3, ...]
        this.currentSpellUpgrades = new Map();
        this.currentSpellPools = new Map();

        // maintain a list of potential upgrade keys in each category
        // these get refreshed every time we traverse the spell trees
        this.potentialPlayerUpgrades = [];
        // this is a list of lists like this [[spellUpgradeKey, spellPoolKey], [spellUpgradeKey, spellPoolKey], ...]
        this.potentialSpellUpgrades = [];
        // array of spell pool keys
        this.potentialSpellPools = [];

        //these are upgrades that were most recently sent to the upgrade screen for the player to choose
        //cache them here to check against when we go to the shop before choosing the upgrades
        //we dont want to show shop spells or upgrades taht are in here
        this.pendingUpgrades = [];
    }

    //call this from create method of scene
    //build everything here, also call createGroup() on each spellPool
    init() {
        this.allSpellPools.set('gatling-beam', new GatlingBeamPool(this.scene, this.scene.player, 'gatling-beam'))
        .set('grenade-drop', new GrenadeDropPool(this.scene, this.scene.player, 'grenade-drop'))
        .set('meteorimpact', new MeteorImpactPool(this.scene, this.scene.player, 'meteorimpact'));

        //if any of these overlap with a persistent upgrade in the case of which stat is upgraded, they are additive
        this.allSpellUpgrades
        .set('passthrough-0', new PassthroughUpgrade('passthrough-0', 1))
        .set('passthrough-1', new PassthroughUpgrade('passthrough-1', 2))
        .set('passthrough-2', new PassthroughUpgrade('passthrough-2', 3))
        .set('passthrough-3', new PassthroughUpgrade('passthrough-3', 4))
        .set('passthrough-4', new PassthroughUpgrade('passthrough-4', 5))
        .set('passthrough-5', new PassthroughUpgrade('passthrough-5', 6))
        .set('passthrough-6', new PassthroughUpgrade('passthrough-3', 10))
        .set('firerate-0', new FireRateUpgrade('firerate-0', 280))
        .set('firerate-1', new FireRateUpgrade('firerate-1', 250))
        .set('firerate-2', new FireRateUpgrade('firerate-2', 200))
        .set('firerate-3', new FireRateUpgrade('firerate-3', 150))
        .set('firerate-4', new FireRateUpgrade('firerate-4', 100))
        .set('firerate-5', new FireRateUpgrade('firerate-5', 50))
        .set('damageradius-grenade-0', new DamageRadiusUpgrade('damageradius-grenade-0', 50))
        .set('damageradius-grenade-1', new DamageRadiusUpgrade('damageradius-grenade-1', 100))
        .set('damageradius-grenade-2', new DamageRadiusUpgrade('damageradius-grenade-2', 150))
        .set('damageradius-grenade-3', new DamageRadiusUpgrade('damageradius-grenade-3', 240))
        .set('damage-0', new DamageUpgrade('damage-0', 2))
        .set('damage-1', new DamageUpgrade('damage-1', 3))
        .set('damage-2', new DamageUpgrade('damage-2', 5))
        .set('damage-3', new DamageUpgrade('damage-3', 7))
        .set('damage-4', new DamageUpgrade('damage-4', 9))
        .set('damage-meteor-0', new DamageUpgrade('damage-meteor-0', 15))
        .set('damage-meteor-1', new DamageUpgrade('damage-meteor-1', 25))
        .set('damage-meteor-2', new DamageUpgrade('damage-meteor-2', 35))
        .set('damage-meteor-3', new DamageUpgrade('damage-meteor-3', 45))
        .set('damage-meteor-4', new DamageUpgrade('damage-meteor-4', 55))
        .set('damage-grenade-0', new DamageUpgrade('damage-grenade-0', 22))
        .set('damage-grenade-1', new DamageUpgrade('damage-grenade-1', 35))
        .set('damage-grenade-2', new DamageUpgrade('damage-grenade-2', 48))
        .set('damage-grenade-3', new DamageUpgrade('damage-grenade-3', 61))
        .set('damage-grenade-4', new DamageUpgrade('damage-grenade-4', 74))
        .set('damage-grenade-5', new DamageUpgrade('damage-grenade-5', 87))
        .set('spellcount-0', new SpellCountUpgrade('spellcount-0', 1))
        .set('spellcount-1', new SpellCountUpgrade('spellcount-1', 2))
        .set('spellcount-2', new SpellCountUpgrade('spellcount-2', 3))
        .set('spellcount-3', new SpellCountUpgrade('spellcount-3', 4))
        .set('spellcount-4', new SpellCountUpgrade('spellcount-4', 5))
        .set('spellcount-5', new SpellCountUpgrade('spellcount-5', 6))
        .forEach(function (value) {
            value.persistentUpgradeManager = this.scene.persistentUpgradeManager;
        }, this);

        this.allPlayerUpgrades
        .set('speed-0', new SpeedUpgrade('speed-0', 1))
        .set('speed-1', new SpeedUpgrade('speed-1', 1.2))
        .set('speed-2', new SpeedUpgrade('speed-2', 1.4))
        .set('speed-3', new SpeedUpgrade('speed-3', 1.6))
        .set('speed-4', new SpeedUpgrade('speed-4', 1.8))
        .set('speed-5', new SpeedUpgrade('speed-5', 2))
        .set('speed-6', new SpeedUpgrade('speed-6', 2.2))
        .forEach(function (value) {
            value.persistentUpgradeManager = this.scene.persistentUpgradeManager;
        }, this);

        //define the unlock tree
        this.nextSpellUpgrades
        .set('passthrough-0', ['passthrough-1'])
        .set('passthrough-1', ['passthrough-2'])
        .set('passthrough-2', ['passthrough-3'])
        .set('passthrough-3', ['passthrough-4'])
        .set('passthrough-4', ['passthrough-5'])
        .set('passthrough-5', ['passthrough-6'])
        .set('firerate-0', ['firerate-1'])
        .set('firerate-1', ['firerate-2'])
        .set('firerate-2', ['firerate-3'])
        .set('firerate-3', ['firerate-4'])
        .set('firerate-4', ['firerate-5'])
        .set('damageradius-grenade-0', ['damageradius-grenade-1'])
        .set('damageradius-grenade-1', ['damageradius-grenade-2'])
        .set('damageradius-grenade-2', ['damageradius-grenade-3'])
        .set('damage-0', ['damage-1'])
        .set('damage-1', ['damage-2'])
        .set('damage-2', ['damage-3'])
        .set('damage-3', ['damage-4'])
        .set('damage-meteor-0', ['damage-meteor-1'])
        .set('damage-meteor-1', ['damage-meteor-2'])
        .set('damage-meteor-2', ['damage-meteor-3'])
        .set('damage-meteor-3', ['damage-meteor-4'])
        .set('spellcount-0', ['spellcount-1'])
        .set('spellcount-1', ['spellcount-2'])
        .set('spellcount-2', ['spellcount-3'])
        .set('spellcount-3', ['spellcount-4'])
        .set('spellcount-4', ['spellcount-5'])
        .set('damage-grenade-0', ['damage-grenade-1'])
        .set('damage-grenade-1', ['damage-grenade-2'])
        .set('damage-grenade-2', ['damage-grenade-3'])
        .set('damage-grenade-3', ['damage-grenade-4'])
        .set('damage-grenade-4', ['damage-grenade-5']);

        this.nextPlayerUpgrades
        .set('speed-0', ['speed-1'])
        .set('speed-1', ['speed-2'])
        .set('speed-2', ['speed-3'])
        .set('speed-3', ['speed-4'])
        .set('speed-4', ['speed-5'])
        .set('speed-5', ['speed-6']);

        //define the start points of the unlock trees for each available upgrade
        //these are unlocked right at the beginning of each level, and they must
        //be unlocked right at the beginning of each level because setting these
        //initial upgrades allows the setting of persistent upgrades at the same time
        this.baseSpellUpgrades.set('gatling-beam', ['passthrough-0', 'firerate-0', 'damage-0'])
        .set('grenade-drop', ['damageradius-grenade-0', 'damage-grenade-0', 'spellcount-0'])
        .set('meteorimpact', ['spellcount-0', 'damage-meteor-0']);

        this.basePlayerUpgrades = ['speed-0'];

        //set the weapons that can be unlocked right away
        this.baseSpellPools = ['gatling-beam', 'grenade-drop', 'meteorimpact'];
    }

    //applies all the initial upgrades at the start of the game
    //call this at the start of each level and supply the player
    applyAllInitialUpgrades(player) {
        //key is a spell pool key
        //value is an array of initial upgrade keys
        this.baseSpellUpgrades.forEach(function(value, key) {
            for (var i = 0; i < value.length; i++) {
                //value[i] is a specific initial upgrade key
                let u = {
                    isSpellPoolUpgrade: true,
                    isPlayerUpgrade: false,
                    isSpellPool: false,
                    key: value[i], //upgrade key
                    target: this.obj.allSpellPools.get(key), //spell pool object
                    upgrade: this.obj.allSpellUpgrades.get(value[i]), //upgrade object
                };

                this.obj.applyUpgrade(u);
            }
        }, {obj: this, player: player});

        for (var i = 0; i < this.basePlayerUpgrades.length; i++) {
            //value[i] is a specific initial upgrade key
            let k = this.basePlayerUpgrades[i];
            let u = {
                isSpellPoolUpgrade: false,
                isPlayerUpgrade: true,
                isSpellPool: false,
                key: k, //upgrade key
                target: this.player, //player object
                upgrade: this.obj.allPlayerUpgrades.get(k), //upgrade object
            };

            this.applyUpgrade(u);
        }
    }

    //check if the upgrade is applied to the spellpool using keys
    hasUpgrade(upgradeKey, spellPoolKey) {
        if (!this.currentSpellUpgrades.has(spellPoolKey)) {
            return false;
        }
        
        var upgrades = this.currentSpellUpgrades.get(spellPoolKey);
        var inc = upgrades.includes(upgradeKey);
        return inc;
        
        
    }

    //check if a spell pool is allowed to use this upgrade
    canUseUpgrade(upgradeKey, spellPoolKey) {
        //look start at the baseUpgradeList and work up until we find this upgrade key
        //if we dont find it or the baseUpgradeList is empty then we cannot use this upgrade
        if (!this.baseSpellUpgrades.has(spellPoolKey)) {
            return false;
        }
        return this._canUseUpgrade(upgradeKey, spellPoolKey, this.baseSpellUpgrades.get(spellPoolKey));
    }

    //recursive function used by canUseUpgrade
    //start at baseupgrade list, if there is a next upgrade list
    //for the current upgrade key loop through that
    //this is a depth first recursive tree search to find the first matching 
    //key to upgradeKey
    _canUseUpgrade(upgradeKey, spellPoolKey, subList) {
        for(var i = 0; i < subList.length; i++) {
            if (subList[i] == upgradeKey) {
                //this upgrade is in the list
                //if we have the upgrade we cannot use it
                //if we do not have the upgrade we can use it
                return !this.hasUpgrade(upgradeKey, spellPoolKey);
            } else {
                if (this.nextSpellUpgrades.has(upgradeKey)) {
                    return this._canUseUpgrade(upgradeKey, spellPoolKey, this.nextSpellUpgrades.get(upgradeKey));
                }
            }
        }

        return false;
    }

    //upgrade:
    //{
    // isSpellPoolUpgrade: false,
    // isPlayerUpgrade: false,
    // isSpellPool: true,
    // key: upgradeKey/spellPoolKey
    // target: player/SpellPool,
    // upgrade: Upgrade/SpellPool,
    //}
    applyUpgrade(upgrade) {
        //console.log("trying to apply upgrade!");
        //console.log(upgrade);

        //the upgrade applies itself to the target
        if (upgrade.isSpellPool) {
            //upgrade should be a SpellPool
            //we add the spell pool to the player list of spell pools
            upgrade.target.addSpellPool(upgrade.upgrade);
            this.currentSpellPools.set(upgrade.key, upgrade.upgrade);
            this.pendingUpgrades = [];
        } else if (upgrade.isSpellPoolUpgrade) {

            //upgrade should be a Upgrade
            //target should be a spellpool
            upgrade.target.addSpellUpgrade(upgrade.upgrade);
            if (this.currentSpellUpgrades.has(upgrade.target.name)) {
                //if we have the spellpool key in the upgrade list, just
                //add it to the list
                this.currentSpellUpgrades.get(upgrade.target.name).push(upgrade.key);
            } else {
                this.currentSpellUpgrades.set(upgrade.target.name, [upgrade.key]);
            }
            this.pendingUpgrades = [];
        } else if (upgrade.isPlayerUpgrade) {
            console.log('player upgrade!');
            //target is player
            if (upgrade.target.addStatUpgrade(upgrade.upgrade)) {
                this.currentPlayerUpgrades.set(upgrade.key, upgrade.upgrade);
                this.pendingUpgrades = [];
            }
        }
    }

    get3RandomUpgrades() {
        this.buildPotentialUpgradeList();
        //console.log(this.potentialPlayerUpgrades);
        //console.log(this.currentPlayerUpgrades);
        //console.log(this.nextPlayerUpgrades);
        //console.log(this.allPlayerUpgrades);

        //key is upgradeKey
        var randomPlayerUpgrades = this.getNUniqueItemsFromList(3, this.potentialPlayerUpgrades);
        randomPlayerUpgrades = randomPlayerUpgrades.map(function(key) {
            return {
                key: key,
                isSpellPoolUpgrade: false,
                isPlayerUpgrade: true,
                isSpellPool: false,
                target: this.scene.player,
                upgrade: this.allPlayerUpgrades.get(key),
            };
        }, this);

        //spellUpgrade is an array like this [upgradeKey, spellPoolKey]
        var randomSpellUpgrades = this.getNUniqueItemsFromList(3, this.potentialSpellUpgrades);
        randomSpellUpgrades = randomSpellUpgrades.map(function(spellUpgrade) {
            return {
                key: spellUpgrade[0], //the upgrade key
                isSpellPoolUpgrade: true,
                isPlayerUpgrade: false,
                isSpellPool: false,
                target: this.allSpellPools.get(spellUpgrade[1]),
                upgrade: this.allSpellUpgrades.get(spellUpgrade[0]),
            };
        }, this);
        
        //key is spellPoolKey
        var randomPools = this.getNUniqueItemsFromList(3, this.potentialSpellPools);
        randomPools = randomPools.map(function(key) {
            return {
                key: key,
                isSpellPoolUpgrade: false,
                isPlayerUpgrade: false,
                isSpellPool: true,
                target: this.scene.player,
                upgrade: this.allSpellPools.get(key),                
            };
        }, this);

        var bigList = randomPlayerUpgrades;
        //the ellipsis (...) makes this into push(randomSpellUpgrades[0], randomSpellUpgrades[1], ...)
        bigList.push(...randomSpellUpgrades); 
        bigList.push(...randomPools);

        this.pendingUpgrades = this.getNUniqueItemsFromList(3, bigList);

        return this.pendingUpgrades;
    }

    //get n unique upgrade keys from the list
    getNUniqueItemsFromList(n, list) {
        if (n >= list.length) {
            return list;
        }
        var indexArray = [];
        //build an array of unique indices based on the list length
        while (indexArray.length < n) {
            //random index from the list
            var r = Math.floor(Math.random() * list.length);
            //if this random index isn't already in the index array then add it
            if (indexArray.indexOf(r) === -1) indexArray.push(r);
        }

        var arr = [];
        indexArray.forEach(function(value) {
            this.arr.push(this.list[value]);
        }, { arr: arr, list: list });

        return arr;
    }

    //get a random upgrade excluding any key from the given list
    buildPotentialUpgradeList() {
        //rebuild list from scratch
        this.potentialPlayerUpgrades = [];
        this.potentialSpellUpgrades = [];
        this.potentialSpellPools = [];

        //recurse through the forest and count the trees
        this.checkPlayerUpgradeList(this.basePlayerUpgrades);
        this.checkNewSpellPools(this.baseSpellPools);
        //don't do that for spellupgrade, they are special :s
        this.getPotentialSpellUpgrades();
        //now our potential upgrade lists are populated
    }

    //find all the available spell pools that arent in use by the player
    //that are available to unlock (need all previous spellpools)
    checkNewSpellPools(list) {
        list.forEach(function(value) {
            if (this.currentSpellPools.has(value)) {
                //recursively call this function with the next list of upgrades
                if (this.nextSpellPools.has(value)) {
                    this.checkNewSpellPools(this.nextSpellPools.get(value));
                }
            } else {
                this.potentialSpellPools.push(value);
            }
        }, this);
    }

    //this will iterate through list and check if it is
    //in the this.currentPlayerUpgrades list, if it is not, it will add this
    //item to the this.potentialPlayerUpgrades, if it is we will get a list
    //of next upgrades from this.nextPlayerUpgrades.get(item) and recursively call this function
    checkPlayerUpgradeList(list) {
        list.forEach(function(value) {
            if (this.currentPlayerUpgrades.has(value)) {
                //recursively call this function with the next list of upgrades
                if (this.nextPlayerUpgrades.has(value)) {
                    this.checkPlayerUpgradeList(this.nextPlayerUpgrades.get(value));
                }
            } else {
                this.potentialPlayerUpgrades.push(value);
            }
        }, this);
    }

    //this one is different, we need to find all spell upgrades
    //available for all the spell pools the player has
    //and we need to check if they are already applied or not
    //we also need to find the next upgrade for already applied upgrades
    //it doesn't matter if the upgrade is for a spell or spellpool, we will 
    //present them as the same thing to the user always
    getPotentialSpellUpgrades() {
        //look at each spell pool for potential spell upgrades
        this.currentSpellPools.forEach(function(value, key) {
            //get the base upgrade list for this spell pool
            if (this.baseSpellUpgrades.has(key)) {
                var baseUpgrades = this.baseSpellUpgrades.get(key);
                this.checkSpellUpgradeList(baseUpgrades, key);
            }
        }, this);
    }

    //check for all available spells for a particular spellpool
    //it is available if not in use by the player
    //this is recursive because it will traverse levels in a tree for a 
    //specific spellpool
    //list should be a list of upgrade keys to check against
    checkSpellUpgradeList(list, spellPoolKey) {
        for(var i = 0; i < list.length; i++) {
            var upgradeKey = list[i];
            if (this.currentSpellUpgrades.has(spellPoolKey)) {
                //if we have this upgrade listed in the currentUprades map
                var currentUpgrades = this.currentSpellUpgrades.get(spellPoolKey);
                if (currentUpgrades.includes(upgradeKey)) {
                    //get the next upgrade list for this upgrade key and try again if it has any
                    //if not just skip to next loop iteration
                    if (this.nextSpellUpgrades.has(upgradeKey)) {
                        var nextUpgrades = this.nextSpellUpgrades.get(upgradeKey);
                        this.checkSpellUpgradeList(nextUpgrades, spellPoolKey);
                    }
                } else {
                    //we have upgrades for this spell pool just not this upgrade
                    //push a potential spell upgrade
                    this.potentialSpellUpgrades.push([upgradeKey, spellPoolKey]);
                }
            } else {
                //this.currentSpellUpgrades doesn't even have this key listed,
                //so we don't have the upgrade at all, add it to the potential spells.
                this.potentialSpellUpgrades.push([upgradeKey, spellPoolKey]);
            }
        }
    }
}