import { Directions, SpawnPatterns } from "./definitions.js";
import { getDirectionVector, getOppositeDirection } from "./helper.js";

//this class handles enemy spawning logic, this way we can decouple the enemypools from the spawn logic
//we will simply define a method of spawning based on a class in the spawn manager.

//each enemypool is responsible for managing it's spawn timer, but the spawn manager will
//take an array of enemies and spawn them in some sort of pattern. this may help down the line
//to convert enemypools into json files so i don't have to have so many classes
export class SpawnManager extends Phaser.Plugins.ScenePlugin {
    constructor(scene, manager) {
        super(scene, manager);
    }
    
    create() {
        this.canvas = this.scene.game.canvas;
    }
    
    //spawn a group of enemies in a line with a length a certain distance from the player
    //the direction from the player will be determined by the enemy "direction" value 
    //that should be in enemies[0].config.onReset.direction. If this value is not found
    //default to the direction being down, so the enemies will spawn above the player
    spawnInLine(enemies, distance, halfLength, delay, delayVariance) {
        if (enemies.length > 0) {            
            let x = enemies[0].scene.player.currentSprite.x;
            let y = enemies[0].scene.player.currentSprite.y;
            let dir = enemies[0].config.onReset.direction ?? Directions.DOWN;
            let spawnDirection = getDirectionVector(getOppositeDirection(dir));
            //create a horizontal line on the player and then center/rotate it based on spawn config
            let spawnLine = new Phaser.Geom.Line(-halfLength, 0, halfLength, 0);
            //scale the line dire
            Phaser.Geom.Line.CenterOn(spawnLine, (spawnDirection.x * distance) + x, (spawnDirection.y * distance) + y);
            switch (dir) {
                case Directions.DOWN:
                    break;
                case Directions.UP:
                    break;
                case Directions.LEFT:
                    Phaser.Geom.Line.Rotate(spawnLine, Math.PI/2);
                    break;
                case Directions.RIGHT:
                    Phaser.Geom.Line.Rotate(spawnLine, Math.PI/2);
                    break;
            }

            let spawnPoints = spawnLine.getPoints(enemies.length);
            this._delayedSpawn(enemies, spawnPoints, delay, delayVariance);
        }
    }

    //spawn enemies in a circle of radius centered on x, y
    spawnInCircleMoveToCenter(enemies, x, y, radius, delay = 0, delayVariance = 0) {
        console.log(enemies.length);
        if (enemies.length > 0) {
            var spawnCircle = new Phaser.Geom.Circle(x, y, radius);
            var spawnPoints = spawnCircle.getPoints(enemies.length);
            var accumulatedDelay = 0;
            for (var i = 0; i < spawnPoints.length; i++) {            
                if (delay == 0) {
                    this._spawn(enemies[i], spawnPoints[i].x, spawnPoints[i].y);
                    enemies[i].target = spawnCircle; //move to center of circle
                } else {
                    var finalDelay = this.calculateFinalDelay(delay, delayVariance);
                    accumulatedDelay += finalDelay;
                    setTimeout(function(enemy, x, y, circle, spawnManager) {
                        spawnManager._spawn(enemy, x, y);
                        enemy.target = circle;
                    }, accumulatedDelay, enemies[i], spawnPoints[i].x, spawnPoints[i].y, spawnCircle, this);
                }
            }
        
            console.log(spawnPoints);
        }
    }

    spawnAroundPlayer(enemies, radius, delay, delayVariance) {
        if (enemies.length > 0) {
            let x = enemies[0].scene.player.currentSprite.x;
            let y = enemies[0].scene.player.currentSprite.y;
            let spawnCircle = new Phaser.Geom.Circle(x, y, radius);
            let spawnPoints = spawnCircle.getPoints(enemies.length);
            this._delayedSpawn(enemies, spawnPoints, delay, delayVariance);
        
            console.log(spawnPoints);
        }
    }

    /**
     * Spawns a group of enemies in a bunch at a certain offset from the players current position
     * 
     * @method SpawnManager#spawnBunch
     * 
     * @param {number} enemies - The spawning enemies
     * @param {object} offset - The offset from which to spawn the bunch, an object like {x: 0, y: 0}
     * @param {number} delay - The delay between spawning each enemy
     * @param {number} delayVariance - The random variance in the delay
     */
    spawnBunch(enemies, offset, delay, delayVariance) {
        if (enemies.length > 0) {
            let x = enemies[0].scene.player.currentSprite.x;
            let y = enemies[0].scene.player.currentSprite.y;
            let spawnSquare = new Phaser.Geom.Rectangle(x + offset.x, y + offset.y, 20, 20);
            let spawnPoints = spawnSquare.getPoints(enemies.length);
            this._delayedSpawn(enemies, spawnPoints, delay, delayVariance);        
            console.log(spawnPoints);
        }
    }

    _delayedSpawn(enemies, points, delay, delayVariance) {
        let accumulatedDelay = 0;
        for (var i = 0; i < points.length; i++) {            
            if (delay == 0) {
                this._spawn(enemies[i], points[i].x, points[i].y);
            } else {
                var finalDelay = this.calculateFinalDelay(delay, delayVariance);
                accumulatedDelay += finalDelay;
                setTimeout(function(enemy, x, y, spawnManager) {
                    spawnManager._spawn(enemy, x, y);
                    //enemy.target = circle;
                }, accumulatedDelay, enemies[i], points[i].x, points[i].y, this);
            }
        }
    }

    //spawn a single enemy at X, Y position, internal method
    //used as a timeout handler for delayed spawns
    _spawn(enemy, x, y) {
        //don't move this to the resetOnAlive function because we need to know x and y for the enableBody function and we shouldn't give that to the resetOnAlive function
        enemy.enableBody(true, x, y, true, true);
        //console.log(`SPAWNING AT <${x}, ${y}>`);
        enemy.resetOnAlive();
    }

    //delayVariance is a value between 0 and infinity, when 0 the
    //final delay is just delay, when > 0 the delay is calculated as follows:
    //delayVariance (DV)
    //variance factor = delayVariance + 1
    //final delay = [Math.random() * (((DV+1) * delay) - (delay/(DV+1)))] + delay/(DV+1)
    //this scales the delay between a random value between delay/(variance factor) and (variance factor) * delay
    calculateFinalDelay(delay, delayVariance) {
        var scaledVariance = delayVariance + 1;
        return Math.floor((Math.random() * (scaledVariance*delay)-(delay/scaledVariance)) + (delay/scaledVariance));
    }

    //this function spawns enemies based on a preset SpawnPattern
    spawnFromPreset(enemies, waveConfig) {
        //look up nullish coaelescing operator
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
        let delay = waveConfig.staggerDelay ?? 0; 
        let variance = waveConfig.staggerVariance ?? 0;
        let dist = waveConfig.radius ?? 400;
        switch (waveConfig.shape) {
            case SpawnPatterns.BOX: 
                break;
            case SpawnPatterns.CIRCLE: 
                this.spawnAroundPlayer(enemies, dist, delay, variance);
                break;
            case SpawnPatterns.LINE: 
                //spawn in a line
                let lineLength = waveConfig.length ?? 100;
                this.spawnInLine(enemies, dist, lineLength, delay, variance);
                break;
            case SpawnPatterns.BUNCHED:
                //spawn in a small square, make sure they are set to collidewithself so they space themselves out automatically
                //as we cannot do that here, also give them a stagger delay to make the physics calculations smoother
                //use the startoffset value to determine where to spawn the bunch
                var offset = waveConfig.startOffset ?? {x: 0, y: 200}
                this.spawnBunch(enemies, offset, delay, variance);
                break;
            case SpawnPatterns.RANDOM:
                //spawn a bunch with a random offset based on the radius value in the waveConfig
                //step 1: build a circle around the player
                //step 2: call getPoint(Math.random()) to get a random point on the circumference
                //step 3: profit
                let circle = new Phaser.Geom.Circle(0, 0, dist);
                this.spawnBunch(enemies, circle.getPoint(Math.random()), delay, variance);
                break;
            case SpawnPatterns.TRIANGLE:
                break;
            case SpawnPatterns.CORNERS: 
                break;
        }
    }
}