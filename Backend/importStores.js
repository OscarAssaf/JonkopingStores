const fs = require('fs');
const client = require('./db'); 

// Helper function to generate random opening hours
function getRandomOpeningHours() {
  const openingTime = Math.floor(Math.random() * 3) + 8; // Random opening time between 8 AM and 10 AM
  const closingTime = openingTime + 8 + Math.floor(Math.random() * 3); // Random closing time between 8-10 hours later
  return `${openingTime}:00 AM - ${closingTime}:00 PM`;
}

// Helper function to generate a random phone number
function getRandomPhoneNumber() {
  return `+46 ${Math.floor(Math.random() * 90000000) + 10000000}`;
}

// Helper function to generate a random price range
function getRandomPriceRange() {
  const priceRanges = ['$', '$$', '$$$'];
  return priceRanges[Math.floor(Math.random() * priceRanges.length)];
}

async function insertStores() {
  try {
    console.log("Clearing existing stores...");
    await client.query("TRUNCATE TABLE stores RESTART IDENTITY CASCADE;"); // Clears data & resets IDs

    const data = JSON.parse(fs.readFileSync('stores.json', 'utf8'));

    for (let store of data) {
      // Ensure empty URLs become NULL
      store.url = store.url && store.url.trim() !== '' ? store.url : null;

      // Generate generic data for new fields
      const phoneNumber = getRandomPhoneNumber();
      const openingHours = getRandomOpeningHours();
      const priceRange = getRandomPriceRange();

      const query = `
        INSERT INTO stores (
          name, url, district, phone_number, opening_hours, price_range
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const values = [
        store.name,
        store.url,
        store.district || null,
        phoneNumber,
        openingHours,
        priceRange,
      ];

      try {
        const res = await client.query(query, values);
        console.log('Inserted:', res.rows[0]);
      } catch (err) {
        console.error('Error inserting store:', store.name, err.message);
      }
    }

    console.log('All stores inserted successfully!');
  } catch (err) {
    console.error('Error inserting stores:', err.stack);
  } finally {
    client.end();
  }
}

insertStores();
