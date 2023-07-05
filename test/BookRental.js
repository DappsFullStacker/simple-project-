
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BookRental", function () {
  let bookRental;

  beforeEach(async () => {
    const BookRental = await ethers.getContractFactory("BookRental");
    bookRental = await BookRental.deploy();
    await bookRental.deployed();
  });

  it("should allow adding a book to the rental system", async function () {
    const bookId = 1;
    const title = "The Great Gatsby";
    const author = "F. Scott Fitzgerald";
    const description = "A classic novel";
    const rentalPrice = ethers.utils.parseEther("1");

    await bookRental.addBook(bookId, title, author, description, rentalPrice);

    const book = await bookRental.books(bookId);
    expect(book.available).to.equal(true);
    expect(book.title).to.equal(title);
    expect(book.author).to.equal(author);
    expect(book.description).to.equal(description);
    expect(book.rentalPrice).to.equal(rentalPrice);
  });

  it("should allow renting a book", async function () {
    const bookId = 1;
    const rentalPeriod = 7 * 24 * 60 * 60;
    const rentalPrice = ethers.utils.parseEther("1");

    await bookRental.addBook(bookId, "The Great Gatsby", "F. Scott Fitzgerald", "A classic novel", rentalPrice);

    await expect(() => bookRental.rentBook(bookId, rentalPeriod, { value: rentalPrice }))
      .to.changeEtherBalance(bookRental, rentalPrice);

    const rentalAgreement = await bookRental.getRentalAgreement(bookId);
    expect(rentalAgreement.active).to.equal(true);
    expect(rentalAgreement.renter).to.equal(await ethers.getSigner(0).getAddress());
    expect(rentalAgreement.rentalPrice).to.equal(rentalPrice);
    expect(rentalAgreement.rentalPeriod).to.equal(rentalPeriod);
    expect(rentalAgreement.deposit).to.equal(rentalPrice);
    expect(rentalAgreement.returned).to.equal(false);
    expect(rentalAgreement.damaged).to.equal(false);

    const book = await bookRental.books(bookId);
    expect(book.available).to.equal(false);
  });

  it("should allow returning a book", async function () {
    const bookId = 1;
    const rentalPeriod = 7 * 24 * 60 * 60;
    const rentalPrice = ethers.utils.parseEther("1");
    const lateFee = ethers.utils.parseEther("0.5");
    const totalRefund = rentalPrice.sub(lateFee);

    await bookRental.addBook(bookId, "The Great Gatsby", "F. Scott Fitzgerald", "A classic novel", rentalPrice);
    await bookRental.rentBook(bookId, rentalPeriod, { value: rentalPrice });

    await expect(() => bookRental.returnBook(bookId))
      .to.changeEtherBalance(await ethers.getSigner(0), totalRefund);

    const rentalAgreement = await bookRental.getRentalAgreement(bookId);
    expect(rentalAgreement.active).to.equal(false);
    expect(rentalAgreement.returned).to.equal(true);

    const book = await bookRental.books(bookId);
    expect(book.available).to.equal(true);

    const logs = await bookRental.queryFilter(bookRental.filters.BookReturned(bookId));
    expect(logs.length).to.equal(1);
    expect(logs[0].event).to.equal("BookReturned");
    expect(logs[0].args.bookId).to.equal(bookId);
    expect(logs[0].args.renter).to.equal(await ethers.getSigner(0).getAddress());
    expect(logs[0].args.rentalPrice).to.equal(rentalPrice);
    expect(logs[0].args.deposit).to.equal(rentalPrice);
    expect(logs[0].args.lateFee).to.equal(lateFee);
  });

  it("should allow reporting damage to a book", async function () {
    const bookId = 1;
    const rentalPeriod = 7 * 24 * 60 * 60;
    const rentalPrice = ethers.utils.parseEther("1");

    await bookRental.addBook(bookId, "The Great Gatsby", "F. Scott Fitzgerald", "A classic novel", rentalPrice);
    await bookRental.rentBook(bookId, rentalPeriod, { value: rentalPrice });

    await expect(() => bookRental.reportDamage(bookId))
      .tochangeEtherBalance(await ethers.getSigner(0), 0);

    const rentalAgreement = await bookRental.getRentalAgreement(bookId);
    expect(rentalAgreement.damaged).to.equal(true);
  });
});