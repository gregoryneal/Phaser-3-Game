//spells get added to a group which pools sprites for reuse
//when we want to cast a spell we check the group (not this object)
//for a Spell object that has it's active property set to false
//then we recast that spell at the new location, once the spell 
//hits an enemy or goes off the screen, we set it to inactive.
//https://newdocs.phaser.io/docs/3.55.2/Phaser.GameObjects.Group
class Spell extends Phaser.Physics.Arcade.Sprite {
    //key is a texture key not the spell key
    //spell key is defined by this.name
    constructor(scene, key) {
        super(scene, 0, 0, key);
        this.textureKey = key;
        this.name = 'unnamed spell';
        this.spellUpgrades = new Map();
        this.spellPool;
        this.speed = 100;
        this.passThroughValue = 1; //how many enemies can we go through before dying
        this.currentPassThroughValue = 0; //the current number of enemies we have passed through
        this.damage = 5;
        this.isSpell = true;

        this.availableUpgrades = []; // a list of keys of available upgrades for this spell, remove one every time
        this.addToUpdateList();
    }

    //apply an upgrade to itself
    //called from the spell pool
    //give the upgrade object itself, not the key
    addUpgrade(spellUpgrade) {
        if (this.spellUpgrades.has(spellUpgrade.name)) return;

        this.spellUpgrades.set(spellUpgrade.name, spellUpgrade);
        //setUpgradeValueOnGameObject(this, spellUpgrade.propertyValue, spellUpgrade.stat, spellUpgrade.persistentKey);
        spellUpgrade.applyUpgrade(this);
    }

    removeUpgrade(spellUpgrade) {
        if (this.spellUpgrades.has(spellUpgrade)) {
            spellUpgrade.remove(this);
            this.spellUpgrades.delete(spellUpgrade);
        }
    }

    preUpdate(time, delta) {
        if (this.scene.isPaused) return;

        this.anims.update(time, delta);
        
        if (this.x < -50 || this.y < -50 || this.y > this.scene.worldSize.height + 50 || this.x > this.scene.worldSize.width + 50) {
            this.die();
        }
    }

    //default behaviour of fire is to shoot at nearest enemy
    //override this for most stuff
    fire(x=this.scene.player.castPos.x, y=this.scene.player.castPos.y) {

        //get closest enemy, don't fire if there are no enemies nearby
        var getEnemyNearest = this.scene.getEnemyManager().getEnemyNearest();
        if (!getEnemyNearest || (getEnemyNearest[1].x == 0 && getEnemyNearest[1].y == 0)) {
            //returns false if there are no enemies spawned yet
            return;
        }

        if (x == 0 && y == 0) { 
            x = this.scene.player.castPos.x
            y = this.scene.player.castPos.y;
        }
        var v = new Phaser.Math.Vector2(getEnemyNearest[1].x - x, getEnemyNearest[1].y - y).normalize();
        var vx = v.x * this.speed;
        var vy = v.y * this.speed;
        this.setRotation(Math.atan2(vy, vx) - (Math.PI/2));
        //Phaser.Display.Bounds.CenterOn(this, )
        //enableBody(resetThisGameObject, newPosX, newPosY, makeActive, makeVisible)
        //you must set the position with this function or the cast position wont be consistent
        this.enableBody(true, this.scene.player.castPos.x, this.scene.player.castPos.y, true, true);
        this.setVelocityX(vx);
        this.setVelocityY(vy); 

        this.currentPassThroughValue = 0;
    }

    die() {
        this.setActive(false);
        this.setVisible(false);
        this.disableBody();
    }

    onHit(enemyHit, value) {
        //we only wanna hit enemies with our spells
        if (enemyHit.isEnemy) {

            //make sure our spell upgrades get a chance to apply damage or modifiers
            (this.spellUpgrades).forEach(element => {
                element.onHit(enemyHit, value);
            });

            this.die();
        }
    }
}

//SpellPool is responsible for managing a list of spell objects in a pool
//it will accept a fire command from the player object and first determine
//if we can fire a new spell, if so it will get the next inactive one from
//the spell pool and cast spell.fire() on it
//the modularity of this system means that SpellPools can
//control how a spell fires, and it can accept any Spell
//object, the Spell object itself controls the effects once fired.
//There should only be one spell pool per spell effect on the player.
//the player should have several spell groups each casting spells throughout the game
class SpellPool extends Phaser.GameObjects.GameObject {
    constructor(scene, player, spellPoolKey) {
        super(scene);
        this.name = spellPoolKey;
        this.upgradeDescription = "Spell Pool"; //nicely readable description of the spell pool effects for the upgrade screen
        this.upgradeStat = "New Spell"; //description of what we are unlocking
        this.finalStatValue = "Spell Pool" //spell pool name displayed on upgrade screen
        this.upgradeTextureKey = "default-upgrade-image"; //the image key to display for unlocking this spellpool on the upgrade screen
        this.t = 10000; //the current timer for when to start a new barrage
        this.spellTimer = 50; //ms before we can fire this spell again
        this.baseSpellCount = 1;
        this.spellCount = this.baseSpellCount; //the number of times to fire in this barrage
        this.spellDelay = 0; //the number of ms between each fire in the barrage
        this.spellDelayTimer = 0; //the timer between the individual spells in the barrage, resets after each spell fired
        this.cost = 50; //how many points it costs the player to unlock
        this.player = player;
        this.collidesWithEnemies = true; //does this group collide with enemy sprites?
        this.config;

        //all the applied upgrades for the spells and the spell pool
        this.spellUpgrades = new Map(); //when we create a new spell for the group pool thingy, we need to apply all these upgrades to the spell
        this.spellPoolUpgrades = new Map(); //same deal as above maps a key to a SpellUpgrade, but these are for spellPools instead of spells

        this.emitter = new Phaser.Events.EventEmitter();
        //this.scene.load.aseprite(this.textureKey, 'images/spells/'+this.textureKey+'.png', 'images/spells/'+this.textureKey+'.json');
    }

    setScene(newScene) {
        //stop spawning everything, and destroy all existing enemies before switching scenes


        this.scene = newScene;

        //regenerate all spells?
    }

    setConfig(config) {
        this.config = config;
        this.textureKey = this.config.key; //this is the key for the file name
    }

    //this adds this spell pool to the player spell pool list
    //using this.name as the key
    apply() {
        this.player.spells.set(this.name, this);
    }

    //add a new upgrade to this spellUpgrades list
    //when it is updated we need to update every spell in the group of the new upgrade
    //if the group member isn't created yet we rely on the callback method
    //specified in the overwritten implementation methods
    addSpellUpgrade(upgrade) {
        //if we designate this a pool upgrade
        if (upgrade.isPoolUpgrade) {
            this.addSpellPoolUpgrade(upgrade);
            return;
        }

        this.spellUpgrades.set(upgrade.name, upgrade);
        this.emitter.emit('addUpgrade', upgrade.name, upgrade);
        //apply spellUpgrades to each spell when called to do so from the upgrade menu or something
        if (this.group) {
            this.group.children.each(function(member) {
                member.addUpgrade(this);
            }, upgrade);
        } else {
            console.log("NO GROUP");
        }
    }

    addSpellPoolUpgrade(upgrade) {
        if (!this.spellPoolUpgrades.has(upgrade.name)) {
            this.spellPoolUpgrades.set(upgrade.name, upgrade);
            upgrade.applyUpgrade(this); //apply the upgrade to the spell pool
            this.emitter.emit('addPoolUpgrade', upgrade.name, upgrade);
        }
    }

    createGroup(scene) {
        scene.anims.createFromAseprite(this.textureKey);
        //console.log(this.config);
        this.group = scene.physics.add.group(this.config);

        if (this.collidesWithEnemies) {
            scene.registerOverlap(this.group);
        }

        //console.log(this.group);
        //add all spellUpgrades to existing pool objects on creation of the group
        //now make sure each member of the group has the upgrade
        //if we create the group with upgrades pre applied we need to apply the upgrades to the spells
        if (this.spellUpgrades.size > 0) {
            this.group.children.each(function(member) {
                //loop through each spellUpgrade
                //value -> spellUpgrade object
                //key   -> spell upgrade key
                this.forEach(function(value, key, map) {
                    //"this" inside the forEach refers to "member" from outside loop
                    this.addUpgrade(key, value);
                }, member);
                member.addUpgrade(this.upgradeKey, this.upgrade);
            }, this.spellUpgrades);
        }
    }

    spellPoolUpdate(delta) {
        if (this.scene.isPaused) return;

        if (this.t >= this.spellTimer && this.spellDelayTimer >= this.spellDelay) {
            //get object from pool and fire it
            const a = this.group.getFirstDead(true);
            if (a) {
                a.fire(this.scene.player.castPos.x, this.scene.player.castPos.y);
                this.spellCount--;
                this.spellDelayTimer = 0;
                if (this.spellCount <= 0) {
                    this.t = 0;
                    this.spellCount = this.baseSpellCount;
                }
            }
        } else {
            this.t += delta;
            this.spellDelayTimer += delta;
        }
/*

        if (this.scene.isPaused) return;

        if (this.t >= this.spellTimer) {
            //get object from pool and fire it
            const a = this.group.getFirstDead(true);
            if (a) {
                a.fire(this.scene.player.castPos.x, this.scene.player.castPos.y);
                this.t = 0;
            }
        } else {
            this.t += delta;
        }
        */
    }
    
}

export class GatlingBeam extends Spell {
    constructor(scene) {
        //this key is the sprite key
        super(scene, 'gatlingbeam');
        this.speed = 1000;
        this.name = 'gatling-beam';
        this.damage = 1;
    }

    onHit(enemyHit, value) {
        if (!enemyHit.isEnemy) return;

        this.currentPassThroughValue += 1;

        (this.spellUpgrades).forEach(element => {
            element.onHit(enemyHit, value);
        });

        if (this.currentPassThroughValue > this.passThroughValue) {
            this.die();
        }       
    }
}

//explodes and does damage in a radius
export class GrenadeDrop extends Spell {
    constructor(scene) {
        super(scene, 'grenade-small');
        this.speed = 50;
        this.name = 'grenade-drop-small'; //this field does nothing
        this.damageRadius = 70;
        this.detonateTime = 5000; //time till detonations in ms
        this.predetonateTime = 3000; //time till the predetonate animation plays
        this.damage = 10;
        this.t = 0; //timer for detonation, do
    }

    //fire from x, y (should be player cast position)
    //drop a grenade, choose a random direction and go 
    //that way for this.detonateTime milliseconds
    fire(x, y) {
        //sets visible and active as well
        this.enableBody(true, x, y, true, true);
        //give the velocity a random value
        Phaser.Math.RandomXY(this.body.velocity, this.speed);
        this.body.setAngularVelocity(/*((2*Math.random()) - 1) */ 150);
        //reset detonation since this is a pooled object
        this.t = 0;
        this.play({key: 'grenade-small-fire', repeat: -1});
    }

    //check for detonation in preupdate
    //so that we don't detonate during a pause
    //(which gets checked for in the super class)
    preUpdate(time, delta) {
        super.preUpdate(time, delta);        
        if (this.scene.isPaused) return;
        if (this.t >= this.predetonateTime) {
            if (this.anims.getName() != 'grenade-small-predetonate') {
                this.play({key: 'grenade-small-predetonate', repeat: -1});
            }
        }

        if (this.t >= this.detonateTime) {
            //detonate and do damage in the radius
            this.detonate();
            this.t = 0;
        } else {
            this.t += delta;
        }
    }

    detonate() {
        this.play('grenade-small-detonate');
        //get all bodies that overlap the detonation circle
        var bodies = this.scene.physics.overlapCirc(this.x, this.y, this.damageRadius, true, true);
        for (var i = 0; i < bodies.length; i++) {
            //don't hurt the player with his own grenade
            if (bodies[i] != this.scene.player.getSprite().body) {
                //tell the enemy object we got hit by this sprite explosive
                if (bodies[i].gameObject.isEnemy && bodies[i].gameObject.onHit) {
                    bodies[i].gameObject.onHit(this, this.damage);
                }
            }
        }
        //wait till animation finishes then disable the body
        this.on('animationcomplete-grenade-small-detonate', function(){
            this.die();
        }, this);
    }

    //no on hit so override it 
    //this just sits there for a few seconds until it explodes
    //doing damage in a radius
    onHit(enemyHit, value) {}

}


//spellpoolkey: gatling-beam
//spell texture: gatlingbeam
export class GatlingBeamPool extends SpellPool {
    constructor(scene, player, spellPoolKey) {        
        super(scene, player, spellPoolKey);
        var config = {
            key: 'gatlingbeam', //this is the texture key don't fuck with this
            classType: GatlingBeam,
            maxSize: 1000, //max number of GatlingBeams allowed at once
            visible: false,
            active: false,
            createCallback: function(gatlingbeam) {
                gatlingbeam.body.onOverlap = true; //turn on overlap event emitters **THIS IS IMPORTANT**
                gatlingbeam.setDisplaySize(4, 16);
                gatlingbeam.setSize(4, 16);
                gatlingbeam.setOrigin(0.5, 0.5); //make it spin from the middle pivot point
                gatlingbeam.setOffset(0);
                //play anims here gatlingbeam.play('animname');

                gatlingbeam.spellPool = this;
                //subscribe to spellPool event emitter on upgrade 
                //gatlingbeam.spellPool.emitter.on('addUpgrade', gatlingbeam.addUpgrade);

                gatlingbeam.currentPassThroughValue = 0;
                //apply all upgrades to new members when we create more for the pool               
                this.scene.upgradeManager.allSpellPools.get('gatling-beam').spellUpgrades.forEach(function(value) {
                    this.spell.addUpgrade(value);
                }, {spellPool: this, spell: gatlingbeam});
            },
        }
        this.setConfig(config);
        this.spellTimer = 300;
        this.finalStatValue = "Gatling Beam";
        this.upgradeDescription = "A beam of energy seeks out the nearest enemy.";
    }
}

//drops GrenadeSmall spells around the player
//spellPoolKey: grenade-drop
//spell texture key: grenade-small
export class GrenadeDropPool extends SpellPool {
    constructor(scene, player, spellPoolKey) {
        super(scene, player, spellPoolKey);
        var config = {
            //texture key for sprite in game
            key: 'grenade-small',
            classType: GrenadeDrop,
            maxSize: 100,
            visible: false,
            active: false,
            createCallback: function(grenade) {
                grenade.setOrigin(0.5, 0.5);
                grenade.setOffset(0); //aligns the physics body with the sprite
                grenade.spellPool = this; //set the spellpool reference
                this.scene.upgradeManager.allSpellPools.get('grenade-drop').spellUpgrades.forEach(function(value) {
                    this.addUpgrade(value);
                }, grenade);
            },
        }
        this.setConfig(config);
        this.spellTimer = 10000;
        this.spellDelay = 1000; //1 second between each grenade drop
        this.finalStatValue = "Grenade Dropper";
        this.upgradeDescription = "Passively drop grenades in random directions.";
    }
}

class MeteorImpact extends Spell {
    constructor(scene) {
        super(scene, 'meteorimpact');
        this.speed = 1;
        this.name = 'meteorimpact'; //this field does nothing
        this.damageRadius = 200;
        this.damage = 15;
        this.meteorIndex = 1; //the index to use for the animation
        this.target = new Phaser.Geom.Point();
        this.inMotion = false;
        this.tolerance = 10; //how close in value we need to be to be considered "there"
        this.offsetX = 0;
        this.offsetY = 0;
        this.radius = 0;
    }

    setIndex(index) {
        this.meteorIndex = index;
        //do the physics stuff here
    }

    //x, y is player cast position
    fire(x, y) {
        //the spellpool assigns this.meteorIndex immediately before calling this method
        this.getSetup(this.meteorIndex);
        //reset the initial values since we this could be reused

        //spawn a random meteor on the top of the screen 
        //out of view and then pick a point on the bottom
        //half of the screen as a target point, travel to
        //this point playing the fire-x animation where x 
        //is a random number between 1 and 5 (the number of
        //meteor impact animations there are). upon reaching
        //the destination play a random explosion animation
        //and do damage in a large radius 
        var x = this.scene.cameras.main.worldView.x; //where the enemy spawns
        var y = this.scene.cameras.main.worldView.y; //default to top left corner of camera location
        var w = this.scene.game.canvas.width;
        var h = this.scene.game.canvas.height;
        var cameraBounds = new Phaser.Geom.Rectangle(x, y, w, h); // {x, y, width, height} type of object x,y is top left of screen in world coords
        cameraBounds.getRandomPoint(this.target);

        //this.point = this.scene.add.circle(this.target.x, this.target.y, 40, 0xffffff);

        

        //this ensures that the meteor visually aligns with the initially generated target
        //the "real" target is always hit when the center of the image aligns with the this.target
        //but overlap hits are generated from the center of the body
        this.target.x -= this.offsetX - (this.width/2) + this.radius;
        this.target.y -= this.offsetY - (this.height/2) + this.radius;

        //var spawnY = cameraBounds.y - outside - (Math.random() * cameraBounds.height);
        //var spawnX = cameraBounds.x + cameraBounds.width + outside + (Math.random() * cameraBounds.width);
        var outside = 500;
        var spawnY = this.target.y - outside;
        var spawnX = this.target.x + outside;
        
        //sets visible and active as well
        this.enableBody(true, spawnX, spawnY, true, true);
        this.body.onOverlap = true;
        this.play({key: 'meteorimpact-fire-' + this.meteorIndex, repeat: -1, frameRate: 3});

        this.scene.physics.moveTo(this, this.target.x, this.target.y, 40, 2000);
        this.inMotion = true;

        /*for (var i = 0; i < this.spellCount; i++) {
             var meteorIndex = Math.floor(Math.random() * 5);
        }*/
    }

    preUpdate(time, delta) {
        //no super because i don't want to check if we are out of bounds since the sprite is so large and spawns off screen
        if (this.scene.isPaused) return;
        this.anims.update(time, delta);
        
        if (this.target && this.inMotion) {
            if (Phaser.Math.Distance.BetweenPoints(this.target, this) < this.tolerance) {
                this.setVelocity(0);
                this.explode();
            }
        }
    }

    explode() {
        this.x += this.offsetX - (this.width/2) + this.radius;
        this.y += this.offsetY - (this.height/2) + this.radius; 
        var bodies = this.scene.physics.overlapCirc(this.x, this.y, this.damageRadius, true, true);
        for (var i = 0; i < bodies.length; i++) {
            //don't hurt the player with his own grenade
            if (bodies[i] != this.scene.player.getSprite().body) {
                //tell the enemy object we got hit by this sprite explosive
                if (bodies[i].gameObject.isEnemy && bodies[i].gameObject.onHit) {
                    bodies[i].gameObject.onHit(this, this.damage);
                }
            }
        }

        //make the next animation visually line up with the target location

        this.inMotion = false;
        //play animation then do the below things after its done
        //pick random explosion
        var index = Math.floor(Math.random() * 2) + 1;
        this.once('animationcomplete-explosion-'+index+'-explode-'+index, function() {
            this.die();
        }, this);
        this.scene.cameras.main.shake(800 + Math.random() * 300, 0.005 + Math.random() * 0.005);
        this.onOverlap = false; //no more overlap events till we reuse in the pool
        this.play({key: 'explosion-'+index+'-explode-'+index});
    }

    //get a specialized physics body radius and offset
    //for the sprite animation, anything hit on the way gets 
    //destroyed too so we need this info
    getSetup(index) {
        switch (index) {
            case 1:
                this.radius = 60; //30
                this.offsetX = 65; //95
                this.offsetY = 395; //425
                break;
            case 2:
                this.radius = 60; //50
                this.offsetX = 70; //80
                this.offsetY = 400; //410
                break;
            case 3:
                this.radius = 60; //38
                this.offsetX = 71; //93
                this.offsetY = 398; //420
                break;
            case 4:
                this.radius = 60; //52
                this.offsetX = 64; //76
                this.offsetY = 396; //408
                break;
            case 5:
                this.radius = 60; //30
                this.offsetX = 65; //95
                this.offsetY = 395; //425
                break;
            default:
                this.radius = 60; //30
                this.offsetX = 95; //95
                this.offsetY = 425; //425
                break;
        }
        
        this.body.setCircle(this.radius);
        this.body.setOffset(this.offsetX, this.offsetY);
    }

    onHit(enemyHit, value) {
        //we only wanna hit enemies with our spells
        if (enemyHit.isEnemy) {

            //make sure our spell upgrades get a chance to apply damage or modifiers
            (this.spellUpgrades).forEach(element => {
                element.onHit(enemyHit, value);
            });
        }
    }
}

export class MeteorImpactPool extends SpellPool {
    constructor(scene, player, spellPoolKey) {
        super(scene, player, spellPoolKey);
        var config = {
            //texture key to load the spells with
            key: 'meteorimpact',
            classType: MeteorImpact,
            maxSize: 40,
            visible: false,
            active: false,
            createCallback: function(meteor) {
                //maybe define which meteor it is from here idk
                meteor.setOrigin(.5, .5);
                meteor.setOffset(0);
                meteor.spellPool = this;
                this.scene.upgradeManager.allSpellPools.get('meteorimpact').spellUpgrades.forEach(function(value) {
                    this.addUpgrade(value);
                }, meteor);
            }
        }
        this.setConfig(config);
        this.spellTimer = 10000;
        this.finalStatValue = "Meteor Rain";
        this.upgradeDescription = "Call upon the god of chaos and unleash meteor showers upon your enemies.";

        this.currIndex = Math.floor(Math.random() * 5) + 1; //the current meteor index
        this.baseSpellCount = 1;
        this.spellCount = this.baseSpellCount; //the number of times to fire in this barrage
        this.spellDelay = 1200; //the number of ms between each fire in the barrage
        this.spellDelayTimer = 0; //the timer between the individual spells in the barrage, resets after each spell fired
        this.t = this.spellTimer; //counter for when to fire
    }

    //each time we create a new one
    //set its index to a random value 
    //between 1 and 5
    spellPoolUpdate(delta) {
        if (this.scene.isPaused) return;

        if (this.t >= this.spellTimer && this.spellDelayTimer >= this.spellDelay) {
            //get object from pool and fire it
            const a = this.group.getFirstDead(true);
            if (a) {
                a.setIndex(this.currIndex);
                this.currIndex = Math.floor(Math.random() * 5) + 1;
                if (this.currIndex > 5) {
                    this.currIndex = 1;
                }
                a.fire(this.scene.player.castPos.x, this.scene.player.castPos.y);
                this.spellCount--;
                this.spellDelayTimer = 0;
                if (this.spellCount <= 0) {
                    this.t = 0;
                    this.spellCount = this.baseSpellCount;
                }
            }
        } else {
            this.t += delta;
            this.spellDelayTimer += delta;
        }
    }
}

class TimeWarp extends Spell {
    constructor(scene) {
        super(scene, 'timewarp');
        this.speed = 50;
        this.name = 'time-warp-beam'; //this field does nothing
        this.damage = 10;
        this.slow = 0.5; //slow them by half
        this.t = 0; //turn off by itself after a few seconds
        this.time = 2000; //how many ms to last
    }

    fire(x, y) {
        //sets visible and active as well
        this.enableBody(true, x, y, true, true);
        //give the velocity a random value
        var angle = Math.floor(Math.random() * 361);
        //NEED TO USE MATTER PHYSICS TO ENABLE NON AXIS ALIGNED BODY
        //OR I NEED TO MAKE A BUNCH OF SPHERES ALONG THE LENGTH OF THE SPELL WHICH IS DUMB
        //reset detonation since this is a pooled object
        this.t = 0;
        this.play({key: 'timewarp-fire', repeat: -1});
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);        
        if (this.scene.isPaused) return;

        if (this.t >= this.time) {
            this.die();
        } else {
            this.t += delta;
        }
    }

    onHit(enemy, damage) {
        if (enemy.isEnemy) {
            //make sure our spell upgrades get a chance to apply damage or modifiers
            (this.spellUpgrades).forEach(element => {
                element.onHit(enemyHit, value);
            });

            enemy.applySlow(this.slow, this.time);
        }   
    }
}

class TimeWarpPool extends SpellPool {
    constructor(scene, player, spellPoolKey) {
        super(scene, player, spellPoolKey);
        var config = {
            //texture key for sprite in game
            key: 'timewarp',
            classType: TimeWarp,
            maxSize: 10,
            visible: false,
            active: false,
            createCallback: function(spell) {
                spell.setOrigin(0.5, 0); //top center is what we wanna rotate around
                spell.setOffset(0); //aligns the physics body with the sprite
                spell.spellPool = this; //set the spellpool reference
                this.scene.upgradeManager.allSpellPools.get('timewarp').spellUpgrades.forEach(function(value) {
                    this.addUpgrade(value);
                }, spell);
            },
        }
        this.setConfig(config);
        this.spellTimer = 5000;
        this.finalStatValue = "Time Warp";
        this.upgradeDescription = "Slow enemies to a crawl.";
    }
}

//Spell IDEAS
//gatling beam: just a regular old gun
//  : faster firing -> spell pool upgrade
//  : more damage -> spell upgrade
//  : fire through more enemies -> spell upgrade 
//  : fire through all enemies
//time warp beam: slows down enemies caught in beam, also damages them
//  : increased slow
//  : wider beam
//  : more beams
//  : shorter timer
//  : pulls enemies into the center
// MIX w/ Meteor Impact
//  : calls in a meteor on location
//grenades: lobs grenades towards enemies in an arc, explodes on impact
//  : more grenades
//  : bigger explosion
//  : sucks them into a black hole instead of exploding
//homing shotgun: shoots projectile that explodes into many smaller projectiles which each track a target
//  : damage path
//  : more shells
//  : homing machine gun (basically gatling beam)
//wave emitter: constant beam that does constant damage in a cone or beam
//  : more waves
//  : waves track mouse, each new wave stacking in a circle
//  : more damage
//  : wave vortex
// MIX w/ homing drones:
//  : heals drones
//homing drones: drones that seek and destroy, but can also be destroyed themselves, have a respawn timer
//  : more drones
//  : quicker spawn
//  : damage
//  : stay near the player
//  : repair drones
//reflector shields: enemies bounce off and go the other way for a short perioud of time
//  : longer duration
//  : shorter cooldown
//  : enemies teleport to the edge of the map 
//  : heals while it's activated
//solar flare eruption: periodic full screen solar flare wipes out enemies in waves
//Meteor Impact: a meteor shower arrives and fucks. shit. up...
//  : more meteors
//  : shorter cooldown
// MIX w/ time warp 
//  : calls in a meteor on location (purchase from upgrade shop?)