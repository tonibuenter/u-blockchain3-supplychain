pragma solidity ^0.4.24;

import "../coffeeaccesscontrol/FarmerRole.sol";
import "../coffeeaccesscontrol/RetailerRole.sol";
import "../coffeeaccesscontrol/DistributorRole.sol";
import "../coffeeaccesscontrol/ConsumerRole.sol";
// Define a contract 'Supplychain'
contract SupplyChain is FarmerRole, RetailerRole, DistributorRole, ConsumerRole {

    // Define 'owner'
    address owner;

    // Define a variable called 'upc' for Universal Product Code (UPC)
    uint  upc;

    // Define a variable called 'sku' for Stock Keeping Unit (SKU)
    uint  sku;

    // Define enum 'State' with the following values:
    enum State
    {
        Harvested, // 0
        Processed, // 1
        Packed, // 2
        ForSale, // 3
        Sold, // 4
        Shipped, // 5
        Received, // 6
        Purchased   // 7
    }



    State constant defaultState = State.Harvested;

    // Define a struct 'Item' with the following fields:
    struct Item {
        uint sku;  // Stock Keeping Unit (SKU)
        uint upc; // Universal Product Code (UPC), generated by the Farmer, goes on the package, can be verified by the Consumer
        address ownerID;  // Metamask-Ethereum address of the current owner as the product moves through 8 stages
        address originFarmerID; // Metamask-Ethereum address of the Farmer
        string originFarmName; // Farmer Name
        string originFarmInformation;  // Farmer Information
        string originFarmLatitude; // Farm Latitude
        string originFarmLongitude;  // Farm Longitude
        uint productID;  // Product ID potentially a combination of upc + sku
        string productNotes; // Product Notes
        uint productPrice; // Product Price
        State itemState;  // Product State as represented in the enum above
        address distributorID;  // Metamask-Ethereum address of the Distributor
        address retailerID; // Metamask-Ethereum address of the Retailer
        address consumerID; // Metamask-Ethereum address of the Consumer
    }

    // Define a public mapping 'items' that maps the UPC to an Item.
    mapping(uint => Item) items;

    // Define a public mapping 'itemsHistory' that maps the UPC to an array of TxHash,
    // that track its journey through the supply chain -- to be sent from DApp.
    mapping(uint => string[]) itemsHistory;


    // Define 8 events with the same 8 state values and accept 'upc' as input argument
    event Harvested(uint upc);
    event Processed(uint upc);
    event Packed(uint upc);
    event ForSale(uint upc);
    event Sold(uint upc);
    event Shipped(uint upc);
    event Received(uint upc);
    event Purchased(uint upc);

    // Define a modifer that checks to see if msg.sender == owner of the contract
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // Define a modifer that verifies the Caller
    modifier verifyCaller (address _address) {
        require(msg.sender == _address);
        _;
    }

    // Define a modifier that checks if the paid amount is sufficient to cover the price
    modifier paidEnough(uint _price) {
        require(msg.value >= _price, 'Paid not enough for the Item!');
        _;
    }

    // Define a modifier that checks the price and refunds the remaining balance
    modifier checkValue(uint _upc) {
        _;
        uint _price = items[_upc].productPrice;
        uint amountToReturn = msg.value - _price;
        msg.sender.transfer(amountToReturn);
    }


    //    contract Sharer {
    //    function sendHalf(address payable addr) public payable returns (uint balance) {
    //        require(msg.value % 2 == 0, "Even value required.");
    //        uint balanceBeforeTransfer = address(this).balance;
    //        addr.transfer(msg.value / 2);
    //        // Since transfer throws an exception on failure and
    //        // cannot call back here, there should be no way for us to
    //        // still have half of the money.
    //        assert(address(this).balance == balanceBeforeTransfer - msg.value / 2);
    //        return address(this).balance;
    //    }
    //}

    // Define a modifier that checks if an item.state of a upc is Harvested
    modifier harvested(uint _upc) {
        require(items[_upc].itemState == State.Harvested, 'Harvested status not met!');
        _;
    }

    // Define a modifier that checks if an item.state of a upc is Processed
    modifier processed(uint _upc) {
        require(items[_upc].itemState == State.Processed, 'Processed status not met!');
        _;
    }

    // Define a modifier that checks if an item.state of a upc is Packed
    modifier packed(uint _upc) {
        require(items[_upc].itemState == State.Packed, 'Packed status not met!');
        _;
    }

    // Define a modifier that checks if an item.state of a upc is ForSale
    modifier forSale(uint _upc) {
        require(items[_upc].itemState == State.ForSale, 'ForSale status not met!');
        _;
    }

    // Define a modifier that checks if an item.state of a upc is Sold
    modifier sold(uint _upc) {
        require(items[_upc].itemState == State.Sold, 'Sold status not met!');
        _;
    }

    // Define a modifier that checks if an item.state of a upc is Shipped
    modifier shipped(uint _upc) {
        require(items[_upc].itemState == State.Shipped, 'Shipped status not met!');
        _;
    }

    // Define a modifier that checks if an item.state of a upc is Received
    modifier received(uint _upc) {
        require(items[_upc].itemState == State.Received, 'Received status not met!');
        _;
    }

    // Define a modifier that checks if an item.state of a upc is Purchased
    modifier purchased(uint _upc) {
        require(items[_upc].itemState == State.Purchased, 'Purchased status not met!');
        _;
    }

    // In the constructor set 'owner' to the address that instantiated the contract
    // and set 'sku' to 1
    // and set 'upc' to 1
    constructor() public payable {
        owner = msg.sender;
        sku = 1;
        upc = 1;
    }

    // Define a function 'kill' if required
    function kill() public {
        if (msg.sender == owner) {
            selfdestruct(owner);
        }
    }


    function getState(uint _upc) public view returns (string memory)
    {
        return _toStateString(items[_upc].itemState);
    }

    function _toStateString(State _state) public pure returns (string memory) {
        // Loop through possible options
        if (_state == State.Harvested) return "Harvested";
        if (_state == State.Processed) return "Processed";
        if (_state == State.Packed) return "Packed";
        if (_state == State.ForSale) return "ForSale";
        if (_state == State.Sold) return "Sold";
        if (_state == State.Shipped) return "Shipped";
        if (_state == State.Received) return "Received";
        if (_state == State.Purchased) return "Purchased";
        return '';
    }


    // Define a function 'harvestItem' that allows a farmer to mark an item 'Harvested'
    function harvestItem(uint _upc, address _originFarmerID, string _originFarmName, string _originFarmInformation,
        string _originFarmLatitude, string _originFarmLongitude, string _productNotes) public
    {
        // Add the new item as part of Harvest
        items[_upc] = Item(sku,
            _upc,
            _originFarmerID,
            _originFarmerID, // Metamask-Ethereum address of the Farmer
            _originFarmName, // Farmer Name
            _originFarmInformation, // Farmer Information
            _originFarmLatitude, // Farm Latitude
            _originFarmLongitude, // Farm Longitude
            _upc + sku, // Product ID potentially a combination of upc + sku
            _productNotes, // Product Notes
            uint(0), // Product Price
            State.Harvested, // Product State as represented in the enum above
            address(0), // Metamask-Ethereum address of the Distributor
            address(0), // Metamask-Ethereum address of the Retailer
            address(0) // Metamask-Ethereum address of the Consumer);
        );
        addFarmer(_originFarmerID);
        // Increment sku
        sku = sku + 1;
        // Emit the appropriate event
        emit Harvested(_upc);
    }

    // Define a function 'processtItem' that allows a farmer to mark an item 'Processed'
    function processItem(uint _upc) public
        // Call modifier to check if upc has passed previous supply chain stage
    harvested(_upc)
        // Call modifier to verify caller of this function
    onlyFarmer

    {
        // Update the appropriate fields
        Item storage item = items[_upc];

        require(item.originFarmerID == msg.sender, 'Origin Farmer ID does not match sender address!');

        item.itemState = State.Processed;

        item.productNotes = 'process Item DONE';

        require(item.itemState == State.Processed, 'Could not change item state!');

        // Emit the appropriate event
        emit Processed(_upc);

    }

    // Define a function 'packItem' that allows a farmer to mark an item 'Packed'
    function packItem(uint _upc) public
        // Call modifier to check if upc has passed previous supply chain stage
    processed(_upc)
        // Call modifier to verify caller of this function
    onlyFarmer
    {
        // Update the appropriate fields
        Item storage item = items[_upc];
        require(item.originFarmerID == msg.sender, 'Origin Farmer ID does not match sender address!');

        item.itemState = State.Packed;

        require(item.itemState == State.Packed, 'Could not change item state!');

        // Emit the appropriate event
        emit Packed(upc);

    }

    // Define a function 'sellItem' that allows a farmer to mark an item 'ForSale'
    function sellItem(uint _upc, uint _price) public
        // Call modifier to check if upc has passed previous supply chain stage
    packed(_upc)
        // Call modifier to verify caller of this function
    onlyFarmer
    {
        // Update the appropriate fields
        Item storage item = items[_upc];
        require(item.originFarmerID == msg.sender);

        item.productPrice = _price;
        item.itemState = State.ForSale;

        require(item.itemState == State.ForSale, 'Could not change item state!');

        // Emit the appropriate event
        emit ForSale(upc);
    }

    // Define a function 'buyItem' that allows the disributor to mark an item 'Sold'
    // Use the above defined modifiers to check if the item is available for sale, if the buyer has paid enough,
    // and any excess ether sent is refunded back to the buyer
    function buyItem(uint _upc) public payable
        // Call modifier to check if upc has passed previous supply chain stage
    forSale(_upc)
        // Call modifer to check if buyer has paid enough
    paidEnough(_upc)
        // Call modifer to send any excess ether back to buyer
    checkValue(_upc)
    {
        // Update the appropriate fields - ownerID, distributorID, itemState
        Item storage item = items[_upc];

        item.ownerID = msg.sender;
        item.consumerID = msg.sender;
        item.distributorID = msg.sender;
        item.itemState = State.Sold;

        // Transfer money to farmer
        item.originFarmerID.transfer(item.productPrice);

        // emit the appropriate event
        emit Sold(upc);
    }

    // Define a function 'shipItem' that allows the distributor to mark an item 'Shipped'
    // Use the above modifers to check if the item is sold
    function shipItem(uint _upc) public
        // Call modifier to check if upc has passed previous supply chain stage
    sold(_upc)
        // Call modifier to verify caller of this function
    onlyDistributor
    {
        // Update the appropriate fields
        Item storage item = items[_upc];
        item.distributorID = msg.sender;
        item.itemState = State.Shipped;

        // Emit the appropriate event
        emit Shipped(_upc);

    }

    // Define a function 'receiveItem' that allows the retailer to mark an item 'Received'
    // Use the above modifiers to check if the item is shipped
    function receiveItem(uint _upc) public
        // Call modifier to check if upc has passed previous supply chain stage
    shipped(_upc)
        // Access Control List enforced by calling Smart Contract / DApp
    onlyRetailer
    {
        // Update the appropriate fields - ownerID, retailerID, itemState
        Item storage item = items[_upc];
        item.itemState = State.Received;

        // Emit the appropriate event
        emit Received(_upc);

    }

    // Define a function 'purchaseItem' that allows the consumer to mark an item 'Purchased'
    // Use the above modifiers to check if the item is received
    function purchaseItem(uint _upc) public
        // Call modifier to check if upc has passed previous supply chain stage
    received(_upc)
        // Access Control List enforced by calling Smart Contract / DApp
    onlyConsumer
    {
        // Update the appropriate fields - ownerID, consumerID, itemState
        Item storage item = items[_upc];
        item.itemState = State.Purchased;

        // Emit the appropriate event
        emit Purchased(_upc);

    }

    // Define a function 'fetchItemBufferOne' that fetches the data
    function fetchItemBufferOne(uint _upc) public view returns
    (
        uint itemSKU,
        uint itemUPC,
        address ownerID,
        address originFarmerID,
        string originFarmName,
        string originFarmInformation,
        string originFarmLatitude,
        string originFarmLongitude
    )
    {
        // Assign values to the 8 parameters
        Item memory item = items[_upc];

        return
        (item.sku,
        item.upc,
        item.ownerID,
        item.originFarmerID,
        item.originFarmName,
        item.originFarmInformation,
        item.originFarmLatitude,
        item.originFarmLongitude);
    }

    // Define a function 'fetchItemBufferTwo' that fetches the data
    function fetchItemBufferTwo(uint _upc) public view returns
    (
        uint itemSKU,
        uint itemUPC,
        uint productID,
        string productNotes,
        uint productPrice,
        uint itemState,
        address distributorID,
        address retailerID,
        address consumerID
    )
    {
        // Assign values to the 9 parameters
        Item memory item = items[_upc];
        itemSKU = item.sku;
        itemUPC = item.upc;
        productID = item.productID;
        productNotes = item.productNotes;
        productPrice = item.productPrice;
        itemState = uint(item.itemState);
        distributorID = item.distributorID;
        retailerID = item.retailerID;
        consumerID = item.consumerID;

        return;

    }


}
