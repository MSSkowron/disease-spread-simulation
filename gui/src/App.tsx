import { useState } from 'react'
import './App.css'
import { startSimulation, stopSimulation } from './simulation/Simulation'
import axios from 'axios'
import simulationJSON from '../assets/simulation.json'

const RANDOM_MOVEMENT_SERVER_API_URL: string = import.meta.env
    .VITE_RANDOM_MOVEMENT_SERVER_API_URL as string

export interface MapData {
    id: string,
    privateTiles: {
        x: number,
        y: number,
    }[],
}

const shuffle = (array: any[]) => {
    let currentIndex = array.length,  randomIndex;
  
    while (currentIndex > 0) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

const App = () => {
    const [isSimulationOn, setIsSimulationOn] = useState<boolean>(false)
    const [numberOfPlayers, setNumberOfPlayers] = useState<number>(200)
    const [timeOfSimulation, setTimeOfSimulation] = useState<number>(10000)

    const start = async () => {
        await axios.post(`${RANDOM_MOVEMENT_SERVER_API_URL}/map`, simulationJSON ,{
            headers: {
                'Content-Type': 'application/json'
              }
        })
        .then((response) => {
            const data: MapData = response.data
            shuffle(data.privateTiles)
            const simulationData = startSimulation(response.data, numberOfPlayers, timeOfSimulation, () => {
                stopSimulation(simulationData!)
                document.body.style.overflow = 'auto'
                setIsSimulationOn(false)
                setNumberOfPlayers(200)
                setTimeOfSimulation(10000)
            })
            document.body.style.overflow = 'hidden'
            setIsSimulationOn(true)
        })
        .catch((error) => {
            console.error(error)
        })
    }

    return (
        <div style={{height: '100vh', width: '100vw'}}>
            <div id='simulation-content' style={{display: `${isSimulationOn ? 'flex' : 'none'}`}} className='w-100 h-100 flex-row-reverse'>
                <div className='flex-grow-1 d-flex justify-content-center align-items-center'>
                    Info Dashboard
                </div>
            </div>
            <div id='simulation-form' style={{display: `${isSimulationOn ? 'none' : 'flex'}`}} className='w-100 h-100 flex-column justify-content-center align-items-center row-gap-2'>
                <h1>Simulation</h1>
                <div className='d-flex flex-column'>
                    <label htmlFor='numberOfPlayers'>Number of players</label>
                    <input id='numberOfPlayers' type='number' min={1} max={200} value={numberOfPlayers} onChange={(e) => {
                        setNumberOfPlayers(parseInt(e.target.value))
                    }}/>
                </div>
                <div className='d-flex flex-column'>
                    <label htmlFor='timeOfSimulation'>Time of simulation (in miliseconds)</label>
                    <input id='timeOfSimulation' type='number' min={1} max={1000000} value={timeOfSimulation} onChange={(e) => {
                        setTimeOfSimulation(parseInt(e.target.value))
                    }}/>
                </div>
                <button className='pe-auto' onClick={start}>Start Simulation</button>
            </div>
        </div>
    )
}
export default App
