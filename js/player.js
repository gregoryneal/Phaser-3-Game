import { PlayerAnimationStateMachine } from './stateMachine.js'
import { millisToMinutesAndSeconds } from './helper.js';


//https://newdocs.phaser.io/docs/3.55.2/Phaser.GameObjects.Group
export class Player extends Phaser.Plugins.ScenePlugin {
    //TODO: remove all global variables from this class, it's tacky.
    //TODO: change input to take pointer instead of mouse input, read here: 
    //https://newdocs.phaser.io/docs/3.80.0/Phaser.Input.Pointer
    //https://newdocs.phaser.io/docs/3.80.0/Phaser.Input.InputManager#mousePointer
    currentScene;
    currentSprite;
    speed = 1;
    isSpawned = false;
    canMove = false;
    canCast = true;
    castPos = {x: 0, y: 0};
    spawnPosition = [];
    mouseOffset = [20, 50];
    stateMachine;
    deadzone = 0.5; //this controls deadzone width for animations, it is a measure of radians away from the y axis
    //within the deadzone the character faces backwards or forwards
    //outside of it the character faces to the sides
    frameTime = 1000; //how long between frames when we are animating through multiple different frames    
    currState = 'right'; //current animation state
    
    //debug text
    thetaText;
    stateText;

    hpText;
    spellPools = new Map(); //maps the spell key to the spell -> key value pair where key is the spell key and value is the spell object
    playerUpgrades = new Map();

    constructor(scene, manager) {
        super(scene, manager);
        this.spawnPosition[0] = this.scene.game.canvas.width * 1.2;
        this.spawnPosition[1] = this.scene.game.canvas.height/2;

        this.level = 1;
        this.xp = 0;
        this.nextLevel = 50; //xp required to go to next level
        this.xpText;

        this.points = 70;

        this.posText;

        this.isBeingControlled = false;

        this.upgradeDescription = "Player"; //used by the upgrade menu to label the upgrade
        //this.castCircle;

        this.healthbar;
        this.healthbarShadow;

        this.isPlayer = true;
        this.damage = 0; //how much damage we do to the enemies on overlap;

        this.baseHP = 100;
        this.hp = this.baseHP;

        this.lives = 3; //how many lives does this player have! fun!

        this.theta = 0;

        this.baseDrag = 0.99;
        this.drag = this.baseDrag;

        this.DEBUG = false;
    }

    //reset the player after we are done with them in a specific scene
    //call create to initialize the player again
    reset() {
        //remove sprite
        if (this.currentSprite === undefined) {

        } else {
            this.currentSprite.setActive(false).setVisible(false);
        }

        //remove preupdate event listener
        //this.scene.events.off('preupdate', this.preUpdate);

        //remove state machine
        this.stateMachine = undefined;

        if(this.DEBUG) {
            this.hpText = undefined;
            this.xpText = undefined;
            this.posText = undefined;
            this.timeText = undefined;
            this.fpsText = undefined;
            this.thetaText = undefined;
        }

        //unregister collider
        this.scene.destroyCollider(this.currentSprite);
    }    

    //only call when you want the player the be ready to play the level
    //this is exact opposite of reset()
    create() {
        //create the player sprite
        this.currentSprite = this.scene.physics.add.sprite(this.spawnPosition[0], this.spawnPosition[1]);
        this.currentSprite.body.onOverlap = true; //generate overlap events
        this.currentSprite.isPlayer = true;
        this.currentSprite.setDamping(true);
        this.currentSprite.setDrag(this.baseDrag);
        this.currentSprite.playerObject = this;
        this.currentSprite.onHit = function(object, damage) {
            //we only want the player to get hit by enemies
            if (object.isEnemy) {
                //console.log("HIT");
                //console.log(object);
                this.setTint(0xff0000);
                setTimeout(function(sprite) {
                    sprite.clearTint();
                }, 100, this);

                this.playerObject.takeDamage(damage);
            }
        };

        //create state machine to handle player animation states
        //based on mouse angle from player
        //TODO: make the deadzone configurable in settings? this doesn't affect gameplay
        this.stateMachine = new PlayerAnimationStateMachine();

        if (this.DEBUG) {
            this.hpText = this.scene.add.text(100, 100, "HP: " + this.hp.toString());
            this.xpText = this.scene.add.text(100, 120, "XP: " + this.xp + "/" + this.nextLevel);
            this.posText = this.scene.add.text(100, 140, "PS: " + this.currentSprite.x + ', ' + this.currentSprite.y);
            this.timeText = this.scene.add.text(100, 160, "T: 0");
            this.fpsText = this.scene.add.text(100, 180, "FPS: " + this.scene.game.loop.actualFps);
            this.thetaText = this.scene.add.text(100, 200, "TH: " + this.theta.toString());
        }

        //relative to this game object for some reason
        //this.healthbarShadow = this.scene.add.graphics();
        //this.healthbar = this.scene.add.graphics();
        //this.buildHealthbar();

        //this.castCircle = this.scene.add.circle(this.castPos.x, this.castPos.y, 40);
        //this.castCircle.setStrokeStyle(2, 0x1a65ac);
        this.updateCastPos();
        //register the overlap between the player and enemy groups
        //being overlapped is how the player takes damage, we don't
        //want to collide with them for the most part
        this.scene.registerOverlap(this.currentSprite);

        //this.scene.events.on('preupdate', this.preUpdate);
    }

    //return the amount of xp required to get from the current level to the next level
    xpInterval() {
        //do some calculation with the current xp value to make it non linear or something if u want
        return Math.pow(this.level, 2.5) + 49;
    }

    addSpellPool(spellPool) {
        if (!this.spellPools.has(spellPool.name)) {
            this.spellPools.set(spellPool.name, spellPool);
            spellPool.createGroup();
        }
    }

    //adds a player upgrade to the player
    //will pretty much store it then call the upgrade
    //class to apply itself
    addStatUpgrade(upgrade) {
        if (this.playerUpgrades.has(upgrade.name)) return false;

        this.playerUpgrades.set(upgrade.name, upgrade);
        upgrade.applyUpgrade(this);
        return true;
    }

    //adds a persistent stat upgrade
    //will permanently alter a property of the player
    //upgrade is PersistentPlayerUpgrade object
    addPersistentStatUpgrade(upgrade) {

    }

    addXP(value) {
        this.xp += value;
        this.points += value;
        if (this.xp >= this.nextLevel) {
            //increase nextLevel to the next level value
            this.nextLevel += this.xpInterval();
            this.level += 1;
            //show level up screen
            this.scene.pauseUpgrade();
        }
    }

    updateCastPos() {
        var bounds = this.currentSprite.getBounds();
        this.castPos.x = bounds.centerX;
        this.castPos.y = bounds.centerY;

        if (this.castCircle) {
            this.castCircle.x = this.castPos.x;
            this.castCircle.y = this.castPos.y;
        }
    }

    /**
     * Step the player, this should be called in the scene update method
     * and passed the time and delta values. The player moves towards the
     * mouse. We also handle the state machine here as well.
     * 
     * @param {number} time 
     * @param {number} delta 
     * @returns {Object} The amount moved {dx: number, dy: number}
     */
    step(time, delta) {
        let zero = {dx: 0, dy: 0};

        if (!this.currentSprite) return zero;

        if (this.DEBUG) {
            if (this.hpText) { 
                this.hpText.text = "HP: " + this.hp.toString();
                this.hpText.x = this.scene.cameras.main.worldView.x + 100;
                this.hpText.y = this.scene.cameras.main.worldView.y + 100;
            }
            if (this.xpText) { 
                this.xpText.text = "XP: " + this.xp + '/' + this.nextLevel;
                this.xpText.x = this.scene.cameras.main.worldView.x + 100;
                this.xpText.y = this.scene.cameras.main.worldView.y + 120;
            }
            if (this.posText) { 
                this.posText.text = "PS: " + this.currentSprite.x + ', ' + this.currentSprite.y;
                this.posText.x = this.scene.cameras.main.worldView.x + 100;
                this.posText.y = this.scene.cameras.main.worldView.y + 140;
            }
            if (this.timeText) {
                this.timeText.text = "T: " + millisToMinutesAndSeconds(this.scene.playTime);
                this.timeText.x = this.scene.cameras.main.worldView.x + 100;
                this.timeText.y = this.scene.cameras.main.worldView.y + 160;
            }

            if (this.fpsText) {
                this.fpsText.text = "FPS: " + this.scene.game.loop.actualFps;
                this.fpsText.x = this.scene.cameras.main.worldView.x + 100;
                this.fpsText.y = this.scene.cameras.main.worldView.y + 180;
            }

            if (this.healthbar && this.healthbarShadow) {
                this.healthbar.setPosition(this.currentSprite.x, this.currentSprite.y);
                this.healthbarShadow.copyPosition(this.healthbar);
            } else {
            }

            if (this.thetaText) {
                this.thetaText.text = "TH: " + this.theta.toString();
                this.thetaText.x = this.scene.cameras.main.worldView.x + 100;
                this.thetaText.y = this.scene.cameras.main.worldView.y + 200;
            }
        }
        
        this.updateCastPos();
        if (this.isBeingControlled) return zero;

        if (!this.canMove) {
            this.currentSprite.setVelocityX(0);
            this.currentSprite.setVelocityY(0);
            return zero;
        }

        let pointerOverUI = this.systems.game.plugins.get('LevelManager').isPointerOverGameUI();
        if (pointerOverUI) {
            this.currentSprite.setDrag(0.1); 
            return zero;
        } else {
            this.currentSprite.setDrag(this.baseDrag);
        }
        
        //current mouse position
        //var x = this.clamp(this.scene.game.input.mousePointer.x + this.mouseOffset[0], 0, this.scene.game.canvas.width);
        //var y = this.clamp(this.scene.game.input.mousePointer.y + this.mouseOffset[1], 0, this.scene.game.canvas.height);
        this.scene.game.input.mousePointer.updateWorldPoint(this.scene.cameras.main);
        var x = this.scene.game.input.mousePointer.worldX;
        var y = this.scene.game.input.mousePointer.worldY; 

        var sx = this.currentSprite.x;
        var sy = this.currentSprite.y;

        var diffX = x - sx;
        var diffY = y - sy;
        this.theta = Math.atan2(diffY, diffX); //the angle between the vector pointing from the player to the mouse and the x axis

        if (this.stateMachine) {
            this.stateMachine.step(this.currentSprite, this.theta, this.deadzone);
        }

        //var scale = Math.sqrt(Math.pow(diffX,2) + Math.pow(diffY,2));
        //move each direction by speed(mouseX - currX)
        
        /*if (Math.abs(diffX) > 2) this.currentSprite.x += this.speed * diffX / scale;
        if (Math.abs(diffY) > 2) this.currentSprite.y += this.speed * diffY / scale;*/
        
        var dx = diffX * this.speed;
        var dy = diffY * this.speed;
        if (Math.abs(diffX) > 20) this.currentSprite.setVelocityX(dx);
        if (Math.abs(diffY) > 20) this.currentSprite.setVelocityY(dy);

        return {dx: dx, dy: dy};
    }

    

    //iterate through each spellpools spellPoolUpdate method, where
    //they will determine if they should fire or something
    //for usage of this inside the foreach check this link out
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach
    castSpells(time, delta) {
        if (!this.canCast) return;
        if (this.scene.isPaused) return;
        this.spellPools.forEach(function(value, key, map) {
            value.spellPoolUpdate(this);
        }, delta);
    }

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    //respawn the player
    respawn() {
        var s = this.currentSprite;
        s.setPosition(this.spawnPosition[0], this.spawnPosition[1]);
        s.play({key:'idle-left',repeat: -1});
        s.body.setSize(15, 22);
        s.body.setOffset(15, 12);
        this.isSpawned = true;
        this.hp = this.baseHP;
        //this.buildHealthbar();
        this.canMove = true;
        this.canCast = true;
        return this.currentSprite;
    }

    takeDamage(damage) {
        this.hp -= damage;

        this.scene.cameras.main.shake(90 + Math.random() * 20, 0.002 + Math.random() * 0.002);
        //redraw the health bar
        this.drawHealthbar();

        if (this.hp <= 0) {
            this.die();
        }
    }

    //clear entire healthbar and shadow
    clearHealthbar() {
        this.healthbar.clear();
        this.healthbarShadow.clear();
    }

    //build entire healthbar and shadow
    buildHealthbar() {
        this.healthbarShadow.setDefaultStyles({
            lineStyle: {
                width: 2,
                color: 0xffffff,
                alpha: 0.7
            },
            fillStyle: {
                color: 0x000000,
                alpha: 1,
            }
        });
        this.healthbarShadow.fillRoundedRect(-15, -20, 30, 3, 2);
        this.healthbarShadow.strokeRoundedRect(-15, -20, 30, 3, 2);
        this.healthbar.fillStyle(0x9b1a14, 1);
        this.healthbar.fillRoundedRect(-15, -20, 30, 3, 2);
    }

    //update the healthbar fill amount
    drawHealthbar() {
        this.healthbar.clear();
        this.healthbar.fillStyle(0x9b1a14, 1);
        this.healthbar.fillRoundedRect(-15, -20, Math.max(0.01, 30 * this.hp / this.baseHP), 3, 2); //the 0.01 ensures it always shows a little bit of red
    }

    //oh dear you seem to have died!
    die() {
        if (this.lives <= 0) {
            //oh shit you lose bitch
            //kill all the enemies in a cinematic way 
            //and end with the players headless animation
        } else {
            this.lives--;
            //you can respawn with one less life
            //disable player control of character
            this.isBeingControlled = true;
            this.clearHealthbar();
            //prevent spells
            this.scene.pauseGame();
            //make the camera stay in position
            this.scene.cameras.main.stopFollow();
            //disable overlap events and blink for 5 seconds
            this.currentSprite.body.onOverlap = false;
            this.currentSprite.clearTint();
            /*setTimeout(function() {
                this.onOverlap = true;
            }, 5000, this.currentSprite.body);
            */
            this.scene.tweens.add({
                targets: this.currentSprite,
                tint: 0x0000ff,
                ease: "Linear",
                duration: 50,
                yoyo: true,
                repeat: 50,
                onComplete: function(tween, targets, params) {
                    targets[0].body.onOverlap = true;
                },
            });

            this.respawn();

            //move character to center of camera in 2 seconds
            this.scene.tweens.add({
                targets: this.currentSprite,
                y: this.scene.cameras.main.worldView.y + (this.scene.cameras.main.worldView.height/2),
                x: this.scene.cameras.main.worldView.x + (this.scene.cameras.main.worldView.width/2),
                duration: 2000,
                ease: 'Linear',
                loop: 0,
                yoyo: false,
                completeDelay: 500, //wait this long before firing onComplete
                onComplete: function(tween, targets, param) {
                    //give back control after moving to center of screen
                    param.isBeingControlled = false;
                    param.scene.cameras.main.startFollow(targets[0], true, 0.03, 0.03);
                    param.scene.resumeGame();
                },
                onCompleteParams: [this],
            });
            //enable character control, camera movement
            //enable overlap events and stop blinking after the 5 seconds is up
        }
    }

    //returns a state value based on the current angle theta
    //in the game world -PI/2 rads points upwards
    //so any value x between -pi/2 < x < pi/2 should return state right
    //and any other value x should return state left
    getStateBasedOnTheta(newTheta) {
        var newState = '';
        if (newTheta >= -1 * Math.PI / 2 && newTheta < Math.PI / 2) {
            //face right
            newState = 'right';
        } else {
            newState = 'left';
        }
        return newState;
    }
}


//player upgrade ideas

//  : speed
//  : crit modifier (total damage on hit = base damage * crit modifier if critting, just base damage if no crit)
//  : crit chance (0 to 1)
//  : dodge (0 to 1) chance to get hit = 1 - dodge
//  : luck (how often random events happen, as well as how much xp the player earns)
//  : defense (less damage from attacks, ranges from 0 - infinity) damage taken = base damage / ((defense/10)+1)
//  : pickup range (picks up consumables, drops, items, xp orbs whatever i decide to do, defaults to 0 the player must roll over them)
//
//  : explode on touch - when enemies touch you explode and knock everything back a bit ( cooldown, explosion range upgrade path )
//  : heal over time
//  : invisibility - following enemies can't see you for a bit
