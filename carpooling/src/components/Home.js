import React, { useEffect, useState } from 'react';
import { Nav, Navbar, Container } from 'react-bootstrap';
import CreateRide from './CreateRide';
import YourRides from './YourRides';
import JoinRide from './JoinRide';
import ProcessRide from './ProcessRide';
import RideHistory from './History';
import Balance from './Balance';
function Home({walletAddress})  {
    //properties
    const [activeTab, setActiveTab] = useState('home');
    const [selectedRideId, setSelectedRideId] = useState(null); // Khai báo selectedRideId ở đây
    const handleSelect = (selectedTab) => {
            setActiveTab(selectedTab);
    };
    useEffect (() => {
      //the code that we want to run
      //console.log("Home account" , walletAddress);
      //Khi đã đăng nhập vào ví Metamask, chuyến đến màn hình chính
      //optional return function 
      return () =>{
        console.log('I am being cleaned up!');
      }
    }, [walletAddress, selectedRideId]); // The dependencies array
    return (
        <div className="">
           
              <Navbar  collapseOnSelect bg="light" expand="lg">
                <Container>
                  <Navbar.Brand href="#">Carpooling</Navbar.Brand>
                  <Navbar.Toggle aria-controls="basic-navbar-nav" />
                  <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto" activeKey={activeTab} onSelect={handleSelect}>
                      <Nav.Item>
                        <Nav.Link eventKey="home">Home</Nav.Link>
                      </Nav.Item>
                     <Nav.Item>
                        <Nav.Link eventKey="create">Create Ride</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="join">Join Ride</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="history">Ride History</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="balance">Balance History</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="balance">Account</Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Navbar.Collapse>
                </Container>
              </Navbar>
              {activeTab === 'home' && (
                <div className='container'>
                 <YourRides account ={walletAddress} handleTabChange={handleSelect} setSelectedRideId={setSelectedRideId}  />
                </div>
              )}
              {activeTab === 'create' && (
                <div className='container'>
                 <CreateRide account ={walletAddress} handleTabChange={handleSelect}/>
                </div>
              )}
              {activeTab === 'join' && (
                <div>
                  <JoinRide account ={walletAddress} handleTabChange={handleSelect}/>
                </div>
              )}
              {activeTab === 'history' && (
                <div>
                 <RideHistory account={ walletAddress}/>
                </div>
              )}
              {activeTab === 'process' && selectedRideId && (
                <ProcessRide account ={walletAddress} rideId={selectedRideId}  handleTabChange={handleSelect}/>
              )} 
              {activeTab === 'balance' && (
                <div>
                 <Balance account={ walletAddress}/>
                </div>
              )}
        </div>
    )
}

export default Home;