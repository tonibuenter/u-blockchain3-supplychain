import {Web3Storage} from 'web3.storage';
import fs from "fs";

const cid = 'bafybeickr467mxqtq3rhk35t65cpiarye6dtjncbmy2fpzyqgg2diw65ce'


function getAccessToken() {
    // If you're just testing, you can paste in a token
    // and uncomment the following line:
    // return 'paste-your-token-here'

    // In a real app, it's better to read an access token from an
    // environement variable or other configuration that's kept outside of
    // your code base. For this to work, you need to set the
    // WEB3STORAGE_TOKEN environment variable before you run your code.
    return process.env.WEB3STORAGE_TOKEN
}

function makeStorageClient() {
    return new Web3Storage({token: getAccessToken()})
}

async function retrieve(cid) {

    const cwd = process.cwd();

    const token = fs.readFileSync(cwd + '/../local/web3-storage-token-01.txt').toString().trim();

    if (!token) {
        return console.error('A token is needed. You can create one on https://web3.storage');
    }
    console.log('token', token);

    const client = new Web3Storage({token});


    const list = await client.list({ maxResults: 10 })
    console.log(`list result! ${JSON.stringify(list, null, ' ')}`)


    const res = await client.get(cid)
    console.log(`Got a response! [${res.status}] ${res.statusText}`)
    if (!res.ok) {
        throw new Error(`failed to get ${cid}`)
    }
    const files = await res.files()
    for (const file of files) {
        console.log(`${file.cid} -- ${file.path} -- ${file.size}`)
    }
    // request succeeded! do something with the response object here...
}

retrieve(cid)





