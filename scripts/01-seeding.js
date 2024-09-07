const { ethers } = require("hardhat");
const config = require("../src/config.json");
const wait = (seconds) => {
  const milliseconds = seconds * 1000;
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function main() {
  const { chainId } = await ethers.provider.getNetwork();
  console.log(`Using chainId ${chainId}`);
  const account = await ethers.getSigners();
  const medical = await ethers.getContractAt(
    "MedicalRecord",
    config[chainId].medical.address
  );
  console.log(`MedicalRecord smart contract fetched at ${medical.address}`);
  let transactionResponse;
  const user1 = account[0];
  transactionResponse = await medical
    .connect(user1)
    .addRecord(
      "Aman Gupta",
      44,
      "Male",
      "B positive",
      "Allergic rhinitis",
      "Hypertension ",
      "Medications"
    );
  await transactionResponse.wait();
  console.log(`Record added with id ${await medical.getRecordId()}`);
  transactionResponse = await medical.connect(user1).deleteRecord(69);
  await transactionResponse.wait();
  console.log(`Record deleted`);
  transactionResponse = await medical.connect(user1).deleteRecord(55);
  await transactionResponse.wait();
  console.log(`Record deleted`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });