// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract CoffeePortal {
    uint totalCoffee;

    address payable public owner;

    //Solidity events
    event NewCoffee(
        address indexed from,
        uint256 timestamp,
        string message,
        string name
    );

    //Constructor
    constructor() payable {
        console.log("This is smart contract");

        //user who is calling this function
        owner = payable(msg.sender);
    }

    struct Coffee {
        string name; //Name of the user who is buying a coffee
        string message; //Message of the user who is buying a coffee
        address giver; // Address of the user who is buying a coffee
        uint256 timestamp; // Timestamp of the coffee purchase
    }

    //Array where is stored all the coffees bought by the users
    Coffee[] coffee;

    //Return struct array of coffees
    function getCoffees() public view returns (Coffee[] memory) {
        return coffee;
    }

    //Return all the coffee bought
    function getTotalCoffee() public view returns (uint256) {
        console.log("Total coffee received:", totalCoffee);
        return totalCoffee;
    }

    function buyCoffee(
        string memory _message,
        string memory _name,
        uint256 _payAmount
    ) public payable {
        uint256 cost = 0.001 ether; // 0.0018 ether === $4.94, setting the limit of the coffee price
        require(_payAmount <= cost, "You don't have enough money");
        
        totalCoffee += 1;
        console.log("%s bought a coffee", msg.sender);

        //store coffee data in the array
        coffee.push(Coffee({
            name: _name,
            message: _message,
            giver: msg.sender,
            timestamp: block.timestamp
        }));

        (bool success,) = owner.call{value: _payAmount}("");
        require(success, "Failed to send money");

        emit NewCoffee(msg.sender, block.timestamp, _message, _name);
    }
}

