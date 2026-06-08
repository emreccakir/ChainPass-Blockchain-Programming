// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HardwarePassport is ERC721URIStorage, Ownable {
    
    uint256 private _nextTokenId;

    // Servis kayıtlarının yapısı
    struct ServiceRecord {
        uint256 date;
        string description;       // Örn: "Manyetik switch değişimi yapıldı"
        string hardwareStatus;     // Örn: "Overclock saptandı", "Temiz"
        address serviceAddress;    // İşlemi yapan yetkili servis
    }

    // Donanımın genel teknik özelliklerini tutan yapı
    struct HardwareDetails {
        string serialNumber;
        string brandModel;
        uint256 productionDate;
        bool isWarrantyActive;
    }

    // Token ID -> Donanım Detayları
    mapping(uint256 => HardwareDetails) public hardwareInfo;
    
    // Token ID -> Servis Geçmişi Listesi
    mapping(uint256 => ServiceRecord[]) private serviceHistories;

    // Onaylı Servis Merkezleri Yetki Listesi
    mapping(address => bool) public authorizedServices;

    // Modifiers (Yetki Kontrolleri)
    modifier onlyService() {
        require(authorizedServices[msg.sender], "Hata: Sadece onayli servis merkezleri veri ekleyebilir.");
        _;
    }

    // Kontratı başlatan kişi (Owner) aynı zamanda ilk yönetici olur
    constructor() ERC721("HardwarePassportNFT", "HWP") Ownable(msg.sender) {}

    // --- YÖNETİCİ (OWNER) FONKSİYONLARI ---

    // Sisteme yeni yetkili servis ekleme
    function addServiceCenter(address _serviceAddress) external onlyOwner {
        authorizedServices[_serviceAddress] = true;
    }

    // Yetkili servis çıkarma
    function removeServiceCenter(address _serviceAddress) external onlyOwner {
        authorizedServices[_serviceAddress] = false;
    }

    // --- YETKİLİ SERVİS FONKSİYONLARI ---

    // Üretim bandından çıkan donanıma ilk NFT'yi (Pasaportu) basma (Mint)
    function mintHardwarePassport(
        address to,
        string memory tokenURI,
        string memory _serialNumber,
        string memory _brandModel
    ) external onlyService returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        hardwareInfo[tokenId] = HardwareDetails({
            serialNumber: _serialNumber,
            brandModel: _brandModel,
            productionDate: block.timestamp,
            isWarrantyActive: true
        });

        return tokenId;
    }

    // Donanıma servis/tamir kaydı ekleme
    function addServiceRecord(
        uint256 _tokenId,
        string memory _description,
        string memory _hardwareStatus,
        bool _warrantyStatus
    ) external onlyService {
        require(_ownerOf(_tokenId) != address(0), "Hata: Boyle bir donanim kaydi bulunamadi.");
        
        serviceHistories[_tokenId].push(ServiceRecord({
            date: block.timestamp,
            description: _description,
            hardwareStatus: _hardwareStatus,
            serviceAddress: msg.sender
        }));

        hardwareInfo[_tokenId].isWarrantyActive = _warrantyStatus;
    }

    // --- HERKESE AÇIK (VIEW) FONKSİYONLAR ---

    // Ürünün tüm servis geçmişini getiren fonksiyon (Mobil uygulamanın okuyacağı yer)
    function getServiceHistory(uint256 _tokenId) external view returns (ServiceRecord[] memory) {
        return serviceHistories[_tokenId];
    }
}