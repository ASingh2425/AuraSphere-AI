// Mock Data for AuraSphere AI - FIFA World Cup 2026 Stadium Operations

export const STADIUM_SECTIONS = {
  // Lower Tier
  "101": { id: "101", name: "Section 101 (North Stand)", tier: "Lower", capacity: 450, occupancy: 0.92, queueRestroom: 3, queueConcession: 8, accessElevator: "Elevator North-A", wheelchairSeats: 12 },
  "102": { id: "102", name: "Section 102 (North-East Stand)", tier: "Lower", capacity: 500, occupancy: 0.88, queueRestroom: 4, queueConcession: 12, accessElevator: "Elevator East-B", wheelchairSeats: 8 },
  "103": { id: "103", name: "Section 103 (East Stand)", tier: "Lower", capacity: 600, occupancy: 0.95, queueRestroom: 6, queueConcession: 15, accessElevator: "Elevator East-B", wheelchairSeats: 16 },
  "104": { id: "104", name: "Section 104 (East Stand)", tier: "Lower", capacity: 600, occupancy: 0.97, queueRestroom: 8, queueConcession: 18, accessElevator: "Elevator East-B", wheelchairSeats: 14 },
  "105": { id: "105", name: "Section 105 (South-East Stand)", tier: "Lower", capacity: 500, occupancy: 0.90, queueRestroom: 5, queueConcession: 11, accessElevator: "Elevator East-B", wheelchairSeats: 8 },
  "106": { id: "106", name: "Section 106 (South Stand)", tier: "Lower", capacity: 450, occupancy: 0.85, queueRestroom: 2, queueConcession: 7, accessElevator: "Elevator South-A", wheelchairSeats: 10 },
  "107": { id: "107", name: "Section 107 (South-West Stand)", tier: "Lower", capacity: 500, occupancy: 0.89, queueRestroom: 4, queueConcession: 9, accessElevator: "Elevator West-B", wheelchairSeats: 8 },
  "108": { id: "108", name: "Section 108 (West Stand)", tier: "Lower", capacity: 600, occupancy: 0.94, queueRestroom: 7, queueConcession: 14, accessElevator: "Elevator West-B", wheelchairSeats: 15 },
  "109": { id: "109", name: "Section 109 (West Stand - Premium)", tier: "Lower", capacity: 400, occupancy: 0.96, queueRestroom: 3, queueConcession: 6, accessElevator: "Elevator West-B", wheelchairSeats: 20 },
  "110": { id: "110", name: "Section 110 (North-West Stand)", tier: "Lower", capacity: 500, occupancy: 0.91, queueRestroom: 5, queueConcession: 10, accessElevator: "Elevator West-B", wheelchairSeats: 8 },

  // Upper Tier
  "201": { id: "201", name: "Section 201 (North Upper)", tier: "Upper", capacity: 700, occupancy: 0.78, queueRestroom: 5, queueConcession: 14, accessElevator: "Elevator North-A", wheelchairSeats: 4 },
  "202": { id: "202", name: "Section 202 (North-East Upper)", tier: "Upper", capacity: 800, occupancy: 0.84, queueRestroom: 7, queueConcession: 16, accessElevator: "Elevator East-B", wheelchairSeats: 4 },
  "203": { id: "203", name: "Section 203 (East Upper)", tier: "Upper", capacity: 900, occupancy: 0.89, queueRestroom: 10, queueConcession: 22, accessElevator: "Elevator East-B", wheelchairSeats: 6 },
  "204": { id: "204", name: "Section 204 (East Upper)", tier: "Upper", capacity: 900, occupancy: 0.92, queueRestroom: 12, queueConcession: 25, accessElevator: "Elevator East-B", wheelchairSeats: 6 },
  "205": { id: "205", name: "Section 205 (South-East Upper)", tier: "Upper", capacity: 800, occupancy: 0.86, queueRestroom: 8, queueConcession: 18, accessElevator: "Elevator East-B", wheelchairSeats: 4 },
  "206": { id: "206", name: "Section 206 (South Upper)", tier: "Upper", capacity: 700, occupancy: 0.75, queueRestroom: 4, queueConcession: 11, accessElevator: "Elevator South-A", wheelchairSeats: 4 },
  "207": { id: "207", name: "Section 207 (South-West Upper)", tier: "Upper", capacity: 800, occupancy: 0.80, queueRestroom: 6, queueConcession: 13, accessElevator: "Elevator West-B", wheelchairSeats: 4 },
  "208": { id: "208", name: "Section 208 (West Upper)", tier: "Upper", capacity: 900, occupancy: 0.88, queueRestroom: 9, queueConcession: 21, accessElevator: "Elevator West-B", wheelchairSeats: 6 },
  "209": { id: "209", name: "Section 209 (West Upper)", tier: "Upper", capacity: 900, occupancy: 0.90, queueRestroom: 8, queueConcession: 19, accessElevator: "Elevator West-B", wheelchairSeats: 6 },
  "210": { id: "210", name: "Section 210 (North-West Upper)", tier: "Upper", capacity: 800, occupancy: 0.82, queueRestroom: 6, queueConcession: 15, accessElevator: "Elevator West-B", wheelchairSeats: 4 }
};

export const GATES = {
  "A": { id: "A", name: "Gate A (North)", waitTime: 12, flowRate: 150, status: "Normal", color: "#00f0ff" },
  "B": { id: "B", name: "Gate B (East)", waitTime: 28, flowRate: 98, status: "Congested", color: "#ff3b30" },
  "C": { id: "C", name: "Gate C (South)", waitTime: 8, flowRate: 180, status: "Normal", color: "#00f0ff" },
  "D": { id: "D", name: "Gate D (West)", waitTime: 18, flowRate: 120, status: "Slow", color: "#ffcc00" }
};

export const TRANSPORT_SERVICES = [
  { id: "metro-1", type: "Metro", name: "Line 1 (Express)", route: "Stadium Terminal <-> Downtown Fan Zone", waitTime: 4, capacity: "85%", status: "On Time", carbonSaved: 2.4 },
  { id: "metro-2", type: "Metro", name: "Line 4 (Local)", route: "Stadium Terminal <-> Airport Hub", waitTime: 8, capacity: "60%", status: "On Time", carbonSaved: 1.8 },
  { id: "bus-shuttle", type: "Shuttle Bus", name: "Park & Ride Shuttle", route: "Stadium Gate C <-> Lot Green & Red", waitTime: 15, capacity: "95%", status: "Delayed (Heavy Traffic)", carbonSaved: 1.1 },
  { id: "rideshare", type: "Ride Share", name: "Uber/Lyft Hub", route: "North Parking Lot Zone E", waitTime: 22, capacity: "N/A", status: "Surge Pricing", carbonSaved: 0.2 },
  { id: "green-bike", type: "Bike Path", name: "Aura Cycle Link", route: "Stadium Gate D <-> Metro-Bike Station", waitTime: 0, capacity: "Low Congestion", status: "Active", carbonSaved: 3.5 }
];

export const MOCK_INCIDENTS = [
  {
    id: "inc-101",
    title: "Liquid Spill in Concourse",
    location: "Section 104 Corridor",
    category: "Safety",
    urgency: "Medium",
    timestamp: "21:32",
    reportedBy: "Fan #3892",
    description: "Large soda spill near the popcorn stall. Risk of slip and fall.",
    status: "Pending",
    assignedTo: null,
    resolutionSteps: [
      "Deploy custodial staff with wet-floor sign and mop.",
      "Clear immediate foot traffic around the spill.",
      "Confirm completion once surface is dry."
    ]
  },
  {
    id: "inc-102",
    title: "Elevator East-B Power Fault",
    location: "Section 103 / 203 Elevator shaft",
    category: "Accessibility",
    urgency: "High",
    timestamp: "21:35",
    reportedBy: "Sensor EV-E3",
    description: "Elevator East-B reported motor temperature anomaly and automatic safety shut-down. 2 fans inside (both wheelchair users).",
    status: "In Progress",
    assignedTo: "Tech Team Lead (Marcus)",
    resolutionSteps: [
      "Dispatch mechanical emergency crew to Elevator East-B machine room.",
      "Notify elevator passengers via intercom of active rescue operation.",
      "Manually override brake to level elevator and release passengers.",
      "Redirect wheelchair traffic to Elevator East-C (30m South)."
    ]
  },
  {
    id: "inc-103",
    title: "Overcrowding Alert Gate B",
    location: "Gate B Security Lines",
    category: "Crowd Control",
    urgency: "High",
    timestamp: "21:38",
    reportedBy: "Gate B Flow Camera AI",
    description: "Security check lines at Gate B are backed up over 45 meters due to ticket scanner scan-failures on Group D tickets.",
    status: "Pending",
    assignedTo: null,
    resolutionSteps: [
      "Reroute incoming ticket holders from Gate B outer barriers to Gate A.",
      "Trigger audio announcement in English and Spanish redirecting fans.",
      "Deploy 4 ticket scanning backup staff with handheld scanners to manual gates."
    ]
  },
  {
    id: "inc-104",
    title: "Broken Seating Row 12 Seat 4",
    location: "Section 208 (West Upper)",
    category: "Maintenance",
    urgency: "Low",
    timestamp: "21:10",
    reportedBy: "Fan #1204 via QR Code",
    description: "Seat base is cracked and cannot support weight.",
    status: "Resolved",
    assignedTo: "Volunteer #88 (Carlos)",
    resolutionSteps: [
      "Locate fan and offer complimentary upgrade to adjacent VIP row.",
      "Flag seat as disabled in ticketing registry.",
      "Submit repair order for post-match maintenance."
    ]
  }
];

export const SUSTAINABILITY_BADGES = [
  { id: "eco-transit", name: "Green Commuter", description: "Use Metro or Bike paths to travel to the stadium.", points: 50, icon: "🚲" },
  { id: "eco-recycle", name: "Zero Waste Champion", description: "Deposit recyclables in designated AI Eco-Bins.", points: 30, icon: "♻️" },
  { id: "eco-ticket", name: "Digital Guardian", description: "Enter stadium with 100% paperless digital pass.", points: 10, icon: "📱" },
  { id: "eco-cup", name: "Refill Warrior", description: "Use reusable cup at water hydration points.", points: 20, icon: "🥤" }
];
