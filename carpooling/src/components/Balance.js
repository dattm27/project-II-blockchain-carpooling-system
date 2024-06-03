import Web3 from 'web3';
import React, { useState, useEffect } from 'react';
import { getBalanceHistory, getCurrentBalance } from '../api';

const Balance = ({ account }) => {
    const [balanceChangeHistory, setBalanceChangeHistory] = useState([]);
    const [currentBalance, setCurrentBalance] = useState(0);
    useEffect(() => {
       // Hàm để lấy lịch sử biến động số dư từ contract và cập nhật state history
       const fetchBalanceHistory = async () => {
            try {
                const balanceChangeHistory = await getBalanceHistory( account);
                
                console.log('list', balanceChangeHistory.length);
                // Chuyển đổi dữ liệu từ danh sách balanceChanges thành danh sách các đối tượng có cấu trúc
                const formattedBalanceHistory = balanceChangeHistory.map(balanceChange => ({
                    user: balanceChange[0],
                    amount: balanceChange[1],
      
                    timestamp: balanceChange[2],
                    description: balanceChange[3]
                }));
                
                // Cập nhật state để hiển thị lịch sử biến động số dư trên giao diện người dùng
                setBalanceChangeHistory(formattedBalanceHistory);
                
                console.log(formattedBalanceHistory);
            } catch (error) {
                console.error("Error fetching balance history:", error);
                // Xử lý lỗi (hiển thị thông báo lỗi, etc.) nếu cần
            }
        };

        // Hàm để lấy số dư hiện tại từ contract và cập nhật state currentBalance
        const fetchCurrentBalance = async () => {
            try {
                const balance = await getCurrentBalance(account);
                const balanceInEther = new Web3(window.ethereum).utils.fromWei(balance, 'ether'); // Chuyển đổi số dư từ wei sang ether
                setCurrentBalance(balanceInEther);
               
            } catch (error) {
                console.error("Error fetching current balance:", error);
                // Xử lý lỗi (hiển thị thông báo lỗi, etc.) nếu cần
            }
        };

        // Gọi cả hai hàm fetchBalanceHistory và fetchCurrentBalance khi component được mount
        fetchBalanceHistory();
        fetchCurrentBalance();
    },[]);
    return (
        <div className='container'>
            <h5>Balance: {currentBalance} ETH</h5>
            <div>
                <h4>Balance History:</h4>
                <div className="list-group">
                    {balanceChangeHistory.slice().reverse().map((change, index) => (
                    <div key={index} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-1">{change.description}</h5>
                            {/* <small className="text-muted">{new Date(Number(change.timestamp)).toLocaleString()}</small> */}
                        </div>
                        <span className=""> {(Number(change.amount)/1e18).toString()} ETH</span>
                        </div>
                        {/* <small className="text-muted">Balance after: {change.balanceAfter.toString()}</small> */}
                        <small></small>
                    </div>
                    ))}
                </div>
                </div>
            </div>
        
    );
};

export default Balance;