include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/pedersen.circom";

template CommitmentHasher() {
    signal input secret;
    signal output commitment;
    component commitmentHasher = Pedersen(248);
    component secretBits = Num2Bits(248);
    secretBits.in <== secret;
    for (var i = 0; i < 248; i++) {
        commitmentHasher.in[i] <== secretBits.out[i];
    }

    commitment <== commitmentHasher.out[0];
}

// Verifies that commitment that corresponds to given secret and nullifier is included in the merkle tree of deposits
template Withdraw() {
    signal input root; // not taking part in any computations
    signal input recipient; // not taking part in any computations
    signal input relayer;  // not taking part in any computations
    signal input fee;      // not taking part in any computations
    signal input nullifierHash // not taking part in any computations
    signal private input secret;
    signal private input commitment;
    signal output c;

    component hasher = CommitmentHasher();
    hasher.secret <== secret;
    hasher.commitment === commitment;

    c<==hasher.commitment;

    // Add hidden signals to make sure that tampering with recipient or fee will invalidate the snark proof
    // Most likely it is not required, but it's better to stay on the safe side and it only takes 2 constraints
    // Squares are used to prevent optimizer from removing those constraints
    signal recipientSquare;
    signal feeSquare;
    signal relayerSquare;
    recipientSquare <== recipient * recipient;
    feeSquare <== fee * fee;
    relayerSquare <== relayer * relayer;
}

component main = Withdraw();