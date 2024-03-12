//EnemyPool is responsible for managing a pool of enemies,
//it should spawn them, animate them, and kill them etc
//this is a base class meant to be derived from.
//an enemy manager class will hold a list of these
//pools to spawn each game
//config: https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.GameObjects.Group.GroupConfig
class EnemyPool extends Phaser.GameObjects.GameObject {

    constructor(scene, config) {
        super(scene);
        this.config = config;
        this.textureKey = config.key;
        //load all files on creation
        this.speed = 100;
        this.collideWithSelf = true; //should this group be able to collide with members of the same group? 
        this.collideWithOthers = false; //should this group be able to collide with other groups?

        this.difficulty = 1;
        this.enemyCount = 1;
        this.spawnTimer = 1000; //how long to wait to spawn a group of enemies in ms
        this.staggerDelay = 0; //how long to wait in between spawning enemies from a single group
        this.staggerVariance = 0; //variance in staggerDelay, for example a value of 1 makes staggerDelay a random value between staggerDelay/2 and 2*staggerDelay
        //value of 2 makes it a random value between staggerDelay/3 and 3*staggerDelay, etc.
        this.timeout; //the timeout of the current spawn timer
        this.currentSpawnConfig = {}; //parameters to the startSpawning function, they are stored here every time we call startSpawning 
        //just in case we pause the pool, then we can use the parameters when we call resume

        this.isPaused = false; //did this pool get it's setInterval paused from the enemy manager?
        this.shouldResumeSpawnTimer = false; //should we resume the spawn timer on this.resume()?

        this.setDifficulty(1);
    }

    stopSpawning(destroyAllEnemies = false) {
        if(this.timeout) {
            clearTimeout(this.timeout);
        }

        if(destroyAllEnemies) {
            if (this.group) {
                this.group.clear(true, true); //destroy everything in the group, the params are removeFromScene and destroyChild
            }
        }
    }

    //spawn a wave after an initial delay, if repeat is true then set a timeout to spawn again after repeatDelay
    //if use spawnTimer is true it will use the class spawn timer otherwise it will use the repeatDelay
    startSpawning(delay, repeat, repeatDelay=delay, useSpawnTimer=true) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        //set spawn config
        this.currentSpawnConfig = {
            startTime: new Date().getTime(),
            initialDelay: delay,
            repeat: repeat,
            useSpawnTimer: useSpawnTimer,
            repeatDelay: repeatDelay,
        }

        this.timeout = setTimeout(this.spawnTimerHandler, delay, this, repeat, repeatDelay, useSpawnTimer);

        //console.log(`startSpawning(delay=${delay}, repeat=${repeat}, repeatDelay=${repeatDelay}, useSpawnTimer=${useSpawnTimer})`);
    }

    //called when the pool is paused
    pause() {
        this.isPaused = true;

        if (this.timeout) {
            //how much time is left on the current timer
            this.timeLeft = this.currentSpawnConfig.startTime + this.currentSpawnConfig.initialDelay - new Date().getTime();
            this.shouldResumeSpawnTimer = true;
            clearTimeout(this.timeout);
        }
    }

    //called when the pool is resumed or just started
    resume() {
        if (this.isPaused) {
            //we just resumed from a previous pause, maybe we need to do something here?

        } else {
            //we just called spawn for the first time
        }

        if (this.shouldResumeSpawnTimer) {
            this.timeout = setTimeout(this.spawnTimerHandler, this.timeLeft, this, this.currentSpawnConfig.repeat, this.currentSpawnConfig.repeatDelay, this.currentSpawnConfig.useSpawnTimer);
            this.shouldResumeSpawnTimer = false;
        }

        this.isPaused = false;
    }

    spawnTimerHandler(enemyPool, repeat, repeatDelay, useSpawnTimer = true) {
        //spawn a wave
        enemyPool.spawn();
        if (repeat) {
            if (useSpawnTimer) repeatDelay = enemyPool.spawnTimer;
            enemyPool.startSpawning(repeatDelay, repeat, repeatDelay, useSpawnTimer);
        }

        //console.log(`spawnTimerHandler(enemyPool=${enemyPool.textureKey}, repeat=${repeat}, repeatDelay=${repeatDelay}, useSpawnTimer=${useSpawnTimer})`);
    }

    setDifficulty(difficulty) {
        //console.log("Setting difficulty to " + difficulty);
        this.difficulty = difficulty;
        this.enemyCount = this.calculateEnemyCount(difficulty);
        this.spawnTimer = this.calculateSpawnTimer(difficulty);
    }

    //retun the spawn timer based on the difficulty value which is an integer
    calculateSpawnTimer(difficulty) {
        return 1000;
    }

    //return the enemy count per spawn based on the difficulty setting
    calculateEnemyCount(difficulty) {
        return 1;
    }

    createGroup() {
        //this has to be called in create in the scene so that the game can 
        //load the aseprite files and create the animations from them first
        //method order: scene.load.aseprite() -> scene.anims.createFromAseprite() -> scene.physics.add.group()
        this.group = this.scene.physics.add.group(this.config);
        this.scene.registerOverlap(this.group); //overlaps happen between all enemies and all spells and between all enemies and the player
        this.scene.registerCollider(this.group, this.collideWithSelf, this.collideWithOthers); //collisions happen if we allow them
         //the enemy pool group

         //you can also register overlap/collider callback functions here
         //or pass them down into the register if we need to define them later
    }

    //spawn function is a function from spawnManager that takes enemies and other params
    //and spawns the assembled grouped enemies
    //params is an array [] of parameters that goes after the enemies when sent to spawnFunction
    _spawn(spawnFunction, params) {
        if (this.scene.isPaused) return;

        //.log("TOTAL CHILDREN: " + this.group.children.size);
        if (this.group == null) {
            console.log("NULL GROUP on ENEMY_POOL");
            return;
        }

        var enemies = [];
        for (var i = 0; i < this.enemyCount; i++) {
            var enemy = this.group.getFirstDead(true, 0, 0);
            if (!enemy) {
                console.error("SOMETHING WRONG WITH ENEMIES SPAWNING METHOD");
            }
            enemies.push(enemy);
        }


        spawnFunction(enemies, ...params);
    }

    //spawn a single wave, never use this to create a timeout method for repeated spawning, use startSpawning() for that
    spawn(x=0, y=0) {

        if (this.scene.isPaused) return;

        //.log("TOTAL CHILDREN: " + this.group.children.size);
        if (this.group == null) {
            console.log("NULL GROUP on ENEMY_POOL");
            return;
        }

        var enemies = [];
        for (var i = 0; i < this.enemyCount; i++) {
            var enemy = this.group.getFirstDead(true, 0, 0);
            if (!enemy) {
                console.error("SOMETHING WRONG WITH ENEMIES SPAWNING METHOD");
            }
            enemies.push(enemy);
        }

        this.scene.spawnManager.spawnOnEdgeOfScreen(enemies, this.staggerDelay, this.staggerVariance);
    }

    //enemy is Enemy class
    despawn(enemy) {
        this.group.killAndHide(enemy);
    }
}

//an enemypool that is built using a config object
class EnemyPool2 extends Phaser.GameObjects.GameObject {
    //config is a levels config item from levels.json -> level1.customEnemies[n].pool
    //should have all the information required to setup an enemy pool exactly like 
    //the EnemyPool class
    constructor(scene, config) {
        super(scene);
        this.config = config;
        this.textureKey = config.group.texture;
        //load all files on creation
        this.collideWithSelf = config.pool.collideWithSelf; //should this group be able to collide with members of the same group? 
        this.collideWithOthers = config.pool.collideWithOthers; //should this group be able to collide with other groups?

        this.difficulty = 1;
        this.enemyCount = 1;
        this.spawnTimer = config.pool.spawnTimer; //how long to wait to spawn a group of enemies in ms
        this.staggerDelay = config.pool.staggerDelay; //how long to wait in between spawning enemies from a single group
        this.staggerVariance = config.pool.staggerVariance; //variance in staggerDelay, for example a value of 1 makes staggerDelay a random value between staggerDelay/2 and 2*staggerDelay
        //value of 2 makes it a random value between staggerDelay/3 and 3*staggerDelay, etc.
        this.timeout; //the timeout of the current spawn timer
        this.currentSpawnConfig = {}; //parameters to the startSpawning function, they are stored here every time we call startSpawning 
        //just in case we pause the pool, then we can use the parameters when we call resume

        this.isPaused = false; //did this pool get it's setInterval paused from the enemy manager?
        this.shouldResumeSpawnTimer = false; //should we resume the spawn timer on this.resume()?

        this.setDifficulty(1);

        //need to call createGroup() from EnemyPool, but it takes a createGroupConfig object:
        //https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.GameObjects.Group.GroupConfig
        //so we need to make one out of the info we have
        this.groupConfig = {
            key: config.group.texture, //key used to load aseprite files make sure the enemy art is images/enemies/pizza.png
            classType: Enemy,
            maxSize: config.group.maxSize,
            active: false,
            visible: false,
            createCallback: this.enemyCreateCallback,
        };
    }

    enemyCreateCallback(enemy) {
        enemy.setupWithConfig(this.config);
    }

    createGroup() {        
        this.group = this.scene.physics.add.group(this.config);
        this.scene.registerOverlap(this.group); //overlaps happen between all enemies and all spells and between all enemies and the player
        this.scene.registerCollider(this.group, this.collideWithSelf, this.collideWithOthers); //collisions happen if we allow them
    }    

    stopSpawning(destroyAllEnemies = false) {
        if(this.timeout) {
            clearTimeout(this.timeout);
        }

        if(destroyAllEnemies) {
            if (this.group) {
                this.group.clear(true, true); //destroy everything in the group, the params are removeFromScene and destroyChild
            }
        }
    }

    //spawn a wave after an initial delay, if repeat is true then set a timeout to spawn again after repeatDelay
    //if use spawnTimer is true it will use the class spawn timer otherwise it will use the repeatDelay
    startSpawning(delay, repeat, repeatDelay=delay, useSpawnTimer=true) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        //set spawn config
        this.currentSpawnConfig = {
            startTime: new Date().getTime(),
            initialDelay: delay,
            repeat: repeat,
            useSpawnTimer: useSpawnTimer,
            repeatDelay: repeatDelay,
        }

        this.timeout = setTimeout(this.spawnTimerHandler, delay, this, repeat, repeatDelay, useSpawnTimer);

        //console.log(`startSpawning(delay=${delay}, repeat=${repeat}, repeatDelay=${repeatDelay}, useSpawnTimer=${useSpawnTimer})`);
    }

    //called when the pool is paused
    pause() {
        this.isPaused = true;

        if (this.timeout) {
            //how much time is left on the current timer
            this.timeLeft = this.currentSpawnConfig.startTime + this.currentSpawnConfig.initialDelay - new Date().getTime();
            this.shouldResumeSpawnTimer = true;
            clearTimeout(this.timeout);
        }
    }

    //called when the pool is resumed or just started
    resume() {
        if (this.isPaused) {
            //we just resumed from a previous pause, maybe we need to do something here?

        } else {
            //we just called spawn for the first time
        }

        if (this.shouldResumeSpawnTimer) {
            this.timeout = setTimeout(this.spawnTimerHandler, this.timeLeft, this, this.currentSpawnConfig.repeat, this.currentSpawnConfig.repeatDelay, this.currentSpawnConfig.useSpawnTimer);
            this.shouldResumeSpawnTimer = false;
        }

        this.isPaused = false;
    }

    spawnTimerHandler(enemyPool, repeat, repeatDelay, useSpawnTimer = true) {
        //spawn a wave
        enemyPool.spawn();
        if (repeat) {
            if (useSpawnTimer) repeatDelay = enemyPool.spawnTimer;
            enemyPool.startSpawning(repeatDelay, repeat, repeatDelay, useSpawnTimer);
        }

        //console.log(`spawnTimerHandler(enemyPool=${enemyPool.textureKey}, repeat=${repeat}, repeatDelay=${repeatDelay}, useSpawnTimer=${useSpawnTimer})`);
    }

    setDifficulty(difficulty) {
        //console.log("Setting difficulty to " + difficulty);
        this.difficulty = difficulty;
        this.enemyCount = this.calculateEnemyCount(difficulty);
        this.spawnTimer = this.calculateSpawnTimer(difficulty);
    }

    //retun the spawn timer based on the difficulty value which is an integer
    calculateSpawnTimer(difficulty) {
        return 1000;
    }

    //return the enemy count per spawn based on the difficulty setting
    calculateEnemyCount(difficulty) {
        return 1;
    }

    //spawn function is a function from spawnManager that takes enemies and other params
    //and spawns the assembled grouped enemies
    //params is an array [] of parameters that goes after the enemies when sent to spawnFunction
    _spawn(spawnFunction, params) {
        if (this.scene.isPaused) return;

        //.log("TOTAL CHILDREN: " + this.group.children.size);
        if (this.group == null) {
            console.log("NULL GROUP on ENEMY_POOL");
            return;
        }

        var enemies = [];
        for (var i = 0; i < this.enemyCount; i++) {
            var enemy = this.group.getFirstDead(true, 0, 0);
            if (!enemy) {
                console.error("SOMETHING WRONG WITH ENEMIES SPAWNING METHOD");
            }
            enemies.push(enemy);
        }


        spawnFunction(enemies, ...params);
    }

    //spawn a single wave, never use this to create a timeout method for repeated spawning, use startSpawning() for that
    spawn(x=0, y=0) {

        if (this.scene.isPaused) return;

        //.log("TOTAL CHILDREN: " + this.group.children.size);
        if (this.group == null) {
            console.log("NULL GROUP on ENEMY_POOL");
            return;
        }

        var enemies = [];
        for (var i = 0; i < this.enemyCount; i++) {
            var enemy = this.group.getFirstDead(true, 0, 0);
            if (!enemy) {
                console.error("SOMETHING WRONG WITH ENEMIES SPAWNING METHOD");
            }
            enemies.push(enemy);
        }

        if (this.config.pool.waveConfig) {
            //use the level config to figure out how to spawn enemies
            this.scene.spawnManager.spawnOnEdgeOfScreen(enemies, this.staggerDelay, this.staggerVariance);
        }
    }

    //enemy is Enemy class
    despawn(enemy) {
        this.group.killAndHide(enemy);
    }
}

//https://newdocs.phaser.io/docs/3.54.0/Phaser.Physics.Arcade.Sprite
class Enemy extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, key) {
        super(scene, -100, -100, key); //key is the texture key that should be used to render this enemy
        this.isEnemy = true; //used by hit checks from spells to ensure we only hit enemies
        this.speed = 100;
        this.health = 5;
        this.baseHealth = 5;
        this.damage = 1; //how much damage we do to the player on overlap
        this.xp = 1; //how much xp is this enemy worth upon death
        this.target = null; //must be a sprite or something with an x, y property
        this.trackingValue = 1; //between 0 and 1, 1 being this enemy goes directly towards the player at all times 0 means it is not good tracking at all (figure this out)
        this.uuid = key + "-" + Phaser.Utils.String.UUID(); //key for the enemies map in the enemy manager
        this.timeAlive = 0;      
        this.maxTimeAlive = 1000000;  
        this.isDying = false; //set to true while we are in the death animation 
        this.isSlowed = false;

        //conditions for instadeath without giving xp
        this.timeAwayFromPlayer = 0; //the total time spent far away from the player
        this.maxTimeAwayFromPlayer = 5000;
        this.playerDistanceThreshold = this.scene.game.config.width * 2;
        
        //this makes the setTint do a full color replace
        //instead of an additive tint
        this.tintFill = true;

        this.addToUpdateList();
    }

    //when an EnemyPool2 is dynamically generating enemies, it will create a new enemy class
    //and call this function, supplying the enemy from the customEnemies array in the levels.json
    //config file. 
    setupWithConfig(config) {
        this.config = config;
        //values come from the arcade sprite class
        if (config.alpha) this.setAlpha(config.alpha);
        //config should only have one of either bodySize or circleRadius
        if (config.bodySize) this.setBodySize(config.bodySize.width, config.bodySize.height, config.bodySize.center);
        if (config.circleRadius) this.setCircle(config.circleRadius);
        if (config.bounce) this.setBounce(config.bounce);
        if (config.speed) this.speed = config.speed;
        if (config.health) this.health = config.health;
        if (config.damage) this.damage = config.damage;
        if (config.xp) this.xp = config.xp;
        if (config.onOverlap) this.onOverlap = config.onOverlap;
        if (config.displaySize) this.setDisplaySize(config.displaySize.x, config.displaySize.y);
        if (config.offset) this.setOffset(config.offset.x, config.offset.y);
        if (config.pushable) this.setPushable(config.pushable);
    }

    //what to do after we reuse this object in the pool
    //reset the hp etc
    resetOnAlive() {
        //console.log(this);
        this.body.setMaxSpeed(this.speed);
        this.isDying = false;
        this.timeAlive = 0;
        this.health = this.baseHealth;
        this.clearTint();
        //add to enemymanager enemies map
        this.scene.enemyManager.enemies.set(this.uuid, this);

        if (this.config.onReset) {
            let p = this.config.onReset;
            if (p.onOverlap) this.onOverlap = p.onOverlap;
            if (p.onCollide) this.onCollide = p.onCollide;
            //play animation then do a preconfigured action afterwards
            if (p.onceCallback && p.onceCallback.key) {
                this.once(`animationcomplete-${p.onceCallback.key}`, function() {

                    if (p.onceCallback.launchTowardsPlayer) {
                        this.enemy.scene.physics.moveTo(this.enemy, this.target.currentSprite.x, this.target.currentSprite.y, this.enemy.speed);
                    }
                    if (p.onceCallback.explode) {}
                    if (p.onceCallback.vacuum) {}
                    if (p.onceCallback.die) { this.die(); }
                }, {enemy: this, target: this.scene.player});
                this.play(p.onceCallback.key);
            } else {

                if (p.animation) this.play(p.animation);
            }
        }
    }

    //apply a slow to this enemy for a duration
    //new speed = speed * amount (0 <= amount <= 1)
    applySlow(duration, amount) {
        if (this.isSlowed) {
            //reset the timer
            clearTimeout(this.slowTimer);
        }        
        var oldMaxSpeed = this.body.maxSpeed;
        this.body.maxSpeed *= amount;
        this.isSlowed = true;
        this.slowTimer = setTimeout(function(oldMaxSpeed, enemy) {
            enemy.body.maxSpeed = oldMaxSpeed;
            enemy.isSlowed = false;
        }, duration, oldMaxSpeed, this);
    }

    die() {
        if (this.isDying) return; //we are already dying
        //play animation then die
        this.isDying = true;

        if (this.config.onDie) {
            let d = this.config.onDie;
            if (d.onOverlap) this.onOverlap = d.onOverlap;
            if (d.onCollide) this.onCollide = d.onCollide;
            if (d.animation) {
                let animation = {};
                //if d.animation is an animation key then play it, but it can also 
                //be an animation configuration object, so we much check first
                if (typeof d.animation === 'string' || d.animation instanceof String) {
                    //d.animation is a string
                    animation.key = d.animation;
                } else {
                    //d.animation is a config object
                    animation = d.animation;
                }
                this.once(`animationcomplete-${animation.key}`, this._die);
                this.play(animation);
            } else {
                this._die();
            }
        }
    }

    //internal die method callback
    _die() {
        this.setActive(false);
        this.setVisible(false);
        this.disableBody();
        //remove from enemymanager enemies map
        this.scene.enemyManager.enemies.delete(this.uuid);
    }

    //the object that we hit and the value of damage being taken
    //this is set by the bullet but we can have hit reduction applied here
    onHit(object, value) {
        //console.log("hit");
        //we only want enemies to get hit by spells
        if (object.isSpell) {
            //console.log("hit by spell");
            if (this.config.onHit) {
                let h = this.config.onHit;
                let t = '0xff0000';
                if (h.tint && Number(h.tint)) t = h.tint;
                this.setTint(Number(t));

                let timeout = 100;
                if (h.timeout) timeout = h.timeout;
                setTimeout(this.tintTimeoutHandler, timeout);

                if (h.takeDamage) this.takeDamage(value);
            }
        }
    }

    tintTimeoutHandler() {
        this.clearTint();
    }

    //this gets called directly from spellUpgrade hits 
    takeDamage(value) {
        //console.log("TAKING " + value + " DAMAGE");
        this.health -= value;

        if (this.health <= 0) {
            this.die();
            this.scene.player.addXP(this.xp);            
        }
    }

    preUpdate(time, delta) {
        if (this.scene.isPaused) {            
            return;
        }
        this.anims.update(time, delta);
        this.timeAlive += delta;

        if (!this.isDying && this.timeAlive > this.maxTimeAlive) {
            this.die();
        }

        if (Phaser.Math.Distance.BetweenPoints(this, this.scene.player.currentSprite) >= this.playerDistanceThreshold) {
            if (this.timeAwayFromPlayer >= this.maxTimeAwayFromPlayer) {
                this.die();
            } else {
                this.timeAwayFromPlayer += delta;
            }
        } else {
            if (this.timeAwayFromPlayer != 0) this.timeAwayFromPlayer = 0;
        }
        if (this.target) {
            //var dir = new Phaser.Math.Vector2(this.target.x - this.x, this.target.y - this.y).normalize();
            this.scene.physics.accelerateToObject(this, this.target, this.speed);
            //this.setVelocity(dir.x * this.speed, dir.y * this.speed);
        }
    }
}

//this class manages all the pools for each enemy type
//new scenes can import different enemies to spawn in index.js
//it basically just spawn them and gives them trajectories
//we should use the pool system similar to how we did the playerspells.js
//but we need a pool for each enemy type
export class EnemyManager extends Phaser.Plugins.ScenePlugin {

    constructor(scene, manager) {
        super(scene, manager);
        //maps a key to an object, not an instantiated one, just a type
        this.enemyPools = new Map();
        //maps a key to the instantiated pool object, this changes when we change scenes
        //we dont want to have a bunch of enemy pools layin around not doin anything
        this.instantiatedEnemyPools = new Map();
        this.activePools = []; //an array of active enemy pools, only spawn enemies added to this array
        this.enemySpawnTimer = new Map(); //maps a enemy pool key to a spawn timer integer so we can clear specific enemy spawn timers

        this.enemies = new Map(); //enemies register themselves here and deregister when they die

        this.difficulty = 100; //this cannot be lower than 1

        //used for closest enemy calculations
        this._lowestDist = 10000000;
        this._closestEnemy;
    }

    //setup the enemy pools map
    //called by baseplugin
    init() {
        //these are preconfigured enemies, if we start copying
        //a custom enemy class a bunch it would help to turn it
        //into a class here
        this.addEnemyPool('pizzas', PizzaEnemyPool);
        this.addEnemyPool('tacos', TacoTrajectileEnemyPool);
        this.addEnemyPool('bats', BatsPool);
    }

    addEnemyPool(key, enemyPool) {
        if (!this.enemyPools.has(key)) {
            this.enemyPools.set(key, enemyPool);
        }
    }

    removeEnemyPool(key) {
        if (this.enemyPools.has(key)) {
            this.enemyPools.delete(key);
            //clear out the enemy spawn timer
        }
    }

    //reset the enemy manager to a default state
    //call before closing the scene and going back 
    //to the main menu
    reset() {
        //stop spawning all enemies
        this.stopSpawningEnemies(true);
        //delete all instantiated pools
        this.instantiatedEnemyPools = new Map();
    }

    //set the state of the enemy manager to the start of the level
    //instantiate the enemy pool classes
    //set the enemy pools to the initial difficulty
    initializeEnemyPools(activePools) {
        if (activePools === undefined) activePools = ['pizzas', 'tacos', 'bats'];
        this.activePools = activePools;
        this.difficulty = 1;

        //set the initial difficulty by just changing the class variable
        for(let i = 0; i < activePools.length; i++) {
            //don't create unless we have a type for this pool and we haven't already created it
            //we maybe could remove this second requirement it's not necessary, and it would allow
            //multiple configurations of the same pool in a scene. TODO: consider this...
            if (this.enemyPools.has(activePools[i]) && !this.instantiatedEnemyPools.has(activePools[i])) {

                let type = this.enemyPools.get(activePools[i]);
                let pool = new type(this.scene);

                //create the group
                pool.createGroup();
                //set the difficulty
                pool.setDifficulty(this.difficulty);
                this.instantiatedEnemyPools.set(activePools[i], pool);
            }
        }
    }

    //initialize custom enemy pools that were created by config files
    initializeCustomPools(enemyPools) {
        for (let i = 0; i < enemyPools.length; i++) {

            //NOTE: the new pool object doesn't get added to this.enemyPools class map
            //keep this in mind
            let name = enemyPools[i].pool.name;
            if (!this.instantiatedEnemyPools.has(name)) {
                let pool = new EnemyPool2(this.scene, enemyPools[i]);

                pool.createGroup();
                pool.setDifficulty(this.difficulty);
                this.activePools.push(name);
                this.instantiatedEnemyPools.set(name, pool);
            }
        }
    }

    //apply it to the Slicer enemy so it can fire in the direction
    //of the nearest enemy each time.
    //Get nearest enemy to point x, y
    getEnemyNearest(x, y) {
        //console.log(this.enemies);
        if (this.enemies.length == 0) return false;

        this._lowestDist = 10000000;
        this._closestEnemy = null;
        if (!x) {
            x = this.scene.player.currentSprite.x + (this.scene.player.currentSprite.width / 2);
            y = this.scene.player.currentSprite.y + (this.scene.player.currentSprite.height / 2);
            //console.log(x + ', ' + y);
        }

        var e = this.scene.physics.closest(this.scene.player.currentSprite, [...this.enemies.values()]);
        if (!e) return false;
        //console.log(this.enemies);
        return [Phaser.Math.Distance.Between(e.x, e.y, x, y), e];
    }

    createAllGroups() {
        this.instantiatedEnemyPools.forEach(function(value, key, map) {
            value.createGroup();
        });
    }

    //start spawning all active pools
    startSpawningEnemies(initialDelay=0) {
        console.log(`startSpawningEnemies(${initialDelay}){}`);
        this.activePools.forEach(function(value) {
            if(this.instantiatedEnemyPools.has(value)) {
                var pool = this.instantiatedEnemyPools.get(value);
                console.log(`this.instantiatedEnemyPools.has(${value})`);
                pool.startSpawning(initialDelay, true); //initialdelay, repeat, useSpawnTimer=true, repeatDelay=initialdelay
            }
        }, this);
    }

    //stop spawning all pools, optionally destroy all enemies that are currently in the scene
    stopSpawningEnemies(destroyAllEnemies) {
        this.instantiatedEnemyPools.forEach(function(value) {
            value.stopSpawning(destroyAllEnemies);
        });
    }

    //spawn single wave of enemy pool by key
    spawnWave(enemyPoolKey) {
        if(this.instantiatedEnemyPools.has(enemyPoolKey)) {
            var pool = this.instantiatedEnemyPools.get(enemyPoolKey);
            pool.startSpawning(0, false); //initial delay, repeat
        }
    }

    //start repeated spawning of enemy pool
    startSpawningEnemy(enemyPoolKey) {
        if(this.instantiatedEnemyPools.has(enemyPoolKey)) {
            var pool = this.instantiatedEnemyPools.get(enemyPoolKey);
            pool.startSpawning(0, true, pool.spawnTimer); //initial delay, repeat
        }
    }

    //stop spawning a specific enemy pool, optionaly destroy all in the scene
    stopSpawningEnemy(enemyPoolKey, destroyAllEnemies) {
        if(this.instantiatedEnemyPools.has(enemyPoolKey)) {
            var pool = this.instantiatedEnemyPools.get(enemyPoolKey);
            pool.stopSpawning(destroyAllEnemies);
        }
    }

    //increase the difficulty by 1 level
    //this should increase the spawn rate of
    //enemies from each pool
    increaseDifficulty() {
        this.difficulty++;
        //increase for all pools, if we later wanna change to just active pools replace the
        //reference here for this.activePools and change the syntax a bit
        this.instantiatedEnemyPools.forEach(function(value) {
            value.setDifficulty(this);
        }, this.difficulty); 
    }

    //decrease the difficulty by 1 level
    decreaseDifficulty() {    
        this.difficulty--;
        //increase for all pools, if we later wanna change to just active pools replace the
        //reference here for this.activePools and change the syntax a bit
        this.instantiatedEnemyPools.forEach(function(value) {
            value.setDifficulty(this);
        }, this.difficulty); 
    }

    update(time, delta) {
    }
}

class PizzaEnemyPool extends EnemyPool {
    constructor(scene) {
        var config = {
            key: 'pizza', //key used to load aseprite files make sure the enemy art is images/enemies/pizza.png
            classType: Slice,
            maxSize: 300,
            active: false,
            visible: false,
            createCallback: function(pizza) {
                pizza.onOverlap = true;
                pizza.setCircle(28);
                pizza.setDisplaySize(16,16);
                pizza.setBounce(1);
            },
        };
        super(scene, config);
    }

    calculateSpawnTimer(difficulty) {
        return Math.floor(Math.max(25, 1000 - (3*difficulty)));
    }

    calculateEnemyCount(difficulty) {
        return Math.ceil(difficulty/3);
    }
}

//a basic spinning pizza enemy
class Slice extends Enemy {
    constructor(scene) {
        super(scene, 'pizza');
        this.target = this.scene.player.currentSprite;
        this.health = 15;
        this.baseHealth = 15;
    }

    resetOnAlive() {
        super.resetOnAlive();
        this.setAngularVelocity(-400 + (Math.random() * 800));
        this.body.setMaxSpeed(this.speed * (1 + Math.random() * .5));
        this.play({
            key: 'pizza-spin', 
            repeat: -1, 
            randomFrame: true,
            frameRate: Math.floor((Math.random() * 5) + 1)
        });
    }
}

class BatsPool extends EnemyPool {
    constructor(scene) {
        var config = {
            key: 'batsoutline', //key used to load aseprite files make sure the enemy art is images/enemies/{key}.png
            classType: Bats,
            maxSize: 200,
            active: false,
            visible: false,
            createCallback: function(bat) {
                bat.onOverlap = true;
                bat.setCircle(9);
                bat.setOffset(6,3);
                bat.setDisplaySize(32,32);
                bat.setBounce(1);
            },
        };
        super(scene, config);
    }

    calculateSpawnTimer(difficulty) {
        return 60000;
    }

    calculateEnemyCount(difficulty) {
        return 100;
    }

    spawn(x=0, y=0) {
        console.log("bats spawning");
        if (this.scene.isPaused) return;

        console.log("TOTAL CHILDREN: " + this.group.children.size);
        if (this.group == null) {
            console.log("NULL GROUP on ENEMY_POOL");
            return;
        }

        var bats = [];

        for (var i = 0; i < this.enemyCount; i++) {

            var enemy = this.group.create(x, y, this.config.key, false, false);
            if (!enemy) {
                //console.log("ENEMY NULL IN THIS.GROUP.GET()");
                //console.log("ACTIVE ENEMIES FROM POOL: " + this.group.getTotalUsed());
                break;
            }

            bats.push(enemy);
/*
            enemy.enableBody(true, x, y, true, true);
            enemy.setVelocityX(dir.x * this.speed);
            enemy.setVelocityY(dir.y * this.speed);
            enemy.reset();
            */
        }

        this.spawnManager.spawnInCircleMoveToCenter(bats, this.scene.player.castPos.x, this.scene.player.castPos.y, this.scene.game.canvas.width * 2);
        

        //do this manually you can't make them spawn in a circle easily i guess
        //maybe make a helper function
    }
}

class Bats extends Enemy {
    constructor(scene) {
        super(scene, 'batsoutline');
        this.health = 30;
        this.baseHealth = 50;
        this.speed = 30;
        this.maxTimeAlive = 60000;
    }

    resetOnAlive() {
        super.resetOnAlive();
        this.play({
            key: 'batsoutline-fly', 
            repeat: -1, 
            randomFrame: true,
            frameRate: 6,
        });
    }

    die() {
        super.die(true, {key:'batsoutline-die', frameRate: 6});
    }
}

//this taco shoots assembles itself at the edge of the screen
//and the shoots itself really fast towards the player position
//at the start of the animation (players have time to dodge)
//defaults to right side of screen (because the taco faces left in the sprite)
//but therse a 50% chance it can spawn on the left side
class TacoTrajectile extends Enemy {
    constructor(scene) {
        super(scene, 'taco');
        this.speed = 500;
        this.health = 6;
        this.baseHealth = 6;
        this.isDying = false; //set to true while we are in the death animation 
        this.maxTimeAlive = 10000;
    }

    resetOnAlive() {
        super.resetOnAlive();
        this.onOverlap = true;
        this.onCollide = true;
        //acquire target location
        var target = {x: this.scene.player.currentSprite.x, y: this.scene.player.currentSprite.y};
        //play build animation then shoot at target location after animation finished
        this.once('animationcomplete-taco-build', function() {
            this.obj.scene.physics.moveTo(this.obj, target.x, target.y, this.obj.speed);
        }, {obj: this, target: target});
        this.play({key: 'taco-build', frameRate: 6});
    }

    die() {
        this.onOverlap = false;
        this.onCollide = false;
        super.die(true, {key: 'taco-eat', frameRate: 4});
        
    }
}

class TacoTrajectileEnemyPool extends EnemyPool {
    constructor(scene) {
        var config = {
            key: 'taco',
            classType: TacoTrajectile,
            maxSize: 300,
            active: false,
            visible: false,
            createCallback: function(taco) {
                taco.onOverlap = true;
                taco.setCircle(8);
                taco.setDisplaySize(16,16);
                taco.setBounce(1);
                taco.moves = true;
            },
        };
        super(scene, config);
        
        this.collideWithSelf = true;
        this.collideWithOthers = true;
    }

    calculateSpawnTimer(difficulty) {
        return Math.floor(Math.max(50, 6000 - (3*difficulty)));
    }

    calculateEnemyCount(difficulty) {
        return Math.floor(Math.min(10, difficulty/5));
    }

    spawn(x, y) {
        if (this.scene.isPaused) return;

        //.log("TOTAL CHILDREN: " + this.group.children.size);
        if (this.group == null) {
            console.log("NULL GROUP on ENEMY_POOL");
            return;
        }

        for (var i = 1; i <= this.enemyCount; i++) { 

            //default to top left
            var spawnOnLeft = true;
            var spawnOnBottom = false;

            var enemy = this.group.getFirstDead(true, x=x, y=y);
            if (!enemy) {
                //console.log("ENEMY NULL IN THIS.GROUP.GET()");
                //console.log("ACTIVE ENEMIES FROM POOL: " + this.group.getTotalUsed());
                return;
            }

            var inside = 100; //how far inside the screen should we spawn
            var x = this.scene.cameras.main.worldView.x; //where the enemy spawns
            var y = this.scene.cameras.main.worldView.y; //default to top left corner of camera location
            var w = this.scene.game.canvas.width; //screen width
            var h = this.scene.game.canvas.height;

            // -> bottom left
            // -> bottom right
            // -> top right
            if (i % 4 == 1) {
                spawnOnBottom = true;
            } else if (i % 4 == 2) {
                spawnOnBottom = true;
                spawnOnLeft = false;
            } else if (i % 4 == 3) {
                spawnOnLeft = false;
            }

            if (spawnOnLeft) {
                enemy.flipX = true;
                x += inside;
            } else {
                enemy.flipX = false;
                x += w - inside;
            }

            if (spawnOnBottom) {
                enemy.flipY = true;
                y += h - inside;
            } else {
                enemy.flipY = false;
                y += inside;
            }
            enemy.enableBody(true, x, y, true, true);
            enemy.reset();
        }
    }
}