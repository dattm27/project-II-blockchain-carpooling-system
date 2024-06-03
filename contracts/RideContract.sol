// SPDX-License-Identifier: MIT
//pragma solidity >=0.4.22 <0.9.0;
pragma solidity ^0.5.0;
contract RideContract {
    uint public rideCount;
    uint public balanceChangeCounter;

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
        //toạ độ cho các điểm đầu cuối 
        int256 startLongitude;
        int256 startLatitude;
        int256 endLongitude;
        int256 endLatitude;
    }
  
    //cấu trúc thông tin khách hàng
    struct Passenger {
        address payable addr; 
        string phoneNumber;
        uint numOfPeople ; // một người có thể đặt cho nhiều người
        uint256 verificationCode;
        bool arrived; 
      

    }

    // Cấu trúc dữ liệu cho một sự thay đổi số dư
    struct BalanceChange {
        address user;           // Người dùng ảnh hưởng
        int256 amount;          // Số dư thay đổi (có thể là dương hoặc âm)
  
        uint256 timestamp;      // Thời gian xảy ra sự thay đổi
        string description;     // Mô tả ngắn về sự thay đổi
    }


    mapping(address => uint[]) private createdRides; // Lưu trữ danh sách các chuyến đi đã được tạo bởi mỗi tài xế
    mapping(address => uint[]) private joinedRides; // Lưu trữ danh sách các chuyến đi đã tham gia của mỗi hành khách
    mapping(address => uint[]) private history;
    mapping(uint => Ride) public rides;
    mapping(uint =>  Passenger []) public passengers;
    mapping(uint => Passenger[]) public pendingPassengers;
    mapping(uint => uint) public numOfPendings; // số lượng pending của mỗi chuyến
    // Mapping từng địa chỉ tài khoản đến lịch sử các sự thay đổi số dư
    mapping(address => uint[]) public balanceChangeHistory;
    mapping (uint => BalanceChange) public balanceChanges;
   


    event RideCreated(uint indexed rideId, address indexed driver, string startPoint, string endPoint, uint256 fare, uint256 startTime, uint numOfSeats);
    event PassengerJoined(uint indexed rideId, address indexed passenger, string phoneNumber, uint numOfPeople, address indexed driver);
    event PassengerCancelled(uint indexed rideId, address indexed passenger);
    event RideCompleted(uint indexed rideId, address indexed driver);
    event PassengerArrived(uint indexed rideId, address indexed passenger);
    event PassengerAccepted(uint indexed rideId, address indexed passenger);
    event PassengerDeclined(uint indexed rideId, address indexed passenger);
    // Khai báo sự kiện
    event BalanceChanged(address indexed account, int256 amount);



    constructor() public {
        // createRide("Start Point", "End Point", 100); // Tạo một chuyến xe mẫu khi khởi tạo
        rideCount = 0;
        balanceChangeCounter = 0;
       
       
    }
    // Hàm trả về danh sách các chuyến đi đã được tạo bởi một tài xế cụ thể
    function getCreatedRides(address _driver) external view returns (uint[] memory) {
        return createdRides[_driver];
    }

    // Hàm trả về danh sách các chuyến đi mà một hành khách cụ thể đã tham gia
    function getJoinedRides(address _passenger) external view returns (uint[] memory) {
        return joinedRides[_passenger];
    }
     // Hàm để lấy thông tin của một chuyến đi cụ thể
    function getRideDetails(uint _rideId) external view returns (string memory, string memory, uint256, uint256, bool, uint256, uint256) {
        require(_rideId > 0 && _rideId <= rideCount, "Invalid ride ID");
        Ride memory ride = rides[_rideId];
        return (ride.startPoint, ride.endPoint, ride.fare, ride.startTime, ride.isActive, ride.numOfSeats, ride.numOfPassengers);
    }
    // // Hàm trả về danh sách các chuyến đi đã được tạo bởi một tài xế cụ thể
    function getHistory(address _account) external view returns (uint[] memory) {
        return history[_account];
    }

     // Hàm trả về danh sách biến động số dư của một tài khoản
    function getBalanceChangeHistory(address _address) external view returns (uint[] memory) {
        return balanceChangeHistory[_address];
    }

    // // hàm hoàn tiền về cho hành khách khi bị huỷ 
    // function withdrawFunds(address payable _receiver, uint256 _amount) internal {
    // (bool success, ) = _receiver.call.value(_amount)("");
    // require(success, "Transfer failed.");
    // }

    // Đầu tiên, driver tạo chuyến đi mới
    function createRide(string calldata _startPoint, string calldata _endPoint, uint256 _fare, uint256 _startTime, uint _numOfSeats, int256 _startLongitude, int256 _startLatitude, int256  _endLongitude, int256 _endLatitude) external {
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
        newRide.startLatitude = _startLatitude;
        newRide.startLongitude = _startLongitude;
        newRide.endLatitude = _endLatitude;
        newRide.endLongitude = _endLongitude;
        // Lưu trữ chuyến xe vào mapping
        rides[rideCount] = newRide;
        // Thêm chuyến xe vào danh sách chuyến đi đã tạo của tài xế
        createdRides[msg.sender].push(newRide.id);

        numOfPendings[rideCount] = 0;
        emit RideCreated(newRide.id, msg.sender, newRide.startPoint, newRide.endPoint, newRide.fare, newRide.startTime, newRide.numOfSeats);

       
    }
    // Hành khách tìm kiếm một chuyến xe -> join vào pending chờ tài xế chấp nhận (lúc join vào hành khách thanh toán luôn)
    function joinPendingRide(uint _rideId, string memory _phoneNumber, uint256 _numberOfPeople ) public payable{
        require(_rideId <= rideCount, "Invalid ride ID");
        require(msg.sender != rides[_rideId].driver, "Join Ride: This is driver address, the ride need a passenger join");
        //kiểm tra nếu còn đủ chỗ để thêm hành khách vào pending
        require(rides[_rideId].numOfPassengers < rides[_rideId].numOfSeats, "");
        //kiểm tra thêm hành khách đó đã nằm trong danh sách pending của chuyến đó chưa
        require(isPassengerInPendingList(_rideId, msg.sender)==uint(0), "Join Ride: Passenger is already in pending list");
        require(msg.value == _numberOfPeople*rides[_rideId].fare*1e18, "Incorrect fare amount");
         numOfPendings[_rideId]++; //tăng lượng khách trong danh sách chờ 
        pendingPassengers[_rideId].push(Passenger(msg.sender, _phoneNumber, _numberOfPeople, 0, false));
       
        //Them chuyen xe vao danh sach chuyen xe da tham gia
        joinedRides[msg.sender].push(_rideId);
        emit PassengerJoined(_rideId, msg.sender, _phoneNumber, _numberOfPeople,rides[_rideId].driver);
        addBalanceChange(msg.sender, -int256(msg.value), "Request for joining ride");

      
    }
  
    //chấp nhận một hành khách vào chuyến -> chuyển từ pending lên danh sách passengers
    function acceptPassenger(uint _rideId, uint _passengerIndex) public {
        require(_passengerIndex < pendingPassengers[_rideId].length, "Passenger index out of range");
        
        // Lấy thông tin hành khách từ danh sách chờ
        Passenger memory passenger = pendingPassengers[_rideId][_passengerIndex];
        //Đổi mã code
        uint256 randomCode = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, _rideId)));
        passenger.verificationCode = randomCode;
        // Thêm hành khách vào danh sách hành khách của chuyến đi
        rides[_rideId].passengers.push(passenger.addr);
        passengers[_rideId].push(passenger);
        rides[_rideId].numOfPassengers += passenger.numOfPeople;
         //xoá hành khách đó khỏi pendings
        numOfPendings[_rideId]--;
        // Gán giá trị của phần tử cần xóa bằng giá trị của phần tử cuối cùng trong mảng
        pendingPassengers[_rideId][_passengerIndex] = pendingPassengers[_rideId][pendingPassengers[_rideId].length - 1];
        // Giảm độ dài của mảng đi một
        pendingPassengers[_rideId].pop();
        emit PassengerAccepted(_rideId, passenger.addr);
    }

    //từ chối một khách -> trả phí luôn cho người ta, xoá khỏi danh sách chờ
    function declinePassenger(uint _rideId, uint _passengerIndex) public {
        require(_rideId <= rideCount, "Invalid ride ID");
        require(msg.sender == rides[_rideId].driver, "Only driver can call this function");
        //hoàn lại tiền cho hành khách đó
        Passenger memory passenger = pendingPassengers[_rideId][_passengerIndex];
        address payable passengerAddr = passenger.addr;
        uint totalFare = passenger.numOfPeople*rides[_rideId].fare*1e18;
        passengerAddr.transfer(totalFare);
         //thêm vào lịch sử biến động số dư
        addBalanceChange(passengerAddr, int256(totalFare), "Joining request declined");
        //xoá hành khách đó khỏi pendings
        numOfPendings[_rideId]--;
        // Gán giá trị của phần tử cần xóa bằng giá trị của phần tử cuối cùng trong mảng
        pendingPassengers[_rideId][_passengerIndex] = pendingPassengers[_rideId][pendingPassengers[_rideId].length - 1];
        // Giảm độ dài của mảng đi một
        pendingPassengers[_rideId].pop();
        emit PassengerDeclined(_rideId, passenger.addr);
  
        
    }

    //Một hành khách huỷ chuyến đi 
    function cancelRide(uint256 _rideId,  address payable _pendingPassenger) external {
        //Hành khách đó còn nằm trong pending, nghĩa là chưa được tài xế chấp nhận
        uint pendingPassengerId = isPassengerInPendingList(_rideId, _pendingPassenger);
        require(pendingPassengerId != uint(0), "Passenger is not in the pending list "); 
         //trả lại tiền cho hành khách đó
         uint256  totalFare = rides[_rideId].fare*pendingPassengers[_rideId][pendingPassengerId-1].numOfPeople*1e18;
        (msg.sender).transfer(totalFare);
        
        //thêm vào lịch sử biến động số dư
        addBalanceChange(msg.sender, int256(totalFare), "Cancel ride joining request");
       //phát sự kiện hành khách huỷ chuyến
        emit PassengerCancelled(_rideId, msg.sender);
         //xoá hành khách đó khỏi pendings
        numOfPendings[_rideId]--;
        // Gán giá trị của phần tử cần xóa bằng giá trị của phần tử cuối cùng trong mảng
        pendingPassengers[_rideId][pendingPassengerId-1] = pendingPassengers[_rideId][pendingPassengers[_rideId].length - 1];
        // Giảm độ dài của mảng đi một
        pendingPassengers[_rideId].pop();

        // Xoá chuyến đi khỏi danh sách tham gia
        removeRideFromList(joinedRides[msg.sender], _rideId);



    }
    //khi chuyến đi kết thúc, tài xế thực hiện lấy tiền của hành khách
    function completeRide(uint256 _rideId) external {
        require(_rideId <= rideCount, "Invalid ride ID");
        require(msg.sender == rides[_rideId].driver, "Only driver can call this function");
        Ride storage ride = rides[_rideId];
        require(ride.isActive, "Ride is not active");

        

        // Deactivate ride
        ride.isActive = false;

        // Xoá chuyến đi khỏi danh sách đã tạo của tài xế và từng hành khách
        removeRideFromList(createdRides[msg.sender], _rideId);
        
        uint numOfArrivals = 0;
        for (uint i = 0; i < ride.passengers.length; i++) {
           if (passengers[_rideId][i].arrived) numOfArrivals +=passengers[_rideId][i].numOfPeople ;
           else {
                // Hoàn trả tiền cho hành khách trong chuyến xe nhưng không bấm arrive
                address payable passengerAddr = passengers[_rideId][i].addr;
                uint totalFare = rides[_rideId].fare*passengers[_rideId][i].numOfPeople*1e18;
                passengerAddr.transfer(totalFare);
                //thêm vào lịch sử biến động số dư
                addBalanceChange(passengerAddr, int256(totalFare), "Join completed without arrival");

           }
           removeRideFromList(joinedRides[passengers[_rideId][i].addr], _rideId);
        }
        // Hoàn tiền cho hành khách còn trong pending
        for(uint i = 0 ; i < pendingPassengers[_rideId].length ; i++){
            address payable passengerAddr = pendingPassengers[_rideId][i].addr;
            uint totalFare = pendingPassengers[_rideId][i].numOfPeople*rides[_rideId].fare*1e18;
            passengerAddr.transfer(totalFare);
            //thêm vào lịch sử biến động số dư
            addBalanceChange(passengerAddr, int256(totalFare), "Join completed");
            //xoá hành khách đó khỏi pendings
            numOfPendings[_rideId]--;
            // Gán giá trị của phần tử cần xóa bằng giá trị của phần tử cuối cùng trong mảng
            pendingPassengers[_rideId][i] = pendingPassengers[_rideId][pendingPassengers[_rideId].length - 1];
            // Giảm độ dài của mảng đi một
            pendingPassengers[_rideId].pop();
            emit PassengerDeclined(_rideId, passengerAddr);

        }

        uint256 totalFare = ride.fare * numOfArrivals *1e18;
       // Chuyển số tiền từ hợp đồng về tài khoản của tài xế
        msg.sender.transfer(totalFare); 
        //Thêm vào biến động số dư
        addBalanceChange(msg.sender, int256(totalFare), "Withdraw ride fare");
        
        //Thêm vào lịch sử
        history[msg.sender].push(_rideId);
        emit RideCompleted(_rideId, msg.sender);

    }
    //Khách hàng confirm là đã bị declined -> xoá khỏi danh sách đã tham gia
    function confirmDeclined(uint _rideId) external {
        removeRideFromList(joinedRides[msg.sender], _rideId);
    }
    //Một hành khách arrive 
    function arrive(uint256 _rideId) external {
        
        //đánh dấu đã đến nơi 
        for (uint i = 0; i < rides[_rideId].passengers.length; i++){
            if(passengers[_rideId][i].addr == msg.sender){
                passengers[_rideId][i].arrived =true;
            }
        }
        
        // Xoá chuyến đi khỏi danh sách tham gia
        removeRideFromList(joinedRides[msg.sender], _rideId);


        //Thêm vào lịch sử
        history[msg.sender].push(_rideId);
       
        emit PassengerArrived(_rideId, msg.sender);


    }

    //Phần dưới không quan trọng
    // Chưa cần dùng
    // Hàm sinh mã xác nhận ngẫu nhiên
    function generateVerificationCode() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % 9000 + 1000;
    }
    
    //2. Hàm tài xế chấp nhận hành khách và tạo mã xác nhận
    // function acceptPassenger(uint _rideId, address _passenger) public {
    //     Passenger storage passenger = pendingPassengers[_passenger][_rideId];
    //     require(!passenger.accepted, "Passenger already accepted");
    //     passenger.verificationCode = generateVerificationCode();
    //     passenger.accepted = true;
    // }
    //3. Driver từ chối hành khách
    // function rejectPendingPassenger(uint _rideId, address payable _passenger) public {
    //     // Kiểm tra xem người gọi hàm có phải là tài xế của chuyến đi không
    //     require(msg.sender == rides[_rideId].driver, "Only driver can reject pending passenger");

    //     // Kiểm tra xem hành khách có tồn tại trong danh sách hàng đợi không
    //     require(pendingPassengers[_passenger][_rideId].id == _rideId, "Passenger not found in pending list");

    //     // Hoàn trả tiền đã gửi của hành khách
    //     uint256 fareAmount = pendingPassengers[_passenger][_rideId].numOfPeople * rides[_rideId].fare * 1e18;
    //    withdrawFunds(_passenger, fareAmount);

    //     // Xóa hành khách khỏi danh sách hàng đợi
    //     delete pendingPassengers[_passenger][_rideId];
    // }

    //4. Hàm hành khách nhập mã xác nhận và tham gia chuyến đi
    // function enterVerificationCode(uint _rideId, uint256 _verificationCode) public {
    //     Passenger storage passenger = pendingPassengers[msg.sender][_rideId];
    //     require(passenger.accepted, "Passenger not accepted yet");
    //     require(passenger.verificationCode == _verificationCode, "Incorrect verification code");
    //     // Thêm hành khách vào danh sách của chuyến đi
    //     addPassenger(_rideId, passenger.phoneNumber, passenger.numOfPeople);
    //     // Xóa thông tin hành khách khỏi danh sách pending
    //     delete pendingPassengers[msg.sender][_rideId];
    // }

    
    // Hàm này bỏ
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

    
    function getPassengers(uint rideId) external view returns (address payable[] memory) {
        require(rideId <= rideCount, "Invalid ride ID");
        return rides[rideId].passengers;
    }

    // Hàm để xoá một chuyến đi khỏi một danh sách chuyến đi
    function removeRideFromList(uint[] storage list, uint256 _rideId) private {
        for (uint i = 0; i < list.length; i++) {
            if (list[i] == _rideId) {
                list[i] = list[list.length - 1];
                delete list[list.length - 1];
                list.pop();
                break;
            }
        }
    }

    // Kiểm tra xem một hành khách đã nằm trong danh sách pending của chuyến đi đó chưa để tránh join 2 lần
    function isPassengerInPendingList(uint _rideId, address _passengerAddress) public view returns(uint) {
        uint i;
        for ( i = 0; i < pendingPassengers[_rideId].length; i++) {
            if (pendingPassengers[_rideId][i].addr== _passengerAddress) {
                return i+1; // Hành khách đã nằm trong danh sách pending
            }
        }
        return uint(0); // Hành khách chưa nằm trong danh sách pending
    }
    
    // Kiểm tra xem một hành khách đã nằm trong danh sách khách của chuyến đi đó
    function isPassengerInList(uint _rideId, address _passengerAddress) public view returns(uint) {
        uint i;
        for ( i = 0; i < passengers[_rideId].length; i++) {
            if (passengers[_rideId][i].addr== _passengerAddress) {
                return i+1; // Hành khách đã nằm trong danh sách pending
            }
        }
        return uint(0); // Hành khách chưa nằm trong danh sách pending
    }

    // Hàm để thêm lịch sử thay đổi số dư
    function addBalanceChange(address _user, int256 _amount, string memory _description) internal {

        
        balanceChangeCounter ++;
        // Ghi lại lịch sử thay đổi số dư
        balanceChangeHistory[_user].push(balanceChangeCounter);
        balanceChanges[balanceChangeCounter] =  BalanceChange({
            user: _user,
            amount: _amount,
            timestamp: block.timestamp,
            description: _description
           
        });
        emit BalanceChanged(_user, _amount);
    }
    
    
}
