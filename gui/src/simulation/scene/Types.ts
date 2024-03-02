import { type Travel } from '../../apis/game/Types'
import { type Equipment } from '../../services/game/Types'
import { type Direction } from 'grid-engine'
import Key = Phaser.Input.Keyboard.Key

export enum CloudType {
    WORK = 'work',
    TRAVEL = 'travel',
    TALK = 'talk',
    PRODUCTION = 'production',
}

export type PlayerId = string

export interface Coordinates {
    x: number
    y: number
}

export interface PlayerState {
    coords: Coordinates
    direction: Direction
    sprite: Phaser.GameObjects.Sprite
}

export interface PlannedTravel {
    isSingle: boolean
    wantToCooperate: boolean | null

    travel: Travel

    playerResources: Equipment
    playerRequiredResources: Equipment
    playerProfit: number | null
    playerIsRunning: boolean | null

    partner: string | null
    partnerResources: Equipment | null
    partnerRequiredResources: Equipment | null
    partnerProfit: number | null
}
