// SPDX-License-Identifier: MIT
//pragma solidity >=0.4.22 <0.9.0;
pragma solidity ^0.5.0;
contract RideContract {
    uint public rideCount;
    address payable owner ;
    mapping(address => uint256) public clientBalances;
    uint256 public ownerBalance;

    struct Ride {
        uint id; 
        address payable driver; 
        string startPoint; //departure
        string endPoint;    //destination
        uint256 fare;
        uint256 startTime;
        uint numOfPassengers; 
        address payable[] passengers;
        bool isActive;
    }
  


    mapping(uint => Ride) public rides;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this function");
        _;
    }

    function clientDeposit() external payable {
        clientBalances[msg.sender] += msg.value;
    }

    function withdrawEarnings() external onlyOwner {
        
       owner.transfer(ownerBalance);
        ownerBalance = 0;
    }

    constructor() public {
        // createRide("Start Point", "End Point", 100); // Tạo một chuyến xe mẫu khi khởi tạo
        rideCount = 0;
        owner = msg.sender;
       
    }

    function createRide(string calldata _startPoint, string calldata _endPoint, uint256 _fare, uint256 _startTime) external {
        require(_fare > 0, "Fare must be greater than zero");
        rideCount++; // Tăng số lượng chuyến xe

        // Tạo một chuyến xe mới
        Ride memory newRide;
        newRide.id = rideCount;
        newRide.driver = msg.sender;
        newRide.startPoint = _startPoint;
        newRide.endPoint = _endPoint;
        newRide.fare = _fare;
        newRide.startTime = _startTime;
        newRide.isActive = true;
        newRide.passengers ;
        newRide.numOfPassengers = 0;
        // Lưu trữ chuyến xe vào mapping
        rides[rideCount] = newRide;
    }
    

    function joinRide(uint256 _rideId) external payable {
        require(_rideId <= rideCount, "Invalid ride ID");
        require(msg.value == rides[_rideId].fare*1e18, "Incorrect fare amount");

        rides[_rideId].passengers.push(msg.sender);
        rides[_rideId].numOfPassengers ++ ;
        clientBalances[msg.sender] -=   msg.value;
        ownerBalance += msg.value;
        (rides[_rideId].driver).transfer(msg.value);
       
    }

    function completeRide(uint256 _rideId) external  {
        require(_rideId <= rideCount, "Invalid ride ID");

        Ride storage ride = rides[_rideId];
        require(ride.isActive, "Ride is not active");

        // Distribute fare to driver and passengers
        // uint256 totalFare = ride.fare * (ride.passengers.length + 1);
        // uint256 farePerPassenger = totalFare / (ride.passengers.length + 1);
        
        //(ride.driver).transfer(farePerPassenger);
        // for (uint256 i = 0; i < ride.passengers.length; i++) {
        //     (ride.passengers[i]).transfer(farePerPassenger);
        // }

        // Deactivate ride
        ride.isActive = false;

    }
    function getPassengers(uint rideId) external view returns (address payable[] memory) {
        require(rideId <= rideCount, "Invalid ride ID");
        return rides[rideId].passengers;
    }
}
