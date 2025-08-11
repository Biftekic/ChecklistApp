// Comprehensive Template Data for ChecklistApp
// Based on CChecklist industry modules

import { ChecklistTemplate } from "@/lib/types/template";

export const allTemplates: ChecklistTemplate[] = [
  // Hospitality Template
  {
    id: "hospitality-hotel",
    name: "Hospitality/Hotel Cleaning",
    industry: {
      id: "hospitality",
      name: "Hospitality",
      code: "HOSP",
      description: "Hotels, motels, resorts, and hospitality facilities"
    },
    description: "Comprehensive hotel and hospitality cleaning with guest rooms, public areas, and service facilities",
    categories: [
      {
        id: "guest-accommodations",
        name: "Guest Accommodations",
        description: "Guest rooms and suites",
        icon: "bed",
        rooms: [
          {
            id: "standard-guest-room",
            name: "Standard Guest Room",
            type: "guest-room",
            tasks: [
              {
                id: "sgr-1",
                name: "Strip and Make Bed",
                description: "Remove used linens, replace with fresh linens using hospital corners",
                estimatedTime: 8,
                frequency: "daily",
                priority: "high",
                supplies: ["Fitted sheet", "Flat sheet", "Pillowcases", "Duvet cover"],
                notes: "Check for stains, tears, or bed bugs during stripping",
                isSelected: true
              },
              {
                id: "sgr-2",
                name: "Clean and Disinfect Bathroom",
                description: "Complete bathroom sanitization including toilet, shower/tub, sink, and fixtures",
                estimatedTime: 10,
                frequency: "daily",
                priority: "high",
                supplies: ["Bathroom disinfectant", "Glass cleaner", "Toilet bowl cleaner", "Microfiber cloths"],
                notes: "Use EPA-registered disinfectants. Replace towels and amenities",
                isSelected: true
              },
              {
                id: "sgr-3",
                name: "Dust All Surfaces",
                description: "Dust furniture, window sills, picture frames, lamps, and electronics",
                estimatedTime: 5,
                frequency: "daily",
                priority: "medium",
                supplies: ["Microfiber cloths", "Furniture polish", "Electronics cleaner"],
                notes: "Work from top to bottom, check under furniture",
                isSelected: true
              },
              {
                id: "sgr-4",
                name: "Vacuum Carpet/Clean Floors",
                description: "Vacuum all carpeted areas in pattern, mop hard floors",
                estimatedTime: 5,
                frequency: "daily",
                priority: "high",
                supplies: ["HEPA vacuum", "Floor cleaner", "Mop"],
                notes: "Vacuum in overlapping strokes, check edges and corners",
                isSelected: true
              },
              {
                id: "sgr-5",
                name: "Empty Trash and Replace Liners",
                description: "Empty all waste baskets, replace liners, remove any recycling",
                estimatedTime: 2,
                frequency: "daily",
                priority: "high",
                supplies: ["Trash bags", "Recycling bags"],
                isSelected: true
              }
            ]
          },
          {
            id: "suite",
            name: "Suite",
            type: "suite",
            tasks: [
              {
                id: "su-1",
                name: "Clean Living Area",
                description: "Dust and vacuum living room, clean furniture and electronics",
                estimatedTime: 10,
                frequency: "daily",
                priority: "high",
                supplies: ["Vacuum", "Furniture polish", "Microfiber cloths"],
                notes: "Pay attention to upholstery and decorative items",
                isSelected: true
              },
              {
                id: "su-2",
                name: "Service Kitchenette",
                description: "Clean appliances, counters, sink, restock supplies",
                estimatedTime: 8,
                frequency: "daily",
                priority: "high",
                supplies: ["Kitchen cleaner", "Dish soap", "Sponges", "Paper towels"],
                notes: "Check dishwasher, microwave, and coffee maker",
                isSelected: true
              }
            ]
          }
        ]
      },
      {
        id: "public-areas",
        name: "Public Areas",
        description: "Lobbies, corridors, and common spaces",
        icon: "users",
        rooms: [
          {
            id: "lobby",
            name: "Lobby",
            type: "public",
            tasks: [
              {
                id: "lo-1",
                name: "Clean Entry Doors and Glass",
                description: "Clean all entry doors, glass panels, and frames",
                estimatedTime: 5,
                frequency: "daily",
                priority: "high",
                supplies: ["Glass cleaner", "Microfiber cloths", "Door polish"],
                notes: "Clean both sides, check for fingerprints frequently",
                isSelected: true
              },
              {
                id: "lo-2",
                name: "Vacuum/Clean Entry Mats",
                description: "Vacuum and spot clean entry mats and runners",
                estimatedTime: 5,
                frequency: "daily",
                priority: "high",
                supplies: ["Vacuum", "Spot cleaner", "Mat cleaning solution"],
                notes: "Replace mats in wet weather",
                isSelected: true
              }
            ]
          }
        ]
      },
      {
        id: "service-areas",
        name: "Service Areas",
        description: "Support and amenity spaces",
        icon: "settings",
        rooms: [
          {
            id: "fitness-center",
            name: "Fitness Center",
            type: "amenity",
            tasks: [
              {
                id: "fc-1",
                name: "Disinfect Exercise Equipment",
                description: "Wipe down all exercise machines and free weights",
                estimatedTime: 15,
                frequency: "daily",
                priority: "high",
                supplies: ["Disinfectant", "Microfiber cloths", "Equipment cleaner"],
                notes: "Use gym-specific disinfectants",
                isSelected: true
              },
              {
                id: "fc-2",
                name: "Clean Mirrors",
                description: "Clean all wall mirrors streak-free",
                estimatedTime: 5,
                frequency: "daily",
                priority: "medium",
                supplies: ["Glass cleaner", "Microfiber cloths", "Squeegee"],
                notes: "Critical for user experience",
                isSelected: true
              }
            ]
          }
        ]
      }
    ],
    estimatedTotalTime: 300,
    tags: ["hospitality", "hotel", "guest-services"],
    compliance: [
      {
        id: "health-dept",
        name: "Health Department Standards",
        requirement: "Maintain lodging facility cleanliness standards",
        category: "Health & Safety"
      }
    ],
    equipment: [
      {
        id: "room-cart",
        name: "Housekeeping Cart",
        quantity: 1,
        notes: "Fully stocked with linens, amenities, and cleaning supplies"
      }
    ]
  },
  
  // Healthcare Template
  {
    id: "healthcare-medical",
    name: "Healthcare/Medical Facility Cleaning",
    industry: {
      id: "healthcare",
      name: "Healthcare",
      code: "MED",
      description: "Hospitals, clinics, medical offices, and healthcare facilities"
    },
    description: "Specialized medical facility cleaning with strict infection control protocols and regulatory compliance",
    categories: [
      {
        id: "clinical-areas",
        name: "Clinical Areas",
        description: "Patient care and treatment areas",
        icon: "activity",
        rooms: [
          {
            id: "patient-room",
            name: "Patient Room",
            type: "clinical",
            tasks: [
              {
                id: "pr-1",
                name: "PPE Donning",
                description: "Put on appropriate personal protective equipment",
                estimatedTime: 3,
                frequency: "daily",
                priority: "high",
                supplies: ["Gloves", "Mask", "Gown", "Face shield"],
                notes: "Follow proper PPE sequence",
                isSelected: true
              },
              {
                id: "pr-2",
                name: "High-Touch Surface Disinfection",
                description: "Disinfect bed rails, call buttons, door handles, light switches",
                estimatedTime: 8,
                frequency: "daily",
                priority: "high",
                supplies: ["EPA-registered hospital disinfectant", "Microfiber cloths"],
                notes: "Allow proper contact time per product instructions",
                isSelected: true
              },
              {
                id: "pr-3",
                name: "Terminal Clean Bathroom",
                description: "Complete disinfection of all bathroom surfaces",
                estimatedTime: 10,
                frequency: "daily",
                priority: "high",
                supplies: ["Hospital-grade disinfectant", "Toilet bowl cleaner", "Microfiber cloths"],
                notes: "Use sporicidal agent for C. diff rooms",
                isSelected: true
              },
              {
                id: "pr-4",
                name: "Floor Disinfection",
                description: "Mop floors with hospital-grade disinfectant",
                estimatedTime: 8,
                frequency: "daily",
                priority: "high",
                supplies: ["Hospital floor cleaner", "Microfiber mop", "Disinfectant"],
                notes: "Work from clean to dirty areas",
                isSelected: true
              },
              {
                id: "pr-5",
                name: "Waste Disposal",
                description: "Remove and properly dispose of medical waste",
                estimatedTime: 3,
                frequency: "daily",
                priority: "high",
                supplies: ["Red biohazard bags", "Regular waste bags", "Sharps container"],
                notes: "Follow medical waste protocols",
                isSelected: true
              }
            ]
          },
          {
            id: "operating-room",
            name: "Operating Room",
            type: "surgical",
            tasks: [
              {
                id: "or-1",
                name: "Pre-Operative Terminal Clean",
                description: "Complete OR disinfection between cases",
                estimatedTime: 30,
                frequency: "as-needed",
                priority: "high",
                supplies: ["OR-specific disinfectant", "Sterile cloths", "Mop system"],
                notes: "Follow strict OR protocols",
                isSelected: true
              },
              {
                id: "or-2",
                name: "Equipment Disinfection",
                description: "Clean and disinfect all OR equipment surfaces",
                estimatedTime: 15,
                frequency: "as-needed",
                priority: "high",
                supplies: ["Equipment-safe disinfectant", "Lint-free cloths"],
                notes: "Do not disturb sterile field",
                isSelected: true
              }
            ]
          }
        ]
      },
      {
        id: "support-areas",
        name: "Support Areas",
        description: "Non-clinical support spaces",
        icon: "clipboard",
        rooms: [
          {
            id: "waiting-room",
            name: "Waiting Room",
            type: "public",
            tasks: [
              {
                id: "wr-1",
                name: "Seating Disinfection",
                description: "Clean and disinfect all seating surfaces",
                estimatedTime: 10,
                frequency: "daily",
                priority: "high",
                supplies: ["Disinfectant", "Microfiber cloths"],
                notes: "Focus on armrests and high-touch areas",
                isSelected: true
              },
              {
                id: "wr-2",
                name: "Magazine/Reading Material Management",
                description: "Remove outdated materials, disinfect holders",
                estimatedTime: 5,
                frequency: "daily",
                priority: "medium",
                supplies: ["Disinfectant wipes"],
                notes: "Consider removing during outbreak situations",
                isSelected: true
              }
            ]
          }
        ]
      }
    ],
    estimatedTotalTime: 480,
    tags: ["healthcare", "medical", "infection-control"],
    compliance: [
      {
        id: "cdc-guidelines",
        name: "CDC Guidelines",
        requirement: "Follow Centers for Disease Control infection prevention protocols",
        category: "Infection Control"
      },
      {
        id: "osha-bloodborne",
        name: "OSHA Bloodborne Pathogens",
        requirement: "Comply with 29 CFR 1910.1030 standards",
        category: "Safety"
      }
    ],
    equipment: [
      {
        id: "ppe-kit",
        name: "PPE Kit",
        quantity: 1,
        notes: "N95 masks, face shields, gowns, gloves"
      },
      {
        id: "spill-kit",
        name: "Biohazard Spill Kit",
        quantity: 1,
        notes: "For bodily fluid cleanup"
      }
    ]
  },
  
  // Retail Template
  {
    id: "retail-store",
    name: "Retail Store Cleaning",
    industry: {
      id: "retail",
      name: "Retail",
      code: "RTL",
      description: "Retail stores, shopping centers, boutiques, and commercial spaces"
    },
    description: "Comprehensive retail store cleaning focused on customer experience and merchandise protection",
    categories: [
      {
        id: "sales-floor",
        name: "Sales Floor",
        description: "Customer shopping areas",
        icon: "shopping-bag",
        rooms: [
          {
            id: "main-sales-floor",
            name: "Main Sales Floor",
            type: "retail",
            tasks: [
              {
                id: "sf-1",
                name: "Dust Product Displays",
                description: "Carefully dust all product displays and shelving",
                estimatedTime: 15,
                frequency: "daily",
                priority: "high",
                supplies: ["Microfiber cloths", "Extension duster"],
                notes: "Be careful not to disturb merchandise",
                isSelected: true
              },
              {
                id: "sf-2",
                name: "Vacuum/Mop Sales Floor",
                description: "Clean all floor areas between displays",
                estimatedTime: 20,
                frequency: "daily",
                priority: "high",
                supplies: ["Vacuum", "Mop", "Floor cleaner"],
                notes: "Work around customers during business hours",
                isSelected: true
              },
              {
                id: "sf-3",
                name: "Clean Glass Displays",
                description: "Clean all glass display cases and windows",
                estimatedTime: 10,
                frequency: "daily",
                priority: "medium",
                supplies: ["Glass cleaner", "Microfiber cloths"],
                notes: "Remove fingerprints and smudges",
                isSelected: true
              },
              {
                id: "sf-4",
                name: "Spot Clean Spills",
                description: "Immediate response to any spills on sales floor",
                estimatedTime: 5,
                frequency: "as-needed",
                priority: "high",
                supplies: ["Spill kit", "Wet floor signs", "Mop"],
                notes: "2-minute response time required",
                isSelected: true
              },
              {
                id: "sf-5",
                name: "Empty Trash Receptacles",
                description: "Empty all customer trash bins and replace liners",
                estimatedTime: 5,
                frequency: "daily",
                priority: "high",
                supplies: ["Trash bags"],
                notes: "Check frequently during peak hours",
                isSelected: true
              }
            ]
          },
          {
            id: "fitting-rooms",
            name: "Fitting Rooms",
            type: "retail",
            tasks: [
              {
                id: "fr-1",
                name: "Sanitize Fitting Room Surfaces",
                description: "Clean mirrors, hooks, benches, and handles",
                estimatedTime: 5,
                frequency: "daily",
                priority: "high",
                supplies: ["Disinfectant", "Glass cleaner", "Microfiber cloths"],
                notes: "Check for left merchandise",
                isSelected: true
              },
              {
                id: "fr-2",
                name: "Vacuum Fitting Room Floors",
                description: "Vacuum each fitting room thoroughly",
                estimatedTime: 8,
                frequency: "daily",
                priority: "high",
                supplies: ["Vacuum"],
                notes: "Check for pins and tags",
                isSelected: true
              }
            ]
          }
        ]
      },
      {
        id: "checkout-area",
        name: "Checkout Area",
        description: "Cash registers and customer service",
        icon: "credit-card",
        rooms: [
          {
            id: "checkout-counters",
            name: "Checkout Counters",
            type: "retail",
            tasks: [
              {
                id: "cc-1",
                name: "Sanitize POS Systems",
                description: "Clean and disinfect payment terminals and screens",
                estimatedTime: 5,
                frequency: "daily",
                priority: "high",
                supplies: ["Electronics cleaner", "Disinfectant wipes"],
                notes: "Use electronics-safe products",
                isSelected: true
              },
              {
                id: "cc-2",
                name: "Clean Counter Surfaces",
                description: "Wipe down all checkout counter surfaces",
                estimatedTime: 5,
                frequency: "daily",
                priority: "high",
                supplies: ["All-purpose cleaner", "Microfiber cloths"],
                notes: "Coordinate with cashiers",
                isSelected: true
              }
            ]
          }
        ]
      },
      {
        id: "support-areas",
        name: "Support Areas",
        description: "Back office and employee areas",
        icon: "archive",
        rooms: [
          {
            id: "stockroom",
            name: "Stockroom",
            type: "storage",
            tasks: [
              {
                id: "sr-1",
                name: "Sweep/Mop Stockroom Floor",
                description: "Clean all accessible floor areas",
                estimatedTime: 15,
                frequency: "weekly",
                priority: "medium",
                supplies: ["Broom", "Mop", "Floor cleaner"],
                notes: "Work around inventory",
                isSelected: true
              },
              {
                id: "sr-2",
                name: "Organize and Dust Shelving",
                description: "Dust storage shelves and organize supplies",
                estimatedTime: 10,
                frequency: "weekly",
                priority: "low",
                supplies: ["Microfiber cloths", "Extension duster"],
                notes: "Do not move inventory without permission",
                isSelected: false
              }
            ]
          }
        ]
      }
    ],
    estimatedTotalTime: 240,
    tags: ["retail", "store", "customer-service"],
    compliance: [
      {
        id: "ada-compliance",
        name: "ADA Compliance",
        requirement: "Maintain accessibility standards",
        category: "Accessibility"
      }
    ],
    equipment: [
      {
        id: "quiet-vacuum",
        name: "Quiet Vacuum Cleaner",
        quantity: 1,
        notes: "For use during business hours"
      },
      {
        id: "spill-kit",
        name: "Spill Response Kit",
        quantity: 2,
        notes: "Quick response to customer spills"
      }
    ]
  }
];

export default allTemplates;
