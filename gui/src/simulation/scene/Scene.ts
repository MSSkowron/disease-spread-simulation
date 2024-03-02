import * as Phaser from 'phaser'
import type { GridEngine, Position } from 'grid-engine'
import { Direction } from 'grid-engine'
import { InteractionCloudBuilder } from '../tools/InteractionCloudBuilder'
import { ContextMenuBuilder } from '../tools/ContextMenuBuilder'
import { ImageCropper } from '../tools/ImageCropper'
import { AdvertisementInfoBuilder } from '../tools/AdvertisementInfoBuilder'
import Key = Phaser.Input.Keyboard.Key
import { Coordinates } from './Types'

const RANDOM_MOVEMENT_SERVER_API_URL: string = import.meta.env
  .VITE_RANDOM_MOVEMENT_SERVER_API_URL as string

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Simulation',
}

export class Scene extends Phaser.Scene {
  private readonly gridEngine!: GridEngine
  public interactionCloudBuiler!: InteractionCloudBuilder
  public advertisementInfoBuilder!: AdvertisementInfoBuilder
  public contextMenuBuilder!: ContextMenuBuilder
  public imageCropper!: ImageCropper
  public characterUrl!: string
  public resourceUrl!: string
  public tileUrl!: string

  constructor() {
    super(sceneConfig)
    this.interactionCloudBuiler = new InteractionCloudBuilder()
    this.advertisementInfoBuilder = new AdvertisementInfoBuilder(this)
    this.contextMenuBuilder = new ContextMenuBuilder()
    this.imageCropper = new ImageCropper()
    this.characterUrl = characterUrl
    this.resourceUrl = resourceUrl
    this.tileUrl = tileUrl
  }

  preload(): void {
    this.load.tilemapTiledJSON(
      MAP_ASSET_KEY,
      `${VITE_ECSB_HTTP_AUTH_AND_MENAGEMENT_API_URL}/assets/${this.settings.gameAssets.mapAssetId}`,
    )
    this.load.image(TILES_ASSET_KEY, this.tileUrl)
    this.load.spritesheet(CHARACTER_ASSET_KEY, this.characterUrl, {
      frameWidth: SPRITE_WIDTH,
      frameHeight: SPRITE_HEIGHT,
    })
  }

  create(): void {
    const tilemap = this.make.tilemap({ key: MAP_ASSET_KEY })
    tilemap.addTilesetImage('Overworld', TILES_ASSET_KEY)

    for (let i = 0; i < tilemap.layers.length; i++) {
      const layer = tilemap.createLayer(i, 'Overworld', 0, 0)
      layer.scale = LAYER_SCALE
    }

    this.cameras.main.setBounds(
      0,
      0,
      tilemap.widthInPixels * LAYER_SCALE,
      tilemap.heightInPixels * LAYER_SCALE,
    )

    const gridEngineConfig = {
      characters: [],
      numberOfDirections: 8,
    }

    this.gridEngine.create(tilemap, gridEngineConfig)

    this.gridEngine.positionChangeStarted().subscribe(({ charId, exitTile, enterTile }) => {
      console.log(`Character ${charId} is moving from ${exitTile} to ${enterTile}`)
    })

    this.gridEngine.positionChangeFinished().subscribe(({ charId, exitTile, enterTile }) => {
      console.log(`Character ${charId} moved from ${exitTile} to ${enterTile}`)
    })

    this.input.on(
      'pointerdown',
      (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[]) => {
        if (gameObjects.length === 0) {
          return
        }

        const clickedSprite = gameObjects[0]

        if (clickedSprite instanceof Phaser.GameObjects.Sprite) {
          console.log('Sprite clicked')
        }
      },
    )

    this.scale.resize(window.innerWidth, window.innerHeight)
  }

  getDirection = (startPosition: Position, endPosition: Position): Direction => {
    const xDiff = startPosition.x - endPosition.x
    const yDiff = startPosition.y - endPosition.y

    if (xDiff === 0 && yDiff === 0) {
      return Direction.NONE
    }

    if (xDiff === 0) {
      return yDiff > 0 ? Direction.UP : Direction.DOWN
    }

    if (yDiff === 0) {
      return xDiff > 0 ? Direction.LEFT : Direction.RIGHT
    }

    if (xDiff > 0) {
      return yDiff > 0 ? Direction.UP_LEFT : Direction.DOWN_LEFT
    }

    return yDiff > 0 ? Direction.UP_RIGHT : Direction.DOWN_RIGHT
  }

  addPlayer(id: string, coords: Coordinates, direction: Direction, characterClass: string): void {
    const sprite = this.add.sprite(0, 0, CHARACTER_ASSET_KEY)
    const text = this.add.text(0, ALL_PLAYERS_DESC_OFFSET_TOP, id)
    text.setColor('#000000')
    text.setFontFamily('Georgia, serif')

    const cloud = this.interactionCloudBuiler.build(this, id)
    const adBubble = this.advertisementInfoBuilder.build(id)
    this.advertisementInfoBuilder.setMarginAndVisibility(id)

    sprite.setInteractive()
    sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {})

    const container = this.add.container(0, 0, [sprite, text, cloud, adBubble])

    this.gridEngine.addCharacter({
      id: id,
      sprite: sprite,
      container,
      facingDirection: direction,
      walkingAnimationMapping: getPlayerMapping(this.settings.classResourceRepresentation)(
        characterClass,
      ),
      speed: this.settings.walkingSpeed,
      startPosition: coords,
      collides: false,
    })

    this.players[id] = {
      coords,
      direction,
      sprite,
    }
  }

  removePlayer(id: string): void {
    this.gridEngine.getSprite(id)?.destroy()
    this.gridEngine.getContainer(id)?.destroy()
    this.gridEngine.removeCharacter(id)

    delete this.players[id]
  }

  movePlayer(id: string, coords: Coordinates, direction: Direction): void {
    this.gridEngine.moveTo(id, coords, {algorithm: 'JPS'})

    this.interactionCloudBuiler.purgeUnnecessaryIcons(id)
    this.players[id].coords = coords
    this.players[id].direction = direction
  }
}
