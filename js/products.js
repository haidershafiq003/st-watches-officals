/**
 * ST WATCHES - Centralized Product Catalog & Store Configuration
 * Currency: PKR (Pakistani Rupee)
 * Brand: ST Watches
 */

const ST_CONFIG = {
  brandName: "ST Watches",
  tagline: "Time, Redefined.",
  currency: "PKR",
  deliveryFee: 250, // Default delivery fee in PKR (easily configurable)
  freeDeliveryThreshold: 20000, // Orders over PKR 20,000 get free delivery
  whatsappNumber: "923708111223", // WhatsApp order receiver (Format: Country code without +)
  phoneDisplay: "+92 370 8111223",
  email: "asadkabir722@gmail.com",
  orderEmail: "asadkabir722@gmail.com", // FormSubmit notification destination
  supportHours: "Mon - Sat: 10:00 AM - 8:00 PM PKT",
  headquarters: "Mirpur, Azad Kashmir, Pakistan",
  deliveryNote: "Dispatched within 24 hours. Delivery in 2-4 business days across Pakistan via TCS & Call Courier.",
  // Advance Payment (10% Instant Discount) Configuration
  advanceDiscountPercent: 10,
  advanceDiscountLabel: "10% Advance Discount",
  jazzcash: {
    name: "JazzCash",
    accountNumber: "03708111223",
    accountTitle: "ST Watches / Asad Kabir",
    deepLink: "jazzcash://",
    androidPackage: "com.techlogix.mobilinkcustomer",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.techlogix.mobilinkcustomer",
    appStoreUrl: "https://apps.apple.com/pk/app/jazzcash/id1209355157",
    ussdCode: "*786#",
    instructions: "Open JazzCash App > Send Money > Enter 03708111223 > Enter exact discounted total amount."
  },
  easypaisa: {
    name: "Easypaisa",
    accountNumber: "03708111223",
    accountTitle: "ST Watches / Asad Kabir",
    deepLink: "easypaisa://",
    androidPackage: "pk.com.telenor.phoenix",
    playStoreUrl: "https://play.google.com/store/apps/details?id=pk.com.telenor.phoenix",
    appStoreUrl: "https://apps.apple.com/pk/app/easypaisa-payments-made-easy/id1212879957",
    ussdCode: "*786#",
    instructions: "Open Easypaisa App > Send Money > Enter 03708111223 > Enter exact discounted total amount."
  }
};

// Standard product colors as specified by user: Black, White, Blue, Red
const ST_STANDARD_COLORS = [
  { id: "black", name: "Black", hex: "#1A1A1A", image: "/assets/images/watch_minimal_black_1790491753888.jpg" },
  { id: "white", name: "White", hex: "#FFFFFF", image: "/assets/images/watch_white_edition_1790621308624.jpg" },
  { id: "blue", name: "Blue", hex: "#1B3B6F", image: "/assets/images/watch_midnight_blue_1790603836932.jpg" },
  { id: "red", name: "Red", hex: "#B91C1C", image: "/assets/images/watch_red_edition_1790621324107.jpg" }
];

const ST_STANDARD_GALLERY = [
  "/assets/images/watch_minimal_black_1790491753888.jpg",
  "/assets/images/watch_white_edition_1790621308624.jpg",
  "/assets/images/watch_midnight_blue_1790603836932.jpg",
  "/assets/images/watch_red_edition_1790621324107.jpg"
];

const ST_PRODUCTS = [
  {
    id: "st-classic-black",
    name: "ST Classic Black",
    category: "Classic Watches",
    gender: "men",
    price: 14500,
    oldPrice: 18500,
    badge: "SALE",
    stock: 14,
    isNew: false,
    isSale: true,
    rating: 4.9,
    reviewsCount: 38,
    image: "/assets/images/watch_minimal_black_1790491753888.jpg",
    colors: ST_STANDARD_COLORS,
    gallery: ST_STANDARD_GALLERY,
    shortDesc: "Understated obsidian elegance engineered with surgical grade 316L stainless steel and anti-reflective sapphire crystal.",
    description: "The ST Classic Black is the cornerstone of our heritage collection. Sculpted from monolithic 316L stainless steel coated in high-durability diamond-like carbon (DLC), this timepiece marries stealth aesthetics with razor-sharp readability. Its matte black dial features diamond-cut indices and a Japanese quartz movement tuned for uncompromising accuracy in all conditions.",
    features: [
      "Case Diameter: 40mm | Thickness: 8.5mm",
      "Movement: Japanese Miyota Calibre High-Precision Quartz",
      "Glass: Scratch-Resistant Sapphire Crystal with AR Coating",
      "Strap: 20mm Quick-Release PVD Black Mesh Bracelet",
      "Water Resistance: 5 ATM / 50 Metres",
      "Warranty: 1 Year ST Official Manufacturer Warranty in Pakistan"
    ]
  },
  {
    id: "st-royal-gold",
    name: "ST Royal Gold",
    category: "Luxury Watches",
    gender: "men",
    price: 26000,
    oldPrice: 32000,
    badge: "BESTSELLER",
    stock: 9,
    isNew: false,
    isSale: true,
    rating: 5.0,
    reviewsCount: 52,
    image: "/assets/images/watch_gold_chronograph_1790491730907.jpg",
    colors: ST_STANDARD_COLORS,
    gallery: ST_STANDARD_GALLERY,
    shortDesc: "A masterwork of 18K yellow gold ion-plating paired with a jet-black sunburst dial and three-subdial chronograph.",
    description: "Conceived for dignitaries and collectors who command presence. The ST Royal Gold features a multi-tiered brushed and mirror-polished bezel, high-precision chronograph sub-dials measuring 1/10th second intervals, and luminous dauphine hands. Coated in heavy electroplated 18K gold that resists tarnishing in South Asia's humid climate.",
    features: [
      "Case Diameter: 42mm | Thickness: 10.2mm",
      "Movement: Seiko VK63 Meca-Quartz Chronograph with Flyback Reset",
      "Glass: Domed Sapphire Crystal with Anti-Scratch Shield",
      "Strap: Solid 316L Stainless Steel 5-Link Gold Bracelet with Butterfly Clasp",
      "Water Resistance: 10 ATM / 100 Metres",
      "Includes: ST Luxury Wood-Finish Presentation Box & Certificate"
    ]
  },
  {
    id: "st-executive-silver",
    name: "ST Executive Silver",
    category: "Classic Watches",
    gender: "men",
    price: 16800,
    oldPrice: null,
    badge: "NEW ARRIVAL",
    stock: 19,
    isNew: true,
    isSale: false,
    rating: 4.8,
    reviewsCount: 24,
    image: "/assets/images/hero_luxury_watch_1790491706763.jpg",
    colors: ST_STANDARD_COLORS,
    gallery: ST_STANDARD_GALLERY,
    shortDesc: "Hand-brushed silver casing with sunray silver-slate dial and date complication at 3 o'clock.",
    description: "Designed for the modern boardroom and black-tie evenings. ST Executive Silver reflects pristine metallurgical artistry with hand-beveled edges, polished indices, and an architectural oyster-style bracelet that drapes seamlessly around the wrist.",
    features: [
      "Case Diameter: 41mm | Thickness: 9.0mm",
      "Movement: Japanese Calibre 2115 Quartz with Quick-Set Date",
      "Glass: Flat Sapphire Crystal Glass",
      "Strap: Brushed Solid Steel 3-Link Bracelet with Micro-Adjustment Clasp",
      "Water Resistance: 5 ATM / 50 Metres",
      "Warranty: 1 Year Comprehensive National Warranty"
    ]
  },
  {
    id: "st-chronograph-black",
    name: "ST Chronograph Black",
    category: "Casual Watches",
    gender: "men",
    price: 19500,
    oldPrice: 24000,
    badge: "SALE",
    stock: 11,
    isNew: false,
    isSale: true,
    rating: 4.9,
    reviewsCount: 41,
    image: "/assets/images/watch_minimal_black_1790491753888.jpg",
    colors: ST_STANDARD_COLORS,
    gallery: ST_STANDARD_GALLERY,
    shortDesc: "Triple-register tactical chronograph with tachymeter bezel and high-density fluororubber performance strap.",
    description: "Engineered for dynamic pace. The ST Chronograph Black incorporates split-second lap timing, date window at 4:30, and Swiss Super-LumiNova coatings on hands and hour markers for total nighttime visibility.",
    features: [
      "Case Diameter: 43mm | Thickness: 11mm",
      "Movement: High-Precision Quartz Chronograph Movement",
      "Glass: Hardened Sapphire Crystal",
      "Strap: Waterproof Textured Silicone Strap with PVD Buckle",
      "Water Resistance: 10 ATM / 100 Metres",
      "Features: Tachymeter Scale, 24-Hour Military Dial"
    ]
  },
  {
    id: "st-classic-brown",
    name: "ST Classic Brown",
    category: "Classic Watches",
    gender: "men",
    price: 13900,
    oldPrice: null,
    badge: "SIGNATURE",
    stock: 22,
    isNew: false,
    isSale: false,
    rating: 4.9,
    reviewsCount: 65,
    image: "/assets/images/watch_classic_brown_1790491742680.jpg",
    colors: ST_STANDARD_COLORS,
    gallery: ST_STANDARD_GALLERY,
    shortDesc: "Warm rose gold bezel embracing a clean porcelain dial, fitted to top-grain vegetable-tanned Italian leather.",
    description: "The quintessential gentleman's dress watch. ST Classic Brown combines vintage warmth with minimalist mid-century proportion. Its ivory enamel dial features Roman numeral indices and slender feuille hands that glide with whisper-quiet precision.",
    features: [
      "Case Diameter: 39mm | Thickness: 8mm",
      "Movement: Japanese Ultra-Slim Calibre Quartz",
      "Glass: Curved Double-Domed Sapphire Crystal",
      "Strap: 20mm Top-Grain Hand-Stitched Italian Brown Leather",
      "Water Resistance: 3 ATM / 30 Metres",
      "Heritage: Inspired by 1950s Horological Proportions"
    ]
  },
  {
    id: "st-elite-gold",
    name: "ST Elite Gold",
    category: "Women's Watches",
    gender: "women",
    price: 22500,
    oldPrice: null,
    badge: "POPULAR",
    stock: 12,
    isNew: true,
    isSale: false,
    rating: 5.0,
    reviewsCount: 31,
    image: "/assets/images/watch_gold_chronograph_1790491730907.jpg",
    colors: ST_STANDARD_COLORS,
    gallery: ST_STANDARD_GALLERY,
    shortDesc: "Radiant 32mm champagne dial accented with baguette crystal indices and jewelry mesh strap.",
    description: "Crafted for refined feminine power. The ST Elite Gold delivers exquisite jewelry-grade luster in a petite 32mm profile. Ideal for formal Pakistani festivities, weddings, and executive daily wear.",
    features: [
      "Case Diameter: 32mm | Thickness: 7.2mm",
      "Movement: Swiss-Engineered Slimline Quartz",
      "Glass: Scratch-Resistant Sapphire Crystal",
      "Strap: 14mm Self-Adjusting Milanese Gold Mesh Bracelet",
      "Water Resistance: 3 ATM / 30 Metres",
      "Dial: Champagne Sunburst with Baguette Faceted Indices"
    ]
  },
  {
    id: "st-minimal-silver",
    name: "ST Minimal Silver",
    category: "Casual Watches",
    gender: "unisex",
    price: 12500,
    oldPrice: 15000,
    badge: "SALE",
    stock: 16,
    isNew: false,
    isSale: true,
    rating: 4.7,
    reviewsCount: 19,
    image: "/assets/images/watch_minimal_black_1790491753888.jpg",
    colors: ST_STANDARD_COLORS,
    gallery: ST_STANDARD_GALLERY,
    shortDesc: "Pure Bauhaus reduction with clean baton hands and a brushed surgical steel bracelet.",
    description: "Stripped of all superfluous noise. The ST Minimal Silver celebrates the purity of form and line. The ultra-slim bezel maximizes dial opening, creating a contemporary statement piece suited for casual, university, or studio wear.",
    features: [
      "Case Diameter: 38mm | Thickness: 7.5mm",
      "Movement: High-Efficiency Japanese Quartz (3-Year Battery)",
      "Glass: K1 Mineral Crystal with Sapphire Coating",
      "Strap: 18mm Brushed Steel Mesh with Safety Lock",
      "Water Resistance: 3 ATM / 30 Metres"
    ]
  },
  {
    id: "st-sport-black",
    name: "ST Sport Black",
    category: "Casual Watches",
    gender: "men",
    price: 15200,
    oldPrice: 17900,
    badge: "SALE",
    stock: 15,
    isNew: false,
    isSale: true,
    rating: 4.8,
    reviewsCount: 29,
    image: "/assets/images/watch_minimal_black_1790491753888.jpg",
    colors: ST_STANDARD_COLORS,
    gallery: ST_STANDARD_GALLERY,
    shortDesc: "Rugged yet refined outdoor sports watch featuring textured waffle dial and 100M water resistance.",
    description: "Built to withstand the elements without sacrificing sharp tailoring. ST Sport Black pairs a knurled screw-down crown with shock-resistant movement casing, ready for sport, travel, and adventure.",
    features: [
      "Case Diameter: 42mm | Thickness: 10.8mm",
      "Movement: Shock-Mounted Quartz Calibre",
      "Glass: Sapphire Coated Anti-Scratch Lens",
      "Strap: Sweat-Resistant Vulcanised Hybrid Rubber",
      "Water Resistance: 10 ATM / 100 Metres",
      "Bezel: Unidirectional 60-Minute Rotating Diver Bezel"
    ]
  },
  {
    id: "st-prestige-blue",
    name: "ST Prestige Blue",
    category: "Luxury Watches",
    gender: "men",
    price: 28000,
    oldPrice: null,
    badge: "FLAGSHIP",
    stock: 7,
    isNew: true,
    isSale: false,
    rating: 5.0,
    reviewsCount: 47,
    image: "/assets/images/watch_midnight_blue_1790603836932.jpg",
    colors: ST_STANDARD_COLORS,
    gallery: ST_STANDARD_GALLERY,
    shortDesc: "Deep midnight blue fumé dial framed in mirror-polished steel with exhibition caseback.",
    description: "The pinnacle of the ST Horology lineup. ST Prestige Blue features a graduated royal blue dial that shifts under light from inky navy to electric lapis lazuli. Hand-assembled by master horologists in limited runs.",
    features: [
      "Case Diameter: 41mm | Thickness: 10.0mm",
      "Movement: Automatic Self-Winding Movement (42-Hour Power Reserve)",
      "Glass: Dual Curved Sapphire Crystal with Dual AR Coating",
      "Strap: Solid Stainless Steel President-Link Bracelet",
      "Water Resistance: 10 ATM / 100 Metres",
      "Caseback: Transparent Exhibition Sapphire Window"
    ]
  },
  {
    id: "st-heritage-brown",
    name: "ST Heritage Brown",
    category: "Classic Watches",
    gender: "men",
    price: 14900,
    oldPrice: null,
    badge: "VINTAGE",
    stock: 18,
    isNew: false,
    isSale: false,
    rating: 4.9,
    reviewsCount: 33,
    image: "/assets/images/watch_classic_brown_1790491742680.jpg",
    colors: ST_STANDARD_COLORS,
    gallery: ST_STANDARD_GALLERY,
    shortDesc: "Antique brass-toned bezel with sepia cream dial and distressed distressed brown saddle leather strap.",
    description: "Evoking timeless mid-century aviation chronometry. The ST Heritage Brown carries warmth and tactile distinction. Every strap develops a unique patina over years of wear, telling your personal life journey.",
    features: [
      "Case Diameter: 40mm | Thickness: 8.8mm",
      "Movement: Japanese Quartz with Subsidiary Seconds Dial",
      "Glass: Scratch-Resistant Sapphire Crystal",
      "Strap: 20mm Distressed Full-Grain Pull-Up Leather",
      "Water Resistance: 5 ATM / 50 Metres",
      "Dial: Matte Cream with Patina Luminous Arabic Numerals"
    ]
  },
  {
    id: "st-royal-black",
    name: "ST Royal Black",
    category: "Men's Watches",
    gender: "men",
    price: 24500,
    oldPrice: 29000,
    badge: "SALE",
    stock: 8,
    isNew: false,
    isSale: true,
    rating: 4.9,
    reviewsCount: 46,
    image: "/assets/images/watch_minimal_black_1790491753888.jpg",
    colors: ST_STANDARD_COLORS,
    gallery: ST_STANDARD_GALLERY,
    shortDesc: "Bold brushed black titanium-look steel case with skeletonized hands and 24-hour chronograph.",
    description: "An uncompromising statement of masculine authority. The ST Royal Black merges stealth tactical black with high-jewelry finishing standards. Features dual chronograph pushers with knurled grips.",
    features: [
      "Case Diameter: 42.5mm | Thickness: 10.5mm",
      "Movement: Calibre OS20 Chronograph Movement",
      "Glass: Anti-Reflective Synthetic Sapphire",
      "Strap: Solid PVD Matte Black Stainless Steel Link",
      "Water Resistance: 10 ATM / 100 Metres",
      "Includes: ST Branded Travel Leather Watch Roll"
    ]
  },
  {
    id: "st-signature-gold",
    name: "ST Signature Gold",
    category: "Luxury Watches",
    gender: "unisex",
    price: 31500,
    oldPrice: null,
    badge: "COLLECTOR",
    stock: 5,
    isNew: true,
    isSale: false,
    rating: 5.0,
    reviewsCount: 58,
    image: "/assets/images/watch_gold_chronograph_1790491730907.jpg",
    colors: ST_STANDARD_COLORS,
    gallery: ST_STANDARD_GALLERY,
    shortDesc: "Our supreme horological creation. 18K micro-brushed gold bezel, onyx stone crown, and perpetual calendar.",
    description: "The ST Signature Gold is crafted strictly in numbered batches of 100 pieces per year for discerning Pakistani patrons. Features hand-polished beveled lugs, a genuine cabochon onyx stone inset into the winding crown, and an individually engraved caseback.",
    features: [
      "Case Diameter: 41mm | Thickness: 9.6mm",
      "Movement: Custom High-Beat Precision Calibre with Date & Day Subdials",
      "Glass: Double-Sided Sapphire with 5-Layer Anti-Glare Treatment",
      "Strap: Custom Engineered Solid Gold-Tone 316L Bracelet",
      "Crown: Fluted Crown with Inset Natural Black Onyx Stone",
      "Certification: Numbered Limited Edition Certificate of Authenticity"
    ]
  }
];

// Helper Functions
function formatPKR(amount) {
  if (typeof amount !== 'number') return 'PKR 0';
  return 'PKR ' + amount.toLocaleString('en-PK');
}

function getAllProducts() {
  return ST_PRODUCTS;
}

function getProductById(id) {
  return ST_PRODUCTS.find(p => p.id === id) || null;
}

function getProductsByCategory(categoryName) {
  if (!categoryName || categoryName === 'All') return ST_PRODUCTS;
  if (categoryName === 'New Arrivals') return ST_PRODUCTS.filter(p => p.isNew);
  if (categoryName === 'Sale') return ST_PRODUCTS.filter(p => p.isSale);
  if (categoryName === "Men's Watches") return ST_PRODUCTS.filter(p => p.gender === 'men' || p.category === "Men's Watches");
  if (categoryName === "Women's Watches") return ST_PRODUCTS.filter(p => p.gender === 'women' || p.category === "Women's Watches");
  return ST_PRODUCTS.filter(p => p.category.toLowerCase().includes(categoryName.toLowerCase()));
}
