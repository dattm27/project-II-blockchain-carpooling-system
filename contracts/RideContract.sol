// SPDX-License-Identifier: MIT
//pragma solidity >=0.4.22 <0.9.0;
pragma solidity ^0.5.0;
contract RideContract {
    uint public rideCount;
    

    struct Ride {
        uint id; 
        address payable driver; 
        string startPoint; //departure
        string endPoint;    //destination
        uint256 fare;   
        uint256 startTime;
        uint numOfSeats; 
        uint numOfPassengers; 
        address payable[] passengers;
        bool isActive;
    }
  
    //cấu trúc thông tin khách hàng
    struct Passenger {
        uint id;
        string phoneNumber;
        uint numOfPeople ; // một người có thể đặt cho nhiều người
        uint256 verificationCode;
        bool accepted; 

    }

    mapping(address => uint[]) private createdRides; // Lưu trữ danh sách các chuyến đi đã được tạo bởi mỗi tài xế
    mapping(address => uint[]) private joinedRides; // Lưu trữ danh sách các chuyến đi đã tham gia của mỗi hành khách
    mapping(uint => Ride) public rides;
    mapping(uint => mapping(uint => Passenger)) public passengers;
    mapping(address => mapping(uint => Passenger)) public pendingPassengers;

   
    constructor() public {
        // createRide("Start Point", "End Point", 100); // Tạo một chuyến xe mẫu khi khởi tạo
        rideCount = 0;
       
       
    }
    // Hàm trả về danh sách các chuyến đi đã được tạo bởi một tài xế cụ thể
    function getCreatedRides(address _driver) external view returns (uint[] memory) {
        return createdRides[_driver];
    }

    // Hàm trả về danh sách các chuyến đi mà một hành khách cụ thể đã tham gia
    function getJoinedRides(address _passenger) external view returns (uint[] memory) {
        return joinedRides[_passenger];
    }

    // hàm hoàn tiền về cho hành khách khi bị huỷ 
    function withdrawFunds(address payable _receiver, uint256 _amount) internal {
    (bool success, ) = _receiver.call.value(_amount)("");
    require(success, "Transfer failed.");
    }


    function createRide(string calldata _startPoint, string calldata _endPoint, uint256 _fare, uint256 _startTime, uint _numOfSeats) external {
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
        newRide.numOfSeats = _numOfSeats; 
        newRide.passengers ;
        newRide.numOfPassengers = 0;
        // Lưu trữ chuyến xe vào mapping
        rides[rideCount] = newRide;
        // Thêm chuyến xe vào danh sách chuyến đi đã tạo của tài xế
        createdRides[msg.sender].push(rideCount);
    }
    //Thêm thông tin hành khách vào chuyến xe
    function addPassenger(uint _rideId, string memory _phoneNumber, uint _numOfPeople) public {
        uint256 passengerID = rides[_rideId].numOfPassengers + 1 ;
        passengers[_rideId][passengerID] = Passenger ({
            id :passengerID ,
            phoneNumber:  _phoneNumber,
            numOfPeople: _numOfPeople,
            verificationCode:0,
            accepted: true
        });
        // Cập nhật số lượng hành khách tham gia chuyến xe
        rides[_rideId].numOfPassengers += _numOfPeople;
    }

    // Hàm sinh mã xác nhận ngẫu nhiên
    function generateVerificationCode() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % 9000 + 1000;
    }
    // 1. Khi hành khách join chuyến (nhập thông tin và thanh toán )
    function joinPendingRide(uint _rideId, string memory _phoneNumber, uint256 _numberOfPeople) public payable{
        require(_rideId <= rideCount, "Invalid ride ID");
        require(msg.sender != rides[_rideId].driver, "Join Ride: This is driver address, the ride need a passenger join");
        //kiểm tra nếu còn đủ chỗ để thêm hành khách vapf 
        require(rides[_rideId].numOfPassengers < rides[_rideId].numOfSeats, "");
        require(msg.value == _numberOfPeople*rides[_rideId].fare*1e18, "Incorrect fare amount");
        pendingPassengers[msg.sender][_rideId] = Passenger(_rideId, _phoneNumber, _numberOfPeople, 0, false);
    }
    //2. Hàm tài xế chấp nhận hành khách và tạo mã xác nhận
    function acceptPassenger(uint _rideId, address _passenger) public {
        Passenger storage passenger = pendingPassengers[_passenger][_rideId];
        require(!passenger.accepted, "Passenger already accepted");
        passenger.verificationCode = generateVerificationCode();
        passenger.accepted = true;
    }
    //3. Driver từ chối hành khách
    function rejectPendingPassenger(uint _rideId, address payable _passenger) public {
        // Kiểm tra xem người gọi hàm có phải là tài xế của chuyến đi không
        require(msg.sender == rides[_rideId].driver, "Only driver can reject pending passenger");

        // Kiểm tra xem hành khách có tồn tại trong danh sách hàng đợi không
        require(pendingPassengers[_passenger][_rideId].id == _rideId, "Passenger not found in pending list");

        // Hoàn trả tiền đã gửi của hành khách
        uint256 fareAmount = pendingPassengers[_passenger][_rideId].numOfPeople * rides[_rideId].fare * 1e18;
       withdrawFunds(_passenger, fareAmount);

        // Xóa hành khách khỏi danh sách hàng đợi
        delete pendingPassengers[_passenger][_rideId];
    }

    //4. Hàm hành khách nhập mã xác nhận và tham gia chuyến đi
    function enterVerificationCode(uint _rideId, uint256 _verificationCode) public {
        Passenger storage passenger = pendingPassengers[msg.sender][_rideId];
        require(passenger.accepted, "Passenger not accepted yet");
        require(passenger.verificationCode == _verificationCode, "Incorrect verification code");
        // Thêm hành khách vào danh sách của chuyến đi
        addPassenger(_rideId, passenger.phoneNumber, passenger.numOfPeople);
        // Xóa thông tin hành khách khỏi danh sách pending
        delete pendingPassengers[msg.sender][_rideId];
    }

    

    //khi người dùng nhấn join vào chuyến có thể đi
    function joinRide(uint256 _rideId) external payable {
        require(_rideId <= rideCount, "Invalid ride ID");
        require(msg.sender != rides[_rideId].driver, "Join Ride: This is driver address, the ride need a passenger join");
        //kiểm tra nếu còn đủ chỗ để thêm hành khách vapf 
        require(rides[_rideId].numOfPassengers < rides[_rideId].numOfSeats, "");
        require(msg.value == rides[_rideId].fare*1e18, "Incorrect fare amount");
        
        // thêm tài khoản của hành khách vào danh sách hành khách của chuyến
        rides[_rideId].passengers.push(msg.sender);
        rides[_rideId].numOfPassengers ++ ; 

       
        // Thêm chuyến xe vào danh sách chuyến đi đã tham gia của hành khách
        joinedRides[msg.sender].push(_rideId);

    }


    //khi chuyến đi kết thúc, tài xế thực hiện lấy tiền của hành khách
    function completeRide(uint256 _rideId) external  {
        require(_rideId <= rideCount, "Invalid ride ID");
        require(msg.sender == rides[_rideId].driver, "Only driver can call this function");
        Ride storage ride = rides[_rideId];
        require(ride.isActive, "Ride is not active");

        //rút tiền từ hợp đồng về tài khoản
        address payable recipient = address(uint160(msg.sender)); // Chuyển msg.sender thành address payable
        (bool callSuccess, ) = recipient.call.value(address(this).balance)("");
        require(callSuccess, "Withdraw coin in the contract failed");


        // Deactivate ride
        ride.isActive = false;

    }
    
    function getPassengers(uint rideId) external view returns (address payable[] memory) {
        require(rideId <= rideCount, "Invalid ride ID");
        return rides[rideId].passengers;
    }
}
