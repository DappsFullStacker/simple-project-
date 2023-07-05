// Import the required dependencies
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Start the test block
describe("Escrow Contract", function () {
  
  // Define the variables to use in the tests
  let Escrow;
  let escrow;
  let buyer;
  let seller;
  let arbitrator;
  let amount;
  let deadline;

  // Set up the variables before each test
  beforeEach(async function () {
    [buyer, seller, arbitrator] = await ethers.getSigners();
    amount = ethers.utils.parseEther("1");
    deadline = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now
    Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(buyer.address, seller.address, amount, deadline, arbitrator.address);
  });

  // Test the deposit function
  it("Should deposit the correct amount", async function () {
    await escrow.connect(buyer).deposit({ value: amount });
    expect(await escrow.getContractBalance()).to.equal(amount);
  });

  // Test the confirmDelivery function
  it("Should confirm delivery", async function () {
    await escrow.connect(buyer).deposit({ value: amount });
    await escrow.connect(buyer).confirmDelivery();
    expect(await escrow.buyerConfirmed()).to.be.true;
  });

  // Test the releaseFunds function
  it("Should release funds to the seller after confirmation", async function () {
    await escrow.connect(buyer).deposit({ value: amount });
    await escrow.connect(buyer).confirmDelivery();
    await escrow.connect(seller).confirmDelivery();
    await escrow.connect(buyer).releaseFunds();
    expect(await escrow.getContractBalance()).to.equal(0);
  });

  // Test the initiateDispute function
  it("Should initiate a dispute", async function () {
    await escrow.connect(buyer).initiateDispute();
    expect(await escrow.dispute()).to.be.true;
  });

});