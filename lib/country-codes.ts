// GA4 returns full country names (English). Map to ISO 3166-1 alpha-2 codes.
export const COUNTRY_CODES: Record<string, string> = {
  "Afghanistan": "AF", "Albania": "AL", "Algeria": "DZ", "Argentina": "AR",
  "Australia": "AU", "Austria": "AT", "Azerbaijan": "AZ", "Bangladesh": "BD",
  "Belarus": "BY", "Belgium": "BE", "Bolivia": "BO", "Brazil": "BR",
  "Bulgaria": "BG", "Cambodia": "KH", "Canada": "CA", "Chile": "CL",
  "China": "CN", "Colombia": "CO", "Cook Islands": "CK", "Costa Rica": "CR",
  "Croatia": "HR", "Czech Republic": "CZ", "Denmark": "DK",
  "Dominican Republic": "DO", "Ecuador": "EC", "Egypt": "EG",
  "El Salvador": "SV", "Ethiopia": "ET", "Finland": "FI", "France": "FR",
  "Germany": "DE", "Ghana": "GH", "Greece": "GR", "Guatemala": "GT",
  "Honduras": "HN", "Hong Kong": "HK", "Hungary": "HU", "India": "IN",
  "Indonesia": "ID", "Iran": "IR", "Iraq": "IQ", "Ireland": "IE",
  "Israel": "IL", "Italy": "IT", "Japan": "JP", "Jordan": "JO",
  "Kazakhstan": "KZ", "Kenya": "KE", "Kuwait": "KW", "Lebanon": "LB",
  "Libya": "LY", "Malaysia": "MY", "Mexico": "MX", "Morocco": "MA",
  "Myanmar": "MM", "Nepal": "NP", "Netherlands": "NL", "New Zealand": "NZ",
  "Nicaragua": "NI", "Nigeria": "NG", "Norway": "NO", "Pakistan": "PK",
  "Panama": "PA", "Paraguay": "PY", "Peru": "PE", "Philippines": "PH",
  "Poland": "PL", "Portugal": "PT", "Romania": "RO", "Russia": "RU",
  "Saudi Arabia": "SA", "Senegal": "SN", "Serbia": "RS", "Singapore": "SG",
  "Slovakia": "SK", "South Africa": "ZA", "South Korea": "KR", "Spain": "ES",
  "Sri Lanka": "LK", "Sweden": "SE", "Switzerland": "CH", "Taiwan": "TW",
  "Thailand": "TH", "Turkey": "TR", "Ukraine": "UA",
  "United Arab Emirates": "AE", "United Kingdom": "GB", "United States": "US",
  "Uruguay": "UY", "Uzbekistan": "UZ", "Venezuela": "VE", "Vietnam": "VN",
  "(not set)": "XX",
}

/**
 * ISO 3166-1 alpha-3 → alpha-2.
 * Used with holtzy/D3-graph-gallery world.geojson which has alpha-3 as feature id.
 */
export const ISO_A3_TO_A2: Record<string, string> = {
  AFG:"AF", ALB:"AL", DZA:"DZ", AND:"AD", AGO:"AO", ARG:"AR", ARM:"AM",
  AUS:"AU", AUT:"AT", AZE:"AZ", BHS:"BS", BHR:"BH", BGD:"BD", BLR:"BY",
  BEL:"BE", BLZ:"BZ", BEN:"BJ", BTN:"BT", BOL:"BO", BIH:"BA", BWA:"BW",
  BRA:"BR", BRN:"BN", BGR:"BG", BFA:"BF", BDI:"BI", CPV:"CV", KHM:"KH",
  CMR:"CM", CAN:"CA", CAF:"CF", TCD:"TD", CHL:"CL", CHN:"CN", COL:"CO",
  COM:"KM", COD:"CD", COG:"CG", CRI:"CR", CIV:"CI", HRV:"HR", CUB:"CU",
  CYP:"CY", CZE:"CZ", DNK:"DK", DJI:"DJ", DOM:"DO", ECU:"EC", EGY:"EG",
  SLV:"SV", GNQ:"GQ", ERI:"ER", EST:"EE", SWZ:"SZ", ETH:"ET", FJI:"FJ",
  FIN:"FI", FRA:"FR", GAB:"GA", GMB:"GM", GEO:"GE", DEU:"DE", GHA:"GH",
  GRC:"GR", GTM:"GT", GIN:"GN", GNB:"GW", GUY:"GY", HTI:"HT", HND:"HN",
  HUN:"HU", ISL:"IS", IND:"IN", IDN:"ID", IRN:"IR", IRQ:"IQ", IRL:"IE",
  ISR:"IL", ITA:"IT", JAM:"JM", JPN:"JP", JOR:"JO", KAZ:"KZ", KEN:"KE",
  PRK:"KP", KOR:"KR", KWT:"KW", KGZ:"KG", LAO:"LA", LVA:"LV", LBN:"LB",
  LSO:"LS", LBR:"LR", LBY:"LY", LIE:"LI", LTU:"LT", LUX:"LU", MDG:"MG",
  MWI:"MW", MYS:"MY", MDV:"MV", MLI:"ML", MLT:"MT", MRT:"MR", MUS:"MU",
  MEX:"MX", MDA:"MD", MNG:"MN", MNE:"ME", MAR:"MA", MOZ:"MZ", MMR:"MM",
  NAM:"NA", NPL:"NP", NLD:"NL", NZL:"NZ", NIC:"NI", NER:"NE", NGA:"NG",
  MKD:"MK", NOR:"NO", OMN:"OM", PAK:"PK", PAN:"PA", PNG:"PG", PRY:"PY",
  PER:"PE", PHL:"PH", POL:"PL", PRT:"PT", QAT:"QA", ROU:"RO", RUS:"RU",
  RWA:"RW", SAU:"SA", SEN:"SN", SRB:"RS", SLE:"SL", SGP:"SG", SVK:"SK",
  SVN:"SI", SOM:"SO", ZAF:"ZA", SSD:"SS", ESP:"ES", LKA:"LK", SDN:"SD",
  SUR:"SR", SWE:"SE", CHE:"CH", SYR:"SY", TWN:"TW", TJK:"TJ", TZA:"TZ",
  THA:"TH", TLS:"TL", TGO:"TG", TTO:"TT", TUN:"TN", TUR:"TR", TKM:"TM",
  UGA:"UG", UKR:"UA", ARE:"AE", GBR:"GB", USA:"US", URY:"UY", UZB:"UZ",
  VEN:"VE", VNM:"VN", YEM:"YE", ZMB:"ZM", ZWE:"ZW", HKG:"HK", PSE:"PS",
  COK:"CK", BRB:"BB", CUW:"CW", PRI:"PR", ABW:"AW", MAC:"MO",
  // Variants / disputed
  "-99":"-99", "N. Cyprus":"CY", "Kosovo":"XK",
}

/** Convert ISO 2-letter code to flag emoji */
export function flagEmoji(code: string): string {
  if (!code || code.length !== 2) return "🏳"
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join("")
}

/** Get ISO alpha-2 code from GA4 country name */
export function countryCode(name: string): string {
  return COUNTRY_CODES[name] ?? name.slice(0, 2).toUpperCase()
}
