const main = async () => {
  //Compile and generate the necessary files for the contract under the artifacts directory.
  const coffeeContractFactory = await hre.ethers.getContractFactory(
    "CoffeePortal"
  );

  const coffeeContract = await coffeeContractFactory.deploy({
    value: hre.ethers.utils.parseEther("0.0018"),
  });

  await coffeeContract.deployed();
  console.log("Coffe Contract is deployed to:", coffeeContract.address);
};

//Get contract balance

let contractBalance = await hre.ethers.provider.getBalance(
  coffeeContract.address
);
console.log(
  "Contract Balance:",
  hre.ethers.utils.formateEther(contractBalance)
);

//Trying to buy a coffee
const coffeeTxn = await coffeeContract.buyCoffee(
  "This is coffee #1",
  "amel",
  ether.utils.parseEther("0.0018")
);

await coffeeTxn.wait();

//Get contract balance after buying a coffee
contractBalance = await hre.ethers.provider.getBalance(coffeeContract.address);
console.log(
  "Contract Balance after buying a coffee:",
  hre.ethers.utils.formateEther(contractBalance)
);

let getAllCoffees = await coffeeContract.getAllCoffees();
console.log("All coffees:", getAllCoffees);

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

runMain();
