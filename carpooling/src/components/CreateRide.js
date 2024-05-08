import React, { useState } from 'react';
import RideContract from '../contracts/RideContract.json';
import Web3 from 'web3';
import { Modal, Button } from 'react-bootstrap'; // Import Modal và các thành phần khác từ React Bootstrap
import { createRide } from '../api';
import MapComponent from './Map';
import mapboxgl from 'mapbox-gl';
import Select from 'react-select';

import SearchLocation from './SearchLocation';
// Thay thế 'your-access-token' bằng access token của bạn
mapboxgl.accessToken = 'pk.eyJ1IjoiZGF0dG0wMyIsImEiOiJjbHZ3aWs2dmIwZG1pMnFvZ2JzczBxYTZwIn0.f8D93mAehFFbbIhmaH83pA';


function CreateRide({account, handleTabChange} ) {
  const [startPoint, setStartPoint] = useState('');
  const [startPointOptions, setStartPointOptions] = useState([]);
  const [endPointOptions, setEndPointOptions] = useState([]);
  const [endPoint, setEndPoint] = useState('');
  const [fare, setFare] = useState(0);
  const [startTime, setStartTime] = useState('');
  const [numOfSeats, setNumOfSeats] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State để kiểm soát hiển thị modal
  const now = new Date();
  const formattedNow = now.toISOString().slice(0, 16); // Định dạng thời gian hiện tại thành YYYY-MM-DDTHH:MM
  const handleCheckYourRideList = () => {
    //onCheckYourRideList(); // Gọi hàm để thay đổi tab sang "Home"
    setShowSuccessModal(false); // Đóng modal thông báo
    handleTabChange('home'); // Chuyển tab sang "Home"
  };
  const handleClose = () => setShowSuccessModal(false);
 
  const handleCreateRide = async () => {
    // Kiểm tra các trường yêu cầu
    if (!startPoint || !endPoint || !fare || !startTime || !numOfSeats) {
      // Nếu bất kỳ trường nào còn trống, hiển thị thông báo hoặc thực hiện hành động phù hợp
      alert('Please fill in all required fields.');
      return; // Ngăn chặn việc tiếp tục thực hiện hành động
    }
    try {
      
      // const  web3 = new Web3(window.ethereum);
      // const accounts = await web3.eth.getAccounts();
      // const networkId = await web3.eth.net.getId();
      // const deployedNetwork = RideContract.networks[networkId];
      // const contract = new web3.eth.Contract(
      //   RideContract.abi,
      //   deployedNetwork && deployedNetwork.address
      // );

      // Convert the start date and time to Unix timestamp
      const startTimeUnix = Math.floor(new Date(startTime).getTime() / 1000);

      await createRide(startPoint, endPoint, fare, startTimeUnix, numOfSeats, account);
      setShowSuccessModal(true); // Hiển thị modal thông báo thành công
     
    } catch (error) {
        console.error('Error creating ride:', error);
      alert('Failed to create ride. Please try again.');
    }
  };

  return (
    <div>
        <h2>Create Ride</h2>
        <div className="row">
        <div className="col-md-6">
            <label>From:</label>
            {/* <input type="text" className="form-control" required value={startPoint} onChange={(e) => setStartPoint(e.target.value)} />  */}
            <SearchLocation setStartPoint={setStartPoint} />

        </div>
        <div className="col-md-6">
            <label>To:</label>
            {/* <input type="text" className="form-control" required value={endPoint} onChange={(e) => setEndPoint(e.target.value)} /> */}
            <SearchLocation setEndPoint={setEndPoint} />
        </div>
        </div>
        <div className="row">
        <div className="col-md-6">
            <label>Fare:</label>
            <input type="number" className="form-control" required value={fare} min ='0' onChange={(e) => setFare(e.target.value)} />
        </div>
        <div className="col-md-6">
            <label>Start Time:</label>
            <input type="datetime-local" className="form-control" required value={startTime}min={formattedNow} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        </div>
        <div className="row">
        <div className="col-md-6">
            <label>Number of Seats:</label>
            <input type="number" className="form-control" required value={numOfSeats} min='1'onChange={(e) => setNumOfSeats(e.target.value)} />
        </div>
        </div>
        <button className="btn btn-primary mt-3" onClick={handleCreateRide}>Create Ride</button>
        {/* <SearchLocation/> */}
        <Modal show={showSuccessModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Ride Created Successfully</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Your ride has been created successfully!</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleCheckYourRideList}>
              Check Your Ride List
            </Button>
          </Modal.Footer>
        </Modal>
    
        
    </div>
    
  
  );
}

export default CreateRide;
