/**
 *@author Jussi Parviainen
 *@created 23.02.2021
 * Pelin konfiguraatio ja käynnistys
 */
// Pelin konfiguraatio:
var config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
	scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [Preload, MainMenu, Level1, DeathScreen]
};
// Pelin käynnistys:
const game = new Phaser.Game(config);
