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
    const [showSuccessModal, setShowSuccessModal] = useState(false); // State để điều khiển modal hiển thị sau khi tham gia chuyến đi thành công
    const handleCloseSuccessModal = () => setShowSuccessModal(false); // Hàm đóng modal thành công
    const handleShowSuccessModal = () => setShowSuccessModal(true); // Hàm mở modal thành công

    const handleCheckYourRideList = () => {
        handleCloseSuccessModal(); // Đóng modal thành công khi chuyển sang tab chuyến của bạn
        // Thêm bất kỳ logic nào khác bạn muốn thực hiện khi chuyển sang tab chuyến của bạn
    };
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        const fetchAvailableRides = async () => {
            try {
                //lấy ra các chuyến xe available
               // console.log('join account', account);
                const rides = await getAvailableRides(account);
               
                setAvailableRides(rides);
                //console.log(rides);
            } catch (error) {
                console.error('Error fetching available rides:', error);
            }
        };

        fetchAvailableRides();
    }, []);

    const handleJoinRide = async() => {
        // Xử lý logic khi người dùng tham gia chuyến đi
        console.log('Joining ride:', selectedRide);
        console.log('Phone number:', phoneNumber);
        console.log('Number of passengers:', numOfPeople);
        try {
            // Thực hiện gọi hàm joinPendingRide
            await joinPendingRide(selectedRide.id, phoneNumber, numOfPeople, account, selectedRide.fare*numOfPeople);
           //alert('Pending');
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
            <Modal show={showSuccessModal} onHide={handleCloseSuccessModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Ride Joined Successfully</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>You have successfully joined the ride!</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseSuccessModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleCheckYourRideList}>
                        Check Your Ride List
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* Danh sách các chuyến đi sẵn sàng */}
            <div className="d-flex flex-wrap justify-content-center">
               {availableRides.length > 0 ? (
                    availableRides.map((ride, index) => (
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
                    ))
                ) : (
                    <p className='text-center fs-5' style={{margin: '5px'}}>No available rides</p>
                )}
            </div>
            
        </>
    );
};

export default JoinRide;
