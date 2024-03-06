import { useState } from 'react'
import './App.css'
import { startSimulation, stopSimulation } from './simulation/Simulation'
import axios from 'axios'
import simulationJSON from '../assets/simulation.json'

const RANDOM_MOVEMENT_SERVER_API_URL: string = import.meta.env
    .VITE_RANDOM_MOVEMENT_SERVER_API_URL as string
const ANALYTICS_SERVER_API_URL: string = import.meta.env
    .VITE_ANALYTICS_SERVER_API_URL as string
export const analyticsData: AnalData[] = []

export interface MapData {
    id: string,
    privateTiles: {
        x: number,
        y: number,
    }[],
    width: number,
    height: number,
}

export interface AnalData {
    noPeople: number,
    time: number,
    probabilityOfInfection: number,
    probabilityOfInfectionAtStart: number,
    avg: number,
    max: number,
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

const getCorrelation = () => {
    axios.post(`${ANALYTICS_SERVER_API_URL}/analysis`, JSON.stringify({data: analyticsData}) ,{
        headers: {
            'Content-Type': 'application/json'
          }
    })
    .then((response) => {
        console.log(response.data)
    })
    .catch((error) => {
        console.error(error)
    })
}

const App = () => {
    const [isSimulationOn, setIsSimulationOn] = useState<boolean>(false)
    const [numberOfIll, setNumberOfIll] = useState<number>(0)

    const [numberOfPlayers, setNumberOfPlayers] = useState<number>(200)
    const [timeOfSimulation, setTimeOfSimulation] = useState<number>(10)
    const [probabilityOfInfection, setProbabilityOfInfection] = useState<string>('0.2')
    const [probabilityOfInfectionAtTheBeginning, setProbabilityOfInfectionAtTheBeginning] = useState<string>('0.1')

    const [recoveryTime, setRecoveryTime] = useState<number>(10)
    const [recoveryTimeDispersion, setRecoveryTimeDispersion] = useState<number>(5)
    const [immunityTime, setImmunityTime] = useState<number>(0)
    const [immunityTimeDispersion, setImmunityTimeDispersion] = useState<number>(0)
    const [immunityRate, setImmunityRate] = useState<string>('0.0')

    const [publicPlaceSpendingTime, setPublicPlaceSpendingTime] = useState<number>(2)
    const [publicPlaceSpendingTimeDispersion, setPublicPlaceSpendingTimeDispersion] = useState<number>(1)
    const [privatePlaceSpendingTime, setPrivatePlaceSpendingTime] = useState<number>(2)
    const [privatePlaceSpendingTimeDispersion, setPrivatePlaceSpendingTimeDispersion] = useState<number>(1)

    const [timeSpendingInHomeWhenIll, setTimeSpendingInHomeWhenIll] = useState<number>(0)
    const [rangeOfDiseaseSpread, setRangeOfDiseaseSpread] = useState<number>(1)
    const [walkingSpeed, setWalkingSpeed] = useState<number>(5)

    const start = async () => {
        const probabilityOfInfectionNumber = parseFloat(probabilityOfInfection)
        if (isNaN(probabilityOfInfectionNumber) || probabilityOfInfectionNumber < 0 || probabilityOfInfectionNumber > 1) {
            alert('Probability of infection must be a number between 0 and 1')
            return
        }
        const probabilityOfInfectionAtTheBeginningNumber = parseFloat(probabilityOfInfectionAtTheBeginning)
        if (isNaN(probabilityOfInfectionAtTheBeginningNumber) || probabilityOfInfectionAtTheBeginningNumber < 0 || probabilityOfInfectionAtTheBeginningNumber > 1) {
            alert('Probability of infection at the beginning must be a number between 0 and 1')
            return
        }
        const immunityRateNumber = parseFloat(immunityRate)
        if (isNaN(immunityRateNumber) || immunityRateNumber < 0 || immunityRateNumber > 1) {
            alert('Immunity rate number must be a number between 0 and 1')
            return
        }
        if (recoveryTimeDispersion > recoveryTime ||
            immunityTimeDispersion > immunityTime ||
            publicPlaceSpendingTimeDispersion > publicPlaceSpendingTime ||
            privatePlaceSpendingTimeDispersion > privatePlaceSpendingTime) {
            alert("Dispersion must be lower then base time")
            return
        }

        await axios.post(`${RANDOM_MOVEMENT_SERVER_API_URL}/map`, simulationJSON ,{
            headers: {
                'Content-Type': 'application/json'
              }
        })
        .then((response) => {
            const data: MapData = response.data
            shuffle(data.privateTiles)
            const simulationData = startSimulation(
                data, 
                numberOfPlayers, 
                timeOfSimulation * 1000, 
                probabilityOfInfectionNumber, 
                probabilityOfInfectionAtTheBeginningNumber,
                recoveryTime * 1000,
                recoveryTimeDispersion * 1000,
                immunityTime * 1000,
                immunityTimeDispersion * 1000,
                immunityRateNumber,
                publicPlaceSpendingTime * 1000,
                publicPlaceSpendingTimeDispersion * 1000,
                privatePlaceSpendingTime * 1000,
                privatePlaceSpendingTimeDispersion * 1000,
                timeSpendingInHomeWhenIll * 1000,
                rangeOfDiseaseSpread,
                walkingSpeed,
                (avg: number, max: number) => {
                    analyticsData.push({
                        noPeople: numberOfPlayers,
                        time: timeOfSimulation,
                        probabilityOfInfection: probabilityOfInfectionNumber,
                        probabilityOfInfectionAtStart: probabilityOfInfectionAtTheBeginningNumber,
                        avg: avg,
                        max: max})
                    stopSimulation(simulationData!)
                    document.body.style.overflow = 'auto'
                    setIsSimulationOn(false)

                    setNumberOfPlayers(200)
                    setTimeOfSimulation(10)
                    setProbabilityOfInfection('0.2')
                    setProbabilityOfInfectionAtTheBeginning('0.1')

                    setRecoveryTime(10)
                    setRecoveryTimeDispersion(5)
                    setImmunityTime(0)
                    setImmunityTimeDispersion(0)
                    setImmunityRate("0.0")

                    setPublicPlaceSpendingTime(2)
                    setPublicPlaceSpendingTimeDispersion(1)
                    setPrivatePlaceSpendingTime(2)
                    setPrivatePlaceSpendingTimeDispersion(1)

                    setTimeSpendingInHomeWhenIll(0)
                    setRangeOfDiseaseSpread(1)
                    setWalkingSpeed(5)

                    setNumberOfIll(0)
                },
                (n : number) => {
                    setNumberOfIll(n)
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
                <div className='flex-grow-1 d-flex flex-column justify-content-center align-items-center'>
                    <h1>Simulation</h1>
                    <p>Number of ill: <strong>{numberOfIll}</strong></p>
                </div>
            </div>
            <div id='simulation-form' style={{display: `${isSimulationOn ? 'none' : 'flex'}`}} className='m-auto w-90 h-100 py-20 flex-column justify-content-center align-items-center row-gap-2'>
                <h1>Simulation</h1>
                <div className='my-4 w-100 h-500 d-flex flex-row justify-content-center align-items-center row-gap-4'>
                    <div className='m-auto w-90 h-50 d-flex flex-column justify-content-center align-items-center row-gap-1'>
                        <h3>Standard Params</h3>
                        <div className='w-100 d-flex flex-column'>
                            <label htmlFor='numberOfPlayers'>Number of players</label>
                            <input id='numberOfPlayers' type='number' min={1} max={200} value={numberOfPlayers} onChange={(e) => {
                                setNumberOfPlayers(parseInt(e.target.value))
                            }}/>
                        </div>
                        <div className='w-100 d-flex flex-column'>
                            <label htmlFor='timeOfSimulation'>Time of simulation (in seconds)</label>
                            <input id='timeOfSimulation' type='number' min={1} max={1000000} value={timeOfSimulation} onChange={(e) => {
                                setTimeOfSimulation(parseInt(e.target.value))
                            }}/>
                        </div>
                        <div className='w-100 d-flex flex-column'>
                            <label htmlFor='ProbabilityOfInfection'>Probability of infection</label>
                            <input id='ProbabilityOfInfection' type='string' value={probabilityOfInfection} onChange={(e) => {
                                setProbabilityOfInfection(e.target.value)
                            }}/>
                        </div>
                        <div className='w-100 d-flex flex-column'>
                            <label htmlFor='ProbabilityOfInfectionAtTheBeginning'>Probability of infection at the beginning</label>
                            <input id='ProbabilityOfInfectionAtTheBeginning' type='string' value={probabilityOfInfectionAtTheBeginning} onChange={(e) => {
                                setProbabilityOfInfectionAtTheBeginning(e.target.value)
                            }}/>
                        </div>
                    </div>
                    <div className='m-auto w-90 h-50 d-flex flex-column justify-content-center align-items-center row-gap-1'>
                        <h3>Recovery Params</h3>
                        <div className='w-100 d-flex flex-column'>
                            <label htmlFor='recoveryTime'>Recovery time (in seconds)</label>
                            <input id='recoveryTime' type='number' min={10} max={100} value={recoveryTime} onChange={(e) => {
                                setRecoveryTime(parseInt(e.target.value))
                            }}/>
                        </div>
                        <div className='w-100 d-flex flex-column'>
                            <label htmlFor='recoveryTimeDispersion'>Recovery time dispersion (in seconds)</label>
                            <input id='recoveryTimeDispersion' type='number' min={5} max={100} value={recoveryTimeDispersion} onChange={(e) => {
                                setRecoveryTimeDispersion(parseInt(e.target.value))
                            }}/>
                        </div>
                        <div className='w-100 d-flex flex-column'>
                            <label htmlFor='immunityTime'>Immunity time (in seconds)</label>
                            <input id='immunityTime' type='number' min={0} max={100} value={immunityTime} onChange={(e) => {
                                setImmunityTime(parseInt(e.target.value))
                            }}/>
                        </div>
                        <div className='w-100 d-flex flex-column'>
                            <label htmlFor='immunityTimeDispersion'>Time of simulation (in seconds)</label>
                            <input id='immunityTimeDispersion' type='number' min={0} max={100} value={immunityTimeDispersion} onChange={(e) => {
                                setImmunityTimeDispersion(parseInt(e.target.value))
                            }}/>
                        </div>
                        <div className='w-100 d-flex flex-column'>
                            <label htmlFor='immunityRate'>Probability of player to be immune after illness</label>
                            <input id='immunityRate' type='string' value={immunityRate} onChange={(e) => {
                                setImmunityRate(e.target.value)
                            }}/>
                        </div>
                    </div>
                    <div className='m-auto w-90 h-50 d-flex flex-column justify-content-center align-items-center row-gap-1'>
                        <h3>Map Activity Params</h3>
                        <div className='w-100 d-flex flex-column'>
                            <label htmlFor='publicPlaceSpendingTime'>Public time spending (in seconds)</label>
                            <input id='publicPlaceSpendingTime' type='number' min={1} max={100} value={publicPlaceSpendingTime} onChange={(e) => {
                                setPublicPlaceSpendingTime(parseInt(e.target.value))
                            }}/>
                        </div>
                        <div className='w-100 d-flex flex-column'>
                            <label htmlFor='publicPlaceSpendingTimeDispersion'>Public time spending dispersion (in seconds)</label>
                            <input id='publicPlaceSpendingTimeDispersion' type='number' min={1} max={100} value={publicPlaceSpendingTimeDispersion} onChange={(e) => {
                                setPublicPlaceSpendingTimeDispersion(parseInt(e.target.value))
                            }}/>
                        </div>
                        <div className='w-100 d-flex flex-column'>
                            <label htmlFor='privatePlaceSpendingTime'>Private time spending (in seconds)</label>
                            <input id='privatePlaceSpendingTime' type='number' min={1} max={100} value={privatePlaceSpendingTime} onChange={(e) => {
                                setPrivatePlaceSpendingTime(parseInt(e.target.value))
                            }}/>
                        </div>
                        <div className='w-100 d-flex flex-column'>
                            <label htmlFor='privatePlaceSpendingTimeDispersion'>Private time spending dispersion (in seconds)</label>
                            <input id='privatePlaceSpendingTimeDispersion' type='number' min={1} max={100} value={privatePlaceSpendingTimeDispersion} onChange={(e) => {
                                setPrivatePlaceSpendingTimeDispersion(parseInt(e.target.value))
                            }}/>
                        </div>
                    </div>
                    <div className='m-auto w-90 h-50 d-flex flex-column justify-content-center align-items-center row-gap-1'>
                        <h3>Special Params</h3>
                        <div className='w-100 d-flex flex-column'>
                            <label htmlFor='timeSpendingInHomeWhenIll'>Time of resting in home when ill (if 0 then disabled)</label>
                            <input id='timeSpendingInHomeWhenIll' type='number' min={1} max={100} value={timeSpendingInHomeWhenIll} onChange={(e) => {
                                setTimeSpendingInHomeWhenIll(parseInt(e.target.value))
                            }}/>
                        </div>
                        <div className='w-100 d-flex flex-column'>
                            <label htmlFor='rangeOfDiseaseSpread'>Range of disease spread</label>
                            <input id='rangeOfDiseaseSpread' type='number' min={1} max={3} value={rangeOfDiseaseSpread} onChange={(e) => {
                                setRangeOfDiseaseSpread(parseInt(e.target.value))
                            }}/>
                        </div>
                        <div className='w-100 d-flex flex-column'>
                            <label htmlFor='walkingSpeed'>Walking speed</label>
                            <input id='walkingSpeed' type='number' min={2} max={10} value={walkingSpeed} onChange={(e) => {
                                setWalkingSpeed(parseInt(e.target.value))
                            }}/>
                        </div>
                    </div>
                </div>
                <button className='pe-auto' onClick={start}>Start Simulation</button>
                <button className='pe-auto' style={{display: `${analyticsData.length == 0 ? 'none' : 'block'}`}} onClick={getCorrelation}>Analyse Data</button>
            </div>
        </div>
    )
}

export default App
