

/**
 *@author Jussi Parviainen
 *@created 28.02.2021
 * Scene, joka esittää oman ikkunan käärmeen kuoleman jälkeen, jossa esitetään edellisen kierroksen pisteet ja voi aloittaa uuden pelin.
 * Käytännössä sama kuin päävalikko, mutta tehtävänannon mukainen scene kuolemalle, jossa pitää esittää edellisen kierroksen pisteet ja mahdollistaa uudelleen pelaaminen.
 * (Päävalikossa käydään pelin aikana vain kerran, kun pelaaja ei ole vielä pelannut kertaakaan ja tämä toimii sen jälkeen ns. päävalikkona, johon palataan aina kuoleman jälkeen).
 */
class DeathScreen extends Phaser.Scene {
	
	
	/**
	 * Scene -olion muodostaja
	 */
	constructor() {
		super({key:"DeathScreen"});
	}

	
	/**
	 * Kutsutaan scenen käynnistyessä:
	 */
	create() {
		
		// Disabloidaan hiiren oikean painikkeen klikkauksella avattava menu:
		this.input.mouse.disableContextMenu();
		
		// Kuolemaruudun grafiikan ja painikkeiden esittäminen:
		this.initMenu();
	}
	
	
	/**
	 * Initialisoi kuoleman jälkeen esitettävän ruudun, piirtää grafiikat, lisää painikkeen pelaamiselle jne...
	 * Käytännössä sama kuin päävalikko, mutta esittää edellisen kierroksen pisteet. Tehty vain demon tehtävänannon pohjalta ja
	 * oikeasti pärjäisi pelkällä päävalikolla, jos sinne lisäisi pisteiden esittämisen.
	 */
	initMenu() {
		
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
		
		// Teksti parhaalle Scorelle:
		style = { font: (0.3 * 0.5 * (this.game.canvas.height - levelPixelHeight)) + "px Arial", fill: "#FFD700", wordWrap: false, boundsAlignH: "center", boundsAlignV: "middle" };
		this.bestScoreTxt = this.add.text(this.levelAnchorX, this.game.canvas.height - (0.5 * 0.5 * (this.game.canvas.height - levelPixelHeight)), "BEST: " + LEVEL1_BEST_SCORE, style);
		this.bestScoreTxt.setOrigin(0, 0.5);
		
		// Teksti edelliselle Scorelle:
		style = { font: (0.05 * levelPixelHeight) + "px Arial", fill: "#ffffff", wordWrap: false, boundsAlignH: "center", boundsAlignV: "middle" };
		this.lastScoreTxt = this.add.text(0.5 * this.game.canvas.width, this.levelAnchorY + 0.02 * levelPixelHeight, "LAST SCORE: " + LEVEL1_LAST_SCORE, style);
		this.lastScoreTxt.setOrigin(0.5, 0);
		
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
	
	
	/**
	 * Avaa päävalikon
	 */
	openMainMenu() {
		this.scene.start("MainMenu");
	}
}