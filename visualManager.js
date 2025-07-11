class VisualManager {
    /**
     * Manages all 2D rendering via PixiJS.
     * @param {string} canvasId - The ID of the canvas element to render to.
     */
    constructor(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            throw new Error(`Canvas element with id "${canvasId}" not found.`);
        }

        this.app = new PIXI.Application({
            view: canvas,
            width: canvas.width,
            height: canvas.height,
            backgroundColor: 0x000000,
            resolution: window.devicePixelRatio || 1,
        });

        this.stage = this.app.stage;
        this.loader = PIXI.Assets; // Using PIXI.Assets for modern PixiJS
    }

    /**
     * Loads visual assets like images and spritesheets.
     * @param {object} assets - An object with keys as asset names and values as URLs.
     * @returns {Promise<void>} A promise that resolves when all assets are loaded.
     */
    async loadAssets(assets) {
        const assetPromises = Object.entries(assets).map(([name, url]) => {
            return this.loader.load(url, (texture) => ({ [name]: texture }));
        });
        await Promise.all(assetPromises);
        console.log("All assets loaded.");
    }

    /**
     * The main update method called by the game loop.
     * It orchestrates the rendering of the entire scene based on visual data.
     * @param {object} visuals - An object containing the visual state.
     * @param {string} [visuals.background] - The URL of the background image.
     * @param {Array<object>} [visuals.characters] - An array of character data objects.
     * @param {Array<object>} [visuals.effects] - An array of visual effect data objects.
     */
    updateScene(visuals) {
        if (visuals.background) {
            this.setBackground(visuals.background);
        }
        if (visuals.characters) {
            visuals.characters.forEach(charData => this.setCharacter(charData));
        }
        if (visuals.effects) {
            visuals.effects.forEach(effectData => this.playEffect(effectData));
        }
    }

    /**
     * Changes the background image of the scene.
     * @param {string} imageUrl - The URL of the texture for the background.
     */
    setBackground(imageUrl) {
        const existingBg = this.stage.getChildByName('background');
        if (existingBg) {
            this.stage.removeChild(existingBg);
        }

        const background = PIXI.Sprite.from(imageUrl);
        background.name = 'background';
        background.width = this.app.screen.width;
        background.height = this.app.screen.height;
        background.anchor.set(0.5);
        background.x = this.app.screen.width / 2;
        background.y = this.app.screen.height / 2;
        this.stage.addChildAt(background, 0);
    }

    /**
     * Displays or updates a character sprite on the stage.
     * @param {object} characterData - The data for the character.
     * @param {string} characterData.name - A unique name for the character sprite.
     * @param {string} characterData.imageUrl - The URL of the character's texture.
     * @param {object} characterData.position - The position to place the character.
     * @param {number} characterData.position.x - The x-coordinate.
     * @param {number} characterData.position.y - The y-coordinate.
     */
    setCharacter(characterData) {
        let characterSprite = this.stage.getChildByName(characterData.name);

        if (!characterSprite) {
            characterSprite = PIXI.Sprite.from(characterData.imageUrl);
            characterSprite.name = characterData.name;
            this.stage.addChild(characterSprite);
        } else {
            // Update texture if it has changed
            const newTexture = PIXI.Texture.from(characterData.imageUrl);
            if (characterSprite.texture !== newTexture) {
                characterSprite.texture = newTexture;
            }
        }

        characterSprite.anchor.set(0.5);
        characterSprite.x = characterData.position.x;
        characterSprite.y = characterData.position.y;
    }

    /**
     * Renders a temporary visual effect on the stage.
     * @param {object} effectData - The data for the visual effect.
     * @param {string} effectData.imageUrl - The URL for the effect's texture.
     * @param {object} effectData.position - The position to place the effect.
     * @param {number} effectData.position.x - The x-coordinate.
     * @param {number} effectData.position.y - The y-coordinate.
     * @param {number} [effectData.duration=1000] - Duration in ms before the effect is removed.
     */
    playEffect(effectData) {
        const effectSprite = PIXI.Sprite.from(effectData.imageUrl);
        effectSprite.anchor.set(0.5);
        effectSprite.x = effectData.position.x;
        effectSprite.y = effectData.position.y;
        this.stage.addChild(effectSprite);

        setTimeout(() => {
            if (effectSprite.parent) {
                this.stage.removeChild(effectSprite);
            }
        }, effectData.duration || 1000);
    }
}