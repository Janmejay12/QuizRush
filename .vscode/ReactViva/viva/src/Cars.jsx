import React from 'react'
import './Cars.css'
const  CarsList = [
    {id : 1, name : "Honda city", fuelType : "petrol"},
        {id : 2, name : "bmw", fuelType : "diesel"},
        {id : 3, name : "audi", fuelType : "diesel"},
        {id : 4, name : "alto", fuelType : "petrol"}
]
const Cars = () => {
    const dieselCars = CarsList.filter((car) => car.fuelType === "diesel");
    const petrolCars = CarsList.filter((car) => car.fuelType === "petrol");
  return (
    <div>
        <h1>Cars List</h1>
        <div className='car-container'>
            <h2>Diesel Cars</h2>
            <ul >
                {dieselCars.map((car) => (
                    <li className='car' key = {car.id}>{car.name}</li>
                ))}
            </ul>
        </div>

        <div className='car-container'>
            <h2>Petrol Cars</h2>
            <ul>
                {petrolCars.map((car) => (
                    <li className='car' key = {car.id}>{car.name}</li>
                ))}
            </ul>
        </div>
      
    </div>
  )
}

export default Cars
