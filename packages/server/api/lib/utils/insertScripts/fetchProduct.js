require('dotenv').config();

// ============================
// CONFIGURATION
// ============================
const CLIENT_ID = process.env.AMAZON_CREDENTIAL_ID;
const CLIENT_SECRET = process.env.AMAZON_CREDENTIAL_SECRET;
const CREDENTIAL_VERSION = '2.1'; // change based on your region (2.1, 2.2, 2.3)
const MARKETPLACE = 'www.amazon.com'; // change if using other locales
const ASINS = ['B09B2SBHQK', 'B09B8V1LZ3']; // your ASINs
const PARTNER_TAG = process.env.AMAZON_PARTNER_TAG;

// ============================
// STEP 1: Get Access Token
// ============================
async function getAccessToken() {
  const tokenUrl =
    'https://creatorsapi.auth.us-west-2.amazoncognito.com/oauth2/token';
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'creatorsapi/default',
  });

  const authHeader =
    'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: authHeader,
    },
    body,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Failed to fetch token: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

// ============================
// STEP 2: Get Item Info
// ============================
async function getItems(accessToken) {
  const url = 'https://creatorsapi.amazon/catalog/v1/getItems';

  const payload = {
    itemIds: ASINS,
    itemIdType: 'ASIN',
    marketplace: MARKETPLACE,
    partnerTag: PARTNER_TAG,
    resources: [
      'images.primary.small',
      'itemInfo.title',
      'itemInfo.features',
      'parentASIN',
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}, Version ${CREDENTIAL_VERSION}`,
      'x-marketplace': MARKETPLACE,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Failed to fetch items: ${JSON.stringify(data)}`);
  }

  return data.itemsResult.items;
}

// ============================
// MAIN FUNCTION
// ============================
async function main() {
  try {
    const token = await getAccessToken();
    console.log('Access token received:', token);

    const items = await getItems(token);
    console.log('Items info:', JSON.stringify(items, null, 2));
  } catch (error) {
    console.error(error);
  }
}

main();
