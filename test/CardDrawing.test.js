// test/CardDrawing.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CardDrawing Contract", function () {
    let CardDrawing, cardDrawing, owner, addr1, addr2;

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        CardDrawing = await ethers.getContractFactory("CardDrawing");
        [owner, addr1, addr2, _] = await ethers.getSigners();

        // Deploy a new CardDrawing contract for each test
        cardDrawing = await CardDrawing.deploy();
        await cardDrawing.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await cardDrawing.owner()).to.equal(owner.address);
        });

        it("Should have a name and symbol", async function () {
            expect(await cardDrawing.name()).to.equal("CardDrawing");
            expect(await cardDrawing.symbol()).to.equal("CARD");
        });
    });

    describe("Minting", function () {
        it("Should allow the owner to mint a specific card", async function () {
            await expect(cardDrawing.mintCard(addr1.address, 1))
                .to.emit(cardDrawing, 'CardDrawn')
                .withArgs(addr1.address, 1);

            expect(await cardDrawing.ownerOf(1)).to.equal(addr1.address);

            const cardDetails = await cardDrawing.getCardDetails(1);
            expect(cardDetails.id).to.equal(1);
            expect(cardDetails.name).to.equal("Card #1");
            expect(cardDetails.description).to.equal("Description for the specific card.");
            expect(cardDetails.image).to.equal("https://example.com/images/default.png");
            expect(cardDetails.rarity).to.equal(4);
        });

        it("Should not allow non-owners to mint a card", async function () {
            await expect(
                cardDrawing.connect(addr1).mintCard(addr2.address, 2)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Drawing Cards", function () {
        it("Should allow users to draw a card", async function () {
            const tx = await cardDrawing.connect(addr1).drawCard();
            const receipt = await tx.wait();

            const tokenId = receipt.events.find(event => event.event === 'CardDrawn').args.tokenId;

            expect(await cardDrawing.ownerOf(tokenId)).to.equal(addr1.address);

            const cardDetails = await cardDrawing.getCardDetails(tokenId);
            expect(cardDetails.id).to.equal(tokenId);
            // Further assertions can be made based on randomness
        });

        it("Should emit CardDrawn event when a card is drawn", async function () {
            await expect(cardDrawing.connect(addr1).drawCard())
                .to.emit(cardDrawing, 'CardDrawn')
                .withArgs(addr1.address, 1);
        });
    });

    describe("Card Metadata", function () {
        it("Should return correct card details", async function () {
            await cardDrawing.mintCard(addr1.address, 3);

            const cardDetails = await cardDrawing.getCardDetails(1);
            expect(cardDetails.name).to.equal("Card #3");
            expect(cardDetails.description).to.equal("Description for the specific card.");
            expect(cardDetails.image).to.equal("https://example.com/images/default.png");
            expect(cardDetails.rarity).to.equal(4);
        });

        it("Should allow the owner to update card metadata", async function () {
            await cardDrawing.mintCard(addr1.address, 4);

            await cardDrawing.setCardMetadata(1, "Updated Card", "Updated Description", "https://example.com/images/updated.png", 2);

            const updatedCard = await cardDrawing.getCardDetails(1);
            expect(updatedCard.name).to.equal("Updated Card");
            expect(updatedCard.description).to.equal("Updated Description");
            expect(updatedCard.image).to.equal("https://example.com/images/updated.png");
            expect(updatedCard.rarity).to.equal(2);
        });

        it("Should not allow non-owners to update card metadata", async function () {
            await cardDrawing.mintCard(addr1.address, 5);

            await expect(
                cardDrawing.connect(addr1).setCardMetadata(1, "Hack", "Hack Description", "https://example.com/images/hack.png", 1)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});
