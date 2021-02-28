

/**
 *@author Jussi Parviainen
 *@created 27.02.2021
 * Pelin "päävalikko" -scene, jossa käydään vain kerran pelin käynnistyessa. Ensimmäisen pelin jälkeen ns. päävalikkona toimii DeathScreen -scene ja päävalikkoon ei ole tarvetta palata enää sen jälkeen.
 * MainMenu ja DeathScreen ovat käytännössä samat scenet --> ainoa ero on, että DeathScreen esittää edellisen kierroksen pisteet ja parhaat pisteet.
 * (Päävalikko ei esitä pisteitä, mutta graafinen tyyli ja toiminnallisuudet ovat muuten täsmälleen samat kuin DeathScreen -scenessä)
 */
class MainMenu extends Phaser.Scene {
	
	
	/**
	 * Scene -olion muodostaja
	 */
	constructor() {
		super({key:"MainMenu"});
	}

	
	/**
	 * Kutsutaan scenen käynnistyessä:
	 */
	create() {
		
		// Disabloidaan hiiren oikean painikkeen klikkauksella avattava menu:
		this.input.mouse.disableContextMenu();
		
		// Päävalikon grafiikan ja painikkeiden esittäminen:
		this.initMainMenu();
	}
	
	
	/**
	 * Initialisoi Päävalikon, piirtää grafiikat, lisää painikkeen pelaamiselle jne...
	 */
	initMainMenu() {
		
		// Levelin koko Grideinä:
		this.gridCountX = 51;
		this.gridCountY = 25;
		
		// Padding, jota hyödynnetään levelin rajojen määrittämiseen, sekä jätetään tilaa teksteille.
		var levelWidthRatio = 0.8;
		var levelHeightRatio = 0.8;
		
		// Lasketaan mahdolliset grien koot leveyden sekä korkeuden perusteella:
		var gridSizeBasedOnWidth = Math.floor(levelWidthRatio * this.game.canvas.width / this.gridCountX);
		var gridSizeBasedOnHeight = Math.floor(levelWidthRatio * this.game.canvas.height / this.gridCountY);
			
		// Käytettävän grid koon asettaminen (valitaan pienempi aikaisemmin laskettu koko)
		if (gridSizeBasedOnWidth > gridSizeBasedOnHeight) this.gridSize = gridSizeBasedOnHeight;
		else this.gridSize = gridSizeBasedOnWidth;
		
		// Lasketaan levelin todellien koko:
		this.gridSize;
		var levelPixelWidth = this.gridSize * this.gridCountX;
		var levelPixelHeight = this.gridSize * this.gridCountY;
		
		// Lasketaan ankkuripiste, joka osoittaa gridin vasemman yläkulman sijainnin kanvasilla:
		this.levelAnchorX = Math.floor(0.5 * (this.game.canvas.width - levelPixelWidth))
		this.levelAnchorY = Math.floor(0.5 * (this.game.canvas.height - levelPixelHeight));
		
		// Piirretään levelin rajat: (lisätään yksipikseli extraa jokaiseen nurkkaan)
		this.borderGraphics = this.add.graphics();
		this.borderGraphics.lineStyle(1, 0xffffff);
		this.borderGraphics.beginPath();
		var offset = 0;
		this.borderGraphics.moveTo(this.levelAnchorX - offset, this.levelAnchorY - offset);
		this.borderGraphics.lineTo(this.levelAnchorX + levelPixelWidth + offset, this.levelAnchorY - offset);
		this.borderGraphics.lineTo(this.levelAnchorX + levelPixelWidth + offset, this.levelAnchorY + levelPixelHeight + offset);
		this.borderGraphics.lineTo(this.levelAnchorX - offset, this.levelAnchorY + levelPixelHeight + offset);
		this.borderGraphics.closePath();
		this.borderGraphics.strokePath();
		
		// Teksti Otsikolle
		var style = { font: (0.6 * 0.5 * (this.game.canvas.height - levelPixelHeight)) + "px Arial", fill: "#ffffff", wordWrap: false, boundsAlignH: "center", boundsAlignV: "middle" };		
		this.titleTxt = this.add.text(0.5 * this.game.canvas.width, 0.5 * 0.5 * (this.game.canvas.height - levelPixelHeight), "GLITCHY SNAKE", style);
		this.titleTxt.setOrigin(0.5, 0.5);
		
		/*
		* Piilotettu, koska tehtävänannossa määrätty DeathScreen -scene toimii ensimmäisen pelikerran jälkeen ns. päävalikkona ja virallisessa päävalikossa käydään pelkästään kerran pelin käynnistyessä.
		// Teksti parhaalle Scorelle:
		style = { font: (0.3 * 0.5 * (this.game.canvas.height - levelPixelHeight)) + "px Arial", fill: "#FFD700", wordWrap: false, boundsAlignH: "center", boundsAlignV: "middle" };
		this.bestScoreTxt = this.add.text(this.levelAnchorX, this.game.canvas.height - (0.5 * 0.5 * (this.game.canvas.height - levelPixelHeight)), "BEST: " + LEVEL1_BEST_SCORE, style);
		this.bestScoreTxt.setOrigin(0, 0.5);
		*/
		
		// Painike, jolla pääsee peliin:
		this.playBtn = this.add.sprite(0.5 * this.game.canvas.width, 0.5 * this.game.canvas.height, 'rectangle').setInteractive();
		this.playBtn.setOrigin(0.5, 0.5);
		this.playBtn.displayWidth = 0.3 * levelPixelWidth;
		this.playBtn.displayHeight = 0.3 * levelPixelHeight;
		this.playBtn.tint = 0x808080;	
		this.playBtn.on('pointerdown', function (pointer) {
			this.scene.startGame();
		});

		this.playBtn.on('pointerover', function (pointer) {
			this.tint = 0xffffff;
		});
		
		this.playBtn.on('pointerout', function (pointer) {
			this.tint = 0x808080;
		});
		
		// Lisätään teksti Play Buttoniin:
		style = { font: (0.5 * 0.3 * levelPixelHeight) + "px Arial", fill: "#000000", wordWrap: false, boundsAlignH: "center", boundsAlignV: "middle" };
		this.playBtnTxt = this.add.text(0.5 * this.game.canvas.width, 0.5 * this.game.canvas.height, "PLAY", style);
		this.playBtnTxt.setOrigin(0.5, 0.5);
	}
	
	
	/**
	 * Aloittaa uuden pelin kutsusta
	 */
	startGame() {
		this.scene.start("Level1");
	}
}