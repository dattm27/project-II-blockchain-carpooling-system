import React, { useState, useEffect } from 'react';
import { getPendingPassengers } from '../api';
import { Table, Button } from 'react-bootstrap';

const ProcessRide = ({ rideId }) => {
  const [pendingPassengers, setPendingPassengers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pending = await getPendingPassengers(rideId);
        setPendingPassengers(pending);
      } catch (error) {
        console.error('Error fetching pending passengers:', error);
      }
    };
    fetchData();
  }, [rideId]);

  const handleAccept = async (passengerIndex) => {
    try {
      //await acceptPassenger(rideId, passengerIndex);
      const updatedPassengers = pendingPassengers.filter((_, index) => index !== passengerIndex);
      setPendingPassengers(updatedPassengers);
    } catch (error) {
      console.error('Error accepting passenger:', error);
    }
  };

  const handleDecline = async (passengerIndex) => {
    try {
      //await declinePassenger(rideId, passengerIndex);
      const updatedPassengers = pendingPassengers.filter((_, index) => index !== passengerIndex);
      setPendingPassengers(updatedPassengers);
    } catch (error) {
      console.error('Error declining passenger:', error);
    }
  };

  return (
    <div className='container'>
      <h2 className='h2'>Pending</h2>
      <Table   hover>
        <thead>
          <tr>
            <th>Phone Number</th>
            <th>Number of People</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pendingPassengers.map((passenger, index) => (
            <tr key={index}>
              <td>{passenger.phoneNumber}</td>
              <td>{passenger.numOfPeople}</td>
              <td>
                <Button variant="success" onClick={() => handleAccept(index)}>Accept</Button>{' '}
                <Button variant="danger" onClick={() => handleDecline(index)}>Decline</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <h2 className='h2'>Passengers</h2>
    </div>
  );
};

export default ProcessRide;
