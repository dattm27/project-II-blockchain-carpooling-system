// MetamaskConnect.js

// import React, { Component } from 'react';
// import Web3 from 'web3';

// class MetamaskConnect extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       account: ''
//     };
//   }

//   async componentDidMount() {
//     await this.loadWeb3();
//     await this.loadAccount();
//   }

//   async loadWeb3() {
//     if (window.ethereum) {
//         window.web3 = new Web3(window.ethereum);
//         // Kiểm tra xem người dùng đã kết nối MetaMask chưa
//         const accounts = await window.web3.eth.getAccounts();
//         if (accounts.length === 0) {
//             console.log('No account signed in');
//             try{
//                 // Yêu cầu kết nối tài khoản MetaMask nếu người dùng chưa kết nối
//                 await window.ethereum.request({ method: 'eth_requestAccounts' });
//             }
//             catch{
//                 console.error('User denied account access');
//             }
//       }
//     } else if (window.web3) {
//       window.web3 = new Web3(window.web3.currentProvider);
//     } else {
//       // Hiển thị cảnh báo nếu không phát hiện MetaMask
//       alert('Please connect to Metamask.');
//       console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
//     }
//   }

//   async loadAccount() {
//     const accounts = await window.web3.eth.getAccounts();
//     this.setState({ account: accounts[0] });

//   }

//    render() {
//     return (
//       <div>
//         {/* Truyền địa chỉ tài khoản như một prop */}
//         {this.props.renderWithAccount && this.props.renderWithAccount(this.state.account)}
//       </div>
//     );
  
//   }
// }

// export default MetamaskConnect;

// MetamaskConnect.js
import React, { useEffect } from 'react';
import Web3 from 'web3';

function MetamaskConnect({ renderWithAccount }) {
  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        const accounts = await window.web3.eth.getAccounts();
        if (accounts.length === 0) {
          console.log('No account signed in');
          try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
          } catch {
            console.error('User denied account access');
          }
        }
        renderWithAccount(accounts[0]); // Gọi callback để truyền tài khoản
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        renderWithAccount(null); // Không có tài khoản nếu không phát hiện MetaMask
      } else {
        alert('Please connect to Metamask.');
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        renderWithAccount(null); // Không có tài khoản nếu không phát hiện MetaMask
      }
    };

    loadWeb3();
  }, [renderWithAccount]);

  return null; // Không cần render gì từ component này
}

export default MetamaskConnect;
