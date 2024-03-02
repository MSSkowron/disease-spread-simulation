import * as Phaser from 'phaser'
import type { GridEngine, Position } from 'grid-engine'
import { CollisionStrategy, Direction } from 'grid-engine'
import {
    CHARACTER_ASSET_KEY,
    LAYER_SCALE,
    MAP_ASSET_KEY,
    SPRITE_HEIGHT,
    SPRITE_WIDTH,
    TILES_ASSET_KEY,
} from '../SimulationUtils'
import { MapData } from '../../App'
import axios from 'axios'

const RANDOM_MOVEMENT_SERVER_API_URL: string = import.meta.env
    .VITE_RANDOM_MOVEMENT_SERVER_API_URL as string

export interface Coordinates {
    x: number
    y: number
}

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'Simulation',
}

const NO_OF_PLAYERS = 1

export default class Scene extends Phaser.Scene {
    private readonly gridEngine!: GridEngine

    private static readonly characterUrl: string = './assets/characters.png'
    private static readonly tileUrl: string = './assets/Overworld.png'
    private static readonly tileJSONUrl: string = './assets/simulation.json'
    private static readonly TilesetName: string = 'Overworld'

    private readonly mapData: MapData
    private readonly onStop: () => void

    private readonly players: {
        [id: string]: { coords: Coordinates; sprite: Phaser.GameObjects.Sprite, home: Coordinates}
    } = {}

    constructor(mapData: MapData, onStop: () => void) {
        super(sceneConfig)
        this.mapData = mapData
        this.onStop = onStop
    }

    preload(): void {
        this.load.tilemapTiledJSON(MAP_ASSET_KEY, Scene.tileJSONUrl)
        this.load.image(TILES_ASSET_KEY, Scene.tileUrl)
        this.load.spritesheet(CHARACTER_ASSET_KEY, Scene.characterUrl, {
            frameWidth: SPRITE_WIDTH,
            frameHeight: SPRITE_HEIGHT,
        })
    }

    create(): void {
        const tilemap = this.make.tilemap({ key: MAP_ASSET_KEY })
        tilemap.addTilesetImage(Scene.TilesetName, TILES_ASSET_KEY)

        for (let i = 0; i < tilemap.layers.length; i++) {
            const layer = tilemap.createLayer(i, Scene.TilesetName, 0, 0)
            layer!.scale = LAYER_SCALE
        }

        this.cameras.main.setBounds(
            0,
            0,
            tilemap.widthInPixels * LAYER_SCALE,
            tilemap.heightInPixels * LAYER_SCALE,
        )

        const gridEngineConfig = {
            characters: [],
            numberOfDirections: 4,
        }

        this.gridEngine.create(tilemap, gridEngineConfig)

        for (let i = 0; i < NO_OF_PLAYERS; i++) {
            const home = this.mapData.privateTiles[i]
            this.addPlayer(i.toString(), { x: home.width, y: home.height }, Direction.DOWN)
        }

        // this.gridEngine.positionChangeStarted().subscribe(({ charId, exitTile, enterTile }) => {
        //     console.log(`Character ${charId} is moving from ${exitTile} to ${enterTile}`)
        // })

        this.gridEngine.positionChangeFinished().subscribe(({ charId, exitTile, enterTile }) => {
            this.players[charId].coords = enterTile
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

        while (true) {
            for (let i = 0; i < NO_OF_PLAYERS; i++) {
                if (this.gridEngine.isMoving(i.toString())) {
                    console.log(`Character ${i} is moving`)
                } else {
                    if (this.players[i.toString()].coords === this.players[i.toString()].home) {
                        this.randomMovePlayer(i.toString())
                    } else {
                        this.movePlayer(i.toString(), this.players[i.toString()].home)
                    }
                }
            }
        }
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

    addPlayer(id: string, home: Coordinates, direction: Direction): void {
        const sprite = this.add.sprite(0, 0, CHARACTER_ASSET_KEY)

        sprite.setInteractive()
        sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {})

        const container = this.add.container(0, 0, [sprite])

        this.gridEngine.addCharacter({
            id: id,
            sprite: sprite,
            container,
            facingDirection: direction,
            walkingAnimationMapping: 0,
            speed: 10,
            startPosition: home,
            collides: {
                collisionGroups: [id],
            },
        })

        this.players[id] = {
            coords: {
                x: home.x,
                y: home.y,
            },
            sprite,
            home: {
                x: home.x,
                y: home.y
            },
        }
    }

    removePlayer(id: string): void {
        this.gridEngine.getSprite(id)?.destroy()
        this.gridEngine.getContainer(id)?.destroy()
        this.gridEngine.removeCharacter(id)

        delete this.players[id]
    }

    randomMovePlayer(id: string): void {
        axios.get(`${RANDOM_MOVEMENT_SERVER_API_URL}/map/${this.mapData.id}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            this.movePlayer(id, {x: response.data.x, y:response.data.y})
        })
        .catch((error) => {
            console.log(error)
        })
    }

    movePlayer(id: string, coords: Coordinates): void {
        this.gridEngine.moveTo(id, coords, {algorithm: 'JPS'})

        this.players[id].coords = coords
    }
}
