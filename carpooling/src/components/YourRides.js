import React, { useEffect, useState } from 'react';
import { getCreatedRides, getRideDetails } from '../api';
import { Card } from 'react-bootstrap';
const YourRides = ({ account }) => {
  const [createdRides, setCreatedRides] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rideIds = await getCreatedRides(account);
        const rides = await Promise.all(rideIds.map(async (rideId) => {
          const rideDetails = await getRideDetails(rideId);
          console.log(rideDetails);
          return {
            id: rideId,
            startPoint: rideDetails[2],
            endPoint: rideDetails[3],
            fare: rideDetails[4],
            startTime: new Date(Number(rideDetails[5]) * 1000).toLocaleString(),
            isActive: rideDetails[8].toString(),
            numOfSeats: rideDetails[6].toString(),
            numOfPassengers: rideDetails[7].toString()
          };
        }));
        setCreatedRides(rides);
      } catch (error) {
        console.error('Error fetching rides:', error);
      }
    };

    fetchData();
  }, [account]);

  return (
    <div>
      <h2>Your Rides:</h2>
      <h3>Created Rides: </h3>
      <div className="row">
        {createdRides.map((ride, index) => (
          <div key={index} className="col-md-4 mb-3">
            <Card>
              <Card.Body>
                <Card.Title>From: {ride.startPoint}</Card.Title>
                <Card.Text>
                  To: {ride.endPoint}<br />
                  Start Time: {ride.startTime}<br />
                  Status: {ride.isActive ? 'Active' : 'Inactive'}<br />
                  Number of passengers: {ride.numOfPassengers}
                </Card.Text>
                {/* Hiển thị các thông tin khác của chuyến xe */}
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
      <h3>Joined Rides: </h3>
    </div>
  );
};

export default YourRides;
