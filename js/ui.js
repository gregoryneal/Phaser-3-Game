var COLOR_LIGHT = 0xffffff;
var COLOR_DARK = 0x000000;

// manages the shop, builds the ui, loads the images
// manages the input events and calls functions that purchase stuff
// interfaces with the upgrade manager to give player upgrades
export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.trackUI = true;
        this.isUpgrading = false; //are we currently upgrading? once we choose an upgrade this turns to false, once we level up and can upgrade this turns true
    }

    update() {
        this.screenCenter = this.scene.getPositionRelativeToViewportPercent(0.5, 0.5);
        //update ui
        if (this.trackUI) {       
                
            var pos = this.scene.getPositionRelativeToViewportPercent(0.5, 1);
            this.spellbar.x = pos.x;
            this.spellbar.y = pos.y - (this.spellbarHeight/2);

            
            pos = this.scene.getPositionRelativeToViewportPercent(0.5, 0);
            this.playPauseContainer.x = pos.x;
            this.playPauseContainer.y = pos.y + 60;
            this.centerUIComponents();
        }
    }

    preloadFiles() {        
        //upgrade menu
        //this.load.image('upgrademenu', 'images/upgrades/upgrademenu.png');
        this.scene.load.image('upgrade-background', 'images/interface/upgrade-background2.png');
        this.scene.load.image('upgrade-select', 'images/interface/upgrade-select.png');
        this.scene.load.image('menu-button-white', 'images/interface/menu-button-white.png');
        this.scene.load.image('default-upgrade-image', 'images/upgrades/defaultupgradeimage.png');
        this.scene.load.image('menu-exit', 'images/interface/menu-exit.png');

        //interface
        this.scene.load.image('pause', 'images/interface/pause.png');        
        this.scene.load.image('play', 'images/interface/play.png');
        this.scene.load.image('button1', 'images/interface/button1.png');

        //spell bar
        this.scene.load.image('spellbar', 'images/interface/spellbar.png');
    }

    //initialize some stuff and create files if we need to
    createFiles() {
        //grab references to needed assets
        this.player = this.scene.player;
        this.upgradeManager = this.scene.upgradeManager;

                //setup upgrade menu
        // UPGRADE MENU BUTTONS

        this.textStyleTextStat = {
            fontFamily: 'Rubiks-Glitch',
            fontSize: 20,
            color: 'white',
        };

        this.textStyleTextTarget = {
            fontSize: 15,
            color: 'white',
        }

        this.textStyleFinalValue = {
            fontSize: 15,
            color: 'white',
        }

        this.shopUpgradeButtonTextStyle = {
            align: 'center', 
            color: 'black',
        };

        //add relative to 0, 0, which is the center of the container, and anchor is center of image
        this.upgradeFrameWidth = 600;
        this.upgradeFrameHeight = 500;
        this.upgradeFramePad = 10; //pad between elements in the frame
        this.upgradeFrame = this.scene.add.nineslice(0, 0, 'upgrade-background', 0, this.upgradeFrameWidth, this.upgradeFrameHeight, 12, 12, 12, 12);
        this.upgrade1Button = this.scene.add.nineslice(0, 0 , 'upgrade-select', 0, this.upgradeFrameWidth - 20, 140, 11, 11, 11, 11);
        this.upgrade2Button = this.scene.add.nineslice(0, 0, 'upgrade-select', 0, this.upgradeFrameWidth - 20, 140, 11, 11, 11, 11);
        this.upgrade3Button = this.scene.add.nineslice(0, 0, 'upgrade-select', 0, this.upgradeFrameWidth - 20, 140, 11, 11, 11, 11); //11

        this.upgrade1Image = this.scene.add.image(-this.upgradeFrameWidth/3, 0, 'default-upgrade-image');
        this.upgrade2Image = this.scene.add.image(-this.upgradeFrameWidth/3, 0, 'default-upgrade-image');
        this.upgrade3Image = this.scene.add.image(-this.upgradeFrameWidth/3, 0, 'default-upgrade-image');
        this.upgrade1Image.setDisplaySize(64, 64);
        this.upgrade2Image.setDisplaySize(64, 64);
        this.upgrade3Image.setDisplaySize(64, 64);

        //descriptor for the target being upgraded, either a spell pool or the player
        this.upgrade1TextTarget = this.scene.add.text(-30, -30, 'SpellPool/Player', this.textStyleTextTarget);
        this.upgrade2TextTarget = this.scene.add.text(-30, -30, 'SpellPool/Player', this.textStyleTextTarget);
        this.upgrade3TextTarget = this.scene.add.text(-30, -30, 'SpellPool/Player', this.textStyleTextTarget);

        //these are the stat being upgraded
        this.upgrade1TextStat = this.scene.add.text(-40, 0, 'Stat 1', this.textStyleTextStat);
        this.upgrade2TextStat = this.scene.add.text(-40, 0, 'Stat 2', this.textStyleTextStat);
        this.upgrade3TextStat = this.scene.add.text(-40, 0, 'Stat 3', this.textStyleTextStat);

        //the final value of the stat being upgraded
        this.upgrade1TextFinalValue = this.scene.add.text(-40, 30, 'Final Value', this.textStyleFinalValue);
        this.upgrade2TextFinalValue = this.scene.add.text(-40, 30, 'Final Value', this.textStyleFinalValue);
        this.upgrade3TextFinalValue = this.scene.add.text(-40, 30, 'Final Value', this.textStyleFinalValue);

        this.upgrade1Container = this.scene.add.container(0, -160 - this.upgradeFramePad);
        this.upgrade2Container = this.scene.add.container(0, 0);
        this.upgrade3Container = this.scene.add.container(0, 160 + this.upgradeFramePad);
        
        //this button only shows up on the upgrade menu, so we want it to show the shop menu with the upgrademenu button
        this.shopButton = this.scene.add.nineslice(0, -(this.upgradeFrameHeight/2) -20, 'button1', 0, 150, 32, 16, 16, 16, 16).setInteractive().on('pointerup', function() {
            this.openShop();
        }, this).on('pointerover', function() {
            this.setTint(0xBBBBBBBB);
        }).on('pointerout', function() {
            this.clearTint();
        });

        this.shopButtonText = this.scene.add.text(0, -(this.upgradeFrameHeight/2) - 20, 'Shop', this.shopUpgradeButtonTextStyle);
        this.upgradeLabel = this.scene.add.text(-this.upgradeFrameWidth/2, (this.upgradeFrameHeight/2) + 5, 'Upgrade', {color: 'white'});

        this.upgradeContainer = this.scene.add.container(0, 0);
        this.upgradeContainer.add(this.shopButton)
        .add(this.shopButtonText)
        .add(this.upgradeFrame)
        .add(this.upgradeLabel);
        Phaser.Display.Bounds.CenterOn(this.shopButtonText, this.shopButton.x, this.shopButton.y);

        this.upgrade1Container.add(this.upgrade1Button)
        .add(this.upgrade1Image)
        .add(this.upgrade1TextStat)
        .add(this.upgrade1TextTarget)
        .add(this.upgrade1TextFinalValue);

        this.upgrade2Container.add(this.upgrade2Button)
        .add(this.upgrade2Image)
        .add(this.upgrade2TextStat)
        .add(this.upgrade2TextTarget)
        .add(this.upgrade2TextFinalValue);

        this.upgrade3Container.add(this.upgrade3Button)
        .add(this.upgrade3Image)
        .add(this.upgrade3TextStat)
        .add(this.upgrade3TextTarget)
        .add(this.upgrade3TextFinalValue);

        this.upgradeContainer.add(this.upgrade1Container)
        .add(this.upgrade2Container)
        .add(this.upgrade3Container);

        this.upgrade1Button.setInteractive();
        this.upgrade2Button.setInteractive();
        this.upgrade3Button.setInteractive();

        //these just set up tint, not the upgrades themselves
        this.upgrade1Button.on('pointerover', function() {
            this.setTint(0xBBBBBB);
        });
        this.upgrade1Button.on('pointerout', function() {
            this.clearTint();
        });

        //these just set up tint, not the upgrades themselves
        this.upgrade2Button.on('pointerover', function() {
            this.setTint(0xBBBBBB);
        });
        this.upgrade2Button.on('pointerout', function() {
            this.clearTint();
        });

        //these just set up tint, not the upgrades themselves
        this.upgrade3Button.on('pointerover', function() {
            this.setTint(0xBBBBBB);
        });
        this.upgrade3Button.on('pointerout', function() {
            this.clearTint();
        });

        this.upgradeContainer.setDepth(1000)
        .setActive(false)
        .setVisible(false);


        // END UPGRADE BUTTONS
        // SHOP BUTTONS

        this.shopWidth = 200;
        this.shopHeight = 500;
        this.shopFrame = this.scene.add.nineslice(0, 0, 'upgrade-background', 0, this.shopWidth, this.shopHeight, 12, 12, 12, 12);

        //this button should only be visible in the shop if we opened an upgrade menu by leveling up, not simply by pausing
        this.upgradeButton = this.scene.add.nineslice(0, -(this.shopHeight/2) -20, 'button1', 0, 150, 32, 16, 16, 16, 16).setInteractive().on('pointerup', function() {
            this.showUpgradeMenu();
        }, this).on('pointerover', function() {
            this.setTint(0xBBBBBBBB);
        }).on('pointerout', function() {
            this.clearTint();
        });
        this.upgradeButtonText = this.scene.add.text(0, 0, 'Upgrade', this.shopUpgradeButtonTextStyle);
        this.shopLabel = this.scene.add.text(-this.shopWidth/2, (this.shopHeight/2) + 5, 'Shop', {color: 'white'});        

        this.newSpellShopButton = this.scene.add.nineslice(0, -(this.shopHeight/2)+40, 'button1', 0, 150, 32, 16, 16, 16, 16).setInteractive().on('pointerover', function() {
            this.setTint(0xBBBBBBBB);
        }).on('pointerout', function() {
            this.clearTint();
        }).on('pointerup', function() {
            //open spell shop menu
            this.showNewSpellShop();
        }, this);

        this.newSpellShopButtonText = this.scene.add.text(0,0, 'New Spell', this.shopUpgradeButtonTextStyle);

        this.newUpgradeButton = this.scene.add.nineslice(0, -(this.shopHeight/2)+80, 'button1', 0, 150, 32, 16, 16, 16, 16).setInteractive().on('pointerover', function() {
            this.setTint(0xBBBBBBBB);
        }).on('pointerout', function() {
            this.clearTint();
        }).on('pointerup', function() {
            //open upgrade shop menu
            //make sure not to show any upgrades that were chosen in saved upgrade menu array
            this.showNewUpgradeShop();
        }, this);

        this.newUpgradeButtonText = this.scene.add.text(0,0, 'New Upgrade', this.shopUpgradeButtonTextStyle);

        this.shopContainer = this.scene.add.container();
        this.shopContainer.add(this.shopFrame)
        .add(this.upgradeButton)
        .add(this.upgradeButtonText)
        .add(this.shopLabel)
        .add(this.newSpellShopButton)
        .add(this.newSpellShopButtonText)
        .add(this.newUpgradeButton)
        .add(this.newUpgradeButtonText);        
        Phaser.Display.Bounds.CenterOn(this.upgradeButtonText, this.upgradeButton.x, this.upgradeButton.y);
        Phaser.Display.Bounds.CenterOn(this.newUpgradeButtonText, this.newUpgradeButton.x, this.newUpgradeButton.y);
        Phaser.Display.Bounds.CenterOn(this.newSpellShopButtonText, this.newSpellShopButton.x, this.newSpellShopButton.y);


        this.shopContainer.setDepth(1001).setActive(false).setVisible(false);

        //END SHOP BUTTONS

        // NEW SPELL SHOP
        this.newSpellShopWidth = 600;
        this.newSpellShopHeight = 300;

        this.newSpellShop = this.scene.rexUI.add.fixWidthSizer({
            name: 'SpellShopContainer',
            x: 0,
            y: 0,
            width: this.newSpellShopWidth,
            height: this.newSpellShopHeight,            
            space: {
                left: 20, right: 20, top: 20, bottom: 20,
                panel: 10
            },
        });

        this.newSpellShopScrollPanel = this.scene.rexUI.add.scrollablePanel({
            x: 0, 
            y: 0,
            width: this.newSpellShopWidth, 
            height: this.newSpellShopHeight,
            scrollMode: 'y',
            background: this.scene.add.nineslice(0, 0, 'upgrade-background', 0, this.newSpellShopWidth, this.newSpellShopHeight, 12, 12, 12, 12), 
            panel: {
                child: this.createNewSpellShopPanel(this.scene),
                mask: { padding: 10, },
            },
            slider: {
                track: this.scene.rexUI.add.roundRectangle({ width: 20, radius: 10, color: 0x444444 }).setDepth(1),
                thumb: this.scene.rexUI.add.roundRectangle({ radius: 13, color: 0x3333ff }).setDepth(1)
            },
            space: {
                left: 20, right: 20, top: 20, bottom: 20,
                panel: 10
            },
            expand: {
                panel: true
            },
            align: {
                panel: 'right'
            },
            mouseWheelScroller: {
                focus: false,
                speed: 0.3
            },
        }).layout();

        this.newSpellShop.add(this.newSpellShopScrollPanel).layout();

        /*
        this.newSpellShopBackButton = this.scene.add.nineslice(0, -(this.newUpgradeShopHeight/2)-20, 'button1', 0, 150, 32, 16, 16, 16, 16).setInteractive().on('pointerup', function() {
            this.openShop();
        }, this).on('pointerover', function() {
            this.setTint(0xBBBBBBBB);
        }).on('pointerout', function() {
            this.clearTint();
        });
        this.newSpellShopBackButtonLabel = this.scene.add.text(0,0,'Back', this.shopUpgradeButtonTextStyle);*/

        var sizer = this.newSpellShopScrollPanel.getByName('newSpellsSizer', true);

        //console.log(this.newSpellShopScrollPanel);
        //console.log(sizer);
        this.scene.rexUI.setChildrenInteractive(this.newSpellShopScrollPanel, {
            targets: [sizer],
            over: true,
            click: {mode: 'release', clickInterval: 100},
        }).on('child.over', function(child, pointer, event) {
            for (var i = 0; i < child.backgroundChildren.length; i++) {
                child.backgroundChildren[i].setTint(0xBBBBBB);
            }                
        }).on('child.out', function(child, pointer, event) {
            
            for (var i = 0; i < child.backgroundChildren.length; i++) {
                child.backgroundChildren[i].clearTint();
            }
        }).on('child.click', function(child, pointer, event) {
            this.scene.purchaseSpellPool(child.spellPoolKey); //child.spellPoolKey is set to the spell pool key when we create the menu labels in this.showNewSpellShop()
        });
        // END NEW SPELL SHOP

        // NEW UPGRADE SHOP
        this.newUpgradeShopWidth = 300;
        this.newUpgradeShopHeight = 300;
        this.newUpgradeShopFrame = this.scene.add.nineslice(0, 0, 'upgrade-background', 0, this.newUpgradeShopWidth, this.newUpgradeShopHeight, 12, 12, 12, 12);
        this.newUpgradeShopLabel = this.scene.add.text(-this.newUpgradeShopWidth/2, (this.newUpgradeShopHeight/2)+5, 'New Upgrade', {color: 'white'});
        this.newUpgradeShopBackButton = this.scene.add.nineslice(0, -(this.newUpgradeShopHeight/2)-20, 'button1', 0, 150, 32, 16, 16, 16, 16).setInteractive().on('pointerup', function() {
            this.openShop();
        }, this).on('pointerover', function() {
            this.setTint(0xBBBBBBBB);
        }).on('pointerout', function() {
            this.clearTint();
        });
        this.newUpgradeShopBackButtonLabel = this.scene.add.text(0,0,'Back', this.shopUpgradeButtonTextStyle);
        this.newUpgradeShopContainer = this.scene.add.container()
        .add(this.newUpgradeShopFrame)
        .add(this.newUpgradeShopLabel)
        .add(this.newUpgradeShopBackButton)
        .add(this.newUpgradeShopBackButtonLabel);
        Phaser.Display.Bounds.CenterOn(this.newUpgradeShopBackButtonLabel, this.newUpgradeShopBackButton.x, this.newUpgradeShopBackButton.y);
        // END NEW UPGRADE SHOP

        //SPELLBAR

        this.spellbarHeight = 40; //height of spellbar in pixels
        this.spellbar = this.scene.add.container(0,0); //add it to the correct position first and set scroll factor to 0
        this.spellbarBackground = this.scene.add.nineslice(0, 0, 'spellbar', 0, 800, this.spellbarHeight, 11, 11, 24, 0);
        this.spellbar.add(this.spellbarBackground);
        this.spellbar.setAlpha(0);//set alpha to 0 initially to avoid the hideUI animation on page load
        this.spellbar.setVisible(false);

        //END SPELLBAR

        //PLAY PAUSE BUTTON
        //create a pause button and add to canvas
        this.playPauseContainer = this.scene.add.container();
        this.pauseBtn = this.scene.add.image(0, 0, 'pause').setInteractive().on('pointerup', function() {
            this.scene.pauseWithShopMenu();            
            this.playBtn.setVisible(true).setActive(true);
            this.pauseBtn.setVisible(false).setActive(false);
        }, this);
        this.playBtn = this.scene.add.image(0, 0, 'play').setVisible(false).setActive(false).setInteractive().on('pointerup', function() {
            this.scene.resumeGame();
            this.pauseBtn.setVisible(true).setActive(true);
            this.playBtn.setVisible(false).setActive(false);
        }, this);
        this.playPauseContainer.add(this.pauseBtn);
        this.playPauseContainer.add(this.playBtn).setVisible(false);

        //start with everything closed 
        this.hideUI();
        this.closeAllMenus();
    }

    centerUIComponents() {
        this.upgradeContainer.setPosition(this.screenCenter.x, this.screenCenter.y);
        this.shopContainer.setPosition(this.screenCenter.x, this.screenCenter.y);
        this.newUpgradeShopContainer.setPosition(this.screenCenter.x, this.screenCenter.y);
        this.newSpellShop.setPosition(this.screenCenter.x, this.screenCenter.y);
    }

    onPauseGame() {        
        this.pauseBtn.setVisible(false).setActive(false);
        this.playBtn.setVisible(true).setActive(true);
    }

    onResumeGame() {
        this.closeAllMenus();
        this.playBtn.setVisible(false).setActive(false);
        this.pauseBtn.setVisible(true).setActive(false);
    }

    //close all the menu panels that can be opened
    closeAllMenus() {
        this.upgradeContainer.setVisible(false).setActive(false);
        this.shopContainer.setVisible(false).setActive(false);
        this.newSpellShop.setVisible(false).setActive(false);
        this.newUpgradeShopContainer.setVisible(false).setActive(false);
    }

    openShop() {
        this.closeAllMenus();
        this.shopContainer.setVisible(true).setActive(true);

        if (this.isUpgrading) {
            this.upgradeButton.setVisible(true).setActive(true);
        } else {
            this.upgradeButton.setVisible(false).setActive(false);
        }
    }

    //we should only be able to call this from a shop
    //that was opened from an upgrade menu, otherwise the upgrade menu is worthless
    showUpgradeMenu() {
        this.closeAllMenus();
        this.upgradeContainer.setVisible(true).setActive(true);
    }

    showNewUpgradeShop() {
        this.closeAllMenus();
        this.newUpgradeShopContainer.setVisible(true).setActive(true);
    }

    showNewSpellShop() {
        this.closeAllMenus();

        //build the new spell shop
        //make sure potential spell pools list is up to date
        this.upgradeManager.buildPotentialUpgradeList();
        var availableSpells = this.upgradeManager.potentialSpellPools;
        var skipPools = []; //spell pools with these keys wont be drawn during this pass        

        //if any of the available spells are in the pending upgrades list
        //add them to the skip pools list so that we don't let the player buy them
        //since he may come back later and pick up the upgrade for free
        for (var i = 0; i < availableSpells.length; i++) {
            for (var j = 0; j < this.upgradeManager.pendingUpgrades.length; j++) {
                if (this.upgradeManager.pendingUpgrades[j].key == availableSpells[i]) {
                    skipPools.push(availableSpells[i]);
                }
            }
        }        

        var sizer = this.newSpellShopScrollPanel.getElement('panel');
        sizer.clear(true); //remove and destroy all children and backgrounds

        console.log('sizer: ');
        console.log(sizer);

        console.log('available: ' + availableSpells.join());
        console.log('skip: ' + skipPools.join());
    
        //these are the buttons we need to add
        for (i = 0; i < availableSpells.length; i++) {
            if (skipPools.includes(availableSpells[i])) continue;

            var spellPool = this.upgradeManager.allSpellPools.get(availableSpells[i]);

            var label = this.scene.rexUI.add.label({
                height: 60,
                space: { left: 10, right: 10, top: 10, bottom: 10 },
                background: this.scene.add.nineslice(0, 0, 'button1', 0, 150, 32, 16, 16, 16, 16),
                text: this.scene.add.text(0, 0, spellPool.finalStatValue, { fontSize: 20, color: 'black' }),
            });
            label.spellPoolKey = availableSpells[i];

            sizer.add(
                label,
                { expand: true }
            );
        }

        sizer.layout();
        this.newSpellShop.setVisible(true).setActive(true);
    }

    generateUpgradeMenu() {
        this.isUpgrading = true;
        //Phaser.Display.Bounds.CenterOn(this.upgradeContainer, this.cameras.main.worldView.x + (this.cameras.main.worldView.width/2), this.cameras.main.worldView.y + (this.cameras.main.worldView.height/2));
        this.upgradeContainer.setActive(true).setVisible(true);

        //get list of all potential upgrades and show 3 of them
        //a potential upgrade is one that is either a new spell
        //or all the  spellupgrades that is in every spell 
        //that is equipped by the player
        //[{
        // isSpellPoolUpgrade: false,
        // isPlayerUpgrade: false,
        // isSpellPool: true,
        // key: upgradeKey/spellPoolKey
        // target: player/SpellPool,
        // upgrade: Upgrade/SpellPool,
        //}, {...}, ...]
        var potentialUpgrades = this.upgradeManager.get3RandomUpgrades();

        //remove all old event listeners from upgrade buttons
        this.upgrade1Button.off('pointerup');
        this.upgrade2Button.off('pointerup');
        this.upgrade3Button.off('pointerup');

        //these just set up tint, not the upgrades themselves
        this.upgrade2Button.off('pointerover', function() {
            this.setTint(0xBBBBBB);
        });
        this.upgrade2Button.on('pointerout', function() {
            this.clearTint();
        });

        //these just set up tint, not the upgrades themselves
        this.upgrade3Button.off('pointerover', function() {
            this.setTint(0xBBBBBB);
        });
        this.upgrade3Button.on('pointerout', function() {
            this.clearTint();
        });


        if (potentialUpgrades.length < 1) {
            this.upgrade1Container.setVisible(false);
            this.upgrade1Container.setActive(false);
            this.upgrade2Container.setVisible(false);
            this.upgrade2Container.setActive(false);
            this.upgrade3Container.setVisible(false);
            this.upgrade3Container.setActive(false);
            return;
        }

        this.upgrade1Container.setVisible(true);
        this.upgrade1Container.setActive(true);
        var upgrade = potentialUpgrades[0].upgrade;
        this.upgrade1Image.setTexture(upgrade.upgradeTextureKey);
        this.upgrade1TextTarget.setText(potentialUpgrades[0].target.upgradeDescription);
        this.upgrade1TextStat.setText(upgrade.upgradeStat);
        this.upgrade1TextFinalValue.setText('-> ' + upgrade.finalStatValue);

        //add event listener
        this.upgrade1Button.on('pointerup', function() {
            this.obj.upgradeManager.applyUpgrade(this.upgrade);
            this.obj.uiManager.isUpgrading = false;
            this.obj.resumeGame();
        }, {obj: this.scene, upgrade: potentialUpgrades[0]});

        if (potentialUpgrades.length < 2) {
            this.upgrade2Container.setVisible(false);
            this.upgrade2Container.setActive(false);            
            this.upgrade3Container.setVisible(false);
            this.upgrade3Container.setActive(false);
            return;
        }

        this.upgrade2Container.setVisible(true);
        this.upgrade2Container.setActive(true);    
        upgrade = potentialUpgrades[1].upgrade;
        this.upgrade2Image.setTexture(upgrade.upgradeTextureKey);
        this.upgrade2TextTarget.setText(potentialUpgrades[1].target.upgradeDescription);
        this.upgrade2TextStat.setText(upgrade.upgradeStat);
        this.upgrade2TextFinalValue.setText('-> ' + upgrade.finalStatValue);

        //add event listener
        this.upgrade2Button.on('pointerup', function() {
            this.obj.upgradeManager.applyUpgrade(this.upgrade);
            this.obj.uiManager.isUpgrading = false;
            this.obj.resumeGame();
        }, {obj: this.scene, upgrade: potentialUpgrades[1]});
        
        if (potentialUpgrades.length < 3) {            
            this.upgrade3Container.setVisible(false);
            this.upgrade3Container.setActive(false);    
            return;
        }

        this.upgrade3Container.setVisible(true);
        this.upgrade3Container.setActive(true);   
        upgrade = potentialUpgrades[2].upgrade;
        this.upgrade3Image.setTexture(upgrade.upgradeTextureKey);
        this.upgrade3TextTarget.setText(potentialUpgrades[2].target.upgradeDescription);
        this.upgrade3TextStat.setText(upgrade.upgradeStat);
        this.upgrade3TextFinalValue.setText('-> ' + upgrade.finalStatValue);

        //add event listener
        this.upgrade3Button.on('pointerup', function() {
            this.obj.upgradeManager.applyUpgrade(this.upgrade);
            this.obj.uiManager.isUpgrading = false;
            this.obj.resumeGame();
        }, {obj: this.scene, upgrade: potentialUpgrades[2]});

    }

    hideUpgradeMenu() {
        this.upgradeContainer.setActive(false);
        this.upgradeContainer.setVisible(false);
    }


    //create a panel with all of the available spells the player can buy
    //this is for initial creation, to toggle and show call showNewSpellShop()
    createNewSpellShopPanel(scene) {
        var sizer = scene.rexUI.add.sizer({
            orientation: 'y',
            space: { item: 3 },
            name: 'newSpellsSizer',
        });

        return sizer;
    }
    

    createHeader(scene, data) {
        var title = scene.rexUI.add.label({
            orientation: 'x',
            text: this.scene.add.text(0, 0, 'Character'),
        });
        var header = scene.rexUI.add.label({
            orientation: 'y',
            icon: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 5, COLOR_LIGHT),
            text: this.scene.add.text(0, 0, data.name),
    
            space: { icon: 10 }
        });
    
        return scene.rexUI.add.sizer({
            orientation: 'y',
            space: { left: 5, right: 5, top: 5, bottom: 5, item: 10 }
        })
            .addBackground(
                scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined).setStrokeStyle(2, COLOR_LIGHT, 1)
            )
            .add(
                title, // child
                { expand: true, align: 'left' }
            )
            .add(header, // child
                { proportion: 1, expand: true }
            );
    };

    createIcon(scene, item, iconWidth, iconHeight) {
        var label = scene.rexUI.add.label({
            orientation: 'y',
            icon: this.scene.rexUI.add.roundRectangle(0, 0, iconWidth, iconHeight, 5, COLOR_LIGHT),
            text: this.scene.add.text(0, 0, item.name),
    
            space: { icon: 3 }
        });
        return label;
    }

    createTable(scene, data, key, rows) {
        var capKey = key.charAt(0).toUpperCase() + key.slice(1);
        var title = scene.rexUI.add.label({
            orientation: 'y',
            text: this.scene.add.text(0, 0, capKey),
        });
    
        var items = data[key];
        var columns = Math.ceil(items.length / rows);
        var table = scene.rexUI.add.gridSizer({
            column: columns,
            row: rows,
    
            rowProportions: 1,
            space: { column: 10, row: 10 },
            name: key  // Search this name to get table back
        });
    
        var item, r, c;
        var iconSize = (rows === 1) ? 80 : 40;
        for (var i = 0, cnt = items.length; i < cnt; i++) {
            item = items[i];
            r = i % rows;
            c = (i - r) / rows;
            table.add(
                createIcon(scene, item, iconSize, iconSize),
                c,
                r,
                'top',
                0,
                true
            );
        }
    
        return scene.rexUI.add.sizer({
            orientation: 'y',
            space: { left: 10, right: 10, top: 10, bottom: 10, item: 10 }
        })
            .addBackground(
                scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined).setStrokeStyle(2, COLOR_LIGHT, 1)
            )
            .add(
                title, // child
                0, // proportion
                'left', // align
                0, // paddingConfig
                true // expand
            )
            .add(table, // child
                1, // proportion
                'center', // align
                0, // paddingConfig
                true // expand
            );
    }
    
    //hide the player ui like the pause, spellbar, buffs etc
    hideUI() {

        this.scene.tweens.add({
            targets: [this.spellbar, this.playPauseContainer],
            alpha: 0,
            duration: 500,
            ease: 'Linear',
            loop: 0,
            yoyo: false,
            onComplete: function(tween, target, param) {
                for(var i = 0; i < target.length; i++) {
                    target[i].setVisible(false);
                }
                this.trackUI = false;
            },
            onCompleteScope: this,
        });
    }

    //show the player ui
    showUI() {
        var t = [this.spellbar, this.playPauseContainer];

        for(var i = 0; i < t.length; i++) {
            t[i].setVisible(true);
        }

        this.trackUI = true;

        this.scene.tweens.add({
            targets: t,
            alpha: 1,
            duration: 500,
            ease: 'Linear',
            loop: 0,
            yoyo: false,
        });
    }

}