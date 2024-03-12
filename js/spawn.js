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

    //spawns a group of enemies on the edge of the screen with optional delay
    //between each spawn.
    //the outsideDistance is how far outside of the screen to spawn, there is no randomization for this yet
    spawnOnEdgeOfScreen(enemies, delay = 0, delayVariance = 0, outsideDistance = 250) {
        var accumulatedDelay = 0; //total accumulated delay for staggering enemy spawns based on random delay variance        
        //console.log(`spawnOnEdgeOfScreen(${enemies.length},${delay},${delayVariance},${outsideDistance})`);
        for (var i = 0; i < enemies.length; i++) {
            var a = Math.random();
            var x = this.scene.cameras.main.worldView.x; //where the enemy spawns
            var y = this.scene.cameras.main.worldView.y; //default to top left corner of camera location
            var w = this.canvas.width;
            var h = this.canvas.height;

            var text = '';
            if (a >= 0 && a <= 0.25) {
                //top border
                x += Math.random() * w;
                y -= outsideDistance;
                //target bottom border
                //tx += Math.random() * w;
                //ty += h

                text = 'top';
            } else if (a > 0.25 && a < 0.5) {
                //right border
                x += w + outsideDistance;
                y += Math.random() * h;
                //target left border
                //ty += Math.random() * h;
                text = 'right';
            } else if (a >= 0.5 && a <= 0.75) {
                //bottom border
                x += Math.random() * w;
                y += h + outsideDistance;
                //target top border
                //tx += Math.random() * w;
                text = 'bottom';
            } else {
                //left border
                y += Math.random() * h;
                x -= outsideDistance;
                //target right border
                //tx += w;
                //ty += Math.random() * h;
                text = 'left';
            }

            //console.log(`<${x}, ${y}>, <${text}>`);

            if (delay == 0) {
                this._spawn(enemies[i], x, y);
            } else {
                var finalDelay = this.calculateFinalDelay(delay, delayVariance);
                accumulatedDelay += finalDelay;
                setTimeout(this._spawn, accumulatedDelay, enemies[i], x, y);
            }
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

    //spawn a single enemy at X, Y position, internal method
    //used as a timeout handler for delayed spawns
    _spawn(enemy, x, y) {
        //console.log(`SPAWNING AT <${x}, ${y}>`);
        enemy.enableBody(true, x, y, true, true);
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
}