import React, { useEffect, useState } from 'react';
import { getCreatedRides, getRideDetails, getJoinedRides, getNumOfPendings, arrivedRide } from '../api'; // Đảm bảo bạn đã triển khai hàm getJoinedRides trong tệp api.js
import { Card, Button } from 'react-bootstrap';

const YourRides = ({ account, handleTabChange, setSelectedRideId }) => {
  const [createdRides, setCreatedRides] = useState([]);
  const [joinedRides, setJoinedRides] = useState([]);
  const [fetch, setFetch] = useState(false);
  const processRide = (rideId) => {
    setSelectedRideId(rideId);
    handleTabChange('process');
  };
  async function handleArrivedRide (rideId) {
    try {
      await arrivedRide(rideId, account);
      setFetch(true);
    }
    catch (error){
      console.log("Error when arrive");

    }
  }
  useEffect(() => {
   
    const fetchData = async () => {
      
      try {
        console.log('getRideOf', account);
        const createdRideIds = await getCreatedRides(account);
        const joinedRideIds = await getJoinedRides(account);

        const createdRidesData = await Promise.all(createdRideIds.map(async (rideId) => {
          const rideDetails = await getRideDetails(rideId);
          const numOfPendings = await getNumOfPendings(rideId);
          return {
            id: rideId,
            startPoint: rideDetails[2],
            endPoint: rideDetails[3],
            fare: rideDetails[4],
            startTime: new Date(Number(rideDetails[5]) * 1000).toLocaleString(),
            isActive: rideDetails[8].toString(),
            numOfPassengers: rideDetails[7].toString(),
            numOfPendings: numOfPendings.toString()
          };
        }));

        const joinedRidesData = await Promise.all(joinedRideIds.map(async (rideId) => {
          const rideDetails = await getRideDetails(rideId);
          return {
            id: rideId,
            startPoint: rideDetails[2],
            endPoint: rideDetails[3],
            fare: rideDetails[4],
            startTime: new Date(Number(rideDetails[5]) * 1000).toLocaleString(),
            isActive: rideDetails[8],
            numOfPassengers: rideDetails[7].toString()
          };
        }));

        setCreatedRides(createdRidesData);
        setJoinedRides(joinedRidesData);
        setFetch(false);
      } catch (error) {
        console.error('Error fetching rides:', error);
      }
    };

    fetchData();
  }, [account, setSelectedRideId, fetch]);

  return (
    <div className='container'>
      <h2 className='h2'>Your Rides:</h2>
      <h3 className='h3'>Created Rides: </h3>
      <div className="row">
        {createdRides.slice().reverse().map((ride, index) => (
          <div key={index} className="col-md-4 mb-3">
            <Card>
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Title>From: {ride.startPoint}</Card.Title>
                  <Card.Text>
                    To: {ride.endPoint}<br />
                    Time: {ride.startTime}<br />
                    Status: {ride.isActive ==='true' ? 'Active' : 'Inactive'}<br />
                    Passengers: {ride.numOfPassengers} - Pendings: {ride.numOfPendings}
                  </Card.Text>
                </div>
                <Button onClick={() => processRide(ride.id) } variant="primary">
                  Process
                </Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
      <h3 className='h3'>Joined Rides: </h3>
      <div className="row">
        {joinedRides.map((ride, index) => (
          <div key={index} className="col-md-4 mb-3">
            <Card>
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Title>From: {ride.startPoint}</Card.Title>
                  <Card.Text>
                    To: {ride.endPoint}<br />
                    Start Time: {ride.startTime}<br />
                    Status: {ride.isActive ? 'Active' : 'Inactive'}<br />
                    Number of passengers: {ride.numOfPassengers}
                  </Card.Text>
                </div>
                <Button onClick={() => handleArrivedRide(ride.id) } variant="success">
                  Arrived
                </Button> 
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YourRides;
