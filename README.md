# Disease Spread Simulation

## Description

This project implements a simulation of disease spread in a population with various configurable parameters.

## Simulation

![Simulation](/img/simulation.png)

## Simulation Configuration

You can configure the simulation in two ways:

- _Interactive Configuration_:

  Fill out the form and click the Start Simulation button.

- _File Upload Configuration_:

  Upload a JSON configuration file using the Upload button.
  The file should have the following format:

```json
{
  "numberOfSimulations": 5,
  "numberOfPlayers": 60,
  "timeOfSimulation": 10,
  "walkingSpeed": 5,
  "data": [
    {
      "probabilityOfInfection": 0.2,
      "probabilityOfInfectionAtTheBeginning": 0.1,
      "recoveryTime": 10,
      "recoveryTimeDispersion": 5,
      "immunityTime": 0,
      "immunityTimeDispersion": 0,
      "immunityRate": 0.0,
      "publicPlaceSpendingTime": 2,
      "publicPlaceSpendingTimeDispersion": 1,
      "privatePlaceSpendingTime": 2,
      "privatePlaceSpendingTimeDispersion": 1,
      "timeSpendingInHomeWhenIll": 0,
      "rangeOfDiseaseSpread": 1
    }
  ]
}
```

### Standard Parameters

- _Number of Players_: Specify the total number of individuals in the simulation (1-200).
- _Time of Simulation_: Set the duration of the simulation in seconds (1-1000000).
- _Probability of Infection_: Adjust the probability of infection for each interaction.
- _Probability of Infection at the Beginning_: Set the initial probability of infection for each individual.

### Recovery Parameters

- _Recovery Time_: Define the time it takes for an individual to recover from the infection (in seconds).
- _Recovery Time Dispersion_: Set the dispersion of recovery time.
- _Immunity Time_: Specify the duration of immunity after recovery (in seconds).
- _Immunity Time Dispersion_: Set the dispersion of immunity time.
- _Immunity Rate_: Define the probability of developing immunity after recovery.

### Map Activity Parameters

- _Public Place Spending Time_: Set the time spent in public places (in seconds).
- _Public Place Spending Time Dispersion_: Set the dispersion of public place spending time.
- _Private Place Spending Time_: Set the time spent in private places (in seconds).
- _Private Place Spending Time Dispersion_: Set the dispersion of private place spending time.

### Special Parameters

- _Time Spending in Home When Ill_: Define the time individuals spend at home when they are ill (in seconds).
- _Range of Disease Spread_: Set the range of disease spread.
- _Walking Speed_: Adjust the walking speed of individuals.

## Data Analysis

After running a simulation, you can analyze the data by clicking the "Analyze Data" button. The analysis results are displayed in a grid, showing correlations between various simulation parameters.
