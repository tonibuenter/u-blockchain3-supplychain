// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact

const truffleAssert = require('truffle-assertions');

var SupplyChain = artifacts.require('SupplyChain');

contract('SupplyChain', function (accounts) {
  var sku = 1;
  var upc = 1;
  const ownerID = accounts[0];
  const originFarmerID = accounts[1];
  const originFarmName = 'John Doe';
  const originFarmInformation = 'Yarray Valley';
  const productImageHash = '';
  const originFarmLatitude = '-38.239770';
  const originFarmLongitude = '144.341490';
  var productID = sku + upc;
  const productNotes = 'Some Best beans for Espresso...';
  const productPrice = web3.utils.toWei('1', 'ether');
  var itemState = 0;
  const distributorID = accounts[2];
  const retailerID = accounts[3];
  const consumerID = accounts[4];
  const anybodyID = accounts[5];
  const emptyAddress = '0x00000000000000000000000000000000000000';

  ///Available Accounts
  ///==================
  ///(0) 0x1c51fB105A131e6dc30263Df09235697138DC473
  ///(1) 0x15dE60c3aEa2C21Fd1706C4A6aC0aA2Db105554c
  ///(2) 0x6fE90a13C80F6F8dcB6646F0EB42485E7EA2806B
  ///(3) 0x836B084150Ec645b150736656db46c2a4c3BAAb6

  console.log('Contract Owner:', ownerID);
  console.log('Farmer:', originFarmerID);
  console.log('Distributor:', distributorID);
  console.log('Retailer:', retailerID);
  console.log('Consumer:', consumerID);

  // 1st Test :: HARVEST
  it('HARVEST :: Testing smart contract function harvestItem() that allows a farmer to harvest coffee', async () => {
    const supplyChain = await SupplyChain.deployed();

    // Declare and Initialize a variable for event
    var eventEmitted = false;

    supplyChain.contract.events.Harvested({}, function (error, event) {
      eventEmitted = true;
    });

    // Mark an item as Harvested by calling function harvestItem()
    await supplyChain.harvestItem(
      upc,
      originFarmerID,
      originFarmName,
      originFarmInformation,
      originFarmLatitude,
      originFarmLongitude,
      productNotes,
      productImageHash,
      { from: originFarmerID }
    );

    await supplyChain.harvestItem(
      222,
      originFarmerID,
      originFarmName,
      originFarmInformation,
      originFarmLatitude,
      originFarmLongitude,
      productNotes,
      productImageHash,
      { from: originFarmerID }
    );

    let exists = await supplyChain.isUpcExists(upc);
    assert.isTrue(exists, 'UPC should exist!');

    exists = await supplyChain.isUpcExists(0);
    assert.isTrue(!exists, 'UPC should not exist!');

    exists = await supplyChain.isUpcExists(1212);
    assert.isTrue(!exists, 'UPC should not exist!');

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
    assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC');
    assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID');
    assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID');
    assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName');
    assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation');
    assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude');
    assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude');
    assert.equal(resultBufferOne[8], productImageHash, 'Error: Missing or Invalid productImageHash');
    //
    assert.equal(resultBufferTwo[0], sku, 'Error resultBufferTwo: Invalid item SKU');
    assert.equal(resultBufferTwo[1], upc, 'Error resultBufferTwo: Invalid item UPC');
    assert.equal(resultBufferTwo[4], 0, 'Error resultBufferTwo: Invalid price');

    assert.equal(resultBufferTwo[5], 0, 'Error resultBufferTwo: Invalid item State');
    assert.equal(eventEmitted, true, 'Invalid event emitted');
  });

  //
  // 2nd Test :: PROCESS
  //
  it('PROCESS :: Testing smart contract function processItem() that allows a farmer to process coffee', async () => {
    const supplyChain = await SupplyChain.deployed();

    // Declare and Initialize a variable for event
    let processEventEmitted = false;

    // Watch the emitted event Processed()
    supplyChain.contract.events.Processed({}, function (error, event) {
      processEventEmitted = true;
    });

    let currentState = await supplyChain.getState(upc);
    assert.equal(currentState, 'Harvested', 'Current state (before)');

    // Mark an item as Processed by calling function processtItem()
    await supplyChain.processItem(upc, {
      from: originFarmerID
    });

    currentState = await supplyChain.getState(upc);
    assert.equal(currentState, 'Processed', 'Current state (after)');

    assert.equal(processEventEmitted, true, 'Processed event not emitted!');

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await supplyChain.fetchItemBufferOne(upc, {
      from: originFarmerID
    });
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo(upc, {
      from: originFarmerID
    });

    // Verify the result set
    assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
    assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC');
    assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID');
    assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID');
    assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName');
    assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation');
    assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude');
    assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude');
    assert.equal(resultBufferOne[8], productImageHash, 'Error: Missing or Invalid productImageHash');

    //
    assert.equal(resultBufferTwo[0], sku, 'Error resultBufferTwo: Invalid item SKU');
    assert.equal(resultBufferTwo[1], upc, 'Error resultBufferTwo: Invalid item UPC');
    assert.equal(resultBufferTwo[4], 0, 'Error resultBufferTwo: Invalid price');
  });

  //
  // 3rd Test :: PACK
  //
  it('PACK :: Testing smart contract function packItem() that allows a farmer to pack coffee', async () => {
    const supplyChain = await SupplyChain.deployed();

    // Declare and Initialize a variable for event
    let eventEmitted = false;
    supplyChain.contract.events.Packed({}, function (error, event) {
      eventEmitted = true;
    });

    let currentState = await supplyChain.getState(upc);
    assert.equal(currentState, 'Processed', 'Current state (before)');

    // Mark an item as Packed by calling function packItem()
    await supplyChain.packItem(upc, { from: originFarmerID });

    currentState = await supplyChain.getState(upc);
    assert.equal(currentState, 'Packed', 'Current state (after)');

    assert.equal(eventEmitted, true, 'Processed event not emitted!');
  });

  //
  // 4th Test :: SELL
  //
  it('SELL :: Testing smart contract function sellItem() that allows a farmer to sell coffee', async () => {
    const supplyChain = await SupplyChain.deployed();
    let currentState = await supplyChain.getState(upc);
    assert.equal(currentState, 'Packed', 'Current state (before)');

    let eventEmitted = false;
    supplyChain.contract.events.ForSale({}, function (error, event) {
      eventEmitted = true;
    });

    await supplyChain.sellItem(upc, 12, { from: originFarmerID });

    currentState = await supplyChain.getState(upc);
    assert.equal(currentState, 'ForSale', 'Current state (after)');

    assert.equal(eventEmitted, true, 'Processed event not emitted!');
  });

  // 5th Test :: SOLD
  it('SOLD :: Testing smart contract function buyItem() that allows a distributor to buy coffee', async () => {
    const supplyChain = await SupplyChain.deployed();
    let eventEmitted = false;
    supplyChain.contract.events.Sold({}, function (error, event) {
      eventEmitted = true;
    });

    await supplyChain.addDistributor(distributorID, { from: ownerID });

    let ethBefore = await web3.eth.getBalance(originFarmerID);

    await supplyChain.buyItem(upc, {
      from: distributorID,
      value: 1.5 * web3.utils.toWei('1', 'ether')
    });

    // Retrieve the just now saved item from blockchain by calling function fetchItem()

    // Verify the result set
  });

  // 6th Test :: SHIPPED
  it('SHIPPED :: Testing smart contract function shipItem() that allows a distributor to ship coffee', async () => {
    const supplyChain = await SupplyChain.deployed();
    let eventEmitted = false;
    supplyChain.contract.events.Shipped({}, function (error, event) {
      eventEmitted = true;
    });

    await supplyChain.shipItem(upc, {
      from: distributorID
    });

    currentState = await supplyChain.getState(upc);
    assert.equal(currentState, 'Shipped', 'Current state (after)');
    assert.equal(eventEmitted, true, 'Processed event not emitted!');
  });

  // 7th Test :: RECEIVED
  it('RECEIVED :: Testing smart contract function receiveItem() that allows a retailer to mark coffee received', async () => {
    const supplyChain = await SupplyChain.deployed();

    await supplyChain.addRetailer(retailerID, { from: ownerID });

    let eventEmitted = false;
    supplyChain.contract.events.Shipped({}, function (error, event) {
      eventEmitted = true;
    });

    await supplyChain.receiveItem(upc, {
      from: retailerID
    });

    currentState = await supplyChain.getState(upc);
    assert.equal(currentState, 'Received', 'Current state (after)');

    assert.equal(eventEmitted, true, 'Processed event not emitted!');
  });

  // 8th Test
  it('PURCHASED :: Testing smart contract function purchaseItem() that allows a consumer to purchase coffee', async () => {
    const supplyChain = await SupplyChain.deployed();

    await supplyChain.addConsumer(consumerID, { from: ownerID });

    let eventEmitted = false;
    supplyChain.contract.events.Purchased({}, function (error, event) {
      eventEmitted = true;
    });

    await supplyChain.purchaseItem(upc, {
      from: consumerID
    });

    currentState = await supplyChain.getState(upc);
    assert.equal(currentState, 'Purchased', 'Current state (after)');

    assert.equal(eventEmitted, true, 'Processed event not emitted!');
  });

  // 9th Test
  it('FETCHITEMBUFFERONE :: Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain', async () => {
    const supplyChain = await SupplyChain.deployed();

    let itemOne = await supplyChain.fetchItemBufferOne(upc, {
      from: anybodyID
    });
    assert.equal(itemOne.itemSKU, 1, 'Check itemSKU');
    // Verify the result set:
  });

  // 10th Test
  it('FETCHITEMBUFFERTWO Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain', async () => {
    const supplyChain = await SupplyChain.deployed();

    let itemOne = await supplyChain.fetchItemBufferTwo(upc, {
      from: anybodyID
    });

    assert.equal(itemOne.itemState, 7, 'Final Item State');
    // Verify the result set:
  });

  // 11th Test
  it('OWNER Testing owner ship', async () => {
    const supplyChain = await SupplyChain.deployed();

    let _owner = await supplyChain.owner();

    assert.equal(_owner, ownerID, 'Wrong ownership');
    // Verify the result set:
  });

  // 11th Test
  it('CHANGEOWNER Testing owner ship changes', async () => {
    const supplyChain = await SupplyChain.deployed();

    await supplyChain.transferOwnership(originFarmerID, { from: ownerID });

    let _owner = await supplyChain.owner();

    assert.equal(_owner, originFarmerID, 'Wrong ownership after transfer');

    await supplyChain.transferOwnership(ownerID, { from: originFarmerID });

    _owner = await supplyChain.owner();

    assert.equal(_owner, ownerID, 'Wrong ownership after reset transfer');

    // Verify the result set:
  });
});
