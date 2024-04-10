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
// console.log(deployedNetwork);
export const getCreatedRides = async (account) => {
  try {
    const createdRides = await contract.methods.getCreatedRides(account).call();
    return createdRides;
  } catch (error) {
    console.error('Error fetching created rides:', error);
    return [];
  }
};

export const getJoinedRides = async (account) => {
  try {
    const joinedRides = await contract.methods.getJoinedRides(account).call();
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
export const getAvailableRides = async (account) => {
  try {
      const totalRides = await contract.methods.rideCount().call(); // Hàm này cần phải được triển khai trong file api.js của bạn

      const availableRides = [];

      // Lặp qua tất cả các chuyến đi và kiểm tra xem chúng có sẵn để tham gia không
      for (let rideId = 1; rideId <= totalRides; rideId++) {
          const rideDetails = await getRideDetails(rideId); // Hàm này cũng cần phải được triển khai trong file api.js của bạn
          //console.log('compare',account);
          if (rideDetails.isActive && rideDetails.numOfPassengers < rideDetails.numOfSeats && rideDetails.driver.toLowerCase() !== account) {
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
          //console.log(rideDetails.driver);
      }
      
      return availableRides;
  } catch (error) {
      throw new Error('Error fetching available rides: ' + error.message);
  }
};


// Khi người dùng bấm join chuyến và nhập các thông tin
export const joinPendingRide = async (_rideId, _phoneNumber, _numberOfPeople, account, calculatedValue) => {
  try {
      // Gọi hàm joinPendingRide từ smart contract
      await contract.methods.joinPendingRide(_rideId, _phoneNumber, _numberOfPeople).send({ from: account, value: calculatedValue*1e18 });
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


//chấp nhận một hành khách
// Hàm để chấp nhận một hành khách vào chuyến đi
export const acceptPassenger = async (rideId, passengerIndex,account) => {
  try {
    await contract.methods.acceptPassenger(rideId, passengerIndex).send({ from: account}); // Thay 'yourAddress' bằng địa chỉ của bạn
    console.log('Passenger accepted successfully');
  } catch (error) {
    console.error('Error accepting passenger:', error);
    throw new Error('Error accepting passenger');
  }
};

// Hàm để chấp nhận một hành khách vào chuyến đi
export const declinePassenger = async (rideId, passengerIndex,account) => {
  try {
    await contract.methods.declinePassenger(rideId, passengerIndex).send({ from: account}); // Thay 'yourAddress' bằng địa chỉ của bạn
    console.log('Passenger declined successfully');
  } catch (error) {
    console.error('Error  decline passenger:', error);
    throw new Error('Error decline passenger');
  }
};
// Hàm để lấy thông tin của một hành khách từ danh sách pendingPassengers
export const getPassenger = async (rideId, passengerIndex) => {
    try {
      const passengers = [];
      const rideDetails = await contract.methods.rides(rideId).call();
      const numOfPassengers = rideDetails[7];
      console.log(numOfPassengers);
     
      for (let i = 0; i< numOfPassengers; i++){
       
        try{
          const passenger = await contract.methods.passengers(rideId,i).call();
          passengers.push(passenger);
        }
        catch (error){
          //Hết pending
        }
      }
      
      // Trả về danh sách tất cả các hành khách đang chờ
      return passengers;

  } catch (error) {
    throw new Error('Error fetching ride pending list: ' + error.message);
  }
};

//Hàm kết thúc chuyến đi
export const completeRide = async (_rideId, account) => {
  try {
   
    await contract.methods.completeRide(_rideId).send({ from: account});
    console.log('Ride completed');
    alert('Join Completed');
  }
  catch (error) {
    throw new Error('Error when completing ride ' + error.message);
  }
}

//Lấy ra số lượng pending của một chuyến đi 
export const getNumOfPendings = async (_rideId)=>{
  try {
    const numOfPendings = await contract.methods.numOfPendings(_rideId).call();
    return numOfPendings;
  }
  catch (error){
    throw new Error ('Error when getNumOfPendings');
  }
}

export const arrivedRide = async( _rideId, account) =>{
  try {
    await contract.methods.arrive(_rideId).send({from: account});
  }
  catch (error){
    throw new Error('Error when arrive Ride');
  }
}

export const getRideHistory = async (account) => {
  try {
    const history = await contract.methods.getHistory(account).call();
    return history;
  } catch (error) {
    console.error('Error fetching history', error);
    return [];
  }
};