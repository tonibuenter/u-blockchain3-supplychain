


## Commands

`truffle compile`


Migrate and deploy on Ganache

`truffle migrate --reset`

Start test (with debug option)

`truffle test --debug`


## Deploy SupplyChain Contract to Rikeby

truffle compile

truffle migrate --network rinkeby


## Product Image

An additional parameter 

```
curl "https://ipfs.infura.io:5001/api/v0/cat?arg=HASH"
    -X POST 
```

```
curl "https://ipfs.infura.io:5001/api/v0/add?pin=false" 
    -X POST 
    -H "Content-Type: multipart/form-data"     
    -F file=@"tfile.txt"
```
