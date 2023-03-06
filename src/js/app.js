function AppFun() {
  $('.tooltip').tooltipster({
    theme: 'tooltipster-light'
  });

  const appAttributes = ['metamaskAccountID', 'ownerID', 'supplyChainContractAddress'];

  const contractAttributes = [
    'upc',
    'sku',
    'originFarmerID',
    'originFarmName',
    'originFarmInformation',
    'originFarmLatitude',
    'originFarmLongitude',
    'productNotes',
    'productPrice',
    'distributorID',
    'retailerID',
    'consumerID',
    'itemState'
  ];

  let formData = {};

  const App = {
    web3Provider: null,
    contracts: {},
    metamaskAccountID: '0x0000000000000000000000000000000000000000',
    ownerID: '0x0000000000000000000000000000000000000000'
  };

  init();

  async function init() {
    infoLog('start init');
    bindEvents();
    /// Setup access to blockchain
    await initWeb3();
    await getMetaskAccountID();
    await initSupplyChain();
  }

  function readFormData() {
    contractAttributes.forEach((att) => (formData[att] = $('#' + att).val()));
    formData.productImageHash = App.productImageHash;
  }

  function writeAppData() {
    appAttributes.forEach((att) => {
      $('#' + att).val(App[att]);
    });
  }

  function inputVal(id) {
    return $('#' + id).val();
  }

  function abbrAddress(address) {
    if (address.length !== 42) {
      return '';
    }
    return address.substring(0, 5) + '...' + address.substring(38, 42);
  }

  function equalAddress(address0, address1) {
    if (!abbrAddress(address0) || !abbrAddress(address1)) {
      return false;
    }
    return address0.toLowerCase() === address1.toLowerCase();
  }

  function writeFormData(data) {
    formData = { ...formData, ...data };
    contractAttributes.forEach((att) => $('#' + att).val(formData[att]));
    console.log(`formData.itemState ${formData.itemState}`);
    App.productImageHash = formData.productImageHash;
    displayProductImage();
  }

  async function initWeb3() {
    /// Find or Inject Web3 Provider
    /// Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
        successLog('DONE: window.ethereum.enable');
      } catch (error) {
        errorLog('User denied account access');
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
      successLog('DONE: window.web3');
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      successLog('DONE: Fallback to Ganache');
    }
    App.web3 = new Web3(App.web3Provider);
  }

  async function getMetaskAccountID() {
    // Retrieving accounts
    try {
      const res = await ethereum.request({ method: 'eth_accounts' });
      console.log('getMetaskID:', res);
      successLog(`getMetaskID: ${res.join(';')}`);
      App.metamaskAccountID = res[0];
      writeAppData();
    } catch (error) {
      console.log('Error:', error);
      errorLog('eth_accounts ' + error.message);
    }
  }

  async function initSupplyChain() {
    /// Source the truffle compiled smart contracts
    let jsonSupplyChain = '../../build/contracts/SupplyChain.json';
    let p = new Promise((resolve) => {
      try {
        $.getJSON(jsonSupplyChain, function (data) {
          resolve(data);
        });
      } catch (e) {
        console.error(e);
        resolve(null);
      }
    });
    let supplyChainArtifact = await p;
    App.contracts.SupplyChain = TruffleContract(supplyChainArtifact);
    App.contracts.SupplyChain.setProvider(App.web3Provider);
    try {
      txStart();
      const supplyChain = await App.contracts.SupplyChain.deployed();
      App.ownerID = await supplyChain.owner();
      App.supplyChainContractAddress = supplyChain.address;
      writeAppData();
      updateRoleManager(App);
    } catch (e) {
      console.error(e);
    } finally {
      txEnd();
    }
  }

  function bindEvents() {
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((_id) => {
      $('#button' + _id).click(async (e) => {
        e.preventDefault();
        await getMetaskAccountID();
        await process(_id);
      });
    });

    $('#button-search-clear').click((e) => {
      e.preventDefault();
      $('#upcSearch').val('');
      $('#div-result').empty('');
    });

    $('#button-search-select').click(async (e) => {
      e.preventDefault();
      let upc = $('#upcSearch').val();
      if (!upc) {
        return;
      }
      const supplyChain = await App.contracts.SupplyChain.deployed();
      let res = await supplyChain.fetchItemBufferOne(upc);
      writeFormData(res);
      res = await supplyChain.fetchItemBufferTwo(upc);
      writeFormData({ ...res, upc });
    });

    $('#button-upload-image').click(async () => {
      uploadInfura();
    });

    $('#transfer-ownership').click(async () => {
      if (!equalAddress(App.metamaskAccountID, App.ownerID)) {
        alert('You are not a the Owner of the Contract.');
        return;
      }
      let newOwnerID = inputVal('newOwnerID');
      if (!abbrAddress(newOwnerID)) {
        alert('Please enter valid address for Contract New Owner ID');
        return;
      }
      try {
        txStart();
        const supplyChain = await App.contracts.SupplyChain.deployed();
        let receipt = await supplyChain.transferOwnership(newOwnerID, { from: App.ownerID });
        processReceipt(receipt);
        alert('Contract Ownership has changed. Please reload page.');
      } catch (e) {
        alert('Could not transfer Contract Ownership: ' + e.message);
      } finally {
        txEnd();
      }
    });
  }

  async function uploadInfura() {
    const input = document.getElementById('productImage');
    let file;
    if (!(input && input.files[0])) {
      alert('Please choose a file first!');
      return;
    }
    file = input.files[0];

    const _formData = new FormData();
    _formData.append('file', file);
    let res = await fetch('https://ipfs.infura.io:5001/api/v0/add?pin=false', {
      // Your POST endpoint
      method: 'POST',
      mode: 'cors',
      headers: {
        //'Content-Type': 'multipart/form-data; boundary=----'
      },
      body: _formData
    });
    let json = await res.json();
    App.productImageHash = json.Hash;
    displayProductImage();
  }

  function displayProductImage() {
    if (App.productImageHash) {
      $('#displayProductImage').attr('src', 'https://ipfs.infura.io:5001/api/v0/cat?arg=' + App.productImageHash);
    } else {
      $('#displayProductImage').attr('src', 'assets/NO_PRODUCT_IMAGE.png');
    }
  }

  async function process(processId) {
    console.log('processId', processId);
    let res;
    switch (processId) {
      case 1:
        harvestItem();
        break;
      case 2:
        processItem();
        break;
      case 3:
        packItem();
        break;
      case 4:
        sellItem();
        break;
      case 5:
        buyItem();
        break;
      case 6:
        shipItem();
        break;
      case 7:
        receiveItem();
        break;
      case 8:
        purchaseItem();
        break;
      case 9:
        res = await fetchItemBufferOne();
        processResultOne(res);
        break;
      case 10:
        res = await fetchItemBufferTwo();
        processResultTwo(res);
        break;
      default:
        console.error(`Unknown processId: ${processId}`);
    }
  }

  async function harvestItem() {
    if (!App.isFarmer) {
      alert('You are not a Farmer');
      return;
    }
    readFormData();

    try {
      txStart();
      const supplyChain = await App.contracts.SupplyChain.deployed();
      let exists = await supplyChain.isUpcExists(formData.upc);
      if (exists) {
        alert(`UPC ${formData.upc} already in use!`);
        return;
      }
      let originFarmerID = formData.originFarmerID || App.metamaskAccountID;

      const receipt = await supplyChain.harvestItem(
        formData.upc,
        originFarmerID,
        formData.originFarmName,
        formData.originFarmInformation,
        formData.originFarmLatitude || '0',
        formData.originFarmLongitude || '0',
        formData.productNotes,
        formData.productImageHash || '',
        { from: App.metamaskAccountID }
      );
      processReceipt(receipt);
      const { logs } = receipt;
      const newProductIdLog = logs.filter((e) => e.event === 'NewProductID')[0];
      if (newProductIdLog) {
        alert('Harvest Item was successful. Product ID: ' + newProductIdLog.args.productID);
      } else {
        alert('Hm, Harvest Item was successful, but no productID returned :-(');
      }
    } catch (e) {
      alert('Harvest Item was not successful. ' + e.message);
    } finally {
      txEnd();
    }
  }

  async function processItem() {
    if (!App.isFarmer) {
      alert('You are not a Farmer');
      return;
    }
    readFormData();
    try {
      txStart();
      const supplyChain = await App.contracts.SupplyChain.deployed();
      const receipt = await supplyChain.processItem(formData.upc, { from: App.metamaskAccountID });
      processReceipt(receipt);
      alert('Item processed');
    } catch (e) {
      alert('Could not process item: ' + e.message);
    } finally {
      txEnd();
    }
  }

  async function packItem() {
    if (!App.isFarmer) {
      alert('You are not a Farmer');
      return;
    }
    readFormData();
    try {
      txStart();
      const supplyChain = await App.contracts.SupplyChain.deployed();
      const receipt = await supplyChain.packItem(formData.upc, { from: App.metamaskAccountID });
      processReceipt(receipt);
      alert('Item packed');
    } catch (e) {
      alert('Could not pack item: ' + e.message);
    } finally {
      txEnd();
    }
  }

  async function sellItem() {
    if (!App.isFarmer) {
      alert('You are not a Farmer');
      return;
    }
    readFormData();
    try {
      txStart();
      const supplyChain = await App.contracts.SupplyChain.deployed();
      const receipt = await supplyChain.sellItem(formData.upc, formData.productPrice, { from: App.metamaskAccountID });
      processReceipt(receipt);
      alert('Item sold');
    } catch (e) {
      alert('Could not sell item: ' + e.message);
    } finally {
      txEnd();
    }
  }

  async function buyItem() {
    if (!App.isDistributor) {
      alert('You are not a Distributor');
      return;
    }
    readFormData();
    try {
      txStart();
      const supplyChain = await App.contracts.SupplyChain.deployed();
      const walletValue = App.web3.utils.toWei('0.01', 'ether');
      const receipt = await supplyChain.buyItem(formData.upc, { from: App.metamaskAccountID, value: walletValue });
      processReceipt(receipt);
      alert('Item Bought');
    } catch (e) {
      alert('Could not buy item: ' + e.message);
    } finally {
      txEnd();
    }
  }

  async function shipItem() {
    if (!App.isDistributor) {
      alert('You are not a Distributor');
      return;
    }
    readFormData();
    try {
      txStart();
      const supplyChain = await App.contracts.SupplyChain.deployed();
      const receipt = await supplyChain.shipItem(formData.upc, { from: App.metamaskAccountID });
      processReceipt(receipt);
      alert('Item Shipped');
    } catch (e) {
      alert('Could not ship item: ' + e.message);
    } finally {
      txEnd();
    }
  }

  async function receiveItem() {
    if (!App.isRetailer) {
      alert('You are not a Retailer');
      return;
    }
    try {
      txStart();
      const supplyChain = await App.contracts.SupplyChain.deployed();
      const receipt = await supplyChain.receiveItem(formData.upc, { from: App.metamaskAccountID });
      processReceipt(receipt);
      alert('Item Received');
    } catch (e) {
      alert('Could not receive item: ' + e.message);
    } finally {
      txEnd();
    }
  }

  async function purchaseItem() {
    if (!App.isConsumer) {
      alert('You are not a Consumer');
      return;
    }
    readFormData();
    try {
      txStart();
      const supplyChain = await App.contracts.SupplyChain.deployed();
      const receipt = await supplyChain.purchaseItem(formData.upc, { from: App.metamaskAccountID });
      processReceipt(receipt);
      alert('Item Purchased');
    } catch (e) {
      alert('Could not purchase item: ' + e.message);
    } finally {
      txEnd();
    }
  }

  function processReceipt(receipt) {
    const { logs } = receipt;
    $('#transaction-history').prepend($('<pre>').text(JSON.stringify(receipt, null, 2)));
    let logD = $('<div>').addClass('events');
    for (let log of logs) {
      logD.append($('<div>').text('Event: ' + log.event));
    }
    $('#transaction-events').prepend(logD);
  }

  async function fetchItemBufferOne() {
    let upc = $('#upcSearch').val();
    if (!upc) {
      alert('Please enter UPC number (greater than 0)');
      return;
    }
    infoLog(`Try to fetchItemBufferOne ${App.upcSearch}`);
    const supplyChain = await App.contracts.SupplyChain.deployed();
    const res = await supplyChain.fetchItemBufferOne(upc);
    infoLog(JSON.stringify(res));
    return res;
  }

  async function fetchItemBufferTwo() {
    let upc = $('#upcSearch').val();
    if (!upc) {
      alert('Please enter UPC number (greater than 0)');
      return;
    }
    infoLog(`Try to fetchItemBufferTwo ${App.upcSearch}`);
    const supplyChain = await App.contracts.SupplyChain.deployed();
    const res = await supplyChain.fetchItemBufferTwo(upc);
    infoLog(JSON.stringify(res));
    return res;
  }
}

$(function () {
  //$(window).load(function () {
    AppFun();
  //});
});

function infoLog(txt) {
  $('#log-data').prepend($('<div>').text(txt));
}

function errorLog(txt) {
  $('#log-data').prepend($('<div>').addClass('error').text(txt));
}

function successLog(txt) {
  $('#log-data').prepend($('<div>').addClass('success').text(txt));
}

function processResultOne(res) {
  if (res) {
    $('#div-result')
      .empty()
      .append(
        $('<table>').append(
          _row('SKU', res[0]),
          _row('UPC', res[1]),
          _row('Owner ID', res[2]),
          _row('Farmer ID', res[3]),
          _row('Name', res[4]),
          _row('Farmer Information', res[5]),
          _row('Latitude', res[6]),
          _row('Longitude', res[7]),
          _row('productImageHash', res[8])
        )
      );
  }
}

function processResultTwo(res) {
  if (res) {
    $('#div-result')
      .empty()
      .append(
        $('<table>').append(
          _row('Product Notes', res.productNotes),
          _row('Price', res.productPrice),
          _row('State', _stateInfo(res.itemState)),
          _row('Distributor', res.distributorID),
          _row('Retailer', res.retailerID),
          _row('Consumer', res.consumerID)
        )
      );
  }
}

function _row(label, value) {
  return $('<tr>').append($('<td>').addClass('label').text(label), $('<td>').text(value));
}

function _stateInfo(itemState) {
  let text = [
    'Harvested', // 0
    'Processed', // 1
    'Packed', // 2
    'ForSale', // 3
    'Sold', // 4
    'Shipped', // 5
    'Received', // 6
    'Purchased' // 7
  ][+itemState];
  return text || 'Unkown Item State';
}

function updateRoleManager(appData) {
  const roles = ['Farmer', 'Distributor', 'Retailer', 'Consumer'];
  let address = appData.metamaskAccountID;

  process();

  async function process() {
    let div = $('#div-role-manager');

    div.empty();
    const roleContract = await appData.contracts.SupplyChain.deployed();

    let buttons = $('<div>').addClass('buttons');
    div.append(buttons);
    for (let role of roles) {
      let state = (appData['is' + role] = await roleContract['is' + role](address, { from: address }));
      buttons.append(_button(role, state));
    }
    buttons.append(_refresh_button());
  }

  function _button(role, state) {
    return $('<button>', {
      text: role,
      click: async () => {
        try {
          txStart();
          if (confirm('Changing state (current ' + state + ') for ' + role)) {
            const roleContract = await appData.contracts.SupplyChain.deployed();
            if (state) {
              await roleContract['renounce' + role]({ from: address });
            } else {
              await roleContract['add' + role](address, { from: address });
            }
            alert('Please refresh the Roles after a couple of seconds to see the changes.');
          }
        } finally {
          txEnd();
        }
      }
    }).addClass('button state-' + state);
  }

  function _refresh_button() {
    return $('<button>', {
      text: 'refresh',
      class: 'button',
      click: async () => {
        updateRoleManager(appData);
      }
    });
  }
}

function txStart() {
  $('#transaction-in-progress').show();
}

function txEnd() {
  $('#transaction-in-progress').hide();
}
