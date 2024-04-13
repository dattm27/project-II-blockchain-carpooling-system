 import logo from './logo.svg';
 import './App.css';
import Web3 from 'web3';
import {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
 import Welcome from './components/Welcome';
 import Home  from './components/Home';
function App() {
  //properties
  const [walletAddress, setWalletAddress]= useState("");
  
  async function requestAccount(){
    console.log('Requesting account...');
    // Kiem tra xem trinh duyet co ket noi voi Metamask ko 
    if (window.ethereum){
      console.log('Detected');
      try {
        const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
        //console.log(accounts);
        setWalletAddress(accounts[0]);
      }catch(error){
        console.log('Error connecting with MetaMask');
      }
    }
    else {
      console.log('MetaMask not detected');
      window.alert('Please install MetaMask');
    }

  }
  //ket noi voi tai khoan MetaMask
  async function connectWallet () {
    //kiem tra MetaMask ton tai khong
    if (typeof window.ethereum !=="undefined"){
      await requestAccount ();
      const web3 = new Web3(window.ethereum);
      const provider = new Web3(web3.currentProvider);
    } 
  }
  useEffect (() => {
    //the code that we want to run
    //console.log("Login account" , walletAddress);
   connectWallet();
    
    //Khi đã đăng nhập vào ví Metamask, chuyến đến màn hình chính
    //optional return function 
    return () =>{
      //console.log('I am being cleaned up!');
    }
  }, []); // The dependencies array
  return (
    
    <div className=''>
     
      {/* Kiểm tra kết nối ví điện tử và đăng nhập tài khoản */}
      {/* {walletAddress!=="" ?  (<Home walletAddress={walletAddress} />) : (<Welcome connectWallet={connectWallet}/>) } */}
       {walletAddress=="" &&<div>
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
        
            <h3>Carpooling</h3>
            <Button variant="primary" onClick={connectWallet}>Connect Wallet</Button>{' '}
          
            
          </header> 
        </div>
      }
      {walletAddress !== "" && (<Home walletAddress={walletAddress} />)}

      
    </div>
   
  );
}

export default App;




// import React, { useEffect, useState } from 'react';
// import { Nav, Navbar, Container } from 'react-bootstrap';

// function App() {
//   const [activeTab, setActiveTab] = useState('home');
//   const [account, setAccount] = useState(null); // State để lưu trữ tài khoản hiện tại
//   const [selectedRideId, setSelectedRideId] = useState(null); // Khai báo selectedRideId ở đây

//   const handleSelect = (selectedTab) => {
//     setActiveTab(selectedTab);
//   };

//   // Callback function để nhận tài khoản từ MetamaskConnect
//   const handleAccountChange = (newAccount) => {
//     setAccount(newAccount);
//   };
  
//     useEffect(() => {
//       // Khi tài khoản thay đổi, cập nhật lại nội dung của tab hiện tại
//       handleSelect(activeTab);
//     }, [account]); // Sử dụng account làm dependency để useEffect re-run khi account thay đổi
//     return (
//     <div className="App">
//      <MetamaskConnect  renderWithAccount={handleAccountChange} />
//       <Navbar  collapseOnSelect bg="light" expand="lg">
//         <Container>
//           <Navbar.Brand href="#">Carpooling</Navbar.Brand>
//           <Navbar.Toggle aria-controls="basic-navbar-nav" />
//           <Navbar.Collapse id="basic-navbar-nav">
//             <Nav className="me-auto" activeKey={activeTab} onSelect={handleSelect}>
//               <Nav.Item>
//                 <Nav.Link eventKey="home">Home</Nav.Link>
//               </Nav.Item>
//              <Nav.Item>
//                 <Nav.Link eventKey="create">Create Ride</Nav.Link>
//               </Nav.Item>
//               <Nav.Item>
//                 <Nav.Link eventKey="join">Join Ride</Nav.Link>
//               </Nav.Item>
//               <Nav.Item>
//                 <Nav.Link eventKey="history">History</Nav.Link>
//               </Nav.Item>
//               <Nav.Item>
//                 <Nav.Link eventKey="history">Account</Nav.Link>
//               </Nav.Item>
//             </Nav>
//           </Navbar.Collapse>
//         </Container>
//       </Navbar>
//       {activeTab === 'home' && (
//         <div className='container'>
//          <YourRides account={account}  handleTabChange={handleSelect} setSelectedRideId={setSelectedRideId} />
//         </div>
//       )}
//       {activeTab === 'create' && (
//         <div className='container'>
//          <CreateRide  handleTabChange={handleSelect}/>
//         </div>
//       )}
//       {activeTab === 'join' && (
//         <div>
//           <JoinRide account={account}/>
//         </div>
//       )}
//       {activeTab === 'history' && (
//         <div>
//           {/* Component History */}
//         </div>
//       )}
//       {activeTab === 'process' && selectedRideId && (
//         <ProcessRide rideId={selectedRideId} />
//       )}
//     </div>
//   );
// }

// export default App;
