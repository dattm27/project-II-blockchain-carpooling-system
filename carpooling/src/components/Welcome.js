import logo from '../logo.svg';
import '../App.css';
import Button from 'react-bootstrap/Button';
import {useEffect, useState} from 'react';
function Welcome ({connectWallet}) {
  useEffect(() => {
    connectWallet();
  }, [])  
  return (
        <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
       {/* <p>
         Edit <code>src/App.js</code> and save to reload.
       </p>
       <a
         className="App-link"
         href="https://reactjs.org"
         target="_blank"
         rel="noopener noreferrer"
       >
         Learn React
       </a>  */}
       <h3>Carpooling</h3>
       <Button variant="primary" onClick={() =>connectWallet()}>Connect Wallet</Button>{' '}
       {/* <h3>walletAddress: {walletAddress}</h3> */}
       
     </header>
    );

}
export default Welcome;