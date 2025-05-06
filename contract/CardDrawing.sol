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
        uint256 rarity;
        // Add more attributes as needed
    }

    // Mapping from token ID to Card details
    mapping(uint256 => Card) private _cards;

    // Event emitted when a new card is drawn
    event CardDrawn(address indexed user, uint256 tokenId);

    // Constructor to set token name and symbol
    constructor() ERC721("CardDrawing", "CARD") {}

    /**
     * @dev Allows a user to draw a card.
     * The function generates a pseudo-random number to select a card.
     * Note: For production, consider using a secure randomness source like Chainlink VRF.
     */
    function drawCard() public returns (uint256) {
        // Generate a pseudo-random number based on block attributes and sender address
        uint256 randomNum = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, msg.sender, block.difficulty)
            )
        ) % 100; // Random number between 0-99

        // Determine card rarity based on random number
        uint256 rarity;
        if (randomNum < 5) {
            rarity = 1; // Legendary
        } else if (randomNum < 20) {
            rarity = 2; // Rare
        } else if (randomNum < 50) {
            rarity = 3; // Uncommon
        } else {
            rarity = 4; // Common
        }

        // Increment token ID
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        // Mint the NFT to the caller
        _mint(msg.sender, newTokenId);

        // Initialize card details (These can be customized or fetched from metadata)
        _cards[newTokenId] = Card({
            id: newTokenId,
            name: getCardName(rarity),
            description: getCardDescription(rarity),
            image: getCardImageUrl(rarity),
            rarity: rarity
        });

        emit CardDrawn(msg.sender, newTokenId);

        return newTokenId;
    }

    /**
     * @dev Mints a specific card to a specified address.
     * Only the contract owner can call this function.
     */
    function mintCard(address to, uint256 cardId) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(to, newTokenId);

        // Initialize card details based on provided cardId
        _cards[newTokenId] = Card({
            id: newTokenId,
            name: getCardNameById(cardId),
            description: getCardDescriptionById(cardId),
            image: getCardImageUrlById(cardId),
            rarity: getCardRarityById(cardId)
        });

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
     * @dev Allows the owner to set or update metadata for a specific card.
     */
    function setCardMetadata(
        uint256 tokenId,
        string memory name,
        string memory description,
        string memory image,
        uint256 rarity
    ) public onlyOwner {
        require(_exists(tokenId), "CardDrawing: Update for nonexistent token");

        _cards[tokenId].name = name;
        _cards[tokenId].description = description;
        _cards[tokenId].image = image;
        _cards[tokenId].rarity = rarity;
    }

    // Internal helper functions to get card attributes based on rarity

    function getCardName(uint256 rarity) internal pure returns (string memory) {
        if (rarity == 1) return "Legendary Card";
        if (rarity == 2) return "Rare Card";
        if (rarity == 3) return "Uncommon Card";
        return "Common Card";
    }

    function getCardDescription(uint256 rarity) internal pure returns (string memory) {
        if (rarity == 1) return "A rare and powerful card.";
        if (rarity == 2) return "A valuable and strong card.";
        if (rarity == 3) return "A useful and decent card.";
        return "A basic and common card.";
    }

    function getCardImageUrl(uint256 rarity) internal pure returns (string memory) {
        if (rarity == 1) return "https://example.com/images/legendary.png";
        if (rarity == 2) return "https://example.com/images/rare.png";
        if (rarity == 3) return "https://example.com/images/uncommon.png";
        return "https://example.com/images/common.png";
    }

    // Placeholder functions for mintCard by cardId
    // In a real scenario, these would fetch data from a predefined set or external source

    function getCardNameById(uint256 cardId) internal pure returns (string memory) {
        return string(abi.encodePacked("Card #", uint2str(cardId)));
    }

    function getCardDescriptionById(uint256 cardId) internal pure returns (string memory) {
        return "Description for the specific card.";
    }

    function getCardImageUrlById(uint256 cardId) internal pure returns (string memory) {
        return "https://example.com/images/default.png";
    }

    function getCardRarityById(uint256 cardId) internal pure returns (uint256) {
        return 4; // Default to Common
    }

    // Utility function to convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        str = string(bstr);
    }

    /**
     * @dev Override tokenURI to return metadata URI based on card details.
     * This can be further expanded to fetch from off-chain metadata storage.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "CardDrawing: URI query for nonexistent token");

        Card memory card = _cards[tokenId];

        // Example metadata JSON structure
        string memory json = string(
            abi.encodePacked(
                '{',
                    '"name": "', card.name, '",',
                    '"description": "', card.description, '",',
                    '"image": "', card.image, '",',
                    '"attributes": [',
                        '{ "trait_type": "Rarity", "value": "', uint2str(card.rarity), '" }',
                    ']',
                '}'
            )
        );

        // Encode the JSON metadata in base64
        return string(abi.encodePacked("data:application/json;base64,", base64(bytes(json))));
    }

    // Base64 encoding library (simplified version)
    string internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function base64(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";

        // Calculate padding
        uint256 tableLength = 4 * ((data.length + 2) / 3);
        string memory result = new string(tableLength);
        bytes memory table = bytes(TABLE);

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)

            for { 
                let i := 0 
            } lt(i, mload(data)) 
            { 
                i := add(i, 3) 
            } {
                let input := and(mload(add(data, add(32, i))), 0xffffff)

                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                out := shl(8, out)
                out := add(out, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                out := shl(8, out)
                out := add(out, mload(add(tablePtr, and(input, 0x3F))))
                out := shl(224, out)

                mstore(resultPtr, out)
                resultPtr := add(resultPtr, 4)
            }

            switch mod(mload(data), 3)
                case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
                case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
        }

        return result;
    }
}
