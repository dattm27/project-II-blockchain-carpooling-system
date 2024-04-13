import React, { useState, useEffect } from 'react';
import { getPendingPassengers, acceptPassenger, getPassenger, completeRide, getRideDetails, declinePassenger } from '../api';
import { Table, Button } from 'react-bootstrap';

const ProcessRide = ({account, rideId , handleTabChange}) => {
  const [pendingPassengers, setPendingPassengers] = useState([]);
  const [acceptedPassengers, setAcceptedPassengers] = useState([]);
  const [rideStatus, setRideStatus] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const pending = await getPendingPassengers(rideId);
        const accepted = await getPassenger(rideId);
        const ride  = await getRideDetails(rideId);
        console.log(ride);
        setPendingPassengers(pending);
        setAcceptedPassengers(accepted);
        setRideStatus(ride.isActive.toString());
        console.log(rideStatus);
      } catch (error) {
        console.error('Error fetching pending passengers:', error);
      }
    };
    fetchData();
  }, [rideId,rideStatus]);

  const handleAccept = async (index) => {
    try {
      await acceptPassenger(rideId, index,account);
      const updatedPassengers = [...pendingPassengers];
      updatedPassengers.splice(index, 1);
      setPendingPassengers(updatedPassengers);
      const accepted = await getPassenger(rideId)
      setAcceptedPassengers(accepted);
      
    } catch (error) {
      console.error('Error accepting passenger:', error);
    }
  };

  const handleDecline = async (passengerAddress, passengerIndex) => {
    try {
      //await declinePassenger(rideId, passengerIndex);
      await declinePassenger(rideId, passengerIndex, account);  
      const updatedPassengers = pendingPassengers.filter((_, index) => index !== passengerIndex);
      setPendingPassengers(updatedPassengers);
      
    } catch (error) {
      console.error('Error declining passenger:', error);
    }
  };
  const handleCompleteRide  = async() => {
    try {
      console.log('id' + rideId);
      await completeRide(rideId, account);
      setRideStatus('false');
    }
    catch (error){
      console.error('Failed to complete ride');
    }
  };

  const handleBack = async () => {
    console.log('Back');
    handleTabChange('home');
  }

  return (
    <div className='container'>
      <Button variant="primary" style= {{marginTop: '1rem', marginRight: '.5rem'}} onClick = {() => handleBack()} >Back</Button>
      {rideStatus === 'true' && (
        <Button variant="primary" onClick={() => handleCompleteRide(rideId)} style={{ marginTop: '1rem' }}>Complete Ride</Button>
      )}
   
      <h2 className='h2'>Pending ({pendingPassengers.length})</h2>
      {pendingPassengers.length > 0 && (
        <>
          
          <Table hover>
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
                  <td>{passenger.numOfPeople.toString()}</td>
                  <td>
                    <Button variant="success" onClick={() => handleAccept(index)}>Accept</Button>{' '}
                    <Button variant="danger" onClick={() => handleDecline( passenger.addr, index)}>Decline</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <hr></hr>
        </>
      )}
      <h2 className='h2'>Accepted ({acceptedPassengers.length})</h2>
      
      {acceptedPassengers.length > 0 && (
        <>
        
          <Table hover>
            <thead>
              <tr>
                <th>Phone Number</th>
                <th>Number of People</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {acceptedPassengers.map((passenger, index) => (
                <tr key={index}>
                  <td>{passenger.phoneNumber}</td>
                  <td>{passenger.numOfPeople.toString()}</td>
                  <td>
                    {/* Thêm nút hoặc hành động cho danh sách hành khách đã chấp nhận (nếu cần) */}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>

  );
};

export default ProcessRide;
