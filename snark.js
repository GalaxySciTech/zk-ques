const snarkjs = require("snarkjs");
const fs = require("fs");
const Web3 = require("web3")
let web3 = new Web3("https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161")
let ABI=[
    {
        "inputs": [
            {
                "internalType": "uint256[2]",
                "name": "a",
                "type": "uint256[2]"
            },
            {
                "internalType": "uint256[2][2]",
                "name": "b",
                "type": "uint256[2][2]"
            },
            {
                "internalType": "uint256[2]",
                "name": "c",
                "type": "uint256[2]"
            },
            {
                "internalType": "uint256[6]",
                "name": "input",
                "type": "uint256[6]"
            }
        ],
        "name": "verifyProof",
        "outputs": [
            {
                "internalType": "bool",
                "name": "r",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]
async function pedersen(secret) {
    const {proof, publicSignals} = await snarkjs.groth16.fullProve({
        root: "0",
        commitment: "5502030351305252144557737684796590846695263346825260353182879378589364806211",
        recipient: "0",
        relayer: "0",
        fee: "0",
        nullifierHash: "0",
        secret: secret
    }, "circom/circuit.wasm", "circom/circuit_final.zkey");
    const vKey = JSON.parse(fs.readFileSync("./circom/verification_key.json"));
    // console.log(JSON.stringify(proof, null, 1));
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    if (res === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }
    console.log(web3.utils.toHex(publicSignals[0]))
    await verify({A:[proof.pi_a[0],proof.pi_a[1]],B:[proof.pi_b[0],proof.pi_b[1]],C:[proof.pi_c[0],proof.pi_c[1]]},publicSignals)
    return publicSignals[0]
}

async function genProof(root, commitment, recipient, relayer, fee, nullifierHash, secret) {
    const {proof, publicSignals} = await snarkjs.groth16.fullProve({
        root: root,
        commitment: commitment,
        recipient: recipient,
        relayer: relayer,
        fee: fee,
        nullifierHash: nullifierHash,
        secret: secret
    }, "circom/circuit.wasm", "circom/circuit_final.zkey");

    console.log("Proof: ");
    console.log(JSON.stringify(proof, null, 1));
    let enRoot = web3.utils.soliditySha3(root,nullifierHash)
    return {
        proof: proof,
        enRoot: enRoot,
        recipient: recipient,
        relayer: relayer,
        fee: fee,
        nullifierHash: nullifierHash,
        secret: secret
    }
    // const vKey = JSON.parse(fs.readFileSync("./circom/verification_key.json"));
    //
    // const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    //
    // if (res === true) {
    //     console.log("Verification OK");
    // } else {
    //     console.log("Invalid proof");
    // }

}

async function verify(proof,input){
    let contract=new web3.eth.Contract(ABI,"0xB2Cca3cDd73Aad441181Cee7e05E2Ccbda3B0373")

    let bo=await contract.methods.verifyProof(proof.A,proof.B,proof.C,input).call();
    console.log(bo)
}

pedersen("23").then(()=>{
    process.exit(0);
})

// genProof("0","0xc2a09f0340bace1298ab269ebd05b2bf263548fd5e983944d8bd2aba1e46243",web3.utils.hexToNumberString("0x2475Dcd4Fe333bE814Ef7C8f8CE8A1E9B5FcDEA0"),web3.utils.hexToNumberString("0x2475Dcd4Fe333bE814Ef7C8f8CE8A1E9B5FcDEA0"),"0","0","23").then(() => {
//     process.exit(0);
// });