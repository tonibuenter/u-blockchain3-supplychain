import {getFilesFromPath, Web3Storage} from 'web3.storage';
import fs from 'fs';

async function main() {

    const cwd = process.cwd();

    const token = fs.readFileSync(cwd + '/../local/web3-storage-token-01.txt').toString().trim();

    console.log('token', token);

    if (!token) {
        return console.error('A token is needed. You can create one on https://web3.storage');
    }

    const storage = new Web3Storage({token});
    const files = await getFilesFromPath(cwd + '/../local/web-storage-test3.txt');

    console.log(`Uploading ${files.length} files`);
    const cid = await storage.put(files);
    console.log('Content added with CID:', cid);
}

main();
