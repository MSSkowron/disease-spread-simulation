import Phaser from 'phaser'
import GridEngine from 'grid-engine'
import { Scene } from './scene/Scene'

export interface SimulationData {
  game: Phaser.Game
  scene: Scene
}

export const startSimulation = (): SimulationData => {
  const scene = new Scene()

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    dom: {
      createContainer: true,
    },
    render: {
      antialias: false,
    },
    scale: {
      mode: Phaser.Scale.ScaleModes.RESIZE,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    parent: 'simulation-content',
    scene: scene,
    plugins: {
      scene: [
        {
          key: 'gridEngine',
          plugin: GridEngine,
          mapping: 'gridEngine',
        },
      ],
    },
  }

  const game = new Phaser.Game(config)

  return {
    game,
    scene,
  }
}

export const stopSimulation = (simulationData: SimulationData): void => {
  simulationData.scene.destroy()
  simulationData.scene.sys.plugins.removeScenePlugin('gridEngine')
  simulationData.scene.sys.game.destroy(true)

  simulationData.game.plugins.removeScenePlugin('gridEngine')
  simulationData.game.destroy(true)
}


