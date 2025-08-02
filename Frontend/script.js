document.addEventListener("DOMContentLoaded", async () => {
  createUI(); 
  await checkLoginStatus(); // Check login status on page load
  await fetchAndDisplayStores(); // Fetch stores after checking login status
});

// Global store list
let stores = [];


 //Creates UI elements
 
function createUI() {
  const body = document.body;

  // Header (for login/logout)
  const header = document.createElement("header");
  header.id = "header";
  header.className = "header";
  body.appendChild(header);

  // Title
  const title = document.createElement("h1");
  title.textContent = "Jönköping City Stores";
  body.appendChild(title);

  // Button Container
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";

  // Add Store Button (if user is logged in)
  if (window.user) {
    const addStoreBtn = document.createElement("button");
    addStoreBtn.textContent = "Add Store";
    addStoreBtn.className = "add-store-button";
    addStoreBtn.onclick = () => (window.location.href = "/add");
    buttonContainer.appendChild(addStoreBtn);
  }

  // Sort Buttons
  const sortButtons = document.createElement("div");
  sortButtons.className = "sort-buttons";

  // Sort  Name
  const sortByNameBtn = document.createElement("button");
  sortByNameBtn.textContent = "Sort by Name";
  sortByNameBtn.onclick = () => sortStores("name");
  sortButtons.appendChild(sortByNameBtn);

  // Sort District
  const sortByDistrictBtn = document.createElement("button");
  sortByDistrictBtn.textContent = "Sort by District";
  sortByDistrictBtn.onclick = () => sortStores("district");
  sortButtons.appendChild(sortByDistrictBtn);

  buttonContainer.appendChild(sortButtons);
  body.appendChild(buttonContainer);

  // Store List
  const storeList = document.createElement("ul");
  storeList.id = "store-list";
  body.appendChild(storeList);
}

//Fetches and displays the store list.
 
async function fetchAndDisplayStores() {
  const storeList = document.getElementById("store-list");
  storeList.innerHTML = "Loading stores...";

  try {
    const response = await fetch("http://localhost:3001/api/stores");
    if (!response.ok) throw new Error("Failed to fetch stores.");

    stores = await response.json();
    displayStores(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    storeList.innerHTML = "<li>Error loading stores.</li>";
  }
}

// Displays stores dynamically.

function displayStores(storeData) {
  const storeList = document.getElementById("store-list");
  storeList.innerHTML = "";

  if (storeData.length === 0) {
    storeList.innerHTML = "<li>No stores available.</li>";
    return;
  }

  storeData.forEach((store) => {
    const li = document.createElement("li");

    const storeName = document.createElement("strong");
    storeName.textContent = store.name;
    li.appendChild(storeName);
    li.appendChild(document.createElement("br"));

    if (store.url) {
      const link = document.createElement("a");
      link.href = store.url.startsWith("http") ? store.url : `https://${store.url}`;
      link.target = "_blank";
      link.textContent = "Visit Website";
      li.appendChild(link);
    } else {
      li.appendChild(document.createTextNode("No website available"));
    }
    li.appendChild(document.createElement("br"));

    const storeDistrict = document.createElement("span");
    storeDistrict.textContent = `Location: ${store.district || "No district info"}`;
    li.appendChild(storeDistrict);
    li.appendChild(document.createElement("br"));

    const phoneNumber = document.createElement("span");
    phoneNumber.textContent = `Phone: ${store.phone_number || "No phone number available"}`;
    li.appendChild(phoneNumber);
    li.appendChild(document.createElement("br"));

    const openingHours = document.createElement("span");
    openingHours.textContent = `Opening Hours: ${store.opening_hours || "No hours available"}`;
    li.appendChild(openingHours);
    li.appendChild(document.createElement("br"));

    const priceRange = document.createElement("span");
    priceRange.textContent = `Price Range: ${store.price_range || "No price info"}`;
    li.appendChild(priceRange);
    li.appendChild(document.createElement("br"));

    // Edit and Delete Buttons (only show if logged in)
    if (window.user) {
      // Edit Button
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.onclick = () => (window.location.href = `/edit/${store.id}`);
      li.appendChild(editButton);

      // Delete Button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.onclick = () => deleteStore(store.id);
      li.appendChild(deleteButton);
    }

    storeList.appendChild(li);
  });
}

//sort stores based on criteria.
// Criteria can be "name" or "district"

function sortStores(criteria) {
  stores.sort((a, b) => {
    // Handle district sorting
    if (criteria === "district") {
      // Check if a district is available
      const districtA = a.district || "";
      const districtB = b.district || "";

      // If one store has a district and the other doesn't, put the one with no district last
      if (!districtA && districtB) return 1; // b comes before a (b has a district)
      if (districtA && !districtB) return -1; // a comes before b (a has a district)

      // If both have districts or neither has, sort alphabetically
      return districtA.toLowerCase().localeCompare(districtB.toLowerCase());
    }

    // Default sorting for other criteria (like name)
    const aValue = a[criteria] || "";
    const bValue = b[criteria] || "";
    return aValue.toLowerCase().localeCompare(bValue.toLowerCase());
  });

  displayStores(stores);
}



 //Delete a store.
 
async function deleteStore(id) {
  if (!confirm("Are you sure you want to delete this store?")) return;

  try {
    const response = await fetch(`http://localhost:3001/api/stores/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete store.");

    alert("Store deleted successfully!");
    await fetchAndDisplayStores();
  } catch (error) {
    console.error("Error deleting store:", error);
  }
}


 //Checks the login status and updates the UI.

async function checkLoginStatus() {
  const header = document.getElementById("header");
  header.innerHTML = ""; // Clear previous content

  if (window.user) {
    // User is logged in
    const greeting = document.createElement("span");
    greeting.textContent = `Hello, ${window.user}! `;
    header.appendChild(greeting);

    const logoutButton = document.createElement("button");
    logoutButton.textContent = "Logout";
    logoutButton.onclick = () => (window.location.href = "/logout");
    header.appendChild(logoutButton);
  } else {
    // User is not logged in
    const loginButton = document.createElement("button");
    loginButton.textContent = "Login";
    loginButton.onclick = () => (window.location.href = "/login");
    header.appendChild(loginButton);
  }
}