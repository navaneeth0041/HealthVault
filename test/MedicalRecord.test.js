const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("MedicalRecord", () => {
  let medical, user1, transactionResponse, transactionReceipt;
  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    user1 = accounts[1];
    const Medical = await ethers.getContractFactory("MedicalRecord");
    medical = await Medical.connect(user1).deploy();
  });
  describe("Deployed", () => {
    it("The contract is deployed successfully", async () => {
      expect(await medical.address).to.not.equal(0);
    });
  });
  describe("Add Record", () => {
    beforeEach(async () => {
      transactionResponse = await medical
        .connect(user1)
        .addRecord(
          "Navaneeth",
          20,
          "Male",
          "A positive",
          "Pollen",
          "Depression",
          "Surgery"
        );
      transactionReceipt = await transactionResponse.wait();
      console.log("Transaction Receipt Logs:", transactionReceipt.logs);
    });

    it("Emits an add record event", async () => {
      const event = medical.interface.decodeEventLog(
        "MedicalRecord__AddRecord",
        transactionReceipt.logs[0].data,
        transactionReceipt.logs[0].topics
      );
      expect(event.name).to.not.equal("");
      expect(event.age).to.not.equal(0);
      expect(event.timestamp).to.not.equal(0);
      expect(event.bloodType).to.not.equal("");
      expect(event.allergies).to.not.equal("");
      expect(event.diagnosis).to.not.equal("");
      expect(event.treatment).to.not.equal("");
    });
    it("The getRecord function is working properly or not", async () => {
      const [
        timestamp,
        name,
        age,
        gender,
        bloodType,
        allergies,
        diagnosis,
        treatment,
      ] = await medical.getRecord(1);
      expect(await medical.getRecordId()).to.be.equal(1);
      expect(timestamp).to.not.equal(0);
      expect(name).to.equal("Navaneeth");
      expect(age).to.equal(20);
      expect(gender).to.equal("Male");
      expect(bloodType).to.equal("A positive");
      expect(allergies).to.equal("Pollen");
      expect(diagnosis).to.equal("Depression");
      expect(treatment).to.equal("Surgery");
    });
  });
  describe("Delete", () => {
    beforeEach(async () => {
      transactionResponse = await medical
        .connect(user1)
        .addRecord(
          "Navaneeth",
          20,
          "Male",
          "A positive",
          "Pollen",
          "Depression",
          "Surgery"
        );
      transactionReceipt = await transactionResponse.wait();
      console.log("Transaction Receipt Logs:", transactionReceipt.logs);
      transactionResponse = await medical.connect(user1).deleteRecord(1);
      transactionReceipt = await transactionResponse.wait();
      console.log("Transaction Receipt Logs:", transactionReceipt.logs);
    });
    it("The record is present in the isdelete mapping", async () => {
      expect(await medical.getDeleted(1)).to.be.equal(true);
    });
    it("It emits a delete event or not", async () => {
      const event = medical.interface.decodeEventLog(
        "MedicalRecord__DeleteRecord",
        transactionReceipt.logs[0].data,
        transactionReceipt.logs[0].topics
      );
      expect(event.recordId).to.not.equal(0);
      expect(event.name).to.not.equal("");
      expect(event.age).to.not.equal(0);
      expect(event.timestamp).to.not.equal(0);
      expect(event.bloodType).to.not.equal("");
      expect(event.allergies).to.not.equal("");
      expect(event.diagnosis).to.not.equal("");
      expect(event.treatment).to.not.equal("");
    });
  });
});
