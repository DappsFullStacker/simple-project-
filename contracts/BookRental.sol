// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract BookRental {
    
    struct Book {
        string title;
        string author;
        string description;
        uint256 rentalPrice;
        bool available;
    }
    
    struct RentalAgreement {
        address renter;
        uint256 rentalPrice;
        uint256 rentalPeriod;
        uint256 deposit;
        uint256 rentalStart;
        bool active;
        bool returned;
        bool damaged;
    }
    
    mapping(uint256 => Book) public books;
    mapping(uint256 => RentalAgreement) public rentalAgreements;
    
    event BookRented(uint256 indexed bookId, address indexed renter);
    event BookReturned(uint256 indexed bookId, address indexed renter, uint256 indexed rentalPrice, uint256 deposit, uint256 lateFee);
    
    function addBook(uint256 bookId, string memory title, string memory author, string memory description, uint256 rentalPrice) public {
        books[bookId] = Book(title, author, description, rentalPrice, true);
    }
    
    function rentBook(uint256 bookId, uint256 rentalPeriod) public payable {
        require(books[bookId].available == true, "Book is not available for rent");
        require(msg.value == books[bookId].rentalPrice, "Incorrect rental price");
        
        RentalAgreement memory rentalAgreement = RentalAgreement({
            renter: msg.sender,
            rentalPrice: books[bookId].rentalPrice,
            rentalPeriod: rentalPeriod,
            deposit: msg.value,
            rentalStart: block.timestamp,
            active: true,
            returned: false,
            damaged: false
        });
        
        rentalAgreements[bookId] = rentalAgreement;
        books[bookId].available = false;
        
        emit BookRented(bookId, msg.sender);
    }
    
    function returnBook(uint256 bookId) public {
        require(rentalAgreements[bookId].active == true, "Rental agreement does not exist");
        require(rentalAgreements[bookId].renter == msg.sender, "You are not the renter of this book");
        require(rentalAgreements[bookId].returned == false, "Book has already been returned");
        
        uint256 rentalPeriod = block.timestamp - rentalAgreements[bookId].rentalStart;
        uint256 lateFee = 0;
        if (rentalPeriod > rentalAgreements[bookId].rentalPeriod) {
            lateFee = (rentalPeriod - rentalAgreements[bookId].rentalPeriod) * rentalAgreements[bookId].rentalPrice;
        }
        
        rentalAgreements[bookId].active = false;
        rentalAgreements[bookId].returned = true;
        books[bookId].available = true;
        
        uint256 totalRefund = rentalAgreements[bookId].deposit - lateFee;
        payable(msg.sender).transfer(totalRefund);
        
        emit BookReturned(bookId, msg.sender, rentalAgreements[bookId].rentalPrice, rentalAgreements[bookId].deposit, lateFee);
    }
    
    function reportDamage(uint256 bookId) public {
        require(rentalAgreements[bookId].active == true, "Rental agreement does not exist");
        require(rentalAgreements[bookId].renter == msg.sender, "You are not the renter of this book");
        require(rentalAgreements[bookId].returned == false, "Book has already been returned");
        
        rentalAgreements[bookId].damaged = true;
    }
    
    function getBookDetails(uint256 bookId) public view returns (string memory, string memory, string memory, uint256, bool) {
        Book memory book = books[bookId];
        return (book.title, book.author, book.description, book.rentalPrice, book.available);
    }
    
    function getRentalAgreement(uint256 bookId) public view returns (RentalAgreement memory) {
        require(rentalAgreements[bookId].active == true, "Rental agreement does not exist");
        require(rentalAgreements[bookId].renter == msg.sender, "You are not the renter of this book");
        return rentalAgreements[bookId];
    }
}