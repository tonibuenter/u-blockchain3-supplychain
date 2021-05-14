


## Commands 

`truffle compile`


Migrate and deploy on Ganache

`truffle migrate --reset`

Start test (with debug option)

`truffle test --debug`



### Product Image

An additional parameter 

`
curl -X POST "https://ipfs.infura.io:5001/api/v0/cat?arg=HASH

`

`
curl "https://ipfs.infura.io:5001/api/v0/add?pin=false" -X POST -H "Content-Type: multipart/form-data"     -F file=@"t.txt"

`



{
    "transactionHash": "0x7c4a4f74cfff101a94e6e4cb27d33b4954adbed5ea02df448b616f2850581203",
    "transactionIndex": 0,
    "blockHash": "0x6e9d9c38bca02588ffce393416a85b66f6907d19f0ef36efce7c742c5f5fcdab",
    "blockNumber": 2485,
    "from": "0x15de60c3aea2c21fd1706c4a6ac0aa2db105554c",
    "to": "0xf324ccedbdd07aaadabef12c70fae186158dfa0f",
    "gasUsed": 47493,
    "cumulativeGasUsed": 47493,
    "contractAddress": null,
    "logs": [
        {
            "logIndex": 0,
            "transactionIndex": 0,
            "transactionHash": "0x7c4a4f74cfff101a94e6e4cb27d33b4954adbed5ea02df448b616f2850581203",
            "blockHash": "0x6e9d9c38bca02588ffce393416a85b66f6907d19f0ef36efce7c742c5f5fcdab",
            "blockNumber": 2485,
            "address": "0xF324CcedBDd07AaadABEf12c70fae186158DfA0F",
            "type": "mined",
            "id": "log_f1920298",
            "event": "Processed",
            "args": {
                "0": "1",
                "__length__": 1,
                "upc": "1"
            }
        }
    ],
    "status": true,
    "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000080000002000000000",
    "rawLogs": [
        {
            "logIndex": 0,
            "transactionIndex": 0,
            "transactionHash": "0x7c4a4f74cfff101a94e6e4cb27d33b4954adbed5ea02df448b616f2850581203",
            "blockHash": "0x6e9d9c38bca02588ffce393416a85b66f6907d19f0ef36efce7c742c5f5fcdab",
            "blockNumber": 2485,
            "address": "0xF324CcedBDd07AaadABEf12c70fae186158DfA0F",
            "data": "0x0000000000000000000000000000000000000000000000000000000000000001",
            "topics": [
                "0x5afe3b1bf87069693c075da5c22a98d63d1aef98a30dbbe538d0781a98b77ee5"
            ],
            "type": "mined",
            "id": "log_f1920298"
        }
    ]
}
