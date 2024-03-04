import * as Phaser from 'phaser'
import type { GridEngine } from 'grid-engine'
import { Direction } from 'grid-engine'
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

export default class Scene extends Phaser.Scene {
    private readonly gridEngine!: GridEngine

    private static readonly characterUrl: string = './assets/characters.png'
    private static readonly tileUrl: string = './assets/Overworld.png'
    private static readonly tileJSONUrl: string = './assets/simulation.json'
    private static readonly TilesetName: string = 'Overworld'

    private numberOfIll: number

    private readonly mapData: MapData
    private readonly numberOfPlayers: number
    private readonly timeOfSimulation: number
    private readonly probabilityOfInfection: number
    private readonly probabilityOfInfectionAtTheBeginning: number
    private readonly onStop: (avg: number, max: number) => void
    private readonly setNumberOfIll: (n: number) => void

    private readonly players: {
        [id: string]: { isHome: boolean; home: Coordinates; sprite: Phaser.GameObjects.Sprite; coords: Coordinates, isIll: boolean }
    } = {}
    private readonly playerIds: string[] = []
    private tiles: integer[][]
    private timeDelta: integer = 0
    private timeouts: NodeJS.Timeout[] = []
    private max: number = 0
    private avg_samples: number[] = []

    constructor(
        mapData: MapData,
        numberOfPlayers: number,
        timeOfSimulation: number,
        probabilityOfInfection: number,
        probabilityOfInfectionAtTheBeginning: number,
        onStop: (avg: number, max: number) => void,
        setNumberOfIll: (n: number) => void,
    ) {
        super(sceneConfig)
        this.numberOfIll = 0
        this.mapData = mapData
        this.numberOfPlayers = numberOfPlayers
        this.timeOfSimulation = timeOfSimulation
        this.probabilityOfInfection = probabilityOfInfection
        this.probabilityOfInfectionAtTheBeginning = probabilityOfInfectionAtTheBeginning
        this.onStop = onStop
        this.setNumberOfIll = setNumberOfIll

        this.tiles = [];
        for(var i: number = 0; i < this.mapData.width; i++) {
            this.tiles[i] = [];
            for(var j: number = 0; j < this.mapData.height; j++) {
                this.tiles[i][j] = 0;
            }
        }
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

        for (let i = 0; i < this.numberOfPlayers; i++) {
            const home = this.mapData.privateTiles[i]
            this.addPlayer(i.toString(), { x: home.x, y: home.y }, Direction.DOWN)
        }

        this.gridEngine.movementStopped().subscribe(({ charId }) => {
            if (this.players[charId].isHome) {
                this.timeouts.push(setTimeout(
                    () => {
                        this.players[charId].isHome = false
                        this.randomMovePlayer(charId)
                    },
                    Math.random() * 5000 + 3000,
                ))
            } else {
                if (Math.random() < 0.5) {
                    this.timeouts.push(setTimeout(
                        () => {
                            this.players[charId].isHome = true
                            this.movePlayer(charId, this.players[charId].home)
                        },
                        Math.random() * 5000 + 3000,
                    ))
                } else {
                    this.timeouts.push(setTimeout(
                        () => {
                            this.randomMovePlayer(charId)
                        },
                        Math.random() * 5000 + 3000,
                    ))
                }
            }
        })

        this.gridEngine.positionChangeFinished().subscribe(({ charId, exitTile, enterTile }) => {
            if (this.players[charId].isIll) {
                this.tiles[exitTile.x][exitTile.y] -= 1
                this.tiles[enterTile.x][enterTile.y] += 1
            } else {
                var sum = 0
                for(let i=-1; i<2; i++){
                    for(let j=-1; j<2; j++){
                        if(enterTile.x + i > 0 && enterTile.x + i < this.mapData.width - 1 && enterTile.y + j > 0 && enterTile.y + j < this.mapData.height - 1) {
                            sum = sum + this.tiles[enterTile.x + i][enterTile.y + j]
                        }
                    }
                }
                this.players[charId].isIll = Math.random() < sum * this.probabilityOfInfection
                if (this.players[charId].isIll) {
                    this.tiles[enterTile.x][enterTile.y] += 1
                    this.numberOfIll++
                    this.max = Math.max(this.numberOfIll, this.max)
                    this.setNumberOfIll(this.numberOfIll)
                    this.gridEngine.setWalkingAnimationMapping(charId, 1)

                    this.timeouts.push(setTimeout(
                        (player: { isHome: boolean; home: Coordinates; sprite: Phaser.GameObjects.Sprite; coords: Coordinates, isIll: boolean }) => {
                            this.tiles[player.coords.x][player.coords.y] -= 1
                            this.numberOfIll--
                            this.setNumberOfIll(this.numberOfIll)
                            this.gridEngine.setWalkingAnimationMapping(charId, 0)
                            player.isIll = false
                        },
                        Math.random() * 10000 + 20000,
                        this.players[charId],
                    ))
                }
            }
            this.players[charId].coords = enterTile
        })

        for (let i = 0; i < this.numberOfPlayers; i++) {
            this.timeouts.push(setTimeout(
                () => {
                    this.players[i.toString()].isHome = false
                    this.randomMovePlayer(i.toString())
                },
                Math.random() * 10000 + 500,
            ))
        }

        this.timeouts.push(setInterval(() => {
            this.avg_samples.push(this.numberOfIll)
        }, 500))

        setTimeout(() => {
            this.stop()
        }, this.timeOfSimulation)
    }

    update(time: number): void {
        if (time - this.timeDelta > 500) {
            this.timeDelta = time
            this.playerIds.forEach(el => {
                if(!this.gridEngine.isMoving(el) && !this.players[el].isIll) {
                    
                    const enterTile = this.players[el].coords
                    var sum = 0
                    for(let i=-1; i<2; i++){
                        for(let j=-1; j<2; j++){
                            if(enterTile.x + i > 0 && enterTile.x + i < this.mapData.width - 1 && enterTile.y + j > 0 && enterTile.y + j < this.mapData.height - 1) {
                                sum = sum + this.tiles[enterTile.x + i][enterTile.y + j]
                            }
                        }
                    }
                    this.players[el].isIll = Math.random() < sum * this.probabilityOfInfection
                    if (this.players[el].isIll) {
                        this.tiles[enterTile.x][enterTile.y] += 1
                        this.numberOfIll++
                        this.max = Math.max(this.numberOfIll, this.max)
                        this.setNumberOfIll(this.numberOfIll)
                        this.gridEngine.setWalkingAnimationMapping(el, 1)
                        const direction = this.gridEngine.getFacingDirection(el)
                        this.gridEngine.turnTowards(el, Direction.DOWN)
                        this.gridEngine.turnTowards(el, Direction.UP)
                        this.gridEngine.turnTowards(el, direction)
    
                        this.timeouts.push(setTimeout(
                            (player: { isHome: boolean; home: Coordinates; sprite: Phaser.GameObjects.Sprite; coords: Coordinates, isIll: boolean }) => {
                                this.tiles[player.coords.x][player.coords.y] -= 1
                                this.numberOfIll--
                                this.setNumberOfIll(this.numberOfIll)
                                this.gridEngine.setWalkingAnimationMapping(el, 0)
                                player.isIll = false
                            },
                            Math.random() * 10000 + 20000,
                            this.players[el],
                        ))
                    }

                }
            })
        }
    }

    printIll(): void {
        console.log(this.tiles.reduce(function(a, b) { return a.concat(b) }) 
            .reduce(function(a, b) { return a + b }));
    }

    addPlayer(id: string, home: Coordinates, direction: Direction): void {
        const sprite = this.add.sprite(0, 0, CHARACTER_ASSET_KEY)

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

        this.playerIds.push(id)
        this.players[id] = {
            isHome: true,
            home: home,
            sprite,
            coords: {x: home.x, y: home.y},
            isIll: false
        }

        if (Math.random() < this.probabilityOfInfectionAtTheBeginning) {
            this.players[id].isIll = true
            this.tiles[home.x][home.y] = 1
            this.numberOfIll++
            this.max = Math.max(this.numberOfIll, this.max)
            this.setNumberOfIll(this.numberOfIll)
            this.gridEngine.setWalkingAnimationMapping(id, 1)

            this.timeouts.push(setTimeout(
                (player: { isHome: boolean; home: Coordinates; sprite: Phaser.GameObjects.Sprite; coords: Coordinates, isIll: boolean }) => {
                    this.tiles[player.coords.x][player.coords.y] -= 1
                    this.numberOfIll--
                    this.setNumberOfIll(this.numberOfIll)
                    this.gridEngine.setWalkingAnimationMapping(id, 0)
                    player.isIll = false
                },
                Math.random() * 10000 + 20000,
                this.players[id],
            ))
        }
    }

    removePlayer(id: string): void {
        this.gridEngine.getSprite(id)?.destroy()
        this.gridEngine.getContainer(id)?.destroy()
        this.gridEngine.removeCharacter(id)

        delete this.players[id]
    }

    randomMovePlayer(id: string): void {
        axios
            .get(`${RANDOM_MOVEMENT_SERVER_API_URL}/map/${this.mapData.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                this.movePlayer(id, { x: response.data.x, y: response.data.y })
            })
            .catch((error) => {
                console.error(error)
            })
    }

    movePlayer(id: string, coords: Coordinates): void {
        this.gridEngine.moveTo(id, coords, { algorithm: 'JPS' })
    }

    stop(): void {
        this.timeouts.forEach(el => {
            clearTimeout(el)
        })
        this.onStop(this.avg_samples.reduce((a, b) => a + b, 0) / this.avg_samples.length, this.max)
    }
}
