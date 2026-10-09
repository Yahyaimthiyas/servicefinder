export const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
]

export const TAMIL_NADU_DISTRICTS = [
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kanchipuram",
  "Kanyakumari",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Nilgiris",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivaganga",
  "Tenkasi",
  "Thanjavur",
  "Theni",
  "Thoothukudi",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tirupathur",
  "Tiruppur",
  "Tiruvallur",
  "Tiruvannamalai",
  "Tiruvarur",
  "Vellore",
  "Viluppuram",
  "Virudhunagar"
]

const STATE_DISTRICTS = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"],
  "Chhattisgarh": ["Raipur", "Bilaspur", "Durg", "Korba"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Karnal"],
  "Himachal Pradesh": ["Shimla", "Mandi", "Kangra", "Solan"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Hazaribagh"],
  "Karnataka": ["Bengaluru Urban", "Mysuru", "Mangaluru", "Hubballi-Dharwad"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
  "Manipur": ["Imphal East", "Imphal West", "Thoubal"],
  "Meghalaya": ["East Khasi Hills", "West Garo Hills", "Jaintia Hills"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"],
  "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  "Sikkim": ["East Sikkim", "West Sikkim", "North Sikkim", "South Sikkim"],
  "Tamil Nadu": TAMIL_NADU_DISTRICTS,
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  "Tripura": ["West Tripura", "South Tripura", "North Tripura"],
  "Uttar Pradesh": ["Lucknow", "Kanpur Nagar", "Varanasi", "Ghaziabad", "Agra"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Nainital", "Udham Singh Nagar"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "North 24 Parganas"],
  "Andaman and Nicobar Islands": ["South Andaman", "North and Middle Andaman", "Nicobar"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
  "Delhi": ["New Delhi", "Central Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Lakshadweep"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"]
}

export function getDistrictsForState(state) {
  if (!state) return []
  return STATE_DISTRICTS[state] || []
}

const TAMIL_NADU_DISTRICT_AREAS = {
  Chennai: ["T Nagar", "Anna Nagar", "Velachery", "Adyar", "Tambaram"],
  Coimbatore: ["Gandhipuram", "RS Puram", "Peelamedu", "Saibaba Colony", "Singanallur"],
  Madurai: ["Anna Nagar", "KK Nagar", "Thiruparankundram", "Simmakkal", "Thirunagar"],
  Salem: ["Ammapet", "Hasthampatty", "Fairlands", "Gugai", "Seelanaickenpatti"],
  "Tiruchirappalli": ["Thillai Nagar", "Srirangam", "Cantonment", "Woriur", "Edamalaipatti Pudur"],
  Erode: ["Perundurai Road", "Bhavani", "Sathyamangalam", "Gobichettipalayam", "Chithode"],
  Tiruppur: ["Kumar Nagar", "Kongu Nagar", "Mangalam", "Anupparpalayam", "Muthanampalayam"],
  Tirunelveli: ["Palayamkottai", "Tirunelveli Town", "Melapalayam", "Perumalpuram", "Thatchanallur"],
  Vellore: ["Gandhinagar", "Sathuvachari", "Katpadi", "Bagayam", "Walajapet"],
  "Kanchipuram": ["Kailasanathar", "Ennaikaran", "Orikkai", "Nathapettai", "Walajabad"],
  "Kanyakumari": ["Nagercoil", "Suchindram", "Marthandam", "Kottar", "Kuzhithurai"],
  "Tiruvallur": ["Tiruvallur Town", "Avadi", "Poonamallee", "Thirunindravur", "Red Hills"],
  "Tiruvannamalai": ["Tiruvannamalai Town", "Polur", "Arani", "Chengam", "Kalambur"],
  "Nagapattinam": ["Nagapattinam Town", "Velankanni", "Kilvelur", "Sirkazhi", "Thirukkuvalai"],
  "Thoothukudi": ["Thoothukudi Town", "Millerpuram", "South Cotton Road", "Muttayyapuram", "Ottapidaram"],
  "Thanjavur": ["Thanjavur Town", "Kumbakonam", "Papanasam", "Pattukkottai", "Orathanadu"],
  "Nilgiris": ["Ooty", "Coonoor", "Kotagiri", "Gudalur", "Kethi"],
  "Krishnagiri": ["Krishnagiri Town", "Hosur", "Denkanikottai", "Pennagaram", "Uthangarai"],
  "Dindigul": ["Dindigul Town", "Oddanchatram", "Palani", "Nilakottai", "Batlagundu"],
  "Karur": ["Karur Town", "Kulithalai", "Pugalur", "Aravakurichi", "Vengamedu"],
  "Namakkal": ["Namakkal Town", "Rasipuram", "Tiruchengode", "Paramathi", "Kolli Hills"],
  "Cuddalore": ["Cuddalore Port", "Thirupapuliyur", "Panruti", "Neyveli", "Kurinjipadi"],
  "Ariyalur": ["Ariyalur Town", "Jayankondam", "Sendurai", "Andimadam", "Kandiyankollai"],
  "Perambalur": ["Perambalur Town", "Arumbavur", "Veppanthattai", "Labbaikudikadu", "Elambalur"],
  "Pudukkottai": ["Pudukkottai Town", "Keeranur", "Aranthangi", "Alangudi", "Karambakudi"],
  "Ramanathapuram": ["Ramanathapuram Town", "Paramakudi", "Rameswaram", "Mudukulathur", "Kamuthi"],
  "Sivaganga": ["Sivaganga Town", "Karaikudi", "Devakottai", "Manamadurai", "Ilayangudi"],
  "Tenkasi": ["Tenkasi Town", "Courtallam", "Sengottai", "Alangulam", "Kadayanallur"],
  "Theni": ["Theni Town", "Cumbum", "Bodinayakanur", "Periyakulam", "Andipatti"],
  "Mayiladuthurai": ["Mayiladuthurai Town", "Sembanarkoil", "Kuthalam", "Tharangambadi", "Manalmedu"],
  "Kallakurichi": ["Kallakurichi Town", "Sankarapuram", "Ulundurpet", "Tirukkoyilur South", "Chinnasalem"],
  "Ranipet": ["Ranipet Town", "Walajah", "Arcot", "Sholinghur", "Mukundarayapuram"],
  "Viluppuram": ["Viluppuram Town", "Tindivanam", "Kallakurichi Road", "Gingee", "Valavanur"]
}

function getTamilNaduServiceAreas(district) {
  if (TAMIL_NADU_DISTRICT_AREAS[district]) {
    return TAMIL_NADU_DISTRICT_AREAS[district]
  }
  // Generic fallback: still provide at least 5 logical areas per district
  return [
    `${district} Central`,
    `${district} North`,
    `${district} South`,
    `${district} East`,
    `${district} West`,
  ]
}

export function getServiceAreasForDistrict(state, district) {
  if (!state || !district) return []
  if (state === "Tamil Nadu") {
    return getTamilNaduServiceAreas(district)
  }
  return []
}
