const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');
const path = require('path');
let rawdata = fs.readFileSync(path.join(__dirname, 'local', 'config.json'));
let config = JSON.parse(rawdata);
console.log(config);

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      host: 'localhost', // Localhost (default: none)
      provider: function () {
        return new HDWalletProvider(config.privateKey, 'https://rinkeby.infura.io/v3/' + config.projectId);
      },
      network_id: 4,
      gas: 6700000,
      gasPrice: 10000000000
    }
  },
  compilers: {
    solc: {
      version: '0.4.24' // ex:  "0.4.20". (Default: Truffle's installed solc)
    }
  }
};
