const main = async () => {
  const [deployer] = await hre.ethers.getSigners();
  const accountBallance = await deployer.getBalance();
  const contractsAccount = deployer.address;

  console.log(
    `Deploying contracts from account ${contractsAccount}, account balance is${accountBallance}`
  );

  const Token = await hre.ethers.getContractFactory("CoffeePortal");
  const portal_token = await Token.deploy({
    value: hre.ethers.utils.parseEther("0.01"),
  });
  await portal_token.deployed();

  console.log(`Coffee Portal address is ${portal_token.address}`);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

runMain();
