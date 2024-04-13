import React, { useState, useEffect } from 'react';
import { getRideHistory, getRideDetails } from '../api'; // Thay thế bằng hàm API thích hợp để lấy lịch sử chuyến đi
import { Card } from 'react-bootstrap';

const RideHistory = ({ account }) => {
    const [rideHistory, setRideHistory] = useState([]);

    useEffect(() => {
        const fetchRideHistory = async () => {
            try {
                // Gọi hàm API để lấy lịch sử chuyến đi dựa trên tài khoản của người dùng
                const history = await getRideHistory(account);
                setRideHistory(history);
                const historyRideDetails = await Promise.all(history.map(async (rideId) => {
                    const rideDetails = await getRideDetails(rideId);
                    return {
                      id: rideId,
                      startPoint: rideDetails[2],
                      endPoint: rideDetails[3],
                      fare: rideDetails[4],
                      startTime: new Date(Number(rideDetails[5]) * 1000).toLocaleString(),
                      isActive: rideDetails[8].toString(),
                      numOfPassengers: rideDetails[7].toString(),
               
                    };
                  }));
                
                setRideHistory(historyRideDetails)
                console.log('History',historyRideDetails);
            } catch (error) {
                console.error('Error fetching ride history:', error);
            }
        };

        fetchRideHistory();
    }, [account]);

    return (
        <div className='container'>
        <h2>Ride History</h2>
        {rideHistory.length > 0 ? (
            rideHistory.slice().reverse().map((ride, index) => (
                <Card key={index} style={{ width: '28rem', margin: '5px' }}>
                    <Card.Body className="d-flex justify-content-between align-items-center">
                        <div>
                            <Card.Title>{ride.startPoint} - {ride.endPoint}</Card.Title>
                            <Card.Text>
                                Start Time: {ride.startTime}
                            </Card.Text>
                        </div>
                    </Card.Body>
                </Card>
            ))
        ) : (
            <p className="text-center fs-5">No ride history found</p>
        )}
    </div>
    );
};

export default RideHistory;
