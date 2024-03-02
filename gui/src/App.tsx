import { useState } from 'react'
import './App.css'

const App = () => {
    const [isSimulationOn, setIsSimulationOn] = useState<boolean>(false)

    const startSimulation = async () => {
        // const gameData = startGame(
        //         gameToken,
        //         gameStatus,
        //         gameSettings,
        //         mapConfig,
        //         characterURL,
        //         resourceURL,
        //         tileSetURL,
        //       )
        //       setGameData(gameData)
        //       document.body.style.overflow = 'hidden'
        //       setIsSimulationOn(true)
    }

    const stopSimulation = () => {
        // stopGame(gameData)
        // setGameData(null)
        // document.body.style.overflow = 'auto'
        // setIsSimulationOn(false)
    }

    return isSimulationOn ? (
        <div id='game-content' />
    ) : (
        <div>
            <button onClick={startSimulation}>Start Simulation</button>
        </div>
    )
}
export default App
