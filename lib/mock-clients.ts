import type { Client } from "@/lib/types"

// Sample client data with requests that will match our mock offers
export const mockClients: Client[] = [
  {
    id: "client1",
    name: "John Smith",
    email: "john.smith@shipco.com",
    company: "ShipCo International",
    status: "active",
    lastContact: new Date("2025-05-01"),
    phone: "+1 (555) 123-4567",
    requests: [
      {
        id: "req1",
        emailSubject: "Need Handysize vessel for US Gulf to Continent route",
        emailContent:
          "Looking for a Handysize vessel around 32k DWT for US Gulf to Continent route. Laycan June 10-15, target rate $15k/day. Please advise on availability.",
        date: new Date("2025-05-05"),
        status: "new",
        extractedData: {
          vesselType: "Handysize",
          vesselSize: 32000,
          loadPort: "US Gulf",
          dischargePort: "Continent",
          laycanStart: new Date("2025-06-10"),
          laycanEnd: new Date("2025-06-15"),
          targetRate: 15,
        },
      },
      {
        id: "req2",
        emailSubject: "Panamax inquiry for ECSA to Far East",
        emailContent:
          "We are looking for a Panamax vessel, approximately 76k DWT, for ECSA to Far East route. Laycan June 12-18, willing to pay up to $20.5k/day. Please send available options.",
        date: new Date("2025-05-08"),
        status: "matched",
        extractedData: {
          vesselType: "Panamax",
          vesselSize: 76000,
          loadPort: "ECSA",
          dischargePort: "Far East",
          laycanStart: new Date("2025-06-12"),
          laycanEnd: new Date("2025-06-18"),
          targetRate: 20.5,
        },
      },
    ],
  },
  {
    id: "client2",
    name: "Sarah Johnson",
    email: "sarah.johnson@oceanfreight.com",
    company: "Ocean Freight Solutions",
    status: "active",
    lastContact: new Date("2025-05-03"),
    phone: "+1 (555) 987-6543",
    requests: [
      {
        id: "req3",
        emailSubject: "Supramax needed for Black Sea to SE Asia",
        emailContent:
          "Urgently seeking a Supramax vessel, around 58k DWT, for Black Sea to SE Asia route. Laycan June 15-20, budget around $18k/day. Please provide options ASAP.",
        date: new Date("2025-05-10"),
        status: "new",
        extractedData: {
          vesselType: "Supramax",
          vesselSize: 58000,
          loadPort: "Black Sea",
          dischargePort: "SE Asia",
          laycanStart: new Date("2025-06-15"),
          laycanEnd: new Date("2025-06-20"),
          targetRate: 18,
        },
      },
    ],
  },
  {
    id: "client3",
    name: "Michael Chen",
    email: "michael.chen@globalcargo.com",
    company: "Global Cargo Ltd",
    status: "inactive",
    lastContact: new Date("2025-04-15"),
    requests: [
      {
        id: "req4",
        emailSubject: "Ultramax inquiry for India to China route",
        emailContent:
          "Looking for an Ultramax vessel, approximately 64k DWT, for India to China route. Laycan June 11-17, target rate $19k/day. Please advise on availability.",
        date: new Date("2025-04-15"),
        status: "matched",
        extractedData: {
          vesselType: "Ultramax",
          vesselSize: 64000,
          loadPort: "India",
          dischargePort: "China",
          laycanStart: new Date("2025-06-11"),
          laycanEnd: new Date("2025-06-17"),
          targetRate: 19,
        },
      },
    ],
  },
  {
    id: "client4",
    name: "Emma Wilson",
    email: "emma.wilson@freightmaster.com",
    company: "Freight Master Inc",
    status: "active",
    lastContact: new Date("2025-05-07"),
    phone: "+1 (555) 456-7890",
    requests: [],
  },
  {
    id: "client5",
    name: "Carlos Rodriguez",
    email: "carlos@maritimesolutions.com",
    company: "Maritime Solutions",
    status: "active",
    lastContact: new Date("2025-05-12"),
    phone: "+34 612 345 678",
    requests: [
      {
        id: "req5",
        emailSubject: "Capesize vessel needed for Brazil to China",
        emailContent:
          "We require a Capesize vessel, approximately 180k DWT, for Brazil to China route. Laycan June 22-30, budget around $28.5k/day. Please provide suitable options.",
        date: new Date("2025-05-12"),
        status: "new",
        extractedData: {
          vesselType: "Capesize",
          vesselSize: 180000,
          loadPort: "Brazil",
          dischargePort: "China",
          laycanStart: new Date("2025-06-22"),
          laycanEnd: new Date("2025-06-30"),
          targetRate: 28.5,
        },
      },
    ],
  },
  {
    id: "client6",
    name: "Sophia Nakamura",
    email: "sophia@pacificshipping.jp",
    company: "Pacific Shipping Co.",
    status: "active",
    lastContact: new Date("2025-05-09"),
    phone: "+81 3 1234 5678",
    requests: [
      {
        id: "req6",
        emailSubject: "Post-Panamax for Australia to Japan route",
        emailContent:
          "Looking for a Post-Panamax vessel, around 95k DWT, for Australia to Japan route. Laycan June 18-25, target rate $24.2k/day. Please advise on availability.",
        date: new Date("2025-05-09"),
        status: "matched",
        extractedData: {
          vesselType: "Post-Panamax",
          vesselSize: 95000,
          loadPort: "Australia",
          dischargePort: "Japan",
          laycanStart: new Date("2025-06-18"),
          laycanEnd: new Date("2025-06-25"),
          targetRate: 24.2,
        },
      },
      {
        id: "req7",
        emailSubject: "Kamsarmax inquiry for Australia to Korea",
        emailContent:
          "Need a Kamsarmax vessel, approximately 82k DWT, for Australia to Korea route. Laycan June 20-27, willing to pay up to $23k/day. Please send options.",
        date: new Date("2025-05-11"),
        status: "new",
        extractedData: {
          vesselType: "Kamsarmax",
          vesselSize: 82000,
          loadPort: "Australia",
          dischargePort: "Korea",
          laycanStart: new Date("2025-06-20"),
          laycanEnd: new Date("2025-06-27"),
          targetRate: 23,
        },
      },
    ],
  },
  {
    id: "client7",
    name: "Alexander Petrov",
    email: "alex@blackseashipping.ru",
    company: "Black Sea Shipping",
    status: "active",
    lastContact: new Date("2025-05-14"),
    phone: "+7 495 123 4567",
    requests: [
      {
        id: "req8",
        emailSubject: "Handymax vessel for Black Sea to Med",
        emailContent:
          "Seeking a Handymax vessel, around 45k DWT, for Black Sea to Mediterranean route. Laycan June 25-30, budget around $16.5k/day. Please provide options.",
        date: new Date("2025-05-14"),
        status: "new",
        extractedData: {
          vesselType: "Handymax",
          vesselSize: 45000,
          loadPort: "Black Sea",
          dischargePort: "Med",
          laycanStart: new Date("2025-06-25"),
          laycanEnd: new Date("2025-06-30"),
          targetRate: 16.5,
        },
      },
    ],
  },
  {
    id: "client8",
    name: "Isabella Martinez",
    email: "isabella@southamericargo.br",
    company: "South American Cargo",
    status: "active",
    lastContact: new Date("2025-05-08"),
    phone: "+55 11 9876 5432",
    requests: [
      {
        id: "req9",
        emailSubject: "VLOC needed for Brazil to China",
        emailContent:
          "Looking for a VLOC, approximately 325k DWT, for Brazil to China route. Laycan July 5-15, target rate $35.8k/day. Please advise on availability.",
        date: new Date("2025-05-08"),
        status: "matched",
        extractedData: {
          vesselType: "VLOC",
          vesselSize: 325000,
          loadPort: "Brazil",
          dischargePort: "China",
          laycanStart: new Date("2025-07-05"),
          laycanEnd: new Date("2025-07-15"),
          targetRate: 35.8,
        },
      },
    ],
  },
  {
    id: "client9",
    name: "David Thompson",
    email: "david@northseashipping.uk",
    company: "North Sea Shipping Ltd",
    status: "inactive",
    lastContact: new Date("2025-04-20"),
    phone: "+44 20 7946 0123",
    requests: [],
  },
  {
    id: "client10",
    name: "Olivia Hansen",
    email: "olivia@nordicfreight.no",
    company: "Nordic Freight AS",
    status: "active",
    lastContact: new Date("2025-05-15"),
    phone: "+47 22 12 34 56",
    requests: [
      {
        id: "req10",
        emailSubject: "Supramax for Baltic to Med route",
        emailContent:
          "Need a Supramax vessel, around 56k DWT, for Baltic to Mediterranean route. Laycan June 28-July 5, willing to pay up to $17.8k/day. Please send options.",
        date: new Date("2025-05-15"),
        status: "new",
        extractedData: {
          vesselType: "Supramax",
          vesselSize: 56000,
          loadPort: "Baltic",
          dischargePort: "Med",
          laycanStart: new Date("2025-06-28"),
          laycanEnd: new Date("2025-07-05"),
          targetRate: 17.8,
        },
      },
    ],
  },
  {
    id: "client11",
    name: "Raj Patel",
    email: "raj@indiaoceanfreight.in",
    company: "India Ocean Freight",
    status: "active",
    lastContact: new Date("2025-05-13"),
    phone: "+91 22 2345 6789",
    requests: [
      {
        id: "req11",
        emailSubject: "Ultramax inquiry for India to Far East",
        emailContent:
          "Looking for an Ultramax vessel, approximately 63k DWT, for India to Far East route. Laycan July 1-7, target rate $19.5k/day. Please advise on availability.",
        date: new Date("2025-05-13"),
        status: "new",
        extractedData: {
          vesselType: "Ultramax",
          vesselSize: 63000,
          loadPort: "India",
          dischargePort: "Far East",
          laycanStart: new Date("2025-07-01"),
          laycanEnd: new Date("2025-07-07"),
          targetRate: 19.5,
        },
      },
    ],
  },
  {
    id: "client12",
    name: "Liu Wei",
    email: "liu@chinamaritimegroup.cn",
    company: "China Maritime Group",
    status: "active",
    lastContact: new Date("2025-05-16"),
    phone: "+86 10 8765 4321",
    requests: [
      {
        id: "req12",
        emailSubject: "Capesize vessel for Australia to China",
        emailContent:
          "Seeking a Capesize vessel, around 175k DWT, for Australia to China route. Laycan July 10-20, budget around $27.5k/day. Please provide suitable options.",
        date: new Date("2025-05-16"),
        status: "new",
        extractedData: {
          vesselType: "Capesize",
          vesselSize: 175000,
          loadPort: "Australia",
          dischargePort: "China",
          laycanStart: new Date("2025-07-10"),
          laycanEnd: new Date("2025-07-20"),
          targetRate: 27.5,
        },
      },
    ],
  },
]

// Function to get clients with their requests
export function getClientsWithRequests(): Client[] {
  return mockClients
}
