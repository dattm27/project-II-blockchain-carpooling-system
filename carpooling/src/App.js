import logo from './logo.svg';
import './App.css';
import Message from './components/Message';
import CreateRide from './components/CreateRide';
import Web3 from 'web3';
import React, { Component } from 'react';
import MetamaskConnect from './components/Metamask';
// function App() {
//   return (
//      <div><CreateRide/></div>
//     // <div className="App">
//     //   <header className="App-header">
//     //     <img src={logo} className="App-logo" alt="logo" />
//     //     <p>
//     //       Edit <code>src/App.js</code> and save to reload.
//     //     </p>
//     //     <a
//     //       className="App-link"
//     //       href="https://reactjs.org"
//     //       target="_blank"
//     //       rel="noopener noreferrer"
//     //     >
//     //       Learn React
//     //     </a>
//     //   </header>
//     // </div>
   
//   );
// }

// export default App;

// App.js

class App extends Component {
  render() {
    return (
      <div>
        <MetamaskConnect />
        {/* Thêm các component khác và chức năng create ride, join ride ở đây */}
      </div>
    );
  }
}

export default App;
