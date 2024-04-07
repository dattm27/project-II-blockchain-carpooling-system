// JoinRide.js

import React, { useState, useEffect } from 'react';
import { getAvailableRides, joinPendingRide } from '../api';
import { Card, Button, Modal, Form } from 'react-bootstrap';

const JoinRide = ({ account }) => {
    const [show, setShow] = useState(false);
    const [availableRides, setAvailableRides] = useState([]);
    const [selectedRide, setSelectedRide] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [numOfPeople, setNumOfPeople] = useState('');

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        const fetchAvailableRides = async () => {
            try {
                //lấy ra các chuyến xe available
                const rides = await getAvailableRides();
                setAvailableRides(rides);
                //console.log(rides);
            } catch (error) {
                console.error('Error fetching available rides:', error);
            }
        };

        fetchAvailableRides();
    }, [account]);

    const handleJoinRide = async() => {
        // Xử lý logic khi người dùng tham gia chuyến đi
        console.log('Joining ride:', selectedRide);
        console.log('Phone number:', phoneNumber);
        console.log('Number of passengers:', numOfPeople);
        try {
            // Thực hiện gọi hàm joinPendingRide
            await joinPendingRide(selectedRide.id, phoneNumber, numOfPeople, account, selectedRide.fare*numOfPeople);
           
        } catch (error) {
            console.error('Error joining ride:', error);
            // Xử lý lỗi nếu có
        }
        //console.log('Joined ride successfully!');
        // Cập nhật giao diện hoặc thực hiện các tác vụ khác sau khi tham gia chuyến đi thành công
        // Đóng modal sau khi xác nhận tham gia chuyến đi
        handleClose();
    };

    return (
        <>
            {/* Hiển thị modal nhập thông tin join chuyến của passenger */}
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Join Ride</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="phoneNumber">
                        <Form.Label>Phone Number:</Form.Label>
                        <Form.Control type="text" placeholder="Enter your phone number" onChange={(e) => setPhoneNumber(e.target.value)} />
                    </Form.Group>
                    <Form.Group controlId="numOfPassengers">
                        <Form.Label>Number of Passengers:</Form.Label>
                        <Form.Control type="number" placeholder="Enter number of passengers" min='1' onChange={(e) => setNumOfPeople(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleJoinRide}>
                        Join Ride
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* Danh sách các chuyến đi sẵn sàng */}
            <div className="d-flex flex-wrap justify-content-center">
                {availableRides.map((ride, index) => (
                   
                    <Card key={index} style={{ width: '28rem', margin: '5px' }}>
                    <Card.Body className="d-flex justify-content-between align-items-center">
                        <div>
                            <Card.Title>{ride.startPoint} - {ride.endPoint}</Card.Title>
                            <Card.Text>
                                Start Time: {ride.startTime}
                                <br />
                                Fare: ETH {ride.fare}
                                <br />
                                Seats Available: {Number(ride.numOfSeats) - Number(ride.numOfPassengers)}
                            </Card.Text>
                        </div>
                        <Button variant="primary" onClick={() => { setSelectedRide(ride); handleShow(); }}>Join</Button>
                    </Card.Body>
                </Card>
                ))}
            </div>
        </>
    );
};

export default JoinRide;
