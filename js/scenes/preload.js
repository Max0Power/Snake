/**
 *@author Jussi Parviainen
 *@created 23.02.2021
 * Scene, joka vastaa kaikkien pelissä käytettävien assettien latauksesta. Assetteja ei tarvitse ladata käyttöön muissa sceneissä.
 * Kutsutaan heti pelin käynnistyessä
 */
class Preload extends Phaser.Scene {
	
	/**
	 * Scene -olion muodostaja
	 */
	constructor() {
		super({key:"Preload"});
	}
	
	
	/**
	 * Assettien lataus:
	 */
	preload() {
		
		this.load.image('rectangle', 'assets/sprites/Rectangle.png')
		this.load.image('food', 'assets/sprites/Food.png')
		this.load.audio('explosion', 'assets/audio/effects/Explosion.wav');
		this.load.audio('pickup', 'assets/audio/effects/Pickup.wav');
		
	}

	
	/**
	 * Kutsutaan scenen käynnistyessä:
	 */
	create() {
		this.input.mouse.disableContextMenu();
		this.scene.start("MainMenu"); // Siirrytään heti päävalikkoon
	}
}
