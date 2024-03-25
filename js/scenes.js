import { UIManager } from "./ui.js";
import { getPositionRelativeToViewportPercent, abbreviateNumber, millisToMinutesAndSeconds } from "./helper.js";

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({key: 'preload'});
    }

    preload() {

        //create load bar
        this.progressBarWidth = 300;
        this.progressBarHeight = 30;
        this.progressBoxWidth = 320;
        this.progressBoxHeight = 50;

        this.progressBar = this.add.graphics();
        this.progressBox = this.add.graphics();

        this.progressBox.fillStyle(0x222222, 0.8);
        this.center = this.cameras.main.midPoint;
        this.progressBox.fillRect(this.center.x - (this.progressBoxWidth/2), this.center.y - (this.progressBoxHeight/2), this.progressBoxWidth, this.progressBoxHeight);

        //console.log(this.center);
        //Phaser.Display.Align.In.Center(this.progressBox, this.cameras.main);
        //Phaser.Display.Align.In.Center(this.progressBar, this.cameras.main);


        //add loader hooks
        this.load.on('progress', function (value) {
            //console.log(value);

            this.progressBar.clear();            
            this.progressBar.fillStyle(0xffffff, 1);
            this.progressBar.fillRect(this.center.x - (this.progressBarWidth/2), this.center.y - (this.progressBarHeight/2), this.progressBarWidth * value, this.progressBarHeight);
            //this.cameras.main.centerOn(this.progressBar);      
        }, this);
                    
        this.load.on('fileprogress', function (file) {
            //console.log(file.src);
        });
        this.load.on('complete', function () {
            //console.log('complete');


            this.progressBar.destroy()
            this.progressBox.destroy();
        }, this);

        //load all assets
        this.loadAllAssets();
    }

    loadAllAssets() {
        //ui sprites
        this.load.image('button-2', 'images/interface/button-2.png');    
        this.load.image('button-1', 'images/interface/button-1.png');    
        this.load.image('selector-4', 'images/interface/selector-4.png');
        this.load.image('border-bottom-1', 'images/interface/border-bottom-1.png');
        this.load.image('border-6', 'images/interface/border-6.png');
        this.load.image('border-8', 'images/interface/border-8.png');
        this.load.image('background-2', 'images/interface/background-2.png');
        this.load.image('badge-holder-2', 'images/interface/badge-holder-2.png');
        this.load.image('indicator-locked-1', 'images/interface/indicator-locked-1.png');
        this.load.image('indicator-locked-3', 'images/interface/indicator-locked-3.png');
        this.load.image('indicator-unlocked-1', 'images/interface/indicator-unlocked-1.png');
        this.load.image('divider-fade-1', 'images/interface/divider-fade-001.png');
        this.load.image('panel-transparent-1', 'images/interface/panel-transparent-center-025.png');
        this.load.image('panel-border-1', 'images/interface/panel-border-026.png');

        this.load.aseprite('badges-1', 'images/interface/badges-1.png', 'images/interface/badges-1.json');

        //ui icons
        this.load.image('stardust', 'images/interface/icons/stardust.png');
        this.load.image('unprocessed-stardust', 'images/interface/icons/unprocessed-stardust.png');
        this.load.image('coin-1', 'images/interface/icons/coin-1.png');
        this.load.image('gem-1', 'images/interface/icons/gem-1.png');
        this.load.image('pause', 'images/interface/icons/pause.png');

        //cursors
        this.load.image('cursor-pointer-1', 'images/interface/cursors/cursor-pointer-1.cur');
        this.load.image('cursor-direction-1', 'images/interface/cursors/cursor-direction-1.cur');
        this.load.image('cursor-direction-25', 'images/interface/cursors/cursor-direction-25.cur');

        //backgroud stuff
        this.load.image('bgsun', 'images/bgsun.png');
        this.load.image('starsnear', 'images/starsnear.png');
        this.load.image('starsfar', 'images/starsfar.png');
        this.load.image('logopizza', 'images/logo/pizza1.png');
        this.load.image('logoparty', 'images/logo/party.png');
        
        //player sprites
        this.load.aseprite('white-anims', 'images/characters/white/white-anims.png', 'images/characters/white/white-anims.json');

        //spell sprites
        this.load.aseprite('gatlingbeam', 'images/spells/gatlingbeam.png', 'images/spells/gatlingbeam.json');
        this.load.aseprite('grenade-small', 'images/spells/grenade-small.png', 'images/spells/grenade-small.json');
        this.load.aseprite('meteorimpact', 'images/spells/meteorimpact.png', 'images/spells/meteorimpact.json');
        this.load.aseprite('explosion-1', 'images/spells/explosion-1.png', 'images/spells/explosion-1.json');
        this.load.aseprite('explosion-2', 'images/spells/explosion-2.png', 'images/spells/explosion-2.json');

        //enemy sprites
        this.load.aseprite('bat', 'images/enemies/batsoutline.png', 'images/enemies/batsoutline.json');
        this.load.aseprite('taco', 'images/enemies/taco.png', 'images/enemies/taco.json');
        this.load.aseprite('pizza', 'images/enemies/pizza.png', 'images/enemies/pizza.json');
        
    }

    create() {
        //create animations from aseprite files
        //badges has 3 animations (so far), each with 9 frames, we overlay 1 frame from each animation to create our badge
        this.anims.createFromAseprite('badges-1');

        //player anims
        this.anims.createFromAseprite('white-anims');

        //spell anims
        this.anims.createFromAseprite('explosion-1');
        this.anims.createFromAseprite('explosion-2');
        this.anims.createFromAseprite('grenade-small');
        this.anims.createFromAseprite('meteorimpact');
        

        //enemy anims
        this.anims.createFromAseprite('bat');
        this.anims.createFromAseprite('taco');
        this.anims.createFromAseprite('pizza');

        //load the main menu scene
        //never unload this scene so we don't unload any assets
        this.scene.launch('main-menu-scene');
    }
}

export class MainMenu extends Phaser.Scene {

    constructor() {
        super({key: 'main-menu-scene'});

        this.allMenus = [];
        this.allMenuSelectors = [];

        this.isPersistentUpgradeHoverMenuOpen = false; //set to true when we want to prevent closing a persistent upgrade window until we first hover the pointer over it and then move the pointer out of it
        this.persistentUpgradeHoverMenu = {}; //map keys to ui objects to override the values

        this.color_light = 0xDDDDDD;
        this.color_dark = 0x777777;
        this.color_primary = 0xFCBA03;

        this.menuPadding = 5;
    }

    preload() {        
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'js/plugins/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });

        //this.load.plugin('rexmodalplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexmodalplugin.min.js', true);
        this.load.plugin('rexintouchingplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexintouchingplugin.min.js', true);
        this.load.plugin('rexcontainerliteplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcontainerliteplugin.min.js', true);
        this.load.plugin('rexclickoutsideplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexclickoutsideplugin.min.js', true);
        this.load.plugin('rexbuttonplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbuttonplugin.min.js', true);
    }

    create() {
        //https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
        //this.input.setDefaultCursor('url(images/interface/cursors/pointer.cur), pointer');
        //this cursor is 16x16 but it's in a 32x32 image?
        this.input.setDefaultCursor('url(images/interface/cursors/cursor-pointer-1.png), pointer');

        this.modalPlugin = this.plugins.get('rexmodalplugin');

        let b = {x: 0, y: 0, width: 300, height: 600};
        this.cameras.main.setBounds(b.x, b.y, b.width, b.height, false);
        this.center = this.cameras.main.midPoint;

        //camera bounds setup
        //menu selector
        this.menuSelectorPadding = 100;
        this.menuSpacing = 50;
        
        this.menuButtonStyle = {
            fontFamily: 'PixelScript',
            fontSize: '20px',
        };

        this.titleStyle = {
            fontFamily: 'OEGothicPixel',
            fontSize: '50px',
        };

        this.defaultCursor = 'url(images/interface/cursors/cursor-pointer-1.png), pointer';
        this.purchaseCursor = 'url(images/interface/cursors/cursor-pointer-15.png), pointer';
        this.dragCursor = 'url(images/interface/cursors/cursor-direction-25.png), pointer';
        this.questionCursor = 'url(images/interface/cursors/cursor-question-1.png), pointer';

        this.saveManager.clearGameSave();
        this.createDefaultSaveFile();

        this.createTitle();

        this.createSavedGameDataPanel(); //shows saved game data
        this.createMainMenu();
        this.createPlayButtonMenu();
        this.createNewGameMenu();
        this.createSettingsMenu();
        this.createCharacterUpgradeMenu();
        this.createClassUpgradeMenu();
        this.createResumeGameMenu();

        this.showMainMenu();

        //when we begin a transition away from the main menu this is called
        this.events.on('transitionout', function(sys, data) {}, this);
        //when we wake the main menu this is called
        this.events.on('transitionwake', function(sys, data) {
            this.showMainMenu();
        }, this);

    }

    //default save file if none is found in localstorage
    createDefaultSaveFile() {
        let fakeSave = this.saveManager.emptySave;
        //fakeSave.persistentUpgrades = ['hp-2', 'hps-2'];
        //fakeSave.playerLevel = 932;
        fakeSave.stardust = 149;
        fakeSave.scrap = 34732;

        this.saveManager.createNewSave(fakeSave);
    }

    createTitle() {
        this.title = this.add.text(0, 0, "The Guardians of Space", this.titleStyle);
        //console.log(this.game.canvas.height);
        //console.log(this.cameras.main.worldView.height);
        Phaser.Display.Bounds.CenterOn(this.title, this.center.x, this.center.y - 200);
    }

    // A menu of buttons with a configurable selector
    // 
    //{
    //  selector: 'default' | image, //if 'default' then selector will be generated with this.createSelector()
    //  header: {
    //      text: "", //text for the button
    //      textStyle: {}, //regular textstyle object from phaser, default to this.menuButtonStyle
    //      divider: "", //a lower border seperator, key
    //      background: "", //key for a nineslice
    //  }
    //  buttons: [buttonConfig1, buttonConfig2, ...],
    //  buttonStyle: {}, //text style config object
    //  buttonName: "", //the name key for the buttons list
    //  ptrUpOverride: function(), //overrides buttonsconfig, if these exist we wont even check if they exist on buttons *optional
    //  ptrOverOverride: function(), *optional
    //  ptrOutOverride: function(), *optional
    //  ptrUpArgs: [],
    //  ptrOverArgs: [],
    //  ptrOutArgs: [],
    //  
    //  gridAlign: { 
    //      x, y, width, height, cellWidth, cellHeight //width and height are number of rows and columns, everything else in px
    //  },
    //  order: [], //the order of the elements, will sort each element in the menu according to this list
    //}
    //buttonN = { text: "", ptrUpHandler: function(...ptrUpArgs) *optional, style: {} *optional, ptrUpArgs: [], ptrOverHandler, ptrOverArgs: [], ptrOutHandler, ptrOutArgs: [], name: ""}
    createSelectorMenu(newMenuConfig) {
        //newMenu
        //newMenuSelector
        //buttons = [button1, button2, button3, ... , buttonN]
        var newMenu = {
            container: this.createMenuContainer(),
            buttons: [],
            numButtons: 0,
            tooltips: new Map(),
            orderableElements: new Map(), //a map of orderableElements, we add to this when we call the add function
            setVisible: function(bool) {
                this.container.setVisible(bool);
                return this.container;
            },
            setActive: function(bool) {
                this.container.setActive(bool);
                return this.container;
            },
            add: function(newElement) {
                //set this new element to be orderable
                if (newElement.name) this.orderableElements.set(newElement.name, newElement);
                this.container.add(newElement);
            },
            setPosition: function(x, y) {
                this.container.setPosition(x, y);
            }
        };

        if (newMenuConfig.selector) {
            //you must provide an instantiated nineslice or image object or the string 'default' if u wanna generate the default one
            if (newMenuConfig.selector == 'default') newMenu.selector = this.createSelector();
            else newMenu.selector = newMenuConfig.selector;
            newMenu.container.add(newMenu.selector);
        }
        

        //a map of unordered elements and their name keys
        let unorderedElements = new Map();

        //create all the buttons from the config
        if (newMenuConfig.buttons) {
            newMenu.numButtons = newMenuConfig.buttons.length;

            for (var i = 0; i < newMenuConfig.buttons.length; i++) {
                var tooltip;
                var newTooltip;
                // {
                //      x, y, width, height, text, textConfig, background,
                // }
                // displays a tooltip for the button on ptrover events and out
                // will create a text for the text but provide a created image or nineslice for the background object
                if (newMenuConfig.buttons[i].tooltip) {
                    tooltip = newMenuConfig.buttons[i].tooltip;

                    newTooltip = this.add.container(tooltip.x, tooltip.y);
                    let tc = { color: 'white', fontSize: '16px' }
                    if(tooltip.textConfig) tc = tooltip.textConfig;
                    let ttText = this.add.text(0, 0, tooltip.text, tc);

                    if (tooltip.background) {
                        tooltip.background.setPosition(tooltip.x, tooltip.y);
                        newTooltip.add(tooltip.background);
                    }

                    newTooltip.add(ttText);
                    Phaser.Display.Bounds.CenterOn(ttText, tooltip.x, tooltip.y);

                    newMenu.tooltips.set(newMenuConfig.buttons[i], newTooltip);

                    newTooltip.setVisible(false).setActive(false);

                }

                let btn;

                var style = this.menuButtonStyle;
                if (newMenuConfig.buttons[i].style) style = newMenuConfig.buttons[i].style;
                else if (newMenuConfig.buttonStyle) style = newMenuConfig.buttonStyle;

                if (newMenuConfig.ptrUpOverride) {
                    btn = this.createMenuButton2(newMenuConfig.buttons[i].text, newMenuConfig.ptrUpOverride, newMenuConfig.ptrUpArgs, style);
                } else {
                    btn = this.createMenuButton2(newMenuConfig.buttons[i].text, newMenuConfig.buttons[i].ptrUpHandler, newMenuConfig.buttons[i].ptrUpArgs, style);
                }
                
                //make the selector toggle on and off
                btn.on('pointerover', (function(newMenu, newButton, buttonConfig) {
                    if(newMenu.selector) this.centerSelectorOn(newMenu.selector, newButton);

                    if(buttonConfig.ptrOverHandler) {
                        if (buttonConfig.ptrOverArgs) {
                            buttonConfig.ptrOverHandler(...buttonConfig.ptrOverArgs); //should be an array to destructure
                        } else {
                            buttonConfig.ptrOverHandler();
                        }
                    }

                    if (newMenu.tooltips.has(buttonConfig)) {
                        newMenu.tooltips.get(buttonConfig).setVisible(true).setActive(true);
                    }

                }).bind(this, ...[newMenu, btn, newMenuConfig.buttons[i]]));

                btn.on('pointerout', (function(newMenu, buttonConfig) {
                    if (newMenu.selector) newMenu.selector.setVisible(false);

                    if (buttonConfig.ptrOutHandler) {
                        if(buttonConfig.ptrOutArgs) {
                            buttonConfig.ptrOutHandler(...buttonConfig.ptrOutArgs); //ptrOutArgs should be an array to destructure
                        } else {
                            buttonConfig.ptrOutHandler();
                        }
                    }

                    if (newMenu.tooltips.has(buttonConfig)) {
                        newMenu.tooltips.get(buttonConfig).setVisible(false).setActive(false);
                    }

                }).bind(this, ...[newMenu, newMenuConfig.buttons[i]]));

                //map the button name to the button object in the unordered elements map
                if (newMenuConfig.buttons[i].name) {
                    unorderedElements.set(newMenuConfig.buttons[i].name, btn);
                }

                if (newMenu.selector) this.allMenuSelectors.push(newMenu.selector);
                this.allMenus.push(newMenu.container);
                newMenu.buttons.push(btn);
                newMenu.container.add(btn);

                //automatically spaced in a vertical grid if no layout provided
                Phaser.Display.Bounds.CenterOn(btn, 0, this.menuSpacing * (i - ((newMenuConfig.buttons.length-1)/2)));
            }
        }

        if (newMenuConfig.header) {
            //add a header object to newMenu
            var ts = newMenuConfig.header.textStyle | this.menuButtonStyle;
            var tooltip = this.add.text(0, 0, newMenuConfig.header.text, {color: 'white'});
            var b = this.add.nineslice(0, 0, newMenuConfig.header.background, 0, tooltip.width+100, 50, 17, 17, 17, 17);
            var d = this.add.image(0, 0, newMenuConfig.header.divider);

            Object.assign(newMenu, {
                header: {
                    background: b,
                    text: tooltip,
                    divider: d,
                }
            });

            newMenu.container
            .add(b)
            .add(tooltip)
            .add(d);
        }

        //copy the gridalign object to the newMenu object
        if (newMenuConfig.gridAlign) {
            Object.assign(newMenu, {
                gridAlign: newMenuConfig.gridAlign
            });
        }

        //layout objects based on name keys inside layout list, 
        //if an element doesn't have a name property in this list
        //it will not be ordered and may be out of place
        //if we provide a gridAlign, all the elements will be ordered
        //and aligned in accordance to the order array
        if (newMenuConfig.order) {

        }

        

        return newMenu;
    }

    showMenu(menus) {
        this.hideAllMenus();
        if (Object.prototype.toString.call(menus) === '[object Array]') {
            //this is an array
            for (var i = 0; i < menus.length; i++) {
                menus[i].setVisible(true).setActive(true);
            }
        } else {
            menus.setVisible(true).setActive(true);
        }
    }

    showMainMenu() {
        this.showMenu(this.mainMenu);
    }

    showNewGameMenu() {
        this.showMenu(this.newGameMenu);
    }

    showPlayButtonMenu() {
        this.showMenu(this.playButtonMenu);
    }

    showSettingsMenu() {
        this.showMenu(this.settingsMenu);
    }

    showCharacterMenu() {
        this.showMenu(this.characterUpgradeMenuBts);
    }

    showClassMenu() {
        this.showMenu(this.classUpgradeMenuBts);
    }

    showResumeGameMenu(){
        this.showMenu([this.resumeGameMenu, this.resumeGameSelectorMenu]);
    }

    hideAllMenus() {
        for (var i = 0; i < this.allMenus.length; i++) {
            this.allMenus[i].setActive(false).setVisible(false);
        }

        for (var i = 0; i < this.allMenuSelectors.length; i++) {
            this.allMenuSelectors[i].setVisible(false);
        }

        
    }

    //create the menu that opens after the player selects PLAY on the main menu
    //this menu lets the user choose to create a new player or play a saved game
    //player can only have one saved game at a time

    //if create new game -> open the createNewGame menu where the player can choose between HOMEBOUND and BOSS mode
    //                   ---> HOMEBOUND mode: a prestige like game mode where the player builds resentment after each level, reducing stats, after they go home they reset level progress but keep persistent progress, enemies get harder after each run as well. .
    //                            -> player can collect items to reduce resentment, or even turn it negative, allowing for powerful stat boosts in the late game
    //                   ---> BOSS mode: same as homebound but no resentment, the going home mechanic is present but does nothing really

    //if load save -> load the saved game, we must detect a saved game and gray this button out if there is no saved game to load
    //             -> once the save is loaded, open the game menu which shows NEXT LEVEL, LEVELS, or QUIT buttons
    createPlayButtonMenu() {
        this.playButtonMenu = this.createSelectorMenu({
            selector: 'default',
            buttons: [
                { 
                    text: "New Game",
                    ptrUpHandler: function() {
                        this.showNewGameMenu();
                    },
                    tooltip: {
                        text: "Create a new game",
                        x: this.center.x/2,
                        y: 300,
                    }
                },
                { 
                    text: "Resume",
                    ptrUpHandler: function() {
                        //resume game
                        if (this.saveManager.tryGetGameSave()) {
                            this.showResumeGameMenu();
                        }
                    },
                    ptrOverHandler: function(headerMenu, headerMenuBG) {
                        headerMenu.setVisible(true);
                    },
                    ptrOverArgs: [this.headerMenu, this.headerMenuBG],
                    ptrOutHandler: function(headerMenu) {
                        headerMenu.setVisible(false);
                    },
                    ptrOutArgs: [this.headerMenu],
                    tooltip: {
                        text: "Start ",
                        x: this.center.x/2,
                        y: 300,
                    }
                },
                { 
                    text: "Back",
                    ptrUpHandler: function() {
                        this.showMainMenu();
                    },
                },
            ],
        });
    }

    createMainMenu() {
        this.mainMenu = this.createSelectorMenu({
            selector: 'default',
            buttons: [
                {
                    text: "Play",
                    ptrUpHandler: function() {
                        this.showPlayButtonMenu();
                    },
                    tooltip: {
                        text: "Play game",
                        x: this.center.x/2,
                        y: 300,
                    }
                },
                {
                    text: 'Character',
                    ptrUpHandler: function() {
                        this.showCharacterMenu();
                    },
                    tooltip: {
                        text: "Unlock permanent upgrades for your character",
                        x: this.center.x/2,
                        y: 300,
                    }
                },
                {
                    text: 'Class',
                    ptrUpHandler: function() {
                        this.showClassMenu();
                    },
                    tooltip: {
                        text: "Unlock powerful new classes",
                        x: this.center.x/2,
                        y: 300,
                    }
                },
                {   
                    text: 'Settings',
                    ptrUpHandler: function() {
                        this.showSettingsMenu();
                    },
                }
            ],
            gridAlign: {
                height: -1,
                cellWidth: 100,
                cellHeight: 50,
                x: -50,
                y: -75,
                position: Phaser.Display.Align.CENTER
            },
        });

        Phaser.Actions.GridAlign(this.mainMenu.buttons, this.mainMenu.gridAlign);
    }

    createNewGameMenu() {
        this.newGameMenu = this.createSelectorMenu({
            selector: 'default',
            buttons: [
                {
                    text: "Bounty mode",
                    tooltip: {
                        text: "Classic mode, with resentment",
                        x: this.center.x/2,
                        y: 300,
                    }
                },
                {
                    text: "Boss mode",
                    tooltip: {
                        text: "Same as homebound without resentment",
                        x: this.center.x/2,
                        y: 300,
                    }
                },
                {
                    text: "Back",
                    ptrUpHandler: function() {
                        this.showPlayButtonMenu();
                    }
                }
            ],            
            gridAlign: {
                height: -1,
                cellWidth: 100,
                cellHeight: 50,
                x: -50,
                y: -75,
                position: Phaser.Display.Align.CENTER
            }
        });
        Phaser.Actions.GridAlign(this.newGameMenu.buttons, this.mainMenu.gridAlign);
    }

    createSettingsMenu() {
        this.settingsMenu = this.createSelectorMenu({
            selector: 'default',
            header: {
                text: "Settings",
                textStyle: {color: 'white', fontSize: '10px', fontFamily: 'Morohashi'},
                background: 'button-2',
                name: 'h',
            },
            buttons: [
                {
                    text: "Physics Step Time",
                    name: 'b1',
                }, 
                {
                    text: "Back",
                    ptrUpHandler: function() {
                        this.showMainMenu();
                    },
                    name: 'b2',
                }
            ],            
            gridAlign: {
                height: -1,
                cellWidth: 100,
                cellHeight: 30,
                x: -50,
                y: -75,
                position: Phaser.Display.Align.CENTER
            },
            buttonStyle: {
                fontSize: '16px',
            },
            layout: ['h', 'b1', 'b2']
        });

        let layout = [this.settingsMenu.header.background, this.settingsMenu.header.divider, ...this.settingsMenu.buttons];
        Phaser.Actions.GridAlign(layout, this.settingsMenu.gridAlign);
        Phaser.Display.Bounds.CenterOn(this.settingsMenu.header.text, this.getCenterX(this.settingsMenu.header.background.x), this.getCenterY(this.settingsMenu.header.background.y));
    }    

    //used to create a notification at the top of the page that
    //tells the player info on the current save game
    //or that there isn't a current save game
    createSavedGameDataPanel() {
        this.saveGamePanelHeight = 150;
        this.saveGamePanelWidth = 500;
        let yMax = 200 - this.center.y;
        this.headerMenu = this.add.container(this.center.x, this.center.y);
        this.headerMenuBG = this.add.nineslice(0, yMax, 'button-2', 0, this.saveGamePanelWidth, this.saveGamePanelHeight, 18, 18, 16, 16).setOrigin(0.5);
        this.headerMenu.add(this.headerMenuBG);

        this.allMenus.push(this.headerMenu);

        if (this.saveManager.cachedSave) {
            this.savedGameDataPanel = this.createSavedGameDataInnerPanel(this.saveManager.cachedSave, 0, yMax, this.saveGamePanelWidth, this.saveGamePanelHeight);
            this.headerMenu.add(this.savedGameDataPanel);
        } else {
            this.headerMenuText = this.add.text(0, 0, "No saved game data :(", this.menuButtonStyle);
            this.headerMenu.add(this.headerMenuText);
            Phaser.Display.Bounds.CenterOn(this.headerMenuText, 0, yMax);
        }
    }

    //creates a savedGameDataPanel centered on x,y that will fit inside panelWidth, panelHeight box
    createSavedGameDataInnerPanel(save, x, y, panelWidth, panelHeight) {
        let badgeW = 32;
        let badgeH = 32;
        let badgeX = ((badgeW - panelWidth)/2) + 50;
        let badgeY = ((badgeH - panelHeight)/2) + 25;
        let panel = this.add.container(x, y);
        this.badge = this.getBadgeIcon(save.playerLevel).setPosition(badgeX, badgeY);
        this.badgeText = this.add.text(0, 0, save.playerLevel.toString(), { fontFamily: 'Morohashi', fontSize: '25px'});
        this.badgeHolder = this.add.image(badgeX, badgeY, 'badge-holder-2');

        this.lvlSeperator = this.add.image(badgeX + badgeW + 50, 0, 'border-8');

        this.gameModeText = this.add.text(0, 0, this.saveManager.getGameModeText());

        this.lvlText = this.add.text(0, 0, `lvl: \t${save.currentLevel}`);
        this.resText = this.add.text(0, 0, `res: \t${save.resentment}`);
        this.dustText = this.add.text(0, 0, `dst: \t${save.stardust}`);
        this.scrapText = this.add.text(0, 0, `scp: \t${save.scrap}`);

        for (var i = 1; i <= this.badge.size; i++) {
            let p = 'badge'+i.toString();
            if (this.badge[p]) {
                panel.add(this.badge[p]);
            }                   
        }
        panel//.add(this.badgeHolder)
        .add(this.badgeText)
        .add(this.lvlText)
        .add(this.resText)
        .add(this.dustText)
        .add(this.scrapText)
        .add(this.lvlSeperator)
        .add(this.gameModeText);

        Phaser.Display.Bounds.CenterOn(this.gameModeText, (panelWidth/2) - (this.gameModeText.width/2) - 10, -(panelHeight/2) + this.gameModeText.height);
        Phaser.Display.Bounds.CenterOn(this.badgeText, badgeX, badgeY + (badgeH/2) + 10);

        Phaser.Display.Bounds.CenterOn(this.lvlText, badgeX + 5, badgeY + badgeH + 15);
        this.resText.setPosition(this.lvlText.x, this.lvlText.y + (this.lvlText.height/2) + 6);
        this.dustText.setPosition(this.resText.x, this.resText.y + (this.resText.height/2) + 6);
        this.scrapText.setPosition(this.dustText.x, this.dustText.y + (this.dustText.height/2) + 6);

        return panel;
    }

    //this screen allows the player to unlock persistent upgrades for their character
    createCharacterUpgradeMenu() {
        this.characterUpgradeMenuWidth = 500;
        this.characterUpgradeMenuHeight = 350;
        this.characterUpgradeMenu = this.add.container(0, 0);
        this.characterUpgradeMenuBG = this.add.nineslice(0, 0, 'button-2', 0, this.characterUpgradeMenuWidth, this.characterUpgradeMenuHeight, 18, 18, 16, 16);
        //this.characterUpgradeMenuBG = this.add.image(0, 0, 'button-2');

        //this is an array of upgrade keys, we need to load this from localstorage first
        //then when the player gets an upgrade, we save that to local storage, and replace
        //current upgrade key with the next one ,we can use upgradesManager.nextUpgrades or whatever.
        //even though nextUpgrades is a list we can just assume it's the next one, or if there are more than one
        //next upgrade we can add buttons to allow the player to get that upgrade
        //
        let currentUpgrades = [];
        let allUpgrades = this.upgradeManager;

        this.characterUpgradeMenuBts = this.createSelectorMenu({
            selector: 'default',
            buttons: [
                {
                    text: "Back",
                    ptrUpHandler: function() {
                        this.showMainMenu();
                    }
                }
            ]
        });



        this.characterUpgradeMenu.add(this.characterUpgradeMenuBG);
        this.characterUpgradeMenuBts.add(this.characterUpgradeMenu);
        
        //this.allMenus.push(this.characterUpgradeMenu);

                    
        let gridAlign = {
            height: -1,
            cellWidth: 100,
            cellHeight: 30 + this.characterUpgradeMenuHeight/2,
            x: -50,
            y: -200,
            position: Phaser.Display.Align.CENTER
        };

        Phaser.Actions.GridAlign([this.characterUpgradeMenu, ...this.characterUpgradeMenuBts.buttons], gridAlign);
    }

    //this screen allows the player to unlock new classes
    createClassUpgradeMenu() {
        this.classUpgradeMenuWidth = 500;
        this.classUpgradeMenuHeight = 350;
        this.classUpgradeMenu = this.add.container(0, 0);
        this.classUpgradeMenuBG = this.add.nineslice(0, 0, 'button-2', 0, this.classUpgradeMenuWidth, this.classUpgradeMenuHeight, 18, 18, 16, 16);
        //this.characterUpgradeMenuBG = this.add.image(0, 0, 'button-2');


        this.classUpgradeMenuBts = this.createSelectorMenu({
            selector: 'default',
            buttons: [
                {
                    text: "Back",
                    ptrUpHandler: function() {
                        this.showMainMenu();
                    }
                }
            ]
        });

        this.classUpgradeMenu.add(this.classUpgradeMenuBG);
        this.classUpgradeMenuBts.add(this.classUpgradeMenu);
        
        //this.allMenus.push(this.characterUpgradeMenu);

                    
        let gridAlign = {
            height: -1,
            cellWidth: 100,
            cellHeight: 30 + this.classUpgradeMenuHeight/2,
            x: -50,
            y: -200,
            position: Phaser.Display.Align.CENTER
        };

        Phaser.Actions.GridAlign([this.classUpgradeMenu, ...this.classUpgradeMenuBts.buttons], gridAlign);
    }

    //create one of these and reuse for every single persistent upgrade button in the main menu
    createPersistentUpgradeButtonHoverWindow() {
        let ts = { fontFamily: 'Nasa21', fontSize: '14px', color: 'white'};

        //outer panel
        let s = this.rexUI.add.sizer({
            x: this.center.x,
            y: this.center.y,
            orientation: 'y',
            space: { item: 5, top: 10, bottom: 10, left: 10, right: 10, },
            width: 200,
        });

        //this sizer indicates the power level of all upgrades
        let valueSizer = this.rexUI.add.sizer({
            orientation: 'y',
            space: { item: 10, },
            width: 60,
        });

        let valuesArraySizer = this.rexUI.add.sizer({
            orientation: 'y',
            space: {item: 0},
            width: 60,
        });

        //the title of the stat being upgraded
        let vSTitle = this.add.text(0, 0, 'baseHP');
        
        valueSizer
        .add(vSTitle, {align: 'center'})
        .add(valuesArraySizer, {align: 'right'})

        let costSizer = this.rexUI.add.sizer({
            x: 0, 
            y: 0,
            orientation: 'y',
            space: { item: 5, }, 
            width: 50,
            height: 50,
        });

        let costText = this.add.text(0, 0, 'cost', ts);
        let sdCostText = this.add.text(0, 0, 'sd: /', ts);
        let scCostText = this.add.text(0, 0, 'sc: /', ts);

        costSizer
        .add(costText)
        .addSpace()
        .add(sdCostText)
        .add(scCostText)
        .setChildrenAlignMode('left')
        .layout();

        let costValueSizer = this.rexUI.add.sizer({
            space: { item: 20, left: 10, right: 10, top: 10, bottom: 10 },
            width: s.width,
        });

        costValueSizer
        .add(costSizer)
        .addSpace()
        .add(valueSizer)
        .layout();

        let purchaseSizer = this.rexUI.add.sizer({                    
            space: { item: 5, left: 5, right: 5 },
            width: 50,
            height: 25
        });
        let purchaseBckgnd = this.add.nineslice(0, 0, 'button-1', 0, 50, 50, 16, 16, 16, 16);

        let purchaseText = this.add.text(0, 0, 'purchase', ts).setColor('black');
        let purchaseBtn = this.plugins.get('rexbuttonplugin').add(purchaseSizer, {clickInterval: 1000});
        purchaseBtn.on('over', function(button, gameObject, pointer, event) {
            console.log(pointer);
            //console.log(pointer);
            let u = gameObject.getData('parent').ref.upgrade;
            if (u) {
                gameObject.getData('background').setTint(0xBBBBBB);
            } else {
                console.log('no upgrade');
            }
            this.input.manager.canvas.style.cursor = this.purchaseCursor;
        }, this);
        purchaseBtn.on('out', function(button, gameObject, pointer, event) {
            gameObject.getData('background').clearTint();
            this.input.manager.canvas.style.cursor = this.defaultCursor;
        }, this);
        purchaseBtn.on('up', function(button, gameObject, pointer, event) {
            gameObject.getData('background').clearTint();
            let p = gameObject.getData('parent');
            let u = p.ref.upgrade;
            if (u) {
                console.log(u.key);
                let nu = u.manager.tryPurchaseUpgrade(u.key);
                //close persistent hover window
                p.hide();
                if (nu) {
                    //console.log('SUCCESS:');
                    //console.log(nu);
                }
            } else {
                //console.log('no upgrade');
            }
        });

        purchaseSizer.setData('background', purchaseBckgnd);
        purchaseSizer.setData('parent', s);

        purchaseSizer
        .add(purchaseText)
        .addBackground(purchaseBckgnd)
        .sendChildToBack(purchaseBckgnd)
        .layout();

        let description = this.add.text(-s.width + 5, -10, 'description', ts);
        let count = this.add.text(s.width - 5, s.height + 5, '1/5', ts);
        let title = this.add.text(0, 0, "Test", ts);

        let titleCount = this.rexUI.add.sizer({
            space: { item: 20, left: 10, right: 10 },
            width: s.width,
        });
        titleCount
        .add(title)
        .addSpace()
        .add(count)
        .layout();

        let bckgnd = this.add.nineslice(0, 0, 'button-2', 0, 100, 100, 18, 18, 16, 16).setOrigin(0.5);
        s.addBackground(bckgnd);
        s.sendChildToBack(bckgnd);

        let border1 = this.add.nineslice(0, 0, 'border-bottom-1', 0, 150, 32, 5, 5, 32, 0);
        let border2 = this.add.nineslice(0, 0, 'border-bottom-1', 0, 150, 32, 5, 5, 32, 0);

        s
        .add(titleCount)
        .add(description, {space: { top: 10}})
        .add(border1)
        .addSpace()
        .add(costValueSizer)
        .add(border2)
        .addSpace()
        .add(purchaseSizer)
        .layout();

        //set this so that we can access each item and change their values
        s.ref = {
            unlockedTextStyle: { fontFamily: 'Nasa21', fontSize: '10px', color: 'green'},
            lockedTextStyle: { fontFamily: 'Nasa21', fontSize: '10px', color: 'red'},
            title: title, //upgrade hover window title
            background: bckgnd, //upgrade background object
            description: description, //upgrade description
            countText: count,   //indicates which upgrade this is and how many there are total
            costText: costText, //cost text, something like 'cost'
            sdCostText: sdCostText, //cost in stardust text
            scCostText: scCostText, //cost in scrap text
            costSizer: costSizer, //holds the labels for the costs of each upgrade
            purchaseButtonText: purchaseText, //the purchase button text
            purchaseButton: purchaseBtn,
            valueTitleSizer: valueSizer, //holds the values of the stat upgrades
            valueTitle: vSTitle,
            valuesArray: valuesArraySizer,
            scene: this,
            upgrade: undefined,
            previousConfig: undefined,
            setupOuterPanel: function(config) {
                this.previousConfig = config;
                //
                //config.upgrade: child.unlockData.nextUnlock, //the next upgrade object, if there is not one this will not be set
                //config.parentButton: child, //the button that opened this window

                //this.parentSizer.layout();
                this.title.setText(config.title);
                this.description.setText(config.description);
                this.countText.setText(config.countText);
                this.costText.setText(config.costText);
                this.sdCostText.setText(config.sdCostText);
                this.scCostText.setText(config.scCostText);
                this.purchaseButtonText.setText(config.purchaseButtonText);

                this.costSizer.layout();
                this.parentSizer.layout();

                if (config.upgrade) {
                    this.upgrade = config.upgrade;
                } else {
                    this.upgrade = undefined;
                }
            },
            //since we can't know how many upgrades are going to be rendered we need a way to 
            //dynamically generate them, so just return this value creator config object, and
            //give it the sizer and title scene objects, and a function to generate a value
            //indicator object, which should be a y orientated sizer with each child being the
            //value for the next upgrade, needs to be a sizer so we can eventually add an 
            //indicator like below:
            //      baseHP
            //          +2HP
            //  next -> +4HP
            //          +6HP
            setupValueSizer: function(scene, title, values) {
                
                this.valueTitle.setText(title);
                //delete all children and start fresh
                this.valuesArray.removeAll(true);

                //values should be an array of values to create a label for
                //values will be an array of value strings and booleans indicating
                //whether this upgrade is unlocked
                for (let i = 0; i < values.length; i++) {
                    let label = scene.add.text(0, 0, values[i][0]);
                    if (values[i][1]) {
                        label.setStyle(this.unlockedTextStyle);
                    } else {
                        label.setStyle(this.lockedTextStyle);
                    }
                    
                    this.valuesArray.add(label, {align: 'right'});
                }

                this.valuesArray.layout();
                this.valueTitleSizer.layout();
            },
            parentSizer: s,
            offsetX: s.width + 20,
            offsetY: 0,
        }

        let clickOutside = this.plugins.get('rexclickoutsideplugin').add(s);
        clickOutside.on('clickoutside', function(clickOutside, gameObject, pointer) {
            gameObject.hide();
        });

        s.setChildrenInteractive();
        /*
        s.on('pointerout', function() {
            s.hide();
        }, s);
        */
        return s;
    }

    //a scrolling panel of persistent upgrade buttons
    //each button has a secondary screen that only displays
    //when we hover over it, it will show the price and
    //detailed description and icons and shit eventually
    createPersistentUpgradePanel(childPanel, panelBackground) {
        let h = 365; //height of persistent stats window

        let header = this.rexUI.add.label({
            space: { left: 5, right: 5, top: 5, bottom: 5 },
            //background: scene.rexUI.add.roundRectangle({ color: color_primary }),
            text: this.add.text(0, 0, 'upgrades', { fontSize: 20 })
        });

        let p = this.rexUI.add.scrollablePanel({
            x: -200,
            y: 0,
            height: h,

            scrollMode: 'y',

            background: panelBackground,
            /*
            background: scene.rexUI.add.roundRectangle({
                strokeColor: color_light,
                radius: 2,
            }),*/

            panel: {
                child: childPanel,    
                mask: { padding: 1, },
            },

            slider: {
                track: this.rexUI.add.roundRectangle({ width: 5, radius: 0, color: this.color_light }),
                thumb: this.rexUI.add.roundRectangle({ width: 5, radius: 0, height: 50, color: this.color_dark })
            },
            
            mouseWheelScroller: {
                focus: false,
                speed: 0.1
            },
            
            header: header,

            /*footer: scene.rexUI.add.label({
                space: { left: 5, right: 5, top: 10, bottom: 0 },
                //background: scene.rexUI.add.roundRectangle({ color: color_primary }),
                text: scene.add.text(0, 0, 'Footer', { fontSize: 20 })
            }),*/

            //draggable: true,

            space: { left: 3, right: 3, top: 3, bottom: 3, panel: 3, header: 5 } //, footer: 5 }
        })
        .sendChildToBack(panelBackground)
        .layout();
        
        //make the header drag the sizer around
        header.setInteractive({draggable: true, cursor: this.dragCursor});
        header.on('drag', function (pointer, dragX, dragY) {
            p.x += dragX - header.x;
            p.y += dragY - header.y;
        }, this);
        p.pin(header);

        p.setChildrenInteractive();
        p.on('child.over', function(child, pointer, event) {
            //child unlockData is set in createPersistentUpgradeButton
            //child.unlockData looks like
            //{
            //  nextUnlock: null, //upgrade object, null if no more to unlock, otherwise it is the next upgrade object
            //  nextUnlockNum: null,
            //  maxNumUnlocks: unlockItem.unlocks.length, 
            //  unlocks: unlockItem.unlocks,
            //  genericKey: unlockItem.genericKey,
            //  propertyName: unlockItem.unlocks[0].propertyValue
            //}
            //console.log(child);
            //move the unlock panel
            let menu = this.persistentUpgradeHoverMenu;
            menu.x = child.centerX + menu.ref.offsetX;     
            menu.y = child.centerY + menu.ref.offsetY;

            let values = []; //array of arrays, like this: [[+100hp, true], [+300hp, true], [+400hp, false], ...]
            //indicating the value of the upgrade and whether the upgrade is unlocked or not
            for (let i = 0; i < child.unlockData.maxNumUnlocks; i++) {
                //unlocks: [{key: 'hp-1', unlocked: true, upgrade: Object}, {key: 'hp-2', unlocked: true, ...}, ...]
                let u = child.unlockData.unlocks[i];
                let t = `${u.upgrade.positiveChangeIndicator}${u.upgrade.statValue}${child.unlockData.genericKey}`;                    
                values.push([t, u.unlocked]);
            }

            //menu.ref is set in createPersistentUpgradeButtonHoverWindow
            //and it holds a reference to each element in the sizer so that we
            //can style the hover window appropriately
            //setup is a function in ref that sets everything up given
            //simple keys or strings
            if (child.unlockData.nextUnlock) {
                let hoverWindowConfig = {
                    title: child.unlockData.nextUnlock.valueDescription,
                    description: child.unlockData.nextUnlock.description,
                    countText: `${child.unlockData.nextUnlockNum-1} out of ${child.unlockData.maxNumUnlocks}`,
                    costText: 'cost',
                    sdCostText: `sd:\t${child.unlockData.nextUnlock.sdcost}`,
                    scCostText: `sc:\t${child.unlockData.nextUnlock.sccost}`,
                    purchaseButtonText: 'purchase',
                    upgrade: child.unlockData.nextUnlock,
                    parentButton: child,
                }

                menu.ref.setupOuterPanel(hoverWindowConfig);
                menu.ref.setupValueSizer(this, child.unlockData.propertyName, values);
            } else {
                let hoverWindowConfig = {
                    title: child.unlockData.unlocks[0].upgrade.valueDescription,
                    description: child.unlockData.unlocks[0].upgrade.description,
                    countText: `${child.unlockData.maxNumUnlocks} out of ${child.unlockData.maxNumUnlocks}`,
                    costText: 'cost',
                    sdCostText: `sd: N/A`,
                    scCostText: `sc: N/A`,
                    purchaseButtonText: 'unavailable',
                    parentButton: child,
                }
                menu.ref.setupOuterPanel(hoverWindowConfig);
                menu.ref.setupValueSizer(this, child.unlockData.propertyName, values);
            }
            
            menu.bringToTop();
            menu.show();

            
            this.input.manager.canvas.style.cursor = this.questionCursor;
        }, this);

        p.on('child.out', function(child, pointer, event) {
            //unlockData is set in createPersistentUpgradeButton
            
            this.input.manager.canvas.style.cursor = this.defaultCursor;
        }, this);

        return p;
    };

    //unlockItem:
    //{
    //  genericKey: 'hp',
    //  unlocks: [{key: 'hp-1', unlocked: true, upgrade: Object}, {key: 'hp-2', unlocked: true, upgrade: Object}, ...]
    //}
    createPersistentUpgradeButton(unlockItem) {
        let w2 = 130; //width of stats button
        let h2 = 25; //height of stats button
        let w3 = 5; //width of icons sizer
        let h3 = 25; //heigth of icons sizer

        //outer panel of label
        let s = this.rexUI.add.sizer({
            orientation: 'x',
            height: 30,
            space: { item: 30 },
            name: `${unlockItem.genericKey}-sizer`, //set the name so we can use getByName to find this button in the scrollable panel
        });
        
        //text label
        let l = this.rexUI.add.label({
            width: w2,
            height: h2,
            text: this.add.text(0, 0, unlockItem.genericKey, {
                fontSize: 12
            }),
            space: {
                left: 10,
                right: 10, 
            },
            name: `${unlockItem.genericKey}-button-label`,
        });

        //icons indicating how many unlocks we have in this category
        let icons = this.rexUI.add.sizer({
            width: w3,
            orientation: 'x', 
            space: { item: 1, right: 15, left: 5, },
            name: `${unlockItem.genericKey}-button-icons-sizer`,
        });

        //create the unlock dot indicators
        for (var i = 0; i < unlockItem.unlocks.length; i++) {
            let item = unlockItem.unlocks[i];
            let icon = this.createUnlockedIndicator(item.unlocked);
            icon.name = `icon-${item.key}`;
            icons.add(icon);
        }

        icons.layout();

        let bckd = this.add.nineslice(0, 0, 'border-bottom-1', 0, 150, 32, 5, 5, 32, 0);

        s
        .add(l)
        .add(icons)
        .addBackground(bckd)
        .sendChildToBack(bckd)
        .layout();

        this.setGenericUpgradeButtonUnlockData(s, unlockItem);

        return s
    };

    //the unlocked ui indicator for persistent spells
    createUnlockedIndicator(unlocked) {
        if (unlocked) {
            return this.rexUI.add.roundRectangle({ 
                width: 4, 
                radius: 2, 
                color: this.color_light, 
                alpha: 1,}).setStrokeStyle(1, this.color_primary);
        } else {
            return this.rexUI.add.roundRectangle({ 
                width: 4, 
                radius: 2,
                color: this.color_light, 
                alpha: 0,}).setStrokeStyle(1, this.color_primary);
        }
    }

    createPersistentUpgradeButtonList() {
        let padding = 5;
        //get a list of all stat button config objects or something
        //unlockList:  [{
        //              genericKey: 'hp',
        //              unlocks: [{key: 'hp-1', unlocked: true, upgrade: Object}, {key: 'hp-2', unlocked: true, upgrade: Object}, ...]
        //          }, ...]
        let unlockList = this.persistentUpgradeManager.getUnlockList();
        //console.log(unlockList);
        let buttons = [];
        for (var i = 0; i < unlockList.length; i++) {
            let c = this.createPersistentUpgradeButton(unlockList[i]);
            buttons.push(c);
        }

        let p = this.rexUI.add.buttons({
            orientation: 'y',                
            space: { item: padding, top: padding, bottom: padding },
            buttons: buttons,
        });

        /*

        p.on('button.over', function(button, index, pointer, event) {
            console.log("BUTTON OVER");
            console.log(button);
        }, this);*/


        p.layout();

        return p;
    }

    //unlockItem:
    //{
    //  genericKey: 'hp',
    //  unlocks: [{key: 'hp-1', unlocked: true, upgrade: Object}, {key: 'hp-2', unlocked: true, upgrade: Object}, ...]
    //}
    //this will set the button unlock data so that it can update its own text values and icons and stuff
    setGenericUpgradeButtonUnlockData(button, unlockItem) {
        button.unlockData = {
            nextUnlock: null, //upgrade object,
            nextUnlockNum: null,
            maxNumUnlocks: unlockItem.unlocks.length, 
            unlocks: unlockItem.unlocks,
            genericKey: unlockItem.genericKey,
            propertyName: unlockItem.unlocks[0].upgrade.propertyValue
        };
        
        //get the first locked upgrade from the list
        let firstLockedUnlockItemIndex = unlockItem.unlocks.findIndex(item => item.unlocked == false);
        if (firstLockedUnlockItemIndex > -1) {
            button.unlockData.nextUnlock = unlockItem.unlocks[firstLockedUnlockItemIndex].upgrade;
            button.unlockData.nextUnlockNum = firstLockedUnlockItemIndex + 1;
        }
        return button;
    }

    //this screen is the entry point into the actual game
    //we will get here either by clicking resume game
    //or by clicking new game and selecting the game type
    createResumeGameMenu() {
        let w = 150; //width of persistent stats window
        let h = 365; //height of persistent stats window

        

        //create an individual button based on the upgrade
        //also create and configure the hover panel here as well
        //unlockListItem:   {
        //                      genericKey: 'hp',
        //                      unlocks: [{key: 'hp-1', unlocked: true, upgrade: Object}, {key: 'hp-2', unlocked: true, ...}, ...] //upgrade object is PersistentUpgrade object
        //                  }

        //a list of all unlocks sorted by generic key
        //unlockList:  [{
        //              genericKey: 'hp',
        //              unlocks: [{key: 'hp-1', unlocked: true, upgrade: Object}, {key: 'hp-2', unlocked: true, upgrade: Object}, ...]
        //          }, ...]
        let childPanel = this.createPersistentUpgradeButtonList();
        let pnlBckd = this.add.nineslice(0, 0, 'button-2', 0, w, h, 18, 18, 16, 16).setOrigin(0.5);


        //create the hover menu singleton
        this.persistentUpgradeHoverMenu = this.createPersistentUpgradeButtonHoverWindow();

        this.persistentUpgradePanel = this.createPersistentUpgradePanel(childPanel, pnlBckd);        
        this.resumeGameMenu = this.add.rexContainerLite(this.center.x, this.center.y);

        let currencySizer = this.rexUI.add.sizer({y: -300, width: 500});
        let stdstTxt = this.add.text(0, 0, `stardust: ${this.saveManager.getStardust()}`);
        let scpTxt = this.add.text(0, 0, `scrap: ${this.saveManager.getScrap()}`);

        //change values on screen when we change the values of the cached save
        this.saveManager.events.on('cachedSaveChanged', function(newSave) {
            console.log("NEW SAVE GAME");

            this.stardust.setText(`stardust: ${this.scene.saveManager.getStardust()}`);            
            this.scrap.setText(`scrap: ${this.scene.saveManager.getScrap()}`);

            /*this.scene.persistentUpgradePanel.removeAll(true);
            this.scene.persistentUpgradePanel.setPanel(this.scene.createPersistentUpgradeButtonList())
            .setBackground(this.panelBackground);*/

        }, {stardust: stdstTxt, scrap: scpTxt, scene: this, panelBackground: pnlBckd});

        this.persistentUpgradeManager.events.on('newUpgrade', function(newUpgrade) {
            //refresh the persistent upgrade menu icons to reflect the new upgrade
            let gkey = this.persistentUpgradeManager.convertUpgradeKeyToGenericKey(newUpgrade.key);
            //this is the locked icon indicator that we must replace with an unlocked icon indicator
            let icons = this.persistentUpgradePanel.getByName(`${gkey}-button-icons-sizer`, true);
            let icon = icons.getByName(`icon-${newUpgrade.key}`);
            let index = icons.getChildIndex(icon);

            let btn = this.persistentUpgradePanel.getByName(`${gkey}-sizer`, true);

            //reload the unlock data from the cached save
            let unlockData = this.persistentUpgradeManager.getUnlockList().find(item => item.genericKey == gkey);

            //this will set the updated unlock data to the button, so when we hover over it
            //it will display updated values because we just applied an upgrade!
            if (unlockData && (index > -1) && btn) {
                this.setGenericUpgradeButtonUnlockData(btn, unlockData);
                icons.remove(icon, true); //destroy the current child and replace with new
                icons.insert(index, this.createUnlockedIndicator(true));
                icons.layout();
            }
        }, this);

        currencySizer
        .add(stdstTxt)
        .addSpace()
        .add(scpTxt)
        .layout();

        this.resumeGameSelectorMenu = this.createSelectorMenu({
            selector: 'default',
            buttons: [
                { 
                    text: "Back",
                    ptrUpHandler: function() {
                        this.showPlayButtonMenu();
                    },
                },
            ],
        });

        //console.log(this.resumeGameSelectorMenu);
        this.resumeGameSelectorMenu.setPosition(this.center.x, this.center.y + 240);

        /*let backBtn = this.add.text(0, 100, 'Back', this.menuButtonStyle);
        backBtn.setInteractive();
        backBtn.on('pointerup', function() {
            this.showMenu(this.playButtonMenu);
        }, this);
        backBtn.on('pointerover', function(ptr, go) {
            //go is an array of gameobjects that the pointer was over when this event was fired
            this.centerSelectorOn(go[0])
        }, this);*/

        //this.resumeGameMenu.setData('backButton', backBtn);
        //this.resumeGameMenu.setData('currency', currencySizer);

        this.levelsPanel = this.createLevelsScrollPanel(this.createLevelsChildPanel(), this.add.nineslice(0, 0, 'button-2', 0, w, h, 18, 18, 16, 16).setOrigin(0.5));

        this.resumeGameMenu
        .addLocal(this.persistentUpgradePanel)
        .addLocal(this.persistentUpgradeHoverMenu)
        .addLocal(this.levelsPanel)
        //.addLocal(backBtn)
        .addLocal(currencySizer);
        this.allMenus.push(this.resumeGameMenu);

        this.persistentUpgradeHoverMenu.hide();
    }

    createLevelsScrollPanel(childPanel, background) {

        let header = this.rexUI.add.label({
            space: { left: 5, right: 5, top: 5, bottom: 5 },
            //background: scene.rexUI.add.roundRectangle({ color: color_primary }),
            text: this.add.text(0, 0, 'levels', { fontSize: 20 })
        });

        let panel = this.rexUI.add.scrollablePanel({
            x: 200,
            y: 0,
            height: 200,

            scrollMode: 'y',

            background: background,
            /*
            background: scene.rexUI.add.roundRectangle({
                strokeColor: color_light,
                radius: 2,
            }),*/

            panel: {
                child: childPanel,    
                mask: { padding: 1, },
            },

            slider: {
                track: this.rexUI.add.roundRectangle({ width: 5, radius: 0, color: this.color_light }),
                thumb: this.rexUI.add.roundRectangle({ width: 5, radius: 0, height: 50, color: this.color_dark })
            },
            
            mouseWheelScroller: {
                focus: false,
                speed: 0.1
            },
            
            header: header,

            /*footer: scene.rexUI.add.label({
                space: { left: 5, right: 5, top: 10, bottom: 0 },
                //background: scene.rexUI.add.roundRectangle({ color: color_primary }),
                text: scene.add.text(0, 0, 'Footer', { fontSize: 20 })
            }),*/

            //draggable: true,
            space: { left: 3, right: 3, top: 3, bottom: 3, panel: 3, header: 5 } //, footer: 5 }
        })
        .sendChildToBack(background)
        .layout();

        //make the header drag the sizer around
        header.setInteractive({draggable: true, cursor: this.dragCursor});
        header.on('drag', function (pointer, dragX, dragY) {
            panel.x += dragX - header.x;
            panel.y += dragY - header.y;
        }, this);
        panel.pin(header);

        panel.setChildrenInteractive();
        panel.on('child.over', function(child, pointer, event) {
            //child.levelData is set in createLevelsChildPanel
            //console.log(child.levelData.levelKey);
            this.input.manager.canvas.style.cursor = this.questionCursor;
        }, this);

        panel.on('child.out', function(child, pointer, event) {
            //child.levelData is set in createLevelsChildPanel
            //console.log(child.levelData.levelKey);
            this.input.manager.canvas.style.cursor = this.defaultCursor;
        }, this);

        panel.on('child.up', function(child, pointer, event) {
            //open confirmation dialog ensuring player wants to load new level
            let style = {
                width: 200,
                space: { left: 20, right: 20, top: 20, bottom: 20, title: 20, content: 30, action: 15, },
    
                background: {
                    key: 'button-2',
                    frame: 0, 
                    leftWidth: 18, 
                    rightWidth: 18,
                    topHeight: 16, 
                    bottomHeight: 16,
                },
    
                title: {
                    space: { left: 5, right: 5, top: 5, bottom: 5 },
                    text: {
                        fontSize: 24
                    },
                    background: {
                        color: this.color_dark
                    }
                },
    
                content: {
                    space: { left: 5, right: 5, top: 5, bottom: 5 },
                    text: {
                        fontSize: 20
                    },
                },
    
                buttonMode: 2,
                button: {
                    space: { left: 10, right: 10, top: 10, bottom: 10 },
                    background: {
                        color: this.color_dark,
                        strokeColor: this.color_light,
                        radius: 10,
    
                        'hover.strokeColor': 0xffffff,
                    }
                },
    
                align: {
                    actions: 'right'
                },

                /*confirm: function(data) {
                    this.scene.levelManager.transitionToLevel(this.levelData);
                },

                confirmScope: {scene: this, levelData: child.levelData},*/
            }

            let dialog = this.rexUI.add.confirmDialog(style)
            .setPosition(this.center.x, this.center.y)
            .setDraggable('title')
            .resetDisplayContent({
                title: 'Next level',
                content: `Are you sure you want to go to ${child.levelData.levelKey}?`,
                buttonA: 'Yes',
                buttonB: 'No',
            })
            .layout()
            .modalPromise({ touchOutsideClose: true })
            .then(function(data){                
                // var index = data.index;
                // var text = data.text;
                // var value = data.value;
                // var button = data.button;
                // var dialog = data.dialog;
                //do other stuff, we don't really need this.
                //console.log(data);
                //if we clicked the yes button
                if (data.index == data.dialog.confirmButtonIndex) {
                    this.scene.levelManager.transitionToLevel(this.scene, this.levelData.levelKey, true, );
                }
            }.bind({scene: this, levelData: child.levelData}));
        }, this);


        return panel;
    }

    createLevelsChildPanel() {
        let w2 = 130; //width of stats button
        let h2 = 25; //height of stats button
        let w3 = 5; //width of icons sizer
        let h3 = 25; //heigth of icons sizer
        let padding = 5;

        let numUnlockedLevels = this.saveManager.getCurrentLevel();
        //console.log(unlockList);
        let buttons = [];
        for (var i = 0; i < this.levelManager.levels.length; i++) {
            //let c = ??
            //buttons.push(c);
            //create a sizer that holds a button for each level, give it a on click methods and stuff
            //outer panel of label
            let btn = this.rexUI.add.sizer({
                orientation: 'x',
                height: 30,
                width: w2,
                space: { item: 30, left: 5, right: 5, top: 5, bottom: 5 },
                name: `level-${i+1}-sizer`, //set the name so we can use getByName to find this button in the scrollable panel
            });

            btn.levelData = {
                levelKey: this.levelManager.levels[i],
            }

            let btnLabel = this.add.text(0, 0, `Level ${i+1}`);
            let background = this.add.rectangle(0, 0, 100, 30);
            let background2 = this.add.nineslice(0, 0, 'border-bottom-1', 0, 150, 32, 5, 5, 32, 0);

            if (i < numUnlockedLevels-1) {
                //we've beaten this level (as long as we make each level a requirement for the next level)
                background.setStrokeStyle(1, 0x0de014, 1);
            }

            btn.addBackground(background);
            btn.addBackground(background2);
            btn.add(btnLabel, {align: 'left'});
            btn.layout();
            btn.setInteractive({cursor: this.purchaseCursor});
            buttons.push(btn);
        }

        let p = this.rexUI.add.buttons({
            orientation: 'y',                
            space: { item: padding, top: padding, bottom: padding },
            buttons: buttons,
        });

        p.layout();

        return p;
    }

    //badge icons are stacking based on the numeric value of each digit in the players level
    //there are 10 icons for each digit above the first order
    //there are 11 icons for the first order, to account for level 0 if you so desire
    //for example if the player is level 351, then we display icon 3 from the 100s place icons,
    //icon 5 from the 10s place and icon 2 from the 1s place (since there is 1 extra we shift the ones place up by one)
    
    //build a badge icon
    //returns an object like:
    // {
    //      badge1: scene.add.image,
    //      badge2: scene.add.image //
    // }
    // badge1 is the 1s place, badge 2 is the 10s place, badge 3 is the 100s place, etc.
    getBadgeIcon(level) {
        let badges = {
            size: 0,
            setPosition: function(x, y) {
                for (var i = 1; i <= this.size; i++) {
                    let p = 'badge'+i.toString();
                    if (this[p]) {
                        this[p].setPosition(x, y);
                    }                   
                }
                return this;
            },
            setVisible: function(bool) {
                for (var i = 1; i <= this.size; i++) {
                    let p = 'badge'+i.toString();
                    if (this[p]) {
                        this[p].setVisible(bool);
                    }                   
                }

                return this;
            },
            setActive: function(bool) {
                for (var i = 1; i <= this.size; i++) {
                    let p = 'badge'+i.toString();
                    if (this[p]) {
                        this[p].setActive(bool);
                    }                   
                }
                return this;
            }
        };
        let s = (level).toString().split('').reverse(); //sort from 1s place to the highest decimal place
        for (var i = 0; i < s.length; i++) {
            var b;
            if (s[i] == '0') {
                b = this.add.image(0, 0, 'badges-1', 9 * i);
            } else {
                b = this.add.image(0, 0, 'badges-1', 9 * i + parseInt(s[i]) - 1);
            }
            b.setOrigin(0.5);
            b.setScale(3);
            badges['badge'+(i+1).toString()] = b;
            badges.size += 1;
        }

        return badges;
    }

    //create a menu button and apply a pointerup event to it, also bind parameters to the function
    //and make sure this means the scene
    createMenuButton2(text, ptrUpHandler, ptrUpArgs=[], textStyle = null) {
        var ts = this.menuButtonStyle;
        if (textStyle != null) ts = textStyle;
        var btn = this.add.text(0, 0, text, ts)
        .setInteractive()

        if (ptrUpHandler) btn.on('pointerup', ptrUpHandler.bind(this, ptrUpArgs));
        return btn;
    }

    getCenterY(element) {
        return element.y + (element.height/2);
    }

    getCenterX(element) {
        return element.x + (element.width/2);
    }

    centerSelectorOn(selector, element) {
        //console.log(element);
        //console.log(selector);
        //selector.setSize(2 * element.width + this.menuSelectorPadding, 45).setVisible(true);
        selector.setSize(280, 45).setVisible(true);
        Phaser.Display.Bounds.CenterOn(selector, this.getCenterX(element), this.getCenterY(element));
    }

    createMenuContainer() {
        return this.add.container(this.center.x, this.center.y);
    }

    createSelector() {
        return this.add.nineslice(0, 0, 'selector-4', 0, 300, 64, 64, 64, 64, 0).setVisible(false);
        //return this.add.nineslice(0, 0, 'panel-border-1', 0, 300, 16, 16, 16, 16, 0).setVisible(false);
    }

    braidArrays(...arrays) {
        const braided = [];
        for (let i = 0; i < Math.max(...arrays.map(a => a.length)); i++) {
          arrays.forEach((array) => {
            if (array[i] !== undefined) braided.push(array[i]);
          });
        }
        return braided;
    }
}

export class UIScene extends Phaser.Scene {
    constructor(key) {
        super({key: key});

        this.isCreated = false;

        this.playTime = 0;
    }

    preload() {        
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'js/plugins/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });

        this.load.plugin('rexlineprogressplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexlineprogressplugin.min.js', true);
    }

    /**
     * Create the main user interface for the current level
     * the data object should be a regular javascript object
     * with properties. Though most of what we need should be
     * obtainable through the global plugins that exist. 
     * At the end of this function we should launch the level
     * given by data.levelKey. We do it this way to give our
     * create function a chance to create the full screen
     * cover sizer BEFORE we create the scene objects. This
     * prevents unneccessary pop in and stuff.
     * 
     * @param {Object} data 
     */
    create(data) {
        this.config = data;

        this.cover = this.rexUI.add.sizer({
            anchor: {
                'centerX': 'center',
                'centerY': 'center',
                width: '100%',
                height: '100%'
            }
        });
        this.cover
        .addBackground(this.rexUI.add.roundRectangle(0, 0, 150, 150, 0, 0x000000))
        .layout();
        //this.cover.hide();

        this.pauseIcon = this.add.image(0, 0, 'pause');
        this.timer = this.add.text(0, 0, '00:00', {fontSize: '30px'});
        //a grid that holds the status indicators
        this.statusBackground = this.add.nineslice(0, 0, 'button-2', 0, 0, 0, 18, 18, 16, 16);
        this.status = this.rexUI.add.gridSizer({
            width: 150,
            height: 70,
            column: 1,
            row: 1,
        });
        //this.status.addBackground(this.statusBackground);
        this.status.layout();

        this.xpBar = this.add.rexLineProgress({
            width: 150,
            height: 15,
            barColor: 0x1fcbf3,
            trackColor: 0x112233,
            trackStrokeColor: 0xddeeff,
            trackStrokeThickness: 2,
            skewX: -15,
            value: 0.25, /*
            rtl: true,
            easeValue: {
                duration: 0,
                ease: 'Linear'
            },
            valuechangeCallback: function(newValue, oldValue, lineProgress) {
            },*/
        });

        this.currencyTextStyle = { fontSize: 20 }
        this.coinIcon = this.add.image(0, 0, 'coin-1');
        this.gemIcon = this.add.image(0, 0, 'stardust');
        this.coinText = this.add.text(0, 0, "0", this.currencyTextStyle);
        this.gemText = this.add.text(0, 0, "0", this.currencyTextStyle);

        this.topStrip = this.rexUI.add.sizer({
            anchor: {
                width: '100%'
            }
        });
        this.topStrip
        .add(this.coinIcon)
        .add(this.coinText)
        .add(this.gemIcon)
        .add(this.gemText)
        .layout();


        this.middleStrip = this.rexUI.add.sizer({
            anchor: {
                width: '100%'
            },
            height: 15
        });
        this.middleStrip.addBackground(this.xpBar);
        this.middleStrip.layout();

        this.bottomStrip = this.rexUI.add.sizer({ 
            orientation: 'x',
            anchor: {
                width: '100%'
            },
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
                item: 10
            }
        });

        this.bottomStrip
        .add(this.pauseIcon)
        .addSpace()
        .add(this.status)
        .addSpace()
        .add(this.timer)
        .addBackground(this.statusBackground)
        .sendChildToBack(this.statusBackground)
        .layout();

        this.statusBackground.setInteractive();

        this.lowerContainer = this.rexUI.add.sizer({
            orientation: 'y',
            rtl: true,
            anchor: {
                width: '100%',
                bottom: 'bottom',
                centerX: 'center'
            },
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
                item: 0
            }
        });

        this.lowerContainer
        .add(this.bottomStrip)
        .add(this.middleStrip)
        .add(this.topStrip)
        //.hide();
        .layout();

        //this.lowerContainer.hide();
        this.cover.bringToTop();

        //this.lowerContainer.drawBounds(this.add.graphics());

        this.saveManager.events.on('cachedSaveChanged', this.redrawUI);

        this.redrawUI(this.saveManager.cachedSave);

        this.isCreated = true;

        //load the level scene
        this.scene.launch(data.levelKey).bringToTop(this.scene.key);
    }

    closeCover() {
        if (this.cover) {
            this.cover.fadeOut(1000);
        }
    }

    closeScene() {
        this.saveManager.events.off('cachedSaveChanged', this.redrawUI);
    }

    redrawUI(save) {
        this.coinText.setText(abbreviateNumber(save.scrap));
        this.gemText.setText(abbreviateNumber(save.stardust));
        this.topStrip.layout();
    }

    isPointerOverUI() {
        if(this.isCreated) {
            return this.lowerContainer.isPointerInBounds();
        } else {
            return false;
        }
    }

    updateTimer(delta) {
        this.playTime += delta;
        this.timer.setText(millisToMinutesAndSeconds(this.playTime));
    }

    /**
     * This is a mirror of the update function from whichever scene has control of the UI level at this time.
     * Use it to update the timers, or anything else that needs to be updated every frame.
     * 
     * @param {number} time the time in ms since the start of the game in the other scene
     * @param {number} delta the delta since the last frame in the other scene
     */
    sceneUpdate(time, delta) {
        this.updateTimer(delta);
    }
}

export class BaseLevel extends Phaser.Scene {
    constructor(key) {
        super({key: key});

        this.key = key;

        this.worldSize = {width: 50000, height: 50000};
        this.isPaused = true;
        
        //becomes true the first time the pizza party button is clicked
        //only resets to false on page reload
        this.gameStarted = false;
        this.startTime = 0;

        //overlap/collider groups are objects that store information about which sprite groups should generate overlap/collider events against what other sprites
        this.overlapMap = new Map(); //a map of overlaps that have been created
        this.overlapGroups = new Set(); //individual objects that have been sent to registerOverlap
        this.colliderGroups = new Set(); //individual gos that have been sent to registerCollider
        this.colliderMap = new Map(); //a map of collisions that have been created

        this.playTime = 0; //how long has the game been running in a playable state (not paused)
        this.canMove = false; //only set to true after intro animations, will allow parallax scrolling
        //and moving the origin of the gameworld
        this.playerSpawn = {x: this.worldSize.width/2, y: this.worldSize.height/2};
        this.isUpgrading = false; //this indicates if the upgrade menu was generated, it tells the shop menu whether or not to draw an upgrade menu button

        //set persistent values for player, spell pools and spells                                                                                                                                                                           
        this.uiSceneKey = 'ui-scene';

        //these setIntervals or setTimeouts should be paushed when we pause the game
        this.timersThatShouldBePaused = [];
    }

    preload() {
        //TODO: add a loading screen during this portion, maybe?

        //https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Loader.LoaderPlugin-json
        //load the level configuration, this.key is the level key that is
        //given by the level manager when this scene is created, it will correspond
        //to one of the level objects in levels.json
        this.load.json('levelConfig', 'files/config/levels.json', this.key);
        this.load.json('enemyConfig', 'files/config/levels.json', "enemies");
    }

    init(data) {
    }

    create(data) {      
        this.levelConfig = this.cache.json.get('levelConfig');
        this.enemyConfig = this.cache.json.get('enemyConfig');
        
        //setup camera and world bounds        
        this.cameras.main.setBounds(0,0,this.worldSize.width,this.worldSize.height, false, false, false, false);
        this.physics.world.setBounds(0,0,this.worldSize.width,this.worldSize.height, false, false, false, false);
        this.cameras.main.centerOn(this.worldSize.width/2, this.worldSize.height/2);

        if (this.levelConfig.enemies) {
            let unconfiguredPools = [];
            //run through all the enemies once and add the enemy pools that need to be initialized to a list
            for (let i = 0; i < this.enemyConfig.length; i++) {
                //if the enemy name is within the level config enemies list
                //we should initialize that enemy pool
                if (this.levelConfig.enemies.includes(this.enemyConfig[i].name)) {
                    unconfiguredPools.push(this.enemyConfig[i]);
                }
            }
            console.log("initializing regular enemy pools");
            //init the enemy manager here, basically set up enemy pools and stuff for the beginning of the game
            this.enemyManager.initializeCustomPools(unconfiguredPools);
        } else {
            console.log("no enemies in levelConfig");
        }

        console.log(this.enemyManager.activePools);

        //instead of defining callbacks for every possible overlap between enemies/spells, and players/enemies
        //we define a single callback and define onHit on every enemy, spell and the player
        //the player shouldn't get hurt by spells, unless they come from the enemy
        //so in order to figure out what should be damaged by what, we define properties on objects that can overlap
        //that determine if they can take damage. for example the player has an isPlayer property, and a spell has
        //and isSpell property, enemies have and isEnemy property, etc. If the player overlaps the enemy, the player
        //has onHit called on it, with the gameobject, and the damage value that should be inflicted. but first, player
        //checks if the property gameobject.isEnemy exists, then takes damage based on the damage value if it does.
        this.physics.world.on('overlap', function(go1, go2, body1, body2) {
            var damage = 5; //default damage if something isn't set up right (haha makes it harder to find bugs future me bitch)
            var d12 = damage; //damage go1 inflicts on go2
            var d21 = damage; //damage go2 inflicts on go1

            //check if either object has damage property, this should
            if (Object.hasOwn(go1, 'damage')) {
                d12 = go1.damage;
            } else if (Object.hasOwn(go2, 'damage')) {
                d21 = go2.damage;
            }
            if (go1.onHit) go1.onHit(go2, d21);
            if (go2.onHit) go2.onHit(go1, d12);
        });

        /*
        //setup the scene transition events
        this.events.on('transitionout', function(sys, data) {
        });
        this.events.on('transitionstart', function(sys, data) {
        }, this);*/

        //setup the background objects
        //add the background sprites, 
        //then add the postFX

        //this map holds a reference to all created background objects
        this.backgrounds = new Map();
        //use this container to add effects to all of our backgrounds at once
        //effects are defined in this.levelConfig.backgroundEffects array
        this.bgEffects = this.add.container(this.worldSize.width/2, this.worldSize.height/2);
        
        if (this.levelConfig.backgrounds) {
            for (let i = 0; i < this.levelConfig.backgrounds.length; i++) {
                let bc = this.levelConfig.backgrounds[i];
                if (bc.key) {
                    //let bg = this.add.image(0, 0, bc.key);
                    let bg = this.add.tileSprite(0, 0, this.game.canvas.width, this.game.canvas.height, this.levelConfig.backgrounds[i].key);
                    if (bc.tileScale) bg.setTileScale(bc.tileScale);
                    if (bc.alpha) bg.setAlpha(bc.alpha);
                    this.backgrounds.set(bc.key, bg);
                    this.bgEffects.add(bg);                    
                    //bg.setScrollFactor(0);
                }
            }
        }

        if (this.levelConfig.backgroundEffects) {
            //make sure to put all the arguments for the function in the array
            if (this.levelConfig.backgroundEffects.addBlur) this.bgEffects.postFX.addBlur(...this.levelConfig.backgroundEffects.addBlur);
        }

        this.scenery = new Map();
        //add other scenery
        //TODO: add scenery registry that will add repeatable scenery at specified intervals
        //or randomly distributed around the player
        if (this.levelConfig.scenery) {
            for (let i = 0; i < this.levelConfig.scenery.length; i++) {
                if (this.levelConfig.scenery[i].key) {
                    let item = this.add.image(0, 0, this.levelConfig.scenery[i].key);
                    if (this.levelConfig.scenery[i].size) {
                        item.setDisplaySize(this.levelConfig.scenery[i].size.x, this.levelConfig.scenery[i].size.y);
                    }
                    if (this.levelConfig.scenery[i].scale) {
                        item.setScale(this.levelConfig.scenery[i].scale);
                    }
                    if (this.levelConfig.scenery[i].position) {                        
                        Phaser.Display.Bounds.CenterOn(item, this.levelConfig.scenery[i].position.x, this.levelConfig.scenery[i].position.y);
                    }

                    this.scenery.set(this.levelConfig.scenery[i].key, item);
                }
            }
        }

        //this scenery gets generated randomly around the map
        this.randomScenery = new Map();
        if (this.levelConfig.randomScenery) {
            //if given a number parameter ensure there are that many objects
            //evenly distributed around the map, if given a density parameter
            //we must take into consideration the map size to find the true
            //number so that we can spawn the right amount. density should 
            //be a number between 0 and 100, 0 being none will spawn on the 
            //map and 100 meaning they will spawn at every point edge to edge
            //so figure out the math bitch.
        }

        if (this.levelConfig.initialDelay) {
            setTimeout(this.beginningAnimations, this.levelConfig.initialDelay, this);
        } else {
            setTimeout(this.beginningAnimations, 500, this);
        }
    }

    //Play animations at the beginning of a level, for like cool intro stuff idk
    //TODO: add config for player intro animations, or dialog for a story or something
    //once that is done move the player to the center of the screen and do the callback
    //which should include finally "starting" the game.
    beginningAnimations(scene) {
        scene.player.create();
        scene.spawnManager.create();
        //close the cover in the ui scene, its just a screen with animations or something
        scene.levelManager.closeCover();
        scene.gameStarted = true;
        scene.isPaused = false;

        //spawn the player at it's respawn point offscreen somewhere
        scene.player.respawn();
        //this makes the player not move towards the mouse
        scene.player.isBeingControlled = true; 
        scene.tweens.add({
            targets: [scene.player.currentSprite],
            y: scene.cameras.main.worldView.y + (scene.cameras.main.worldView.height/2),
            x: scene.cameras.main.worldView.x + (scene.cameras.main.worldView.width/2),
            duration: 2000,
            ease: 'Linear',
            loop: 0,
            yoyo: false,
            completeDelay: 1000, //make the sprite sit at the center of the screen for 1s before firing on complete
            onComplete: scene.onPlayerMoveToCenterScreenFinished,
            onCompleteParams: [scene]
        });
    }

    onPlayerMoveToCenterScreenFinished(tween, targets, scene) {
        //when we finish this animation, start the camera follow
        let lerpVal = 0.05;
        scene.player.isBeingControlled = false;
        scene.cameras.main.startFollow(targets[0], false, lerpVal, lerpVal, 10, 10);
        scene.gameStarted = true;
        scene.isPaused = false;

        scene.beginGame();
    }

    beginGame() {
        this.startTime = this.time; //time property same as from update, it is paused when the scene is paused, so we can use it as long as we pause the game through this.scene.pause();
        this.giveSpellPool('gatling-beam');        
        this.enemyManager.startSpawningEnemies(2000);
    }

    //called by the level manager when it starts a scene transition
    shutdown() {
        this.destroyAllColliders();

        //stop following the player if we called startFollow earlier
        this.cameras.main.stopFollow();

        //remove all backgrounds from the map and delete them
        this.bgEffects.removeAll();
        this.backgrounds.forEach(function(value) {
            value.destroy();
        });
        this.backgrounds.clear();

        this.scenery.forEach(function(value) {
            value.destroy();
        });
        this.scenery.clear();

        this.randomScenery.forEach(function(value) {
            value.destroy();
        });
        this.randomScenery.clear();

        this.player.reset();
    }

    update(time, delta) {
        let center = getPositionRelativeToViewportPercent(this, 0.5, 0.5);

        if (this.isPaused || !this.gameStarted) {
            return;
        }

        this.playTime += delta;

        if (this.player) {
            let d = this.player.step(time, delta);
            this.player.castSpells(time, delta);

            //scroll backgrounds 
            for (let i = 0; i < this.levelConfig.backgrounds.length; i++) {
                if (this.levelConfig.backgrounds[i].scrollSpeed) {
                    let bg = this.backgrounds.get(this.levelConfig.backgrounds[i].key);
                    bg.tilePositionX += d.dx * this.levelConfig.backgrounds[i].scrollSpeed;
                    bg.tilePositionY += d.dy * this.levelConfig.backgrounds[i].scrollSpeed;
                }
            }

            this.bgEffects.setPosition(center.x, center.y);
        }

        if (this.levelManager.UILvl) {
            this.levelManager.UILvl.sceneUpdate(time, delta);
        }
    }

    //this function registers overlaps with all other registered colliders
    //call it when you create a new group or object that needs to collide with everything else
    //overlap events should occur when a spell projectile overlaps an enemy or an enemy overlaps the player
    //anything that overlaps with anything else in overlapGroups will have onHit called on it or something
    registerOverlap(newOverlap) {
        //don't register the same one twice, just new ones with it
        if (this.overlapGroups.has(newOverlap)) return;

        if (this.overlapGroups.size == 0) {
            this.overlapGroups.add(newOverlap);
            return;
        }

        this.overlapGroups.forEach(function(value) {
            if (this.obj.overlapMap.get(value) != this.newOverlap && this.obj.overlapMap.get(this.newOverlap) != value) {
                //new overlap being registered
                this.obj.physics.add.overlap(value, this.newOverlap);
                this.obj.overlapMap.set(value, this.newOverlap);
                this.obj.overlapGroups.add(this.newOverlap);
            }
        }, {obj: this, newOverlap: newOverlap}); //the this arg makes this (inside forEach) equal to this (scene object)
    }

    //destroys all overlaps and collisions that were registered
    //at the start of the level, call this at the end of the level
    destroyAllColliders() {
        this.overlapMap.forEach(function(value, key) {
            value.destroy();
        });
        this.colliderMap.forEach(function(value, key) {
            value.destroy();
        });

        this.overlapGroups = new Set();
        this.colliderGroups = new Set();
        this.overlapMap = new Map();
        this.colliderMap = new Map();
    }

    //will destroy a specific collider within overlapMap and colliderMap
    //will remove this object from the associated group and in order for
    //this object to have collisions registered it will need to be sent
    //back to registerCollider or registerOverlap
    destroyCollider(collider) {
        let deleteKey = [];
        //destroy any colliders where the value or key matches the collider object
        this.overlapMap.forEach(function(value, key) {
            if (value == collider || key == collider) {
                value.destroy();
                deleteKey.push(key);
            }
        });

        for (let i = 0; i < deleteKey.length; i++) {
            this.overlapMap.delete(deleteKey[i]);
        }

        deleteKey = [];

        this.colliderMap.forEach(function(value, key) {
            if (value == collider || key == collider) {
                value.destroy();
                deleteKey.push(key);
            }
        });

        for (let i = 0; i < deleteKey.length; i++) {
            this.colliderMap.delete(deleteKey[i]);
        }

        //remove the colliders from the group
        this.overlapGroups.delete(collider);
        this.colliderGroups.delete(collider);
    }

    //this registers collisions between all other entities passed to this function 
    //enemies should collide with all enemies, with no bounce as well
    registerCollider(newCollider, canCollideWithSelf, canCollideWithOthers) {
        //don't register the same collision twice, we only want to register unseen collisions with all the current colliders
        if (this.colliderGroups.has(newCollider)) return;
        //register a physics collision only with this same group
        if (canCollideWithSelf) {
            //since they collide with themselves add a new collision here as well
            this.physics.add.collider(newCollider, newCollider);
            this.colliderGroups.add(newCollider);
            this.colliderMap.set(newCollider, newCollider);
            //if we haven't added anything to the collision group yet
            /*if (this.colliderGroups.size == 0) {                
                //since they collide with themselves add a new collision here as well
                this.physics.add.collider(newCollider, newCollider);
                this.colliderGroups.add(newCollider);
                this.colliderMap.set(newCollider, newCollider);
                //return;
            }*/
        }

        //register a physics collision with all groups passed to this function that also has canCollideWithOthers = true
        if (canCollideWithOthers) {
            this.colliderGroups.forEach(function(value) {
                if (this.obj.colliderMap.get(value) != this.newCollider && this.obj.colliderMap.get(this.newCollider) != value) {
                    //new overlap being registered
                    this.obj.physics.add.collider(value, this.newCollider);
                    this.obj.colliderMap.set(value, this.newCollider);
                    this.obj.colliderGroups.add(this.newCollider);
                }
            }, {obj: this, newCollider: newCollider});
        }
    }

    pauseGame() {
        //stop all preupdate from enemy manager
        //stop player from moving is taken care of in 
        this.isPaused = true;
        //this.anims.pauseAll();
        //this.physics.pause();

        this.scene.pause();

        //emit an event to signal the ui scene that we have paused the game
        //this.uiManager.onPauseGam();
    }

    //pause the game and generate 3 new upgrades
    pauseUpgrade() {
        this.pauseGame();

        //emit an event to signal the ui scene that we have paused the game and want to upgrade
        //this.uiManager.generateUpgradeMenu();
    }
    
    //pause the game and show the shop
    pauseWithShopMenu() {
        this.pauseGame();

        //emit an event to signal the ui scene that we have paused the game and want to open the shop menu
        //this.uiManager.openShop();
    }

    resumeGame() {
        //this.anims.resumeAll();
        //this.physics.resume();
        this.scene.resume();
        this.isPaused = false;
        
        //emit an event to signal the ui scene that we have resumed the game
        //this.uiManager.onResumeGame();
    }

    giveSpellPool(key) {
        if (!this.inGameUpgradeManager.currentSpellPools.has(key)) {
            this.inGameUpgradeManager.applyUpgrade({
                isSpellPool: true,
                isPlayerUpgrade: false,
                isSpellPoolUpgrade: false,
                key: key,
                target: this.player,
                upgrade: this.inGameUpgradeManager.allSpellPools.get(key),
            });
        }
    }

    //give a spell pool an upgrade, could apply to spells or spellpools
    giveUpgrade(upgradeKey, spellPoolKey) {
        var canUse = this.inGameUpgradeManager.canUseUpgrade(upgradeKey, spellPoolKey);
        if (canUse) {
            this.inGameUpgradeManager.applyUpgrade({
                isSpellPool: false,
                isPlayerUpgrade: false,
                isSpellPoolUpgrade: true,
                key: upgradeKey,
                target: this.inGameUpgradeManager.allSpellPools.get(spellPoolKey),
                upgrade: this.inGameUpgradeManager.allSpellUpgrades.get(upgradeKey),
            });
        }
    }

    //give the player an upgrade
    givePlayerUpgrade(playerUpgradeKey) {
        if (!this.inGameUpgradeManager.currentPlayerUpgrades.has(playerUpgradeKey) && this.inGameUpgradeManager.allPlayerUpgrades.has(playerUpgradeKey)) {
            this.inGameUpgradeManager.applyUpgrade({
                isSpellPool: false,
                isPlayerUpgrade: true,
                isSpellPoolUpgrade: false,
                key: playerUpgradeKey,
                target: this.player,
                upgrade: this.inGameUpgradeManager.allPlayerUpgrades.get(playerUpgradeKey),
            });
        }
    }
}

export class LevelOne extends BaseLevel {

    constructor() {
        super('level-1');
        
        //store setTimeouts that trigger animation changes in here so that they can be cancelled
        this.fadeOutAnimation = null;
        this.menuFadeAnimLength = 1000;
        this.playerSpawnTime = 1000;

        this.fadeOutAnimation = null; 
        this.audioIsFadingOut = false;

        this.backgroundObjects = new Map();

        //magic class handles all upgrades for the player and spells
        this.uiManager = new UIManager(this);

        this.timersThatShouldBePaused = []; // a list of timers and intervals that should be paused when the game is paused

        this.trackUI = true; //should the game update the position of the normal ui? this is the spellbar, pause button and other constantly on screen interfaces
    }

    preload() {
        
        //rex plugins
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'js/plugins/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });

        //background stuff

    }

    create() {        
        //container to hold starfield so we can apply postFX
        this.bgContainer = this.add.container();        
        Phaser.Display.Bounds.CenterOn(this.bgContainer, this.cameras.main.worldView.x + (this.cameras.main.worldView.width/2), this.cameras.main.worldView.y + (this.cameras.main.worldView.height/2));

        //var i = this.textures.get("starsnear").getSourceImage();
        //this.starsnear = this.add.tileSprite(i.width/2, i.height/2, this.game.canvas.width, this.game.canvas.height, 'starsnear');
        //this.starsfar = this.add.tileSprite(i.width/2, i.height/2, this.game.canvas.width, this.game.canvas.height, 'starsfar');
        //var centerViewport = this.getPositionRelativeToViewportPercent(0.5, 0.5); //get center of viewport
        this.starsnear = this.add.tileSprite(0, 0, this.game.canvas.width, this.game.canvas.height, 'starsnear');
        this.starsfar = this.add.tileSprite(0, 0, this.game.canvas.width, this.game.canvas.height, 'starsfar');    
        this.starsnear.tileScaleX = 0.8;
        this.starsnear.tileScaleY = 0.8;
        this.starsfar.tileScaleX = 0.4;
        this.starsfar.tileScaleY = 0.4;
        this.starsnear.alpha = 0;
        this.starsfar.alpha = 0;
    
        this.bgContainer.add(this.starsnear);
        this.bgContainer.add(this.starsfar);
        this.bgContainer.postFX.addBlur(1, 0.4, 0.4, 1);

        var i = this.textures.get('bgsun').getSourceImage();
        var bgSunDims = this.getScaledBGImgDimensions([i.width, i.height]); //scaled dimensions to get this image to fit into the background at any scale
        //const bgsun = this.add.tileSprite(this.game.canvas.width/2, this.game.canvas.height/2, screenDim[0]/2, screenDim[1] + (bgSunDims[1] / 2)  + 10, 'bgsun');
        //we add the background sun to the center of the map but shift it down below the visible part of the screen so we can animate it up
        this.bgsun = this.add.image(0,0,'bgsun');
        Phaser.Display.Bounds.CenterOn(this.bgsun, this.worldSize.width/2, (this.worldSize.height/2)+(bgSunDims[1]) + 10);
        this.bgsun.scale = bgSunDims[2];
        
        this.backgroundObjects.set("bgsun", this.bgsun);
        this.backgroundObjects.set("starsnear", this.starsnear);
        this.backgroundObjects.set('starsfar', this.starsfar);

        this.beginGame();
    }

    
    
    update(time, delta) {
        //center the background container every frame        
        //screenCenter is the center of the screen in world coordinates
        
        this.screenCenter = getPositionRelativeToViewportPercent(this, 0.5, 0.5);
        Phaser.Display.Bounds.CenterOn(this.bgContainer, this.screenCenter.x, this.screenCenter.y);
 
        this.uiManager.update();

        if (!this.isBeingControlled) {
            this.starsnear.tilePositionX += d.dx * .0004;
            this.starsnear.tilePositionY += d.dy * .0004;
            this.starsfar.tilePositionX += d.dx * .0004;
            this.starsfar.tilePositionY += d.dy * .0004;
        }
    }

    purchaseSpellPool(spellPoolKey) {
        var spellPool = this.inGameUpgradeManager.allSpellPools.get(spellPoolKey);
        if (!this.inGameUpgradeManager.currentSpellPools.has(spellPoolKey)) {
            if (this.player.points >= spellPool.cost) {
                this.player.points -= spellPool.cost;
                this.giveSpellPool(spellPoolKey);
                console.log("BUYING SPELL POOL: " + spellPoolKey);
            }
        }

        this.resumeGame();

        console.log("New points: " + this.player.points);
    }

    beginGame() {
        //beginning of game flow
        //ANIMATIONS PAN UP: this is background animations that are visible right at the start
        //PLAYER MOVES TO CENTER OF SCREEN: no control yet just move the player to the center of the screen
        //CAMERA START FOLLOW: start camera following with a low lerp value (like .05)

        this.gameStarted = true;
        this.isPaused = false;        
        var animTime = 5000;

        //remove event listener until we click the x button up top
        $('#pizzapartybutton').off('click', this.pizzaPartyButtonEventListener);

        //do the intro animation
        //then have the player spawn just outside of the screen
        var audio = document.getElementById("pizzamusic");
        audio.volume = 1.0;
        audio.play();    
        $("#exit-music-button").stop().fadeTo(this.menuFadeAnimLength, 1);

        this.fadeOutAnimation = setTimeout(function() {
            $("#content-wrapper").stop().fadeTo(this.menuFadeAnimLength, 0, function() {
                $("#content-wrapper").hide();
            });
        }, this.menuFadeAnimLength);

        if (this.bgsun != null) {
            this.tweens.add({
                targets: [this.bgsun],
                y: this.worldSize.height/2,
                duration: animTime,
                ease: 'Linear',
                loop: 0,
                yoyo: false
            });
        }      
        
        if (this.starsnear != null) {
            this.tweens.add({
                targets: [this.starsnear],
                alpha: 1,
                tilePositionY: 150,
                duration: animTime,
                ease: 'Linear',
                loop: 0,
                yoyo: false
            });
        }

        if (this.starsfar != null) {
            this.tweens.add({
                targets: [this.starsfar],
                alpha: 0.8,
                tilePositionY: 75,
                duration: animTime,
                ease: 'Linear',
                loop: 0,
                yoyo: false
            });
        }
        
        var playerTweenTime = 1000;
        //have the player spawn and make it's way toward the center of screen
        setTimeout(function(scene, tweenTime) {
            scene.player.respawn();
            scene.player.isBeingControlled = true;
            scene.tweens.add({
                targets: [scene.player.currentSprite],
                y: scene.cameras.main.worldView.y + (scene.cameras.main.worldView.height/2),
                x: scene.cameras.main.worldView.x + (scene.cameras.main.worldView.width/2),
                duration: tweenTime,
                ease: 'Linear',
                loop: 0,
                yoyo: false,
            });
        }, this.playerSpawnTime, this, playerTweenTime);

        var startGameTime = this.playerSpawnTime + playerTweenTime + 2000;
        setTimeout(function(scene, delay) {
            //scene.cameras.main.startFollow(scene.player.currentSprite, true, 0.03, 0.03);
            scene.cameras.main.startFollow(scene.player.currentSprite, true);
            scene.player.isBeingControlled = false;
            scene.uiManager.showUI();
            scene.enemyManager.startSpawningEnemies(delay + 2000);            
            //give starting weapons
            scene.giveSpellPool('gatling-beam');

            //give an upgrade
        }, startGameTime, this, startGameTime);

        //make the enemies spawn harder every minute
        this.timersThatShouldBePaused.push(setInterval(function(scene) {
            scene.enemyManager.increaseDifficulty();
        }, 5000, this));
    }

    

    //take the ratio of the width of the image and the game
    //compare with the ratio of the height of the image and the game
    //and scale the entire image by the max value of the two
    //this ensures any background image will scale to fit inside
    //the canvas, don't use for interactable stuff, just for bg
    //the third index of the array returned is the scale that was used
    getScaledBGImgDimensions(oldDimensions) {
        var a = this.game.canvas.width / oldDimensions[0];
        var b = this.game.canvas.height / oldDimensions[1];
        var c = Math.max(a, b);
        var ret = [oldDimensions[0] * c, oldDimensions[1] * c, c];
        return ret;
    }
}