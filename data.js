// Reconstructed / illustrative dataset.
// Per-vessel numbers are NOT Reuters' underlying data — they are built to sum to
// the totals reported in coverage of the investigation:
//   33 transfers, 11 vessels, ~5,000,000 barrels total, hub vessel = "Dune".
// Use this only for the purposes of this design/critique exercise.

const HUB_NAME = "DUNE";

const VESSELS = [
  { name: "Argo",           transfers: 5, barrels: 850000 },
  { name: "Harmony",        transfers: 4, barrels: 620000 },
  { name: "Global Beauty",  transfers: 4, barrels: 590000 },
  { name: "PK Phoenix",     transfers: 3, barrels: 480000 },
  { name: "Cathay Phoenix", transfers: 3, barrels: 460000 },
  { name: "Silver Wave",    transfers: 3, barrels: 410000 },
  { name: "Golden Horizon", transfers: 3, barrels: 400000 },
  { name: "Marine Legacy",  transfers: 3, barrels: 380000 },
  { name: "Ocean Splendor", transfers: 2, barrels: 300000 },
  { name: "Star Voyager",   transfers: 2, barrels: 280000 },
  { name: "Eastern Glory",  transfers: 1, barrels: 230000 }
];

// sanity totals (for console reference only)
const TOTAL_TRANSFERS = VESSELS.reduce((s, v) => s + v.transfers, 0); // 33
const TOTAL_BARRELS = VESSELS.reduce((s, v) => s + v.barrels, 0);     // 5,000,000
