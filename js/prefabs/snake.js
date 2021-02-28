
/**
 *@author Jussi Parviainen
 *@created 27.02.2021
 * Käärmeen luokka, joka vastaa käytännössä kokonaan Snake -pelin logiikasta.
 */
class Snake extends Phaser.GameObjects.Group {
	
	/**
	 * Snake -olin muodostus:
	 * @param scene: Scene, johon käärme luodaan
	 * @param gridCountX: levelin gridin koon leveys ("ruudut"), jossa käärme voi liikkua horisontaalisesti. (Määrätään scenessä, joka lisää käärmeen)
	 * @param gridCountY: levelin gridin koon korkeus ("ruudut"), jossa käärme voi liikkua vertikaalisesti. (Määrätään scenessä, joka lisää käärmeen)
	 * @param levelAnchorX: Gridin ankkuripiste X scenessä = vasen ylä kulma. Annetaan pikselin koordinaattina.
	 * @param levelAnchorY: Gridin ankkuripiste Y scenessä = vasen ylä kulma. Annetaan pikselin koordinaattina.
	 * @param gridSize: Gridin koko pikseleinä (eli gridissä olevan ruudun koko)
	 */
	constructor(scene, gridCountX, gridCountY, levelAnchorX, levelAnchorY, gridSize) {
		super(scene);
		
		// Otetaan levelin tiedot talteen, jota käytetään sijaintien laskemisessa:
		this.gridCountX = gridCountX;
		this.gridCountY = gridCountY;
		this.levelAnchorX = levelAnchorX;
		this.levelAnchorY = levelAnchorY;
		this.gridSize = gridSize;
		
		// Nykyinen Score:
		this.score = 0;
		
		// INPUTIN MÄÄRITTELY: ------------
		this.keyA = scene.input.keyboard.addKey('A');
		this.keyD = scene.input.keyboard.addKey('D');
		this.keyW = scene.input.keyboard.addKey('W');
		this.keyS = scene.input.keyboard.addKey('s');
		this.keyLeft = scene.input.keyboard.addKey('LEFT');
		this.keyRight = scene.input.keyboard.addKey('RIGHT');
		this.keyUp = scene.input.keyboard.addKey('UP');
		this.keyDown = scene.input.keyboard.addKey('DOWN');
		this.pointer = scene.input.activePointer; // <-- Otetaan pointteri käyttöön, joka mahdollistaa hiirellä/kosketusnäytöllä pelaamisen
		this.pointerLastPos = {x: 0, x: 0}; // <-- hiirellä/kosketusnäytöllä pelaamisessa käytettävä muuttuja
		this.pointerJustPressed = false; // <-- <-- hiirellä/kosketusnäytöllä pelaamisessa käytettävä muuttuja
		
		// Liikkumisen parametrit:
		this.moveInterval = 0.12;
		this.moveTimer = this.moveInterval;
		this.moveDir = "RIGHT";
		this.lastMoveDir = "LEFT";
		
		// KÄÄRMEEN PÄÄN GAMEOBJECT LUONTI: ---------------------
		// Luodaan käärmeen pää levelin keskelle:
		this.headGridIndex = {x:  Math.floor(this.gridCountX * 0.5), y: Math.floor(this.gridCountY * 0.5)};
		var posX = this.levelAnchorX + this.headGridIndex.x * this.gridSize;
		var posY = this.levelAnchorY + this.headGridIndex.y * this.gridSize;
		this.head = scene.add.sprite(posX, posY, 'rectangle');
		this.head.displayWidth = this.gridSize;
		this.head.displayHeight = this.gridSize;		
		this.head.setOrigin(0,0);
		this.head.tint = 0xff1000;
		this.head.setDepth(1);

		this.isAlive = true;

		// KÄÄRMEEN PÄÄN RÄJÄHDYS PARTIKKELIT: --------------
		this.explosionParticles = scene.add.particles('rectangle');
		this.explosionParticles.createEmitter({
			angle: { min: 0, max: 360 },
			speed: { min: 200, max: 300 },
			quantity: 20,
			tint: [ 0xff1000],
			lifespan: 2000,
			alpha: { start: 1, end: 0 },
			scale: { start: (this.gridSize / 32), end: 0 },
			on: false
		});
		this.explosionParticles.setDepth(2);
		
		
		// KÄÄRMEEN HÄNNÄN PARAMETRIT:
		this.tailObjects = []; // taulukko, johon on tallennettuna käärmeen hännän palaset
		this.tailTargetLength = 10; // muuttuja, joka kertoo hännän pituuden. Häntä kasvaa kyseiseen pituuteen kierrätysiteraatioiden kautta.
		this.tailMoveIndex = 0;
		
		this.tailMinRecycleIterations = 1;
		this.tailMaxRecyleIterations = 50;
		this.tailMinPauseRecycleIterations = 1;
		this.tailMaxPauseRecycleIterations = 10;
		this.tailCurrentRecycleIterations = Math.floor(this.tailMinRecycleIterations + Math.random() * (this.tailMaxRecyleIterations  - this.tailMinRecycleIterations ));
		this.tailCurrentPauseRecyleIterations = Math.floor(this.tailMinPauseRecycleIterations + Math.random() * (this.tailMaxPauseRecycleIterations  - this.tailMinPauseRecycleIterations ));
		
		// Hännän palasten Collision Matrix: false tarkoittaa, että collisionia hännän palan kanssa ei synny kyseisessä indeksissä.
		this.tailCollisionMatrix = new Array(this.gridCountX);
		for (var x = 0; x < this.gridCountX; x++) {
			this.tailCollisionMatrix[x] = new Array(this.gridCountY);
			for (var y = 0; y < this.gridCountY; y++) {
				this.tailCollisionMatrix[x][y] = false;
			}
		}
		
		// RUOKA:
		this.foodObjects = new Object(); // tallennetaan ruoan palaset Dictionaryyn, jossa avaimena toimii: "gridX_gridY"
		this.spawnFood();
		this.spawnFood();
		this.spawnFood();
	}
	
	
	/**
	 * Käärme -olion update metodi, jota tulee kutsua scenen updatessa, johon käärme on lisätty.
	 * Vastaa käärmeen inputin kuuntelusta, liikuttamisesta, törmäyksien kuuntelusta, pisteistä jne... ... 
	 */
	update(deltaInSeconds) {
		
		// Jos käärme ei ole elossa --> ei tehdä Updatessa toimenpiteitä:
		if (!this.isAlive) return;
		
		// Käsitellään inputti, joka määrää käärmeen liikkumissuunnan:
		this.handleInput();
		
		// Jos moveTimer on nollaantunut --> hoidetaan käärmeen liikutus:
		this.moveTimer -= deltaInSeconds
		if (this.moveTimer <= 0) {
			this.moveTimer = this.moveInterval;
			
			// HÄNNÄN PALASTEN LIIKUTUS: (riippuvainen kierrätysiteraatioista, jotta peliin saadaan lisää mielenkiintoa)
			if (this.tailCurrentRecycleIterations > 0) { // jos nykyisten kierrätys iteraatioiden lukumäärä > 0 --> siirretään perimmäinen häntä pala pään sijaintiin tai luodaan uusi riippuen aktiivisen häntäpalojen lukumäärästä 
				this.tailCurrentRecycleIterations--; // vähennetään kierrätyksen iteraatioita --> nollaantuessa siirrytään iteraatioihin, jotka tauttaa hännän palasten siirtoa
				
				var posX = this.levelAnchorX + this.headGridIndex.x * this.gridSize;
				var posY = this.levelAnchorY + this.headGridIndex.y * this.gridSize;
				// Jos häntä objekteja on vähemmän kuin hännän targetLength --> luodaan uusi häntäpala pelaajan sijaintiin
				if (this.tailObjects.length < this.tailTargetLength) {
					const tailObj = this.scene.add.sprite(posX, posY, 'rectangle');
					tailObj.displayWidth = this.gridSize;
					tailObj.displayHeight = this.gridSize;		
					tailObj.setOrigin(0,0);
					tailObj.tint = 0x8a2020;
					this.tailObjects[this.tailObjects.length] = {gameObject: tailObj, gridIndex: {x: this.headGridIndex.x, y: this.headGridIndex.y } };
				}
				// Muuten siirretään perimmäisenä taulukossa oleva häntäpala:
				else {
					this.tailCollisionMatrix[this.tailObjects[this.tailMoveIndex].gridIndex.x][this.tailObjects[this.tailMoveIndex].gridIndex.y] = false;
					this.tailObjects[this.tailMoveIndex].gameObject.x = posX;
					this.tailObjects[this.tailMoveIndex].gameObject.y = posY;
					this.tailObjects[this.tailMoveIndex].gridIndex = {x: this.headGridIndex.x, y: this.headGridIndex.y };
					this.tailMoveIndex++;
					if (this.tailMoveIndex > this.tailObjects.length - 1) this.tailMoveIndex = 0;
				}
				this.tailCollisionMatrix[this.headGridIndex.x][this.headGridIndex.y] = true;
			}
			// Hännän palasten kierrätyksen/spawnaamisen tauotus:
			else {
				this.tailCurrentPauseRecyleIterations--;		
				if (this.tailCurrentPauseRecyleIterations < 0) {
					this.tailCurrentRecycleIterations = Math.floor(this.tailMinRecycleIterations + Math.random() * (this.tailMaxRecyleIterations  - this.tailMinRecycleIterations ));
					this.tailCurrentPauseRecyleIterations = Math.floor(this.tailMinPauseRecycleIterations + Math.random() * (this.tailMaxPauseRecycleIterations  - this.tailMinPauseRecycleIterations ));			
				}
			}
			
			
			// PÄÄN LIIKUTUS:
			if (this.moveDir === "LEFT") {
				this.headGridIndex.x--;
				if (this.headGridIndex.x < 0) this.headGridIndex.x = this.gridCountX - 1;
			}
			else if (this.moveDir === "RIGHT") {
				this.headGridIndex.x++;
				if (this.headGridIndex.x > this.gridCountX - 1) this.headGridIndex.x = 0;
			}
			else if (this.moveDir === "UP") {
				this.headGridIndex.y--;
				if (this.headGridIndex.y < 0) this.headGridIndex.y = this.gridCountY - 1;
			}
			else if (this.moveDir === "DOWN") {
				this.headGridIndex.y++;
				if (this.headGridIndex.y > this.gridCountY - 1) this.headGridIndex.y = 0;
			}
			
			this.setHeadPos(this.headGridIndex.x, this.headGridIndex.y);
			this.lastMoveDir = this.moveDir;
			
			// PÄÄN COLLISIONIT RUOKAAN: --> siirretään ruoan sijainti kartalla, kasvatetaan hännän pituutta ja esitetään ääni
			if ((this.headGridIndex.x + "_" + this.headGridIndex.y) in this.foodObjects) {
				this.spawnFood();
				this.foodObjects[(this.headGridIndex.x + "_" + this.headGridIndex.y)].destroy();
				delete this.foodObjects[(this.headGridIndex.x + "_" + this.headGridIndex.y)];
				this.tailTargetLength += 10;
				this.score += 10;
				this.scene.sound.play('pickup');
			}
			
			// PÄÄN COLLISIONIT HÄNTÄÄN: --> käärme kuolee pään osuessa häntään
			if (this.tailCollisionMatrix[this.headGridIndex.x][this.headGridIndex.y] === true) {
				this.die();
			}
		}
	}
	
	
	/**
	 * Käsittelee inputin käärmeen pään ohjaamiseen (näppäimistö + pointteri kontrollit) ja asettaa liikkumissuunnan inputin perusteella. 
	 */
	handleInput() {
		
		// Käsitellään ensiksi hiirellä/kosketusnäytöllä pelaaminen:
		var mouseDelta = {x: 0, y: 0}; // osoittaa pointterin liikumisen määrän
		var mouseMoveLeft = false; // true, jos halutaan liikkua oikealle käyttäen pointteria...
		var mouseMoveRight = false;
		var mouseMoveUp = false;
		var mouseMoveDown = false;
		if (this.pointer.isDown) { // jos hiiri/kosketus on päällä:
			
			// Jos pointterilla painallus on juuri aloitettu: otetaan talteen sijainti
			if (this.pointerJustPressed === false) {
				this.pointerJustPressed = true;
				this.pointerLastPos.x = this.pointer.x;
				this.pointerLastPos.y = this.pointer.y;
			}
			
			// Lasketaan matkaa painalluksen alkuun suhden:
			mouseDelta.x = this.pointer.x - this.pointerLastPos.x;
			mouseDelta.y = this.pointer.y - this.pointerLastPos.y;
			
			// Jos pointteri on liikkunut määrätyn vähimmäis matkan X tai Y akselilla:
			const MIN_MOUSE_MOVE_DST_ON_AXIS = 10;
			if (Math.abs(mouseDelta.x) > MIN_MOUSE_MOVE_DST_ON_AXIS || Math.abs(mouseDelta.y) > MIN_MOUSE_MOVE_DST_ON_AXIS) {
				// Päivitetään edellinen pointterin sijainti
				this.pointerLastPos.x = this.pointer.x;
				this.pointerLastPos.y = this.pointer.y;
				// Jos pointteri on liikunut enemmän horisontaalisesti --> käsitellään vain vasemmalle ja oikealle liikkuminen
				if (Math.abs(mouseDelta.x) > Math.abs(mouseDelta.y)) {
					if (mouseDelta.x < 0) mouseMoveLeft = true;
					else if (mouseDelta.x > 0) mouseMoveRight = true;
				}
				else { // Muuten käsitellään tilanteet, jossa pelaajaa halutaan ohjata vertikaalisesti:
					if (mouseDelta.y < 0) mouseMoveUp = true;
					else if (mouseDelta.y > 0) mouseMoveDown = true;
				}
			}
		}
		else if (this.pointerJustPressed === true) this.pointerJustPressed = false; // jos pointteri ei ole pohjassa --> nollataan pointerJustPressed parametri
		
		// Määritetään pelaajan liikkuminen painikkeiden sekä pointterin inputin perusteella:
		if ((this.keyA.isDown || this.keyLeft.isDown || mouseMoveLeft) && this.lastMoveDir !== "RIGHT") this.moveDir = "LEFT";
		if ((this.keyD.isDown || this.keyRight.isDown || mouseMoveRight) && this.lastMoveDir !== "LEFT") this.moveDir = "RIGHT";
		if ((this.keyW.isDown || this.keyUp.isDown || mouseMoveUp) && this.lastMoveDir !== "DOWN") this.moveDir = "UP";
		if ((this.keyS.isDown || this.keyDown.isDown || mouseMoveDown) && this.lastMoveDir !== "UP") this.moveDir = "DOWN";
	}
	
	
	/**
	 * Asettaa käärmeen pään sijainnin annetun grid koordinaatin perusteella
	 */
	setHeadPos(gridX, gridY) {
		this.headGridIndex = {x: gridX, y: gridY}
		this.head.x = this.levelAnchorX + gridX * this.gridSize;
		this.head.y = this.levelAnchorY + gridY * this.gridSize;
	}
	
	
	/**
	 * Käärme kuolee kutsuttaessa, esittää räjähdyspartikkelit ja äänen
	 */
	die() {
		this.isAlive = false;
		this.explosionParticles.emitParticleAt(this.head.x, this.head.y);
		this.scene.sound.play('explosion');
	}
	
	
	/**
	 * Arpoo satunnaisen tyhjän koodinaatiston indeksin (Käytetään ruuan spawnaamiseen)
	 */
	getRandomEmptyGridIndex() {
		
		// Yritetään ensiksi arpoa luku sattumalta:
		var randomX = Math.floor(Math.random() * this.gridCountX)
		var randomY = Math.floor(Math.random() * this.gridCountY);
		
		var canAddRandom = true;
		
		if (randomX === this.headGridIndex.x && randomY === this.headGridIndex.y) canAddRandom = false;
		if (this.tailCollisionMatrix[randomX][randomY]) canAddRandom = false;
		
		if ((randomX + "_" + randomY) in this.foodObjects) canAddRandom = false;
		
		if (canAddRandom) return {x:randomX, y: randomY};
		
		// Jos luvun arpominen ei onnistunut ja grid piste oli varattu --> tehdään arpominen pidemmän kaavan kautta:
		var acceptablePositions =  [];
		for (var x = 0; x < this.gridCountX; x++) {
			for (var y = 0; y < this.gridCountY; y++) {
				if (x === this.headGridIndex.x && y === this.headGridIndex.y) continue;
				if (this.tailCollisionMatrix[x][y] === true) continue;
				if ( (x + "_" + y) in this.foodObjects) continue;
				acceptablePositions[acceptablePositions.length] = {x: x, y: y};
			}
		}
		
		return acceptablePositions[Math.floor(Math.random() * acceptablePositions.length)];
	}
	
	
	/**
	 * Spawnaa tasoon ruoka -objektin satunnaiseen sijaintiin
	 */
	spawnFood() {
		var foodGridIndex = this.getRandomEmptyGridIndex();
		var posX = this.levelAnchorX + foodGridIndex.x * this.gridSize;
		var posY = this.levelAnchorY + foodGridIndex.y * this.gridSize;
		const food = this.scene.add.sprite(posX, posY, 'food');
		food.displayWidth = this.gridSize;
		food.displayHeight = this.gridSize;		
		food.setOrigin(0,0);
		food.tint = 0x00ffff;
		this.foodObjects[foodGridIndex.x + "_" + foodGridIndex.y] = food;
	}
	
	
	/**
	 * Palauttaa pelaajan pisteet
	 */
	getScore() {
		return this.score;
	}
	
	
	/**
	 * Palauttaa tiedon onko käärme elossa
	 */
	getIsAlive() {
		return this.isAlive;
	}
}