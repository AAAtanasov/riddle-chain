import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { OnchainRiddle, OnchainRiddle__factory } from "../../typechain-types";

describe("OnchainRiddle", function () {
    let riddleContract: OnchainRiddle, bot: SignerWithAddress, user: SignerWithAddress;

    beforeEach(async function () {
        [bot, user] = await ethers.getSigners();
        const RiddleFactory = (await ethers.getContractFactory("OnchainRiddle")) as OnchainRiddle__factory;
        riddleContract = await RiddleFactory.connect(bot).deploy();
        await riddleContract.waitForDeployment();
        this.contractAddress = await riddleContract.getAddress();
    });

    it("Should set a riddle by the bot", async function () {
        const riddleText = "What has keys but can't open locks?";
        const answerHash = ethers.keccak256(ethers.toUtf8Bytes("piano"));

        await riddleContract.connect(bot).setRiddle(riddleText, answerHash);
        expect(await riddleContract.riddle()).to.equal(riddleText);
        expect(await riddleContract.isActive()).to.be.true;
    });

    it("Should allow a user to submit the correct answer", async function () {
        const riddleText = "What has to be broken before you can use it?";
        const answerHash = ethers.keccak256(ethers.toUtf8Bytes("egg"));

        await riddleContract.connect(bot).setRiddle(riddleText, answerHash);
        await riddleContract.connect(user).submitAnswer("egg");

        expect(await riddleContract.winner()).to.equal(user.address);
        expect(await riddleContract.isActive()).to.be.false;
    });

    it("Should not allow an incorrect answer to win", async function () {
        const riddleText = "What has to be broken before you can use it?";
        const answerHash = ethers.keccak256(ethers.toUtf8Bytes("egg"));

        await riddleContract.connect(bot).setRiddle(riddleText, answerHash);
        await riddleContract.connect(user).submitAnswer("glass");

        expect(await riddleContract.winner()).to.equal(ethers.ZeroAddress);
        expect(await riddleContract.isActive()).to.be.true;
    });

    it("Should only allow the bot to set a riddle", async function () {
        const riddleText = "What can travel around the world while staying in the same spot?";
        const answerHash = ethers.keccak256(ethers.toUtf8Bytes("stamp"));

        await expect(riddleContract.connect(user).setRiddle(riddleText, answerHash)).to.be.revertedWith(
            "Only bot can call this function",
        );
    });
});