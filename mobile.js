/* MobileIdeMorph */

MobileIdeMorph.prototype = new IDE_Morph();
MobileIdeMorph.prototype.constructor = MobileIdeMorph;
MobileIdeMorph.uber = IDE_Morph.prototype;

// MobileIdeMorph preferences settings and skins

MobileIdeMorph.prototype.setDefaultDesign = function () {
    MobileIdeMorph.uber.setDefaultDesign.call(this);
    MobileIdeMorph.prototype.padding = 2;
};

// MobileIdeMorph settings persistance

MobileIdeMorph.prototype.applySavedSettings = function () {
    var design = this.getSetting('design'),
        zoom = this.getSetting('zoom') || 1.25,
        language = this.getSetting('language'),
        click = this.getSetting('click'),
        longform = this.getSetting('longform'),
        longurls = this.getSetting('longurls'),
        plainprototype = this.getSetting('plainprototype'),
        keyboard = this.getSetting('keyboard'),
        tables = this.getSetting('tables'),
        tableLines = this.getSetting('tableLines'),
        autoWrapping = this.getSetting('autowrapping');

    // design
    if (design === 'flat') {
        this.setFlatDesign();
    } else {
        this.setDefaultDesign();
    }

    // blocks zoom
    if (zoom) {
        SyntaxElementMorph.prototype.setScale(Math.min(zoom, 12));
        CommentMorph.prototype.refreshScale();
        SpriteMorph.prototype.initBlocks();
    }

    // language
    if (language && language !== 'en') {
        this.userLanguage = language;
    } else {
        this.userLanguage = null;
    }

    //  click
    if (click && !BlockMorph.prototype.snapSound) {
        BlockMorph.prototype.toggleSnapSound();
    }

    // long form
    if (longform) {
        InputSlotDialogMorph.prototype.isLaunchingExpanded = true;
    }

    // project data in URLs
    if (longurls) {
        this.projectsInURLs = true;
    } else {
        this.projectsInURLs = false;
    }

    // keyboard editing
    if (keyboard === 'false') {
        ScriptsMorph.prototype.enableKeyboard = false;
    } else {
        ScriptsMorph.prototype.enableKeyboard = true;
    }

    // tables
    if (tables === 'false') {
        List.prototype.enableTables = false;
    } else {
        List.prototype.enableTables = true;
    }

    // tableLines
    if (tableLines) {
        TableMorph.prototype.highContrast = true;
    } else {
        TableMorph.prototype.highContrast = false;
    }

    // nested auto-wrapping
    if (autoWrapping === 'false') {
        ScriptsMorph.prototype.enableNestedAutoWrapping = false;
    } else {
        ScriptsMorph.prototype.enableNestedAutoWrapping = true;
    }

    // plain prototype labels
    if (plainprototype) {
        BlockLabelPlaceHolderMorph.prototype.plainLabel = true;
    }
};

// MobileIdeMorph instance creation:

function MobileIdeMorph(isAutoFill) {
    this.init(isAutoFill);
}

MobileIdeMorph.prototype.init = function (isAutoFill) {
    MobileIdeMorph.uber.init.call(this);
    this.isMobile = true;
    this.barHeight = 48;
    this.tabBar = null;
    this.spritesPanel = null;
    this.stagePanel = null;
};

// MobileIdeMorph construction

MobileIdeMorph.prototype.buildPanes = function () {
    this.createControlBar();
    this.createTabBar();
    this.createCategories();
    this.createPalette();
    this.createPaletteDrawer();
    this.createStage();
    this.createSpriteBar();
    this.createSpriteEditor();
    this.createCorralBar();
    this.createCorral();
    this.createSpritesPanel();
    this.createStagePanel();
};

MobileIdeMorph.prototype.createControlBar = function () {
    var padding = 5,
        button,
        slider,
        projectButton,
        settingsButton,
        x,
        colors = [
            this.groupColor,
            this.frameColor.darker(50),
            this.frameColor.darker(50)
        ],
        myself = this;

    if (this.controlBar) {
        this.controlBar.destroy();
    }

    this.controlBar = new Morph();
    this.controlBar.color = this.frameColor;
    this.controlBar.setHeight(this.barHeight); // height is fixed
    this.add(this.controlBar);

    // steppingSlider
    slider = new SliderMorph(
        61,
        1,
        Process.prototype.flashTime * 100 + 1,
        6,
        'horizontal'
    );
    slider.action = function (num) {
        Process.prototype.flashTime = (num - 1) / 100;
        myself.controlBar.refreshResumeSymbol();
    };
    slider.alpha = MorphicPreferences.isFlat ? 0.1 : 0.3;
    slider.setExtent(new Point(50, 16));
    this.controlBar.add(slider);
    this.controlBar.steppingSlider = slider;

    // settingsButton
    button = new PushButtonMorph(
        this,
        'settingsMenu',
        new SymbolMorph('gears', 16)
        //'\u2699'
    );
    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.labelMinExtent = new Point(48, 36);
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = this.buttonLabelColor;
    button.contrast = this.buttonContrast;
    button.drawNew();
    // button.hint = 'edit settings';
    button.fixLayout();
    settingsButton = button;
    this.controlBar.add(settingsButton);
    this.controlBar.settingsButton = settingsButton; // for menu positioning

    // projectButton
    button = new PushButtonMorph(
        this,
        'projectMenu',
        new SymbolMorph('file', 16)
        //'\u270E'
    );
    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.labelMinExtent = new Point(48, 36);
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = this.buttonLabelColor;
    button.contrast = this.buttonContrast;
    button.drawNew();
    // button.hint = 'open, save, & annotate project';
    button.fixLayout();
    projectButton = button;
    this.controlBar.add(projectButton);
    this.controlBar.projectButton = projectButton; // for menu positioning

    this.controlBar.fixLayout = function () {
        settingsButton.setCenter(myself.controlBar.center());
        settingsButton.setLeft(this.left() + padding);

        projectButton.setCenter(myself.controlBar.center());
        projectButton.setRight(this.right() - padding);

        this.refreshSlider();
        this.updateLabel();
    };

    this.controlBar.refreshSlider = function () {
        if (Process.prototype.enableSingleStepping && !myself.isAppMode) {
            slider.drawNew();
            slider.show();
        } else {
            slider.hide();
        }
        // this.refreshResumeSymbol();
    };

    this.controlBar.updateLabel = function () {
        var suffix = myself.world().isDevMode ?
                ' - ' + localize('development mode') : '';

        if (this.label) {
            this.label.destroy();
        }
        if (myself.isAppMode) {
            return;
        }

        this.label = new StringMorph(
            (myself.projectName || localize('untitled')) + suffix,
            14,
            'sans-serif',
            true,
            false,
            false,
            MorphicPreferences.isFlat ? null : new Point(2, 1),
            myself.frameColor.darker(myself.buttonContrast)
        );
        this.label.color = myself.buttonLabelColor;
        this.label.drawNew();
        this.add(this.label);
        this.label.setCenter(this.center());
    };
};

MobileIdeMorph.prototype.createTabBar = function () {
    var padding = 5,
        buttons,
        spritesButton,
        scriptsButton,
        costumesButton,
        soundsButton,
        stageButton,
        x,
        colors = [
            this.groupColor,
            this.frameColor.darker(50),
            this.frameColor.darker(50)
        ],
        myself = this;

    if (this.tabBar) {
        this.tabBar.destroy();
    }

    this.tabBar = new Morph();
    this.tabBar.color = this.frameColor;
    this.tabBar.setHeight(this.barHeight); // height is fixed
    this.add(this.tabBar);

    this.tabBar.tabTo = function (tabString) {
        var active;
        myself.currentTab = tabString;
        this.children.forEach(function (each) {
            each.refresh();
            if (each.state) {active = each; }
        });
        active.refresh(); // needed when programmatically tabbing
        myself.createSpriteEditor();
        myself.fixLayout('tabEditor');
    };

    // spritesButton
    spritesButton = new ToggleButtonMorph(
        colors,
        this,
        function () {myself.tabBar.tabTo('sprites'); },
        new SymbolMorph('turtle', 16),
        function () {  // query
            return myself.currentTab === 'sprites';
        }
    );
    this.tabBar.spritesButton = spritesButton; // for menu positioning

    // scriptsButton
    scriptsButton = new ToggleButtonMorph(
        colors,
        this,
        function () {myself.tabBar.tabTo('scripts'); },
        '?',
        function () {  // query
            return myself.currentTab === 'scripts';
        }
    );
    this.tabBar.scriptsButton = scriptsButton; // for menu positioning

    // costumesButton
    costumesButton = new ToggleButtonMorph(
        colors,
        this,
        function () {myself.tabBar.tabTo('costumes'); },
        '?',
        function () {  // query
            return myself.currentTab === 'costumes';
        }
    );
    this.tabBar.costumesButton = costumesButton; // for menu positioning

    // soundsButton
    soundsButton = new ToggleButtonMorph(
        colors,
        this,
        function () {myself.tabBar.tabTo('sounds'); },
        '\u266B',
        function () {  // query
            return myself.currentTab === 'sounds';
        }
    );
    this.tabBar.soundsButton = soundsButton; // for menu positioning

    // stageButton
    stageButton = new ToggleButtonMorph(
        colors,
        this,
        function () {myself.tabBar.tabTo('stage'); },
        new SymbolMorph('poster', 16),
        function () {  // query
            return myself.currentTab === 'stage';
        }
    );
    this.tabBar.stageButton = stageButton; // for menu positioning

    buttons = [
        spritesButton,
        scriptsButton,
        costumesButton,
        soundsButton,
        stageButton
    ];

    buttons.forEach(function (button) {
        button.corner = 12;
        button.labelMinExtent = new Point(48, 36);
        button.padding = 0;
        button.labelShadowOffset = new Point(-1, -1);
        button.labelShadowColor = colors[1];
        button.labelColor = myself.buttonLabelColor;
        button.contrast = myself.buttonContrast;
        button.fontSize = 20;
        button.drawNew();
        button.fixLayout();
        button.refresh();
        myself.tabBar.add(button);
    });

    this.tabBar.fixLayout = function () {
        var width, x;
        width = (buttons[0].width() + padding) * buttons.length - padding;
        x = myself.tabBar.center().x - width / 2;
        buttons.forEach(function (button) {
            button.setCenter(myself.tabBar.center());
            button.setLeft(x);
            x += button.width() + padding;
        });
    };
};

MobileIdeMorph.prototype.tabTo = function (tabString) {
    this.tabBar.tabTo(tabString);
};

MobileIdeMorph.prototype.createSpriteEditor = function () {
    // assumes that the logo pane and the stage have already been created
    var scripts = this.currentSprite.scripts,
        ide = this;

    if (this.spriteEditor) {
        this.spriteEditor.destroy();
    }

    if (this.currentTab === 'sprites') {
        this.spriteEditor = this.spritesPanel;
        this.addChild(this.spriteEditor);
    } else if (this.currentTab === 'scripts') {
        scripts.isDraggable = false;
        scripts.color = this.groupColor;
        scripts.cachedTexture = this.scriptsPaneTexture;

        this.spriteEditor = new Morph();
        this.spriteEditor.color = this.groupColor;

        this.spriteEditor.scrollFrame = new ScrollFrameMorph(
            scripts,
            null,
            this.sliderColor
        );
        this.spriteEditor.scrollFrame.padding = 10;
        this.spriteEditor.scrollFrame.growth = 50;
        this.spriteEditor.scrollFrame.isDraggable = false;
        this.spriteEditor.scrollFrame.acceptsDrops = false;
        this.spriteEditor.scrollFrame.contents.acceptsDrops = true;

        scripts.scrollFrame = this.spriteEditor.scrollFrame;
        scripts.updateUndropControls();

        this.spriteEditor.add(this.spriteEditor.scrollFrame);
        this.spriteEditor.scrollFrame.scrollX(this.spriteEditor.padding);
        this.spriteEditor.scrollFrame.scrollY(this.spriteEditor.padding);


        this.spriteEditor.add(this.paletteDrawer);

        this.add(this.spriteEditor);

        this.spriteEditor.fixLayout = function () {
            ide.paletteDrawer.setTop(this.top());
            ide.paletteDrawer.setHeight(this.height());
            ide.paletteDrawer.fixLayout();

            this.scrollFrame.setPosition(ide.categories.topRight());
            this.scrollFrame.setExtent(new Point(
                this.width() - this.scrollFrame.left(),
                this.height()
            ));
        };
    } else if (this.currentTab === 'costumes') {
        this.spriteEditor = new WardrobeMorph(
            this.currentSprite,
            this.sliderColor
        );
        this.spriteEditor.color = this.groupColor;
        this.add(this.spriteEditor);
        this.spriteEditor.updateSelection();

        this.spriteEditor.acceptsDrops = false;
        this.spriteEditor.contents.acceptsDrops = false;
    } else if (this.currentTab === 'sounds') {
        this.spriteEditor = new JukeboxMorph(
            this.currentSprite,
            this.sliderColor
        );
        this.spriteEditor.color = this.groupColor;
        this.add(this.spriteEditor);
        this.spriteEditor.updateSelection();
        this.spriteEditor.acceptDrops = false;
        this.spriteEditor.contents.acceptsDrops = false;
    } else if (this.currentTab === 'stage') {
        this.spriteEditor = this.stagePanel;
        this.addChild(this.spriteEditor);
    } else {
        this.spriteEditor = new Morph();
        this.spriteEditor.color = this.groupColor;
        this.spriteEditor.acceptsDrops = true;
        this.spriteEditor.reactToDropOf = function (droppedMorph) {
            if (droppedMorph instanceof DialogBoxMorph) {
                ide.world().add(droppedMorph);
            } else if (droppedMorph instanceof SpriteMorph) {
                ide.removeSprite(droppedMorph);
            } else {
                droppedMorph.destroy();
            }
        };
        this.add(this.spriteEditor);
    }

    this.spriteEditor.show();
};

MobileIdeMorph.prototype.createSpritesPanel = function () {
    var ide = this;

    this.spritesPanel = new Morph();
    this.spritesPanel.color = this.groupColor;
    // panel is not added until needed but pretends to exist in world
    this.spritesPanel.parent = this;

    this.spritesPanel.add(this.spriteBar);
    this.spritesPanel.add(this.corralBar);
    this.spritesPanel.add(this.corral);

    this.spritesPanel.fixLayout = function (situation) {
        ide.spriteBar.setTop(this.top());
        ide.spriteBar.setWidth(this.width());
        ide.spriteBar.setHeight(59);

        ide.corralBar.setTop(ide.spriteBar.bottom() + 1);
        ide.corralBar.setWidth(this.width());

        ide.corral.setTop(ide.corralBar.bottom() + ide.padding);
        ide.corral.setWidth(this.width());
        ide.corral.setHeight(this.bottom() - ide.corral.top() - ide.padding);

        if (situation !== 'selectSprite') {
            ide.corral.fixLayout();
        }
    };
};

MobileIdeMorph.prototype.createStagePanel = function () {
    var padding = 5,
        button,
        stopButton,
        pauseButton,
        startButton,
        x,
        colors = [
            this.groupColor,
            this.frameColor.darker(50),
            this.frameColor.darker(50)
        ],
        myself = this;

    this.stagePanel = new Morph();
    this.stagePanel.color = this.groupColor;
    // panel is not added until needed but pretends to exist in world
    this.stagePanel.parent = this;

    // stopButton
    button = new ToggleButtonMorph(
        null, // colors
        this, // the IDE is the target
        'stopAllScripts',
        [
            new SymbolMorph('octagon', 14),
            new SymbolMorph('square', 14)
        ],
        function () {  // query
            return myself.stage ?
                    myself.stage.enableCustomHatBlocks &&
                        myself.stage.threads.pauseCustomHatBlocks
                        : true;
        }
    );

    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.labelMinExtent = new Point(36, 18);
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = new Color(200, 0, 0);
    button.contrast = this.buttonContrast;
    button.drawNew();
    // button.hint = 'stop\nevery-\nthing';
    button.fixLayout();
    button.refresh();
    stopButton = button;
    this.stagePanel.add(stopButton);
    this.stagePanel.stopButton = stopButton; // for refreshing

    //pauseButton
    button = new ToggleButtonMorph(
        null, //colors,
        this, // the IDE is the target
        'togglePauseResume',
        [
            new SymbolMorph('pause', 12),
            new SymbolMorph('pointRight', 14)
        ],
        function () {  // query
            return myself.isPaused();
        }
    );

    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.labelMinExtent = new Point(36, 18);
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = new Color(255, 220, 0);
    button.contrast = this.buttonContrast;
    button.drawNew();
    // button.hint = 'pause/resume\nall scripts';
    button.fixLayout();
    button.refresh();
    pauseButton = button;
    this.stagePanel.add(pauseButton);
    this.stagePanel.pauseButton = pauseButton; // for refreshing

    this.stagePanel.refreshResumeSymbol = function () {
        var pauseSymbols;
        if (Process.prototype.enableSingleStepping &&
                Process.prototype.flashTime > 0.5) {
            myself.stage.threads.pauseAll(myself.stage);
            pauseSymbols = [
                new SymbolMorph('pause', 12),
                new SymbolMorph('stepForward', 14)
            ];
        } else {
            pauseSymbols = [
                new SymbolMorph('pause', 12),
                new SymbolMorph('pointRight', 14)
            ];
        }
        pauseButton.labelString = pauseSymbols;
        pauseButton.createLabel();
        pauseButton.fixLayout();
        pauseButton.refresh();
    };
    this.stagePanel.refreshResumeSymbol();

    // startButton
    button = new PushButtonMorph(
        this,
        'pressStart',
        new SymbolMorph('flag', 14)
    );
    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.labelMinExtent = new Point(36, 18);
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = new Color(0, 200, 0);
    button.contrast = this.buttonContrast;
    button.drawNew();
    // button.hint = 'start green\nflag scripts';
    button.fixLayout();
    startButton = button;
    this.stagePanel.add(startButton);
    this.stagePanel.startButton = startButton;

    this.stagePanel.add(this.stage);

    this.stagePanel.fixLayout = function () {
        myself.stage.setScale(myself.stageRatio);
        myself.stage.setCenter(this.center());
        x = this.right() - padding;
        [stopButton, pauseButton, startButton].forEach(
            function (button) {
                button.setBottom(myself.stage.top() - padding);
                button.setRight(x);
                x -= button.width();
                x -= padding;
            }
        );
    };
};

MobileIdeMorph.prototype.refreshStopButton = function () {
    if (this.currentTab === 'stage') {
        this.spriteEditor.stopButton.refresh();
    }
};

MobileIdeMorph.prototype.refreshPauseButton = function () {
    if (this.currentTab === 'stage') {
        this.spriteEditor.pauseButton.refresh();
    }
};

// MobileIdeMorph layout

MobileIdeMorph.prototype.fixLayout = function (situation) {
    // situation is a string, i.e.
    // 'selectSprite' or 'refreshPalette' or 'tabEditor'
    var padding = this.padding;

    Morph.prototype.trackChanges = false;

    if (situation !== 'refreshPalette') {
        // controlBar
        this.controlBar.setWidth(this.right());
        this.controlBar.fixLayout();

        // tabBar
        this.tabBar.setBottom(this.bottom());
        this.tabBar.setWidth(this.right());
        this.tabBar.fixLayout();

        // spriteEditor
        this.spriteEditor.setPosition(new Point(
            this.left(),
            this.controlBar.bottom() + padding
        ));
        this.spriteEditor.setExtent(new Point(
            this.width(),
            this.tabBar.top() - this.spriteEditor.top() - padding
        ));
        if (typeof this.spriteEditor.fixLayout === 'function') {
            this.spriteEditor.fixLayout(situation);
        }
    }

    Morph.prototype.trackChanges = true;
    this.changed();
};

// MobileIdeMorph menus

MobileIdeMorph.prototype.settingsMenu = function () {
    var menu,
        stage = this.stage,
        world = this.world(),
        myself = this,
        pos = this.controlBar.settingsButton.bottomLeft(),
        shiftClicked = (world.currentKey === 16);

    function addPreference(label, toggle, test, onHint, offHint, hide) {
        var on = '\u2611 ',
            off = '\u2610 ';
        if (!hide || shiftClicked) {
            menu.addItem(
                (test ? on : off) + localize(label),
                toggle,
                test ? onHint : offHint,
                hide ? new Color(100, 0, 0) : null
            );
        }
    }

    menu = new MenuMorph(this);
    if (!SnapCloud.username) {
        menu.addItem(
            'Login...',
            'initializeCloud'
        );
        menu.addItem(
            'Signup...',
            'createCloudAccount'
        );
        menu.addItem(
            'Reset Password...',
            'resetCloudPassword'
        );
    } else {
        menu.addItem(
            localize('Logout') + ' ' + SnapCloud.username,
            'logout'
        );
        menu.addItem(
            'Change Password...',
            'changeCloudPassword'
        );
    }
    menu.addLine();
    menu.addItem('Language...', 'languageMenu');
    menu.addItem(
        'Zoom blocks...',
        'userSetBlocksScale'
    );
    menu.addItem(
        'Stage size...',
        'userSetStageSize'
    );
    menu.addLine();
    addPreference(
        'Turbo mode',
        'toggleFastTracking',
        this.stage.isFastTracked,
        'uncheck to run scripts\nat normal speed',
        'check to prioritize\nscript execution'
    );
    addPreference(
        'Visible stepping',
        'toggleSingleStepping',
        Process.prototype.enableSingleStepping,
        'uncheck to turn off\nvisible stepping',
        'check to turn on\n visible stepping (slow)',
        false
    );
    menu.addLine(); // everything below this line is stored in the project
    addPreference(
        'Thread safe scripts',
        function () {stage.isThreadSafe = !stage.isThreadSafe; },
        this.stage.isThreadSafe,
        'uncheck to allow\nscript reentrance',
        'check to disallow\nscript reentrance'
    );
    addPreference(
        'Flat line ends',
        function () {
            SpriteMorph.prototype.useFlatLineEnds =
                !SpriteMorph.prototype.useFlatLineEnds;
        },
        SpriteMorph.prototype.useFlatLineEnds,
        'uncheck for round ends of lines',
        'check for flat ends of lines'
    );
    addPreference(
        'Codification support',
        function () {
            StageMorph.prototype.enableCodeMapping =
                !StageMorph.prototype.enableCodeMapping;
            myself.currentSprite.blocksCache.variables = null;
            myself.currentSprite.paletteCache.variables = null;
            myself.refreshPalette();
        },
        StageMorph.prototype.enableCodeMapping,
        'uncheck to disable\nblock to text mapping features',
        'check for block\nto text mapping features',
        false
    );
    addPreference(
        'Inheritance support',
        function () {
            StageMorph.prototype.enableInheritance =
                !StageMorph.prototype.enableInheritance;
            myself.currentSprite.blocksCache.variables = null;
            myself.currentSprite.paletteCache.variables = null;
            myself.refreshPalette();
        },
        StageMorph.prototype.enableInheritance,
        'uncheck to disable\nsprite inheritance features',
        'check for sprite\ninheritance features',
        false
    );
    menu.addLine();
    menu.addItem(
        'More settings...',
        'moreSettingsMenu'
    );
    if (world.isDevMode) {
        menu.addLine();
        menu.addItem(
            'Switch back to user mode',
            'switchToUserMode',
            'disable deep-Morphic\ncontext menus'
                + '\nand show user-friendly ones',
            new Color(0, 100, 0)
        );
    } else if (shiftClicked) { // shift-click
        menu.addLine();
        menu.addItem(
            'Switch to dev mode',
            'switchToDevMode',
            'enable Morphic\ncontext menus\nand inspectors,'
                + '\nnot user-friendly!',
            new Color(100, 0, 0)
        );
    }
    menu.popup(world, pos);
};

MobileIdeMorph.prototype.moreSettingsMenu = function () {
    var menu,
        stage = this.stage,
        world = this.world(),
        myself = this,
        pos = this.controlBar.settingsButton.bottomLeft(),
        shiftClicked = (world.currentKey === 16);

    function addPreference(label, toggle, test, onHint, offHint, hide) {
        var on = '\u2611 ',
            off = '\u2610 ';
        if (!hide || shiftClicked) {
            menu.addItem(
                (test ? on : off) + localize(label),
                toggle,
                test ? onHint : offHint,
                hide ? new Color(100, 0, 0) : null
            );
        }
    }

    menu = new MenuMorph(this);
    if (shiftClicked) {
        menu.addItem(
            'Dragging threshold...',
            'userSetDragThreshold',
            'specify the distance the hand has to move\n' +
                'before it picks up an object',
            new Color(100, 0, 0)
        );
        menu.addLine();
    }
    /*
    addPreference(
        'JavaScript',
        function () {
            Process.prototype.enableJS = !Process.prototype.enableJS;
            myself.currentSprite.blocksCache.operators = null;
            myself.currentSprite.paletteCache.operators = null;
            myself.refreshPalette();
        },
        Process.prototype.enableJS,
        'uncheck to disable support for\nnative JavaScript functions',
        'check to support\nnative JavaScript functions'
    );
    */
    if (isRetinaSupported()) {
        addPreference(
            'Retina display support',
            'toggleRetina',
            isRetinaEnabled(),
            'uncheck for lower resolution,\nsaves computing resources',
            'check for higher resolution,\nuses more computing resources'
        );
    }
    addPreference(
        'Blurred shadows',
        'toggleBlurredShadows',
        useBlurredShadows,
        'uncheck to use solid drop\nshadows and highlights',
        'check to use blurred drop\nshadows and highlights',
        true
    );
    addPreference(
        'Zebra coloring',
        'toggleZebraColoring',
        BlockMorph.prototype.zebraContrast,
        'uncheck to disable alternating\ncolors for nested block',
        'check to enable alternating\ncolors for nested blocks',
        true
    );
    addPreference(
        'Dynamic input labels',
        'toggleDynamicInputLabels',
        SyntaxElementMorph.prototype.dynamicInputLabels,
        'uncheck to disable dynamic\nlabels for variadic inputs',
        'check to enable dynamic\nlabels for variadic inputs',
        true
    );
    addPreference(
        'Prefer empty slot drops',
        'togglePreferEmptySlotDrops',
        ScriptsMorph.prototype.isPreferringEmptySlots,
        'uncheck to allow dropped\nreporters to kick out others',
        'settings menu prefer empty slots hint',
        true
    );
    addPreference(
        'Long form input dialog',
        'toggleLongFormInputDialog',
        InputSlotDialogMorph.prototype.isLaunchingExpanded,
        'uncheck to use the input\ndialog in short form',
        'check to always show slot\ntypes in the input dialog'
    );
    addPreference(
        'Plain prototype labels',
        'togglePlainPrototypeLabels',
        BlockLabelPlaceHolderMorph.prototype.plainLabel,
        'uncheck to always show (+) symbols\nin block prototype labels',
        'check to hide (+) symbols\nin block prototype labels'
    );
    addPreference(
        'Virtual keyboard',
        'toggleVirtualKeyboard',
        MorphicPreferences.useVirtualKeyboard,
        'uncheck to disable\nvirtual keyboard support\nfor mobile devices',
        'check to enable\nvirtual keyboard support\nfor mobile devices',
        true
    );
    addPreference(
        'Input sliders',
        'toggleInputSliders',
        MorphicPreferences.useSliderForInput,
        'uncheck to disable\ninput sliders for\nentry fields',
        'check to enable\ninput sliders for\nentry fields'
    );
    if (MorphicPreferences.useSliderForInput) {
        addPreference(
            'Execute on slider change',
            'toggleSliderExecute',
            ArgMorph.prototype.executeOnSliderEdit,
            'uncheck to suppress\nrunning scripts\nwhen moving the slider',
            'check to run\nthe edited script\nwhen moving the slider'
        );
    }
    addPreference(
        'Clicking sound',
        function () {
            BlockMorph.prototype.toggleSnapSound();
            if (BlockMorph.prototype.snapSound) {
                myself.saveSetting('click', true);
            } else {
                myself.removeSetting('click');
            }
        },
        BlockMorph.prototype.snapSound,
        'uncheck to turn\nblock clicking\nsound off',
        'check to turn\nblock clicking\nsound on'
    );
    addPreference(
        'Animations',
        function () {myself.isAnimating = !myself.isAnimating; },
        myself.isAnimating,
        'uncheck to disable\nIDE animations',
        'check to enable\nIDE animations',
        true
    );
    addPreference(
        'Cache Inputs',
        function () {
            BlockMorph.prototype.isCachingInputs =
                !BlockMorph.prototype.isCachingInputs;
        },
        BlockMorph.prototype.isCachingInputs,
        'uncheck to stop caching\ninputs (for debugging the evaluator)',
        'check to cache inputs\nboosts recursion',
        true
    );
    addPreference(
        'Rasterize SVGs',
        function () {
            MorphicPreferences.rasterizeSVGs =
                !MorphicPreferences.rasterizeSVGs;
        },
        MorphicPreferences.rasterizeSVGs,
        'uncheck for smooth\nscaling of vector costumes',
        'check to rasterize\nSVGs on import',
        true
    );
    addPreference(
        'Flat design',
        function () {
            if (MorphicPreferences.isFlat) {
                return myself.defaultDesign();
            }
            myself.flatDesign();
        },
        MorphicPreferences.isFlat,
        'uncheck for default\nGUI design',
        'check for alternative\nGUI design',
        false
    );
    addPreference(
        'Nested auto-wrapping',
        function () {
            ScriptsMorph.prototype.enableNestedAutoWrapping =
                !ScriptsMorph.prototype.enableNestedAutoWrapping;
            if (ScriptsMorph.prototype.enableNestedAutoWrapping) {
                myself.removeSetting('autowrapping');
            } else {
                myself.saveSetting('autowrapping', false);
            }
        },
        ScriptsMorph.prototype.enableNestedAutoWrapping,
        'uncheck to confine auto-wrapping\nto top-level block stacks',
        'check to enable auto-wrapping\ninside nested block stacks',
        false
    );
    addPreference(
        'Project URLs',
        function () {
            myself.projectsInURLs = !myself.projectsInURLs;
            if (myself.projectsInURLs) {
                myself.saveSetting('longurls', true);
            } else {
                myself.removeSetting('longurls');
            }
        },
        myself.projectsInURLs,
        'uncheck to disable\nproject data in URLs',
        'check to enable\nproject data in URLs',
        true
    );
    addPreference(
        'Sprite Nesting',
        function () {
            SpriteMorph.prototype.enableNesting =
                !SpriteMorph.prototype.enableNesting;
        },
        SpriteMorph.prototype.enableNesting,
        'uncheck to disable\nsprite composition',
        'check to enable\nsprite composition',
        true
    );
    addPreference(
        'First-Class Sprites',
        function () {
            SpriteMorph.prototype.enableFirstClass =
                !SpriteMorph.prototype.enableFirstClass;
            myself.currentSprite.blocksCache.sensing = null;
            myself.currentSprite.paletteCache.sensing = null;
            myself.refreshPalette();
        },
        SpriteMorph.prototype.enableFirstClass,
        'uncheck to disable support\nfor first-class sprites',
        'check to enable support\n for first-class sprite',
        true
    );
    addPreference(
        'Keyboard Editing',
        function () {
            ScriptsMorph.prototype.enableKeyboard =
                !ScriptsMorph.prototype.enableKeyboard;
            if (ScriptsMorph.prototype.enableKeyboard) {
                myself.removeSetting('keyboard');
            } else {
                myself.saveSetting('keyboard', false);
            }
        },
        ScriptsMorph.prototype.enableKeyboard,
        'uncheck to disable\nkeyboard editing support',
        'check to enable\nkeyboard editing support',
        false
    );
    addPreference(
        'Table support',
        function () {
            List.prototype.enableTables =
                !List.prototype.enableTables;
            if (List.prototype.enableTables) {
                myself.removeSetting('tables');
            } else {
                myself.saveSetting('tables', false);
            }
        },
        List.prototype.enableTables,
        'uncheck to disable\nmulti-column list views',
        'check for multi-column\nlist view support',
        false
    );
    if (List.prototype.enableTables) {
        addPreference(
            'Table lines',
            function () {
                TableMorph.prototype.highContrast =
                    !TableMorph.prototype.highContrast;
                if (TableMorph.prototype.highContrast) {
                    myself.saveSetting('tableLines', true);
                } else {
                    myself.removeSetting('tableLines');
                }
            },
            TableMorph.prototype.highContrast,
            'uncheck for less contrast\nmulti-column list views',
            'check for higher contrast\ntable views',
            false
        );
    }
    addPreference(
        'Live coding support',
        function () {
            Process.prototype.enableLiveCoding =
                !Process.prototype.enableLiveCoding;
        },
        Process.prototype.enableLiveCoding,
        'EXPERIMENTAL! uncheck to disable live\ncustom control structures',
        'EXPERIMENTAL! check to enable\n live custom control structures',
        true
    );
    if (shiftClicked) {
        menu.addLine(); // everything below this line is stored in the project
        addPreference(
            'Prefer smooth animations',
            'toggleVariableFrameRate',
            StageMorph.prototype.frameRate,
            'uncheck for greater speed\nat variable frame rates',
            'check for smooth, predictable\nanimations across computers',
            true
        );
        addPreference(
            'Persist linked sublist IDs',
            function () {
                StageMorph.prototype.enableSublistIDs =
                    !StageMorph.prototype.enableSublistIDs;
            },
            StageMorph.prototype.enableSublistIDs,
            'uncheck to disable\nsaving linked sublist identities',
            'check to enable\nsaving linked sublist identities',
            true
        );
    }
    menu.popup(world, pos);
};

MobileIdeMorph.prototype.createCategories = function () {
    var myself = this,
        size = 40;

    if (this.categories) {
        this.categories.destroy();
    }
    this.categories = new Morph();
    this.categories.color = this.frameColor;
    this.categories.silentSetWidth(size);

    function addCategoryButton(category) {
        var color = SpriteMorph.prototype.blockColor[category],
            colors = [color, color, color],
            button;

        button = new ToggleButtonMorph(
            colors,
            myself, // the IDE is the target
            function () {
                myself.currentCategory = category;
                myself.categories.children.forEach(function (each) {
                    each.refresh();
                });
                myself.refreshPalette(true);
                myself.paletteDrawer.setOpen(true);
            },
            null, // label
            function () {  // query
                return myself.currentCategory === category;
            }
        );

        button.corner = 8;
        button.setExtent(new Point(size, size));
        button.refresh();
        myself.categories.add(button);
        return button;
    }

    function fixCategoriesLayout() {
        var y = 0;
        myself.categories.children.forEach(function (button) {
            button.setPosition(new Point(0, y));
            y += button.height();
        });
    }

    SpriteMorph.prototype.categories.forEach(function (cat) {
        if (!contains(['lists', 'other'], cat)) {
            addCategoryButton(cat);
        }
    });
    fixCategoriesLayout();
};

MobileIdeMorph.prototype.createPalette = function () {
    MobileIdeMorph.uber.createPalette.call(this);
    if (this.paletteDrawer) {
        this.paletteDrawer.add(this.palette);
        this.paletteDrawer.fixLayout();
    }
};

MobileIdeMorph.prototype.createPaletteDrawer = function () {
    var ide = this;

    this.paletteDrawer = new Morph();
    this.paletteDrawer.color = this.groupColor;
    this.paletteDrawer.acceptsDrops = true;
    this.paletteDrawer.add(this.palette);
    this.paletteDrawer.add(this.categories);

    this.paletteDrawer.isOpen = false;

    this.paletteDrawer.fixLayout = function () {
        this.setWidth(ide.palette.width() + ide.categories.width());
        this.setOpen(this.isOpen);
        ide.palette.setPosition(this.position());
        ide.palette.setHeight(this.height());
        ide.categories.setTop(this.top());
        ide.categories.setRight(this.right());
        ide.categories.setHeight(this.height());
    };

    this.paletteDrawer.setOpen = function (flag) {
        var x = flag ? ide.left() : ide.left() - ide.palette.width();
        if (this.isOpen === flag) {
            this.setLeft(x);
        } else {
            this.glideTo(new Point(x, this.top()), 100);
        }
        this.isOpen = flag;
    };

    this.paletteDrawer.mouseClickLeft = function () {
        this.setOpen(true);
    };

    this.paletteDrawer.reactToDropOf = function (droppedMorph, hand) {
        if (droppedMorph instanceof DialogBoxMorph) {
            myself.world().add(droppedMorph);
        } else if (droppedMorph instanceof SpriteMorph) {
            myself.removeSprite(droppedMorph);
        } else if (droppedMorph instanceof SpriteIconMorph) {
            droppedMorph.destroy();
            myself.removeSprite(droppedMorph.object);
        } else if (droppedMorph instanceof CostumeIconMorph) {
            myself.currentSprite.wearCostume(null);
            droppedMorph.perish();
        } else if (droppedMorph instanceof BlockMorph) {
            if (hand && hand.grabOrigin.origin instanceof ScriptsMorph) {
                hand.grabOrigin.origin.clearDropInfo();
                hand.grabOrigin.origin.lastDroppedBlock = droppedMorph;
                hand.grabOrigin.origin.recordDrop(hand.grabOrigin);
            }
            droppedMorph.perish();
        } else {
            droppedMorph.perish();
        }
    };
};

MobileIdeMorph.prototype.createSpriteBar = function () {
    // assumes that the categories pane has already been created
    var rotationStyleButtons = [],
        thumbSize = new Point(45, 45),
        nameField,
        padlock,
        thumbnail,
        tabColors = this.tabColors,
        symbols = ['\u2192', '\u21BB', '\u2194'],
        labels = ['don\'t rotate', 'can rotate', 'only face left/right'],
        myself = this;

    if (this.spriteBar) {
        this.spriteBar.destroy();
    }

    this.spriteBar = new Morph();
    this.spriteBar.color = this.frameColor;

    function addRotationStyleButton(rotationStyle) {
        var colors = myself.rotationStyleColors,
            button;

        button = new ToggleButtonMorph(
            colors,
            myself, // the IDE is the target
            function () {
                if (myself.currentSprite instanceof SpriteMorph) {
                    myself.currentSprite.rotationStyle = rotationStyle;
                    myself.currentSprite.changed();
                    myself.currentSprite.drawNew();
                    myself.currentSprite.changed();
                }
                rotationStyleButtons.forEach(function (each) {
                    each.refresh();
                });
            },
            symbols[rotationStyle], // label
            function () {  // query
                return myself.currentSprite instanceof SpriteMorph
                    && myself.currentSprite.rotationStyle === rotationStyle;
            },
            null, // environment
            localize(labels[rotationStyle])
        );

        button.corner = 8;
        button.labelMinExtent = new Point(11, 11);
        button.padding = 0;
        button.labelShadowOffset = new Point(-1, -1);
        button.labelShadowColor = colors[1];
        button.labelColor = myself.buttonLabelColor;
        button.fixLayout();
        button.refresh();
        rotationStyleButtons.push(button);
        button.setPosition(myself.spriteBar.position().add(2));
        button.setTop(button.top()
            + ((rotationStyleButtons.length - 1) * (button.height() + 2))
            );
        myself.spriteBar.add(button);
        if (myself.currentSprite instanceof StageMorph) {
            button.hide();
        }
        return button;
    }

    addRotationStyleButton(1);
    addRotationStyleButton(2);
    addRotationStyleButton(0);
    this.rotationStyleButtons = rotationStyleButtons;

    thumbnail = new Morph();
    thumbnail.setExtent(thumbSize);
    thumbnail.image = this.currentSprite.thumbnail(thumbSize);
    thumbnail.setPosition(
        rotationStyleButtons[0].topRight().add(new Point(5, 3))
    );
    this.spriteBar.add(thumbnail);

    thumbnail.fps = 3;

    thumbnail.step = function () {
        if (thumbnail.version !== myself.currentSprite.version) {
            thumbnail.image = myself.currentSprite.thumbnail(thumbSize);
            thumbnail.changed();
            thumbnail.version = myself.currentSprite.version;
        }
    };

    nameField = new InputFieldMorph(this.currentSprite.name);
    nameField.setWidth(100); // fixed dimensions
    nameField.contrast = 90;
    nameField.setPosition(thumbnail.topRight().add(new Point(10, 3)));
    this.spriteBar.add(nameField);
    nameField.drawNew();
    nameField.accept = function () {
        var newName = nameField.getValue();
        myself.currentSprite.setName(
            myself.newSpriteName(newName, myself.currentSprite)
        );
        nameField.setContents(myself.currentSprite.name);
    };
    this.spriteBar.reactToEdit = nameField.accept;

    // padlock
    padlock = new ToggleMorph(
        'checkbox',
        null,
        function () {
            myself.currentSprite.isDraggable =
                !myself.currentSprite.isDraggable;
        },
        localize('draggable'),
        function () {
            return myself.currentSprite.isDraggable;
        }
    );
    padlock.label.isBold = false;
    padlock.label.setColor(this.buttonLabelColor);
    padlock.color = tabColors[2];
    padlock.highlightColor = tabColors[0];
    padlock.pressColor = tabColors[1];

    padlock.tick.shadowOffset = MorphicPreferences.isFlat ?
            new Point() : new Point(-1, -1);
    padlock.tick.shadowColor = new Color(); // black
    padlock.tick.color = this.buttonLabelColor;
    padlock.tick.isBold = false;
    padlock.tick.drawNew();

    padlock.setPosition(nameField.bottomLeft().add(2));
    padlock.drawNew();
    this.spriteBar.add(padlock);
    if (this.currentSprite instanceof StageMorph) {
        padlock.hide();
    }
};

MobileIdeMorph.prototype.createCorral = function (forSubMorph) {
    // assumes the corral bar has already been created
    var frame, template, padding = 5, myself = this;

    if (this.corral) {
        this.corral.destroy();
    }

    this.corral = new Morph();
    this.corral.color = this.groupColor;

    this.corral.stageIcon = new SpriteIconMorph(this.stage);
    this.corral.stageIcon.isDraggable = false;
    this.corral.add(this.corral.stageIcon);

    frame = new ScrollFrameMorph(null, null, this.sliderColor);
    frame.acceptsDrops = false;
    frame.contents.acceptsDrops = false;

    frame.contents.wantsDropOf = function (morph) {
        return morph instanceof SpriteIconMorph;
    };

    frame.contents.reactToDropOf = function (spriteIcon) {
        myself.corral.reactToDropOf(spriteIcon);
    };

    frame.alpha = 0;

    this.sprites.asArray().forEach(function (morph) {
        if (!morph.isClone) {
            template = new SpriteIconMorph(morph, template);
            frame.contents.add(template);
        }
    });

    this.corral.frame = frame;
    this.corral.add(frame);

    this.corral.fixLayout = function () {
        this.stageIcon.setTop(this.top());
        this.stageIcon.setLeft(this.left() + padding);
        this.frame.setLeft(this.stageIcon.right() + padding);
        this.frame.setExtent(new Point(
            this.right() - this.frame.left(),
            this.height()
        ));
        this.arrangeIcons();
        this.refresh();
    };

    this.corral.arrangeIcons = function () {
        var x = this.frame.left(),
            y = this.frame.top(),
            max = this.frame.right(),
            start = this.frame.left();

        this.frame.contents.children.forEach(function (icon) {
            var w = icon.width();

            if (x + w > max) {
                x = start;
                y += icon.height(); // they're all the same
            }
            icon.setPosition(new Point(x, y));
            x += w;
        });
        this.frame.contents.adjustBounds();
    };

    this.corral.addSprite = function (sprite) {
        this.frame.contents.add(new SpriteIconMorph(sprite));
        this.fixLayout();
    };

    this.corral.refresh = function () {
        this.stageIcon.refresh();
        this.frame.contents.children.forEach(function (icon) {
            icon.refresh();
        });
    };

    this.corral.wantsDropOf = function (morph) {
        return morph instanceof SpriteIconMorph;
    };

    this.corral.reactToDropOf = function (spriteIcon) {
        var idx = 1,
            pos = spriteIcon.position();
        spriteIcon.destroy();
        this.frame.contents.children.forEach(function (icon) {
            if (pos.gt(icon.position()) || pos.y > icon.bottom()) {
                idx += 1;
            }
        });
        myself.sprites.add(spriteIcon.object, idx);
        myself.createCorral();
        myself.fixLayout();
    };
};


// MobileIdeMorph resizing

MobileIdeMorph.prototype.setExtent = function (point) {
    // adjust stage ratio if necessary
    this.stageRatio = point.x / this.stage.dimensions.x;

    // apply
    IDE_Morph.uber.setExtent.call(this, point);
    this.fixLayout();
};

MobileIdeMorph.prototype.toggleAppMode = function (appMode) {
    var world = this.world(),
        elements = [
            this.controlBar.settingsButton,
            this.controlBar.projectButton,
            this.corral,
            this.corralBar,
            this.spriteEditor,
            this.spriteBar,
            this.palette,
            this.categories
        ];

    this.isAppMode = isNil(appMode) ? !this.isAppMode : appMode;

    Morph.prototype.trackChanges = false;
    if (this.isAppMode) {
        this.setColor(this.appModeColor);
        this.controlBar.setColor(this.color);
        this.controlBar.appModeButton.refresh();
        elements.forEach(function (e) {
            e.hide();
        });
        world.children.forEach(function (morph) {
            if (morph instanceof DialogBoxMorph) {
                morph.hide();
            }
        });
        if (world.keyboardReceiver instanceof ScriptFocusMorph) {
            world.keyboardReceiver.stopEditing();
        }
    } else {
        this.setColor(this.backgroundColor);
        this.controlBar.setColor(this.frameColor);
        elements.forEach(function (e) {
            e.show();
        });
        this.stage.setScale(1);
        // show all hidden dialogs
        world.children.forEach(function (morph) {
            if (morph instanceof DialogBoxMorph) {
                morph.show();
            }
        });
        // prevent scrollbars from showing when morph appears
        world.allChildren().filter(function (c) {
            return c instanceof ScrollFrameMorph;
        }).forEach(function (s) {
            s.adjustScrollBars();
        });
        // prevent rotation and draggability controls from
        // showing for the stage
        if (this.currentSprite === this.stage) {
            this.spriteBar.children.forEach(function (child) {
                if (child instanceof PushButtonMorph) {
                    child.hide();
                }
            });
        }
        // update undrop controls
        this.currentSprite.scripts.updateUndropControls();
    }
    this.setExtent(this.world().extent()); // resume trackChanges
};

/* ScriptsMorph */

ScriptsMorph.prototype.mouseClickLeft = function () {
    var ide = this.parentThatIsA(MobileIdeMorph);
    if (ide && ide.paletteDrawer) {
        ide.paletteDrawer.setOpen(false);
    }
};

/* BlockMorph */

BlockMorph.prototype.reactToTemplateCopied = function () {
    var ide = this.parentThatIsA(MobileIdeMorph);
    if (ide && ide.paletteDrawer) {
        ide.paletteDrawer.setOpen(false);
    }
};

