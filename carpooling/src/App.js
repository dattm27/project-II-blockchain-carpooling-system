// import logo from './logo.svg';
// import './App.css';
 import CreateRide from './components/CreateRide';
// import Web3 from 'web3';
// import React, { Component } from 'react';
import YourRides from './components/YourRides';
import MetamaskConnect from './components/Metamask';
import JoinRide from './components/JoinRide';
import ProcessRide from './components/ProcessRide';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// // function App() {
// //   return (
// //      <div><CreateRide/></div>
// //     // <div className="App">
// //     //   <header className="App-header">
// //     //     <img src={logo} className="App-logo" alt="logo" />
// //     //     <p>
// //     //       Edit <code>src/App.js</code> and save to reload.
// //     //     </p>
// //     //     <a
// //     //       className="App-link"
// //     //       href="https://reactjs.org"
// //     //       target="_blank"
// //     //       rel="noopener noreferrer"
// //     //     >
// //     //       Learn React
// //     //     </a>
// //     //   </header>
// //     // </div>
   
// //   );
// // }

// // export default App;

// // App.js


// import NavigationBar from './components/NavBar';

// class App extends Component {
//   render() {
//     return (
      
     
//     );
//   }
// }

// export default App;





import React, { useState } from 'react';
import { Nav, Navbar, Container } from 'react-bootstrap';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [account, setAccount] = useState(null); // State để lưu trữ tài khoản hiện tại
  const [selectedRideId, setSelectedRideId] = useState(null); // Khai báo selectedRideId ở đây

  const handleSelect = (selectedTab) => {
    setActiveTab(selectedTab);
  };

  // Callback function để nhận tài khoản từ MetamaskConnect
  const handleAccountChange = (newAccount) => {
    setAccount(newAccount);
  };

  return (
    <div className="App">
     <MetamaskConnect  renderWithAccount={handleAccountChange} />
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
                <Nav.Link eventKey="history">History</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="history">Account</Nav.Link>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {activeTab === 'home' && (
        <div className='container'>
         <YourRides account={account}  handleTabChange={handleSelect} setSelectedRideId={setSelectedRideId} />
        </div>
      )}
      {activeTab === 'create' && (
        <div className='container'>
         <CreateRide  handleTabChange={handleSelect}/>
        </div>
      )}
      {activeTab === 'join' && (
        <div>
          <JoinRide account={account}/>
        </div>
      )}
      {activeTab === 'history' && (
        <div>
          {/* Component History */}
        </div>
      )}
      {activeTab === 'process' && selectedRideId && (
        <ProcessRide rideId={selectedRideId} />
      )}
    </div>
  );
}

export default App;
