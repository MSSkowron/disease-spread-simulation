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

const NO_OF_PLAYERS = 200

export default class Scene extends Phaser.Scene {
    private readonly gridEngine!: GridEngine

    private static readonly characterUrl: string = './assets/characters.png'
    private static readonly tileUrl: string = './assets/Overworld.png'
    private static readonly tileJSONUrl: string = './assets/simulation.json'
    private static readonly TilesetName: string = 'Overworld'

    private readonly mapData: MapData
    private readonly onStop: () => void

    private readonly players: {
        [id: string]: { isHome: boolean, home: Coordinates ,sprite: Phaser.GameObjects.Sprite}
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
            this.addPlayer(i.toString(), { x: home.x, y: home.y }, Direction.DOWN)
        }

        for (let i = 0; i < NO_OF_PLAYERS; i++) {
            setTimeout(() => {
                this.players[i.toString()].isHome = false
                this.randomMovePlayer(i.toString())
            }, Math.random() * 10000 + 500)
        }

        this.gridEngine.movementStopped().subscribe(({ charId, direction }) => {
            if (this.players[charId].isHome) {
                setTimeout(() => {
                    this.players[charId].isHome = false
                    this.randomMovePlayer(charId)
                }, Math.random() * 10000 + 500)
            } else {
                setTimeout(() => {
                    this.players[charId].isHome = true
                    this.movePlayer(charId, this.players[charId].home)
                }, Math.random() * 10000 + 500)
            }
        })
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
            speed: 7,
            startPosition: home,
            collides: {
                collisionGroups: [id],
            },
        })

        this.players[id] = {
            isHome: true,
            home: home,
            sprite,
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
    }
}
