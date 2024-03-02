import { useState } from 'react'
import './App.css'
import { SimulationData, startSimulation, stopSimulation } from './simulation/Simulation'

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
        const simulationData = startSimulation(stop)
        setSimulationData(simulationData)
        document.body.style.overflow = 'hidden'
        setIsSimulationOn(true)
    }

    return isSimulationOn ? (
        <div id='simulation-content' />
    ) : (
        <div id='simulation-form'>
            <h1>Simulation</h1>
            <div>
                <label htmlFor="">X</label>
                <input type="text" />
            </div>
            <div>
                <label htmlFor="">Y</label>
                <input type="text" />
            </div>
            <div>
                <label htmlFor="">Z</label>
                <input type="text" />
            </div>                        
            <button onClick={start}>Start Simulation</button>
        </div>
    )
}
export default App
