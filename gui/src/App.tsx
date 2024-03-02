import { useState } from 'react'
import './App.css'
import { SimulationData, startSimulation, stopSimulation } from './simulation/Simulation'
import axios from 'axios'
import simulationJSON from '../assets/simulation.json'

const RANDOM_MOVEMENT_SERVER_API_URL: string = import.meta.env
    .VITE_RANDOM_MOVEMENT_SERVER_API_URL as string


const App = () => {
    const [isSimulationOn, setIsSimulationOn] = useState<boolean>(false)
    const [simulationData, setSimulationData] = useState<SimulationData | null>(null)

    const stop = () => {
        stopSimulation(simulationData!)
        setSimulationData(null)
        document.body.style.overflow = 'auto'
        setIsSimulationOn(false)
    }

    const start = async () => {
        console.log(simulationJSON)
        await axios.post(RANDOM_MOVEMENT_SERVER_API_URL, simulationJSON ,{
            headers: {
                'Content-Type': 'application/json'
              }
        })
        .then((response) => {
            const simulationData = startSimulation(stop)
            setSimulationData(simulationData)
            document.body.style.overflow = 'hidden'
            setIsSimulationOn(true)
        })
        .catch((error) => {
            console.log(error)
        })
    }

    return isSimulationOn ? (
        <div id='simulation-content'/>
    ) : (
        <div id='simulation-form' className='w-100 d-flex flex-column justify-content-center align-items-center row-gap-2' style={{height: '100vh'}}>
            <h1>Simulation</h1>
            <div className='d-flex flex-column'>
                <label htmlFor=''>X</label>
                <input type='text' />
            </div>
            <div className='d-flex flex-column'>
                <label htmlFor=''>Y</label>
                <input type='text' />
            </div>
            <div className='d-flex flex-column'>
                <label htmlFor=''>Z</label>
                <input type='text' />
            </div>
            <button className='pe-auto' onClick={start}>Start Simulation</button>
        </div>
    )
}
export default App
