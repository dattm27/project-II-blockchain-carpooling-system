import React, { useState, useEffect } from 'react';
import { getPendingPassengers, acceptPassenger, getPassenger, completeRide, getRideDetails, declinePassenger, getEventListener } from '../api';
import { Table, Button } from 'react-bootstrap';
import Map from './Mapbox';

const ProcessRide = ({account, rideId , handleTabChange}) => {
  const [pendingPassengers, setPendingPassengers] = useState([]);
  const [acceptedPassengers, setAcceptedPassengers] = useState([]);
  const [rideStatus, setRideStatus] = useState(null);
  //cặp toạ độ điểm đầu và kết thúc để truyền vào map 
  const [startPointCoordinates, setStartPointCoordinates] = useState(null);
  const [endPointCoordinates, setEndPointCoordinates] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const pending = await getPendingPassengers(rideId);
        const accepted = await getPassenger(rideId);
        const ride  = await getRideDetails(rideId);
        const startLongitude= Number(ride.startLongitude)/10000000000;
        const startLatitude = Number(ride.startLatitude)/10000000000;
        const endLongitude = Number(ride.endLongitude)/10000000000;
        const endLatitude = Number(ride.endLatitude)/10000000000;
        // đặt thành cặp toạ độ điểm đầu và cuối truyền vào map
        setStartPointCoordinates([  startLongitude,  startLatitude ]);
        setEndPointCoordinates([  endLongitude,  endLatitude ]);
        console.log(startLongitude, ' ', startLatitude );
        console.log(endLongitude,' ', endLatitude);
        setPendingPassengers(pending);
        setAcceptedPassengers(accepted);
        setRideStatus(ride.isActive.toString());
        //console.log(rideStatus);
      } catch (error) {
        console.error('Error fetching pending passengers:', error);
      }
    };
    // lắng nghe sự kiện có người join, hoặc được accept, hoặc bị từ chối
    const listenToEvent = async() =>{
      console.log('PassengerArrived listener added');
      const listener = await getEventListener();
      listener.on("PassengerArrived", (_rideId, passenger)=>{
          let data = {_rideId, passenger};
          console.log(data);
          
          console.log('PassengerArrived event emitted');
          if(rideId ===_rideId) fetchData();
          
      }); 
      console.log('PassengerJoined listener added');
      listener.on("PassengerJoined", (_rideId, passenger, phoneNumber, numOfPeople, driver) => {
        let data={driver};
        //console.log('driver', data, 'account', account);
        console.log('PassengerJoined event emitted');
        if(rideId ===_rideId) fetchData();
      })
      console.log('PassengerCancelled listener added');
      listener.on("PassengerCancelled", (_rideId, _passenger) => {
        //let data={driver};
        //console.log('driver', data, 'account', account);
        console.log('PassengerJoined event emitted');
        if(rideId ===_rideId) fetchData();
      })
    }
    fetchData();
    listenToEvent();
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
      handleTabChange('home');
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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {acceptedPassengers.map((passenger, index) => (
                <tr key={index}>
                  <td>{passenger.phoneNumber}</td>
                  <td>{passenger.numOfPeople.toString()}</td>
                  <td>
                    {passenger.arrived ? 'Arrived' : 'On ride'}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
       
      )}
        {startPointCoordinates && endPointCoordinates && (
        <Map startPointCoordinates={startPointCoordinates} endPointCoordinates={endPointCoordinates} />
      )}
    </div>

  );
};

export default ProcessRide;
