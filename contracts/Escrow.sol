// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Escrow {
    address payable public buyer;
    address payable public seller;
    address public arbitrator;
    uint public amount;
    uint public deadline;
    bool public buyerConfirmed;
    bool public sellerConfirmed;
    bool public dispute;
    bool public fundsReleased;
    
    constructor(address payable _buyer, address payable _seller, uint _amount, uint _deadline, address _arbitrator) {
        buyer = _buyer;
        seller = _seller;
        amount = _amount;
        deadline = block.timestamp + _deadline;
        arbitrator = _arbitrator;
    }
    
    function deposit() public payable {
        require(msg.sender == buyer && msg.value == amount, "Deposit failed: incorrect amount or sender");
    }
    
    function confirmDelivery() public {
        require(msg.sender == buyer || msg.sender == seller, "Confirmation failed: unauthorized sender");
        if (msg.sender == buyer) {
            buyerConfirmed = true;
        } else {
            sellerConfirmed = true;
        }
    }
    
    function releaseFunds() public {
        require(block.timestamp <= deadline, "Release failed: deadline has passed");
        require(!dispute, "Release failed: dispute ongoing");
        require((msg.sender == buyer && buyerConfirmed) || (msg.sender == seller && sellerConfirmed), "Release failed: unauthorized sender or confirmation not given");
        seller.transfer(amount);
        fundsReleased = true;
    }
    
    function initiateDispute() public {
        require(msg.sender == arbitrator || msg.sender == buyer || msg.sender == seller, "Dispute failed: unauthorized sender");
        require(!dispute, "Dispute failed: dispute already ongoing");
        dispute = true;
    }
    
    function resolveDispute(bool buyerWins) public {
        require(msg.sender == arbitrator, "Resolution failed: unauthorized sender");
        require(dispute, "Resolution failed: no dispute ongoing");
        if (buyerWins) {
            buyer.transfer(amount);
        } else {
            seller.transfer(amount);
        }
        fundsReleased = true;
    }
    
    function refundBuyer() public {
        require(msg.sender == arbitrator, "Refund failed: unauthorized sender");
        require(dispute, "Refund failed: no dispute ongoing");
        require(!fundsReleased, "Refund failed: funds already released");
        buyer.transfer(amount);
    }
    
    function refundSeller() public {
        require(msg.sender == arbitrator, "Refund failed: unauthorized sender");
        require(dispute, "Refund failed: no dispute ongoing");
        require(!fundsReleased, "Refund failed: funds already released");
        seller.transfer(amount);
    }
    
    function getContractBalance() public view returns(uint) {
        return address(this).balance;
    }
    
    function getDeadline() public view returns(uint) {
        return deadline;
    }
}