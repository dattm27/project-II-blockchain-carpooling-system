import React, { useEffect } from 'react';
import Web3 from 'web3';

function MetamaskConnect({ renderWithAccount }) {
  useEffect(() => {
    const connectMetamask = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Yêu cầu quyền truy cập tài khoản từ MetaMask
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const account = accounts[0];
          // Khởi tạo web3 bằng window.ethereum
          window.web3 = new Web3(window.ethereum);
          renderWithAccount(account); // Gọi callback để truyền tài khoản
        } catch (error) {
          console.error('User denied account access');
        }
      } else if (typeof window.web3 !== 'undefined') {
        // Sử dụng web3 hiện tại nếu MetaMask không khả dụng
        window.web3 = new Web3(window.web3.currentProvider);
        const accounts = await window.web3.eth.getAccounts();
        const account = accounts[0];
        renderWithAccount(account); // Gọi callback để truyền tài khoản
      } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        renderWithAccount(null); // Không có tài khoản nếu không phát hiện MetaMask
      }
    };

    connectMetamask();
  }, [renderWithAccount]);

  return null; // Không cần render gì từ component này
}

export default MetamaskConnect;
