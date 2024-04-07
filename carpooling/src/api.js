// api.js

import Web3 from 'web3';
import RideContract from './contracts/RideContract.json';

const web3 = new Web3(window.ethereum);
const contractAddress = '0xD2374689F1fdaE4c2327020CBf55Cb16936f5061';
const contractABI = RideContract.abi;
const networkId = await web3.eth.net.getId();
const deployedNetwork = await RideContract.networks[networkId];
const accounts = await web3.eth.getAccounts();
const contract =new web3.eth.Contract(
  RideContract.abi,
  deployedNetwork && deployedNetwork.address
);

export const getCreatedRides = async (userAddress) => {
  try {
    const createdRides = await contract.methods.getCreatedRides(accounts[0]).call();
    return createdRides;
  } catch (error) {
    console.error('Error fetching created rides:', error);
    return [];
  }
};

export const getJoinedRides = async (userAddress) => {
  try {
    const joinedRides = await contract.methods.getJoinedRides(accounts[0]).call();
    console.log(joinedRides);
    return joinedRides;
  } catch (error) {
    console.error('Error fetching joined rides:', error);
    return [];
  }
};

// Hàm lấy chi tiết của một chuyến đi từ hợp đồng thông minh
export const getRideDetails = async (rideId) => {
    try {
      // Gọi hàm rides trên hợp đồng thông minh để lấy thông tin chi tiết của chuyến đi
      //console.log('ID from getRideDetails: ' + rideId);
      const rideDetails = await contract.methods.rides(rideId).call();
     // console.log('Ride Detail: ' + rideDetails);
      // Trả về thông tin chi tiết của chuyến đi
      return rideDetails;
    } catch (error) {
      // Xử lý lỗi nếu có
      throw new Error('Error fetching ride details: ' + error.message);
    }
  };



// Hàm để lấy danh sách các chuyến đi có sẵn để tham gia
export const getAvailableRides = async () => {
  try {
      const totalRides = await contract.methods.rideCount().call(); // Hàm này cần phải được triển khai trong file api.js của bạn

      const availableRides = [];

      // Lặp qua tất cả các chuyến đi và kiểm tra xem chúng có sẵn để tham gia không
      for (let rideId = 1; rideId <= totalRides; rideId++) {
          const rideDetails = await getRideDetails(rideId); // Hàm này cũng cần phải được triển khai trong file api.js của bạn
         
          if (rideDetails.isActive && rideDetails.numOfPassengers < rideDetails.numOfSeats && rideDetails.driver !== accounts[0]) {
              availableRides.push({
                  id: rideId,
                  startPoint: rideDetails.startPoint,
                  endPoint: rideDetails.endPoint,
                  fare: rideDetails.fare.toString(),
                  startTime: new Date(Number(rideDetails.startTime) * 1000).toLocaleString(),
                  isActive: rideDetails.isActive,
                  numOfSeats: rideDetails.numOfSeats.toString(),
                  numOfPassengers: rideDetails.numOfPassengers
              });
          }
      }

      return availableRides;
  } catch (error) {
      throw new Error('Error fetching available rides: ' + error.message);
  }
};


// Khi người dùng bấm join chuyến và nhập các thông tin
export const joinPendingRide = async (_rideId, _phoneNumber, _numberOfPeople, userAddress, calculatedValue) => {
  try {
      // Gọi hàm joinPendingRide từ smart contract
      await contract.methods.joinPendingRide(_rideId, _phoneNumber, _numberOfPeople).send({ from: userAddress, value: calculatedValue*1e18 });
      // Xử lý sau khi join chuyến thành công
      console.log('Joined ride successfully!');
  } catch (error) {
      // Xử lý lỗi nếu có
      console.error('Error joining ride:', error);
  }
};

//xem danh sách pending của một chuyến đi 
export const getPendingPassengers = async (rideId) => {
  try {
      const pendingPassengers = [];
      const numOfPendings =  await contract.methods.numOfPendings(rideId).call();
      for (let i = 0; i< numOfPendings; i++){

        const passenger = await contract.methods.pendingPassengers(rideId,i).call();
        pendingPassengers.push(passenger);
      }
      
      // Trả về danh sách tất cả các hành khách đang chờ
      return pendingPassengers;

  } catch (error) {
    throw new Error('Error fetching ride pending list: ' + error.message);
  }
};

