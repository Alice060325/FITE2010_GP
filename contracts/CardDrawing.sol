// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// Import OpenZeppelin ERC721 standards and utilities
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CardDrawing is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Struct to store card details
    struct Card {
        uint256 id;
        string name;
        string description;
        string image;
        string rarity;
        string office;
        string coursesTaught;
    }

    // Mapping from token ID to Card details
    mapping(uint256 => Card) private _cards;

    // Predefined card metadata
    mapping(uint256 => Card) private predefinedCards;

    // Event emitted when a new card is drawn
    event CardDrawn(address indexed user, uint256 tokenId);

    // Constructor to set token name and symbol, and initialize predefined cards
    constructor() ERC721("CardDrawing", "CARD") {
        initializePredefinedCards();
    }

    // Initialize predefined cards using data from cardDesigns.json
    function initializePredefinedCards() internal {
        predefinedCards[1] = Card(
            1,
            "Dirk Schnieders",
            "Senior Lecturer",
            "ipfs://bafkreic3xilye2wzbjxtlgccc7xo6egbrvg76ojgcshcb3eyiap3xyim4y",
            "SR",
            "CB-324",
            "COMP3270, ENGG1330"
        );
        predefinedCards[2] = Card(
            2,
            "Chow Kam Pui",
            "MA, PhD UC Santa Barbara; MSc Programmes Director; MDASC Programme Coordinator; Senior Lecturer",
            "ipfs://bafkreiffdzjdbnov7ahfuw5e2be6nv4f2e7blqtluii37ri7njvv44lyme",
            "N",
            "CB-408",
            "COMP2501, FITE2000, FITE4801"
        );
        predefinedCards[3] = Card(
            3,
            "Liu Qi",
            "Assistant Professor; BASc(FinTech) Programme Director",
            "ipfs://bafkreidxgv5fjzdofh2vkh4j3xuqxivbqddspjz3yyq4mbq3hrql5lsrrq",
            "UR",
            "CB-401C",
            "FITE2010, FITE3010"
        );
        predefinedCards[4] = Card(
            4,
            "Yiu Siu Ming",
            "Professor; Associate Director (TPg) of CDS",
            "ipfs://bafkreif4vtfqv26il2iyuo2od77hw5fknkyxfehacp6bwt2ollp4twkxfe",
            "R",
            "CB-424",
            "COMP2119"
        );
        predefinedCards[5] = Card(
            5,
            "Chim Tat Wing",
            "Lecturer",
            "ipfs://bafkreifungq3zedeeagf6m6p5jte74rm6eb35hqd45m3twmm6t2jho3nf4",
            "SSR",
            "HW-519",
            "COMP1117, COMP2113, COMP2396, COMP3329, COMP3330, COMP3510, COMP4805, ENGG1340"
        );
    }

    /**
     * @dev Allows a user to draw a random card.
     * The function generates a pseudo-random number to select a card.
     */
    function drawCard() public returns (uint256) {
        // Generate a pseudo-random card ID between 1 and 5
        uint256 cardId = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, msg.sender, block.difficulty)
            )
        ) % 5 + 1; // Card IDs range from 1 to 5

        // Increment token ID
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        // Mint the NFT to the caller
        _mint(msg.sender, newTokenId);

        // Assign predefined card metadata to the new token
        _cards[newTokenId] = predefinedCards[cardId];

        emit CardDrawn(msg.sender, newTokenId);

        return newTokenId;
    }

    /**
     * @dev Mints a specific predefined card to a specified address.
     * Only the contract owner can call this function.
     */
    function mintCard(address to, uint256 cardId) public onlyOwner returns (uint256) {
        require(predefinedCards[cardId].id != 0, "CardDrawing: Invalid card ID");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(to, newTokenId);

        // Assign predefined card metadata to the new token
        _cards[newTokenId] = predefinedCards[cardId];

        emit CardDrawn(to, newTokenId);

        return newTokenId;
    }

    /**
     * @dev Returns the details of a specific card by token ID.
     */
    function getCardDetails(uint256 tokenId) public view returns (Card memory) {
        require(_exists(tokenId), "CardDrawing: Query for nonexistent token");
        return _cards[tokenId];
    }

    /**
     * @dev Override tokenURI to return metadata URI based on card details.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "CardDrawing: URI query for nonexistent token");

        Card memory card = _cards[tokenId];

        // Metadata JSON
        string memory json = string(
            abi.encodePacked(
                '{',
                    '"name": "', card.name, '",',
                    '"description": "', card.description, '",',
                    '"image": "', card.image, '",',
                    '"attributes": [',
                        '{ "trait_type": "Rarity", "value": "', card.rarity, '" },',
                        '{ "trait_type": "Office", "value": "', card.office, '" },',
                        '{ "trait_type": "Courses Taught", "value": "', card.coursesTaught, '" }',
                    ']',
                '}'
            )
        );

        // Encode as base64
        return string(abi.encodePacked("data:application/json;base64,", base64(bytes(json))));
    }

    // Base64 encoding utility
    string internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function base64(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";

        string memory result = new string(4 * ((data.length + 2) / 3));
        bytes memory table = bytes(TABLE);

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            let dataPtr := data
            let endPtr := add(data, mload(data))

            for {} lt(dataPtr, endPtr) {}
            {
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)
                mstore(resultPtr, shl(248, mload(add(tablePtr, and(shr(18, input), 0x3F)))))
                mstore(add(resultPtr, 1), shl(248, mload(add(tablePtr, and(shr(12, input), 0x3F)))))
                mstore(add(resultPtr, 2), shl(248, mload(add(tablePtr, and(shr(6, input), 0x3F)))))
                mstore(add(resultPtr, 3), shl(248, mload(add(tablePtr, and(input, 0x3F)))))
                resultPtr := add(resultPtr, 4)
            }

            switch mod(mload(data), 3)
            case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
            case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
        }

        return result;
    }
}
