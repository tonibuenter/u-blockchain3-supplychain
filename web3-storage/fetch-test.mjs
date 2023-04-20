// curl https://bafybeickr467mxqtq3rhk35t65cpiarye6dtjncbmy2fpzyqgg2diw65ce.ipfs.w3s.link/web-storage-test.txt -o out-web-storage-test.txt


import fetch from 'node-fetch';

const r1 = await fetch('https://bafybeickr467mxqtq3rhk35t65cpiarye6dtjncbmy2fpzyqgg2diw65ce.ipfs.w3s.link/web-storage-test.txt');
const data = await r1.text();

console.log(data);

// ignores Accept :-(
// const r2 = await fetch('https://bafybeickr467mxqtq3rhk35t65cpiarye6dtjncbmy2fpzyqgg2diw65ce.ipfs.w3s.link', {headers: {'Accept': 'application/json;'}});
// const data2 = await r2.text();
//
// console.log(data2);

const urls = ['https://dweb.link/ipfs/bafkreihaateen76zhfcpzm3uuex7ivqi6vcpcknrqgqkcqxe3qdl2ox7ea', 'https://gw.crustfiles.app/ipfs/bafkreihaateen76zhfcpzm3uuex7ivqi6vcpcknrqgqkcqxe3qdl2ox7ea']

for (const url of urls) {
    const r3 = await fetch(url);
    const d3 = await r3.text();
    console.log(url.substring(0, 128), '\n', d3);
}


// https://crustipfs.xyz/ipfs/bafybeif24jahdunorozivqvucl744htkvkdec4rzejc5ivhnq32ud4dzzi
