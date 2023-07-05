
const { ethers } = require("hardhat");

async function main() {
  const BookRental = await ethers.getContractFactory("BookRental");
  const bookRental = await BookRental.deploy();
  await bookRental.deployed();

  console.log("BookRental contract deployed to:", bookRental.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
