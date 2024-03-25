//convert a screen space coordinate to a world space
//x is from 0 to this.cameras.main.worldView.width

import { Directions } from "./definitions.js";

//y is from 0 to this.cameras.main.worldView.height
export var getPositionRelativeToViewport = function(scene, x, y) {
    //console.log(scene);
    //console.log(scene.cameras.main.worldView.y);
    /*`screen x: ${this.input.x}`,
    `screen y: ${this.input.y}`,
    `world x: ${this.input.mousePointer.worldX}`,
    `world y: ${this.input.mousePointer.worldY}`*/
    let x2 = scene.cameras.main.worldView.x + x;
    let y2 = scene.cameras.main.worldView.y + y;
    //console.log(`{ x: ${x2}, y: ${y2} }`);
    return {x: x2, y: y2};
}

//xPerc and yPerc are 0 to 1
//gets the world coordinate of a percentage within the viewport
export var getPositionRelativeToViewportPercent = function(scene, xPerc, yPerc) {
    return getPositionRelativeToViewport(scene, scene.cameras.main.worldView.width * xPerc, scene.cameras.main.worldView.height * yPerc);
}

//gives a gameobject (in this case a player, spellpool, or spell object) an "upgrade" by essentially setting the property value to upgradeValue + whatever
//persistent value is stored in the persistentUpgradeManager under persistentKey, this lets us upgrade objects in game and persistently seperately
//this way we apply all upgrades the exact same way so we don't have to repeat code
export var setUpgradeValueOnGameObject = function(gameObject, property, upgradeValue, persistentKey) {    

    if (!(property in gameObject)) return;

    let persistentValue = this.scene.persistentUpgradeManager.getCurrentUpgradeValue(persistentKey);
    if(persistentValue) upgradeValue += persistentValue;
    this[property] = upgradeValue;
}

//a sequential unlockable is a class of object that is unlockable in nature
//aka there is a list of base unlocks, each unlock is mapped to a key, and
//each unlock is contained in a list of next unlocks, which define what
//unlocks are available after the previous one is unlocked
export class SequentialUnlockable {
    constructor() {
        //map key to unlock object
        this.allUnlocks = new Map();
        //the unlocks that are available to start with
        this.baseUnlocks = [];
        //the currently unlocked objects
        this.currentUnlocks = [];
    }

    set(key, object) {

    }

    remove(key) {

    }

    unlock(key) {

    }
}

//will convert a big long number into a smaller number that conveys the same info
//for example 1,000,000 will become 1M, 1,334 will become 1.3K, where the 
//number of decimals is the MINIMUM number of decimals to display, but the 
//overall number of decimals is determined by maxLength, we will pad the numbers
//until we get to maxLength number of string characters. values after the decimal
//may also be removed if maxLength is too small to allow for them
//we assume number is an integer
export var abbreviateNumber = function(number, decPlaces=1) {
    //console.log('abbreviatuing number');
    // 2 decimal places => 100, 3 => 1000, etc
    decPlaces = Math.pow(10, decPlaces)

    // Enumerate number abbreviations
    var abbrev = ['K', 'M', 'B', 'T', 'QA', 'QI', 'SX', 'OC', 'NO', 'DC']

    // Go through the array backwards, so we do the largest first
    for (var i = abbrev.length - 1; i >= 0; i--) {
        // Convert array index to "1000", "1000000", etc
        var size = Math.pow(10, (i + 1) * 3)

        // If the number is bigger or equal do the abbreviation
        if (size <= number) {
        // Here, we multiply by decPlaces, round, and then divide by decPlaces.
        // This gives us nice rounding to a particular decimal place.
            number = Math.round((number * decPlaces) / size) / decPlaces

        // Handle special case where we round up to the next abbreviation
            if (number == 1000 && i < abbrev.length - 1) {
                number = 1
                i++
            }

            // Add the letter for the abbreviation
            number += abbrev[i]
        }
    }

    return number;
}

export var millisToMinutesAndSeconds = function(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return (
        seconds == 60 ?
        (minutes+1) + ":00" :
        minutes + ":" + (seconds < 10 ? "0" : "") + seconds
    );
}

export var isString = function(val) {
    return typeof val === 'string' || val instanceof String
}

export var getOppositeDirection = function(dir) {
    switch (dir) {
        case Directions.DOWN:
            return Directions.UP;
        case Directions.UP:
            return Directions.DOWN;
        case Directions.LEFT:
            return Directions.RIGHT;
        case Directions.RIGHT:
            return Directions.LEFT;
    }
}

export var getDirectionVector = function(dir) {
    switch (dir) {
        case Directions.DOWN:
            return {x: 0, y: 1};
        case Directions.UP:
            return {x: 0, y: -1};
        case Directions.LEFT:
            return {x: -1, y: 0};
        case Directions.RIGHT:
            return {x: 1, y: 0};
    }
}