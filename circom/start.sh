find . -type f -not \( -name '*.circom' -or -name '*.sh' -or -name '*.ptau' \) -delete

circom circuit.circom --r1cs --wasm --sym

#Start a new powers of tau ceremony and make a contribution (enter some random text)

#snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
#snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v

#Prapare phase 2

#snarkjs powersoftau prepare phase2 ../powersOfTau28_hez_final_16.ptau pot12_final.ptau -v

#Start a new zkey and make a contribution (enter some random text)

snarkjs zkey new circuit.r1cs powersOfTau28_hez_final_16.ptau circuit_0000.zkey

snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name="1st Contributor Name" -v -e="xxxxxx"

snarkjs zkey contribute circuit_0001.zkey circuit_0002.zkey --name="2st Contributor Name" -v -e="Another random entropy"

snarkjs zkey export bellman circuit_0002.zkey  challenge_phase2_0003
snarkjs zkey bellman contribute bn128 challenge_phase2_0003 response_phase2_0003 -e="some random text"
snarkjs zkey import bellman circuit_0002.zkey response_phase2_0003 circuit_0003.zkey -n="Third contribution name"

snarkjs zkey beacon circuit_0003.zkey circuit_final.zkey 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"

snarkjs zkey export verificationkey circuit_final.zkey verification_key.json

snarkjs zkey export solidityverifier circuit_final.zkey verifier.sol