import * as fs from 'fs';
import * as path from 'path';

/**
 * Helper script to update .env.local with deployed contract addresses
 * Usage: npx ts-node scripts/update-env.ts <network>
 * Example: npx ts-node scripts/update-env.ts localhost
 */

const network = process.argv[2] || 'localhost';
const deploymentsFile = path.join(__dirname, `../deployments/${network}.json`);

if (!fs.existsSync(deploymentsFile)) {
  console.error(`Deployment file not found: ${deploymentsFile}`);
  console.error('Please deploy contracts first using: npm run deploy:local');
  process.exit(1);
}

const deployment = JSON.parse(fs.readFileSync(deploymentsFile, 'utf-8'));
const contracts = deployment.contracts;

const envLocalPath = path.join(__dirname, '../.env.local');
let envContent = '';

// Read existing .env.local if it exists
if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf-8');
}

// Update or add contract addresses
const updates = [
  { key: 'VITE_IP_ASSET_REGISTRY_ADDRESS', value: contracts.IPAssetRegistry },
  { key: 'VITE_IP_FRACTIONALIZER_ADDRESS', value: contracts.IPFractionalizer },
  { key: 'VITE_ROYALTY_DISTRIBUTOR_ADDRESS', value: contracts.RoyaltyDistributor },
  { key: 'VITE_IP_MARKETPLACE_ADDRESS', value: contracts.IPMarketplace },
  { key: 'VITE_IP_GOVERNANCE_ADDRESS', value: contracts.IPGovernance },
];

updates.forEach(({ key, value }) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    envContent += `\n${key}=${value}`;
  }
});

fs.writeFileSync(envLocalPath, envContent.trim() + '\n');

console.log(`✅ Updated .env.local with contract addresses from ${network} deployment`);
console.log('\nContract addresses:');
updates.forEach(({ key, value }) => {
  console.log(`  ${key}=${value}`);
});

