App = {
    loading: false,
    contracts: {},
    account: null,
    rideContract: null,
    web3Provider: null,
    balance: 0, 
  
  
    load: async () => {
      await App.loadWeb3();
      await App.loadAccount();
      await App.loadContract();
      await App.render();
      await App.updateBalance();// Cập nhật số dư khi tải ứng dụng
    },
  
    loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
        App.web3Provider = window.ethereum;
        web3 = new Web3(window.ethereum);
      } else {
        window.alert("Please connect to Metamask.");
      }
  
      if (window.ethereum) {
        //App.web3Provider = new Web3(ethereum);
        try {
          await ethereum.request({ method: 'eth_requestAccounts' })
         // web3.eth.sendTransaction({/*...*/});
        } catch (error) {
          console.error('User denied account access');
        }
      } else if (window.web3) {
        App.web3Provider = web3.currentProvider;
        window.web3 = new Web3(web3.currentProvider);
        web3.eth.sendTransaction({});
      } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
    },
  
    loadAccount: async () => {
      const accounts = await web3.eth.getAccounts();
      App.account = accounts[0];
      $('#account').html(`Account: ${App.account}`);
    },
  
    loadContract: async () => {
       
        const rideContracts = await $.getJSON('RideContract.json');
        App.contracts.RideContract = TruffleContract(rideContracts )
        App.contracts.RideContract.setProvider(App.web3Provider)

         // Hydrate the smart contract with values from the blockchain
        App.rideContracts  = await App.contracts.RideContract.deployed()
    },
  
    render: async () => {
      if (App.loading) {
        return;
      }
      App.setLoading(true);
      await App.renderRides();
      App.setLoading(false);
    },
    updateBalance: async () => {
        try {
          // Truy vấn số dư của tài khoản hiện tại
          const accounts = await window.web3.eth.getAccounts();
          const account = accounts[0];
          const balanceWei = await window.web3.eth.getBalance(account);
          const balanceEther = window.web3.utils.fromWei(balanceWei, 'ether');
          App.balance = parseFloat(balanceEther);
          $('#balance').html(`Balance: ${App.balance} ETH`);
          
        } catch (error) {
          console.error('Error updating balance:', error);
        }
      },
    renderRides: async () => {
        const rideCount = await App.rideContracts.rideCount()
        const $rideContractsList =  $('#rideContracts');
        $rideContractsList.empty();
    
        // Render danh sách các ride contracts
        for (var i = 1; i <= rideCount; i++) {
            const rideContract = await App.rideContracts.rides(i)  
            const $rideContract = $('<li>').text(` Start Point: ${rideContract.startPoint}, End Point: ${rideContract.endPoint}, Fare: ${rideContract.fare}`);
            $rideContractsList.append($rideContract);
        };
    },
  
    createRide: async () => {
      App.setLoading(true);
      const startPoint = $('#startPoint').val();
      const endPoint = $('#endPoint').val();
      const fare = $('#fare').val();
      await App.rideContracts.createRide(startPoint, endPoint, fare, { from: App.account });
      window.location.reload();
    },
  
    setLoading: (boolean) => {
      App.loading = boolean;
      const loader = $('#loader');
      const content = $('#content');
      if (boolean) {
        loader.show();
        content.hide();
      } else {
        loader.hide();
        content.show();
      }
    }
  }
  
  $(() => {
    $(window).load(() => {
      App.load();
    });
  });
  