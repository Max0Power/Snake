/**
 *@author Jussi Parviainen
 *@created 23.02.2021
 * Level1 Scene --> itse demon peliscene.
 * Vastaa esim. levelin rakentamisesta (grafiikka, asetukset ), käärmeen spawnaamisesta + scenen vaihdosta DeathScreen -sceneen käärmeen kuollessa.
 */

// Scoren ylläpidon -muuttujat:
var LEVEL1_BEST_SCORE = 0;
var LEVEL1_LAST_SCORE = 0;

class Level1 extends Phaser.Scene {
	
	/**
	 * Scene -olion muodostaja
	 */
	constructor() {
		super({key:"Level1"});
	}

	
	/**
	 * Kutsutaan scenen käynnistyessä:
	 */
	create() {
		
		// Disabloidaan hiiren oikean painikkeen klikkauksella avattava menu:
		this.input.mouse.disableContextMenu();
		
		// Parametrit scenen vaihdokseen pelin loppuessa
		this.levelChangeDuration = 4.0; // aika, joka odotetaan pelin loppuessa
		this.levelChangeTimer = this.levelChangeDuration; // timeri, jota vähennetään pelin loppuessa
		
		// Levelin rajojen piirto ja tekstien asetus:
		this.initLevel();
		
		// Käärmeen spawnaaminen:
		this.snake = new Snake(this, this.gridCountX, this.gridCountY, this.levelAnchorX, this.levelAnchorY, this.gridSize);
	}

	
	/**
	 * Updatessa huolehditaan käärmeen update metodin kutsusta, sekä scenen pisteiden esittämisestä + scenen vaihdoksesta pelin loppuessa
	 */
	update(time, delta) {
		
		// Käärmeen päivitys:
		this.snake.update(delta/1000);
		
		if (this.snake.getScore() > LEVEL1_BEST_SCORE) {
			LEVEL1_BEST_SCORE = this.snake.getScore();
			this.bestScoreTxt.text = "BEST: " + LEVEL1_BEST_SCORE;
		}
		
		LEVEL1_LAST_SCORE = this.snake.getScore();
		
		this.scoreTxt.text = this.snake.getScore();
		
		if (!this.snake.getIsAlive()) {
			this.levelChangeTimer -= (delta / 1000);
			
			if (this.levelChangeTimer <= 0) {
				this.openDeathScreen();
			}
		}
		
	}
	
	
	initLevel() {
		
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
		
		// Teksti Scorelle:
		var style = { font: (0.6 * 0.5 * (this.game.canvas.height - levelPixelHeight)) + "px Arial", fill: "#ffffff", wordWrap: false, boundsAlignH: "center", boundsAlignV: "middle" };		
		this.scoreTxt = this.add.text(0.5 * this.game.canvas.width, 0.5 * 0.5 * (this.game.canvas.height - levelPixelHeight), "0", style);
		this.scoreTxt.setOrigin(0.5, 0.5);
		
		// Teksti parhaalle Scorelle:
		style = { font: (0.3 * 0.5 * (this.game.canvas.height - levelPixelHeight)) + "px Arial", fill: "#FFD700", wordWrap: false, boundsAlignH: "center", boundsAlignV: "middle" };
		this.bestScoreTxt = this.add.text(this.levelAnchorX, this.game.canvas.height - (0.5 * 0.5 * (this.game.canvas.height - levelPixelHeight)), "BEST: " + LEVEL1_BEST_SCORE, style);
		this.bestScoreTxt.setOrigin(0, 0.5);
	}
	
	
	openDeathScreen() {
		this.scene.start("DeathScreen");
	}
}