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
            const cardId = 1;
            await expect(cardDrawing.mintCard(addr1.address, cardId))
                .to.emit(cardDrawing, 'CardDrawn')
                .withArgs(addr1.address, cardId);

            expect(await cardDrawing.ownerOf(cardId)).to.equal(addr1.address);

            const cardDetails = await cardDrawing.getCardDetails(cardId);
            expect(cardDetails.id).to.equal(cardId);
            expect(cardDetails.name).to.equal(`Card #${cardId}`);
            expect(cardDetails.description).to.equal("Description for the specific card.");
            expect(cardDetails.image).to.equal("https://example.com/images/default.png");
            expect(cardDetails.rarity).to.equal(4); // As per getCardRarityById
        });

        it("Should not allow non-owners to mint a card", async function () {
            await expect(
                cardDrawing.connect(addr1).mintCard(addr2.address, 2)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Drawing Cards", function () {
        it("Should allow users to draw a card", async function () {
            // Since randomness is involved, we can't predict the exact card details
            const tx = await cardDrawing.connect(addr1).drawCard();
            const receipt = await tx.wait();

            const event = receipt.events.find(event => event.event === 'CardDrawn');
            const tokenId = event.args.tokenId;

            expect(await cardDrawing.ownerOf(tokenId)).to.equal(addr1.address);

            const cardDetails = await cardDrawing.getCardDetails(tokenId);
            expect(cardDetails.id).to.equal(tokenId);

            // Validate that rarity is within allowed values
            expect(cardDetails.rarity).to.be.within(1, 4);

            // Validate name, description, and image based on rarity
            const expectedName = cardDrawing.getCardName(cardDetails.rarity);
            expect(cardDetails.name).to.equal(expectedName);

            const expectedDescription = cardDrawing.getCardDescription(cardDetails.rarity);
            expect(cardDetails.description).to.equal(expectedDescription);

            const expectedImage = cardDrawing.getCardImageUrl(cardDetails.rarity);
            expect(cardDetails.image).to.equal(expectedImage);
        });

        it("Should emit CardDrawn event when a card is drawn", async function () {
            await expect(cardDrawing.connect(addr1).drawCard())
                .to.emit(cardDrawing, 'CardDrawn')
                .withArgs(addr1.address, 1);
        });
    });

    describe("Card Metadata", function () {
        it("Should return correct card details for minted card", async function () {
            const cardId = 3;
            await cardDrawing.mintCard(addr1.address, cardId);

            const cardDetails = await cardDrawing.getCardDetails(cardId);
            expect(cardDetails.name).to.equal(`Card #${cardId}`);
            expect(cardDetails.description).to.equal("Description for the specific card.");
            expect(cardDetails.image).to.equal("https://example.com/images/default.png");
            expect(cardDetails.rarity).to.equal(4);
        });

        it("Should allow the owner to update card metadata", async function () {
            const cardId = 4;
            await cardDrawing.mintCard(addr1.address, cardId);

            const newName = "Updated Card";
            const newDescription = "Updated Description";
            const newImage = "https://example.com/images/updated.png";
            const newRarity = 2;

            await expect(
                cardDrawing.setCardMetadata(cardId, newName, newDescription, newImage, newRarity)
            ).to.not.be.reverted;

            const updatedCard = await cardDrawing.getCardDetails(cardId);
            expect(updatedCard.name).to.equal(newName);
            expect(updatedCard.description).to.equal(newDescription);
            expect(updatedCard.image).to.equal(newImage);
            expect(updatedCard.rarity).to.equal(newRarity);
        });

        it("Should not allow non-owners to update card metadata", async function () {
            const cardId = 5;
            await cardDrawing.mintCard(addr1.address, cardId);

            await expect(
                cardDrawing.connect(addr1).setCardMetadata(cardId, "Hack", "Hack Description", "https://example.com/images/hack.png", 1)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
});
