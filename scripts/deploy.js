

async function main() {
  
  const Escrow = await ethers.getContractFactory("Escrow");
  
  const buyer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const seller = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const arbitrator = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";
  const amount = ethers.utils.parseEther("1"); // 1 ETH
  const deadline = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now
  
  const escrow = await Escrow.deploy(buyer, seller, amount, deadline, arbitrator);

  console.log("Escrow contract deployed to:", escrow.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });