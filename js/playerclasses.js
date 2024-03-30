//this class manages the player classes, we interact with it when we change classes and if we need any class based information
//a class is more thematic than anything, it will define base upgrades and spells that the player has, as well as a hopefully unique sprite and animations
export class PlayerClassManager extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);
    }
}