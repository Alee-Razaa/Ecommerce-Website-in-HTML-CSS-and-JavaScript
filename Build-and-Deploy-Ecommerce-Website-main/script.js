// Script for navigation bar
const bar = document.getElementById("bar");
const nav = document.getElementById("navbar");
const close = document.getElementById("close");

if (bar) {
  bar.addEventListener("click", () => {
    nav.classList.add("active");
  });
}

if (close) {
  close.addEventListener("click", () => {
    nav.classList.remove("active");
  });
}

// script.js
function toggleButtonState() {
  const input = document.getElementById("search-input");
  const button = document.getElementById("submit-btn");

  if (input.value.trim() !== "") {
    button.removeAttribute("disabled");
    button.classList.add("enabled");
  } else {
    button.setAttribute("disabled", "true");
    button.classList.remove("enabled");
  }
}

// Cart feature

// Function to add a product to the cart table
function addToCart(product) {
  const cartTableBody = document.querySelector("#cart table tbody");

  // Store product in localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));

  // Dynamically update the cart table if on the cart page
  if (cartTableBody) {
    // Create a new row
    const newRow = document.createElement("tr");

    // Construct the row's inner HTML with the product data
    newRow.innerHTML = `
      <td>
        <a href="#" class="remove"><i class="far fa-times-circle"></i></a>
      </td>
      <td><img src="${product.image}" alt="Product Image" /></td>
      <td>${product.name}</td>
      <td>$${product.price.toFixed(2)}</td>
      <td><input type="number" value="1" min="1" /></td>
      <td>$${product.price.toFixed(2)}</td>
    `;

    // Append the new row to the table body
    cartTableBody.appendChild(newRow);

    // Add event listener to remove button
    newRow.querySelector(".remove").addEventListener("click", (e) => {
      e.preventDefault();
      removeFromCart(product.name); // Update localStorage
      newRow.remove(); // Remove the row
    });
  }

  // Update cart indicator after adding a product
  updateCartIndicator();
}

// Function to remove a product from localStorage
function removeFromCart(productName) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((item) => item.name !== productName);
  localStorage.setItem("cart", JSON.stringify(cart));
  console.log("Product removed from cart:", productName);

  // Update the cart indicator
  // updateCartIndicator();
}

// Example: Add product details dynamically
document.querySelectorAll(".pro a .cart").forEach((cartIcon) => {
  cartIcon.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent navigation to the product page

    const proElement = cartIcon.closest(".pro");
    const product = {
      name: proElement.querySelector("h5").textContent.trim(),
      price: parseFloat(
        proElement.querySelector("h4").textContent.trim().replace("$", "")
      ),
      image: proElement.querySelector("img").getAttribute("src"),
    };

    addToCart(product); // Add the product to the cart
  });
});

// Function to load the cart from localStorage
function loadCart() {
  const cartTableBody = document.querySelector("#cart table tbody");
  if (cartTableBody) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.forEach((product) => {
      const newRow = document.createElement("tr");

      newRow.innerHTML = `
        <td>
          <a href="#" class="remove"><i class="far fa-times-circle"></i></a>
        </td>
        <td><img src="${product.image}" alt="Product Image" /></td>
        <td>${product.name}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td><input type="number" value="1" min="1" /></td>
        <td>$${product.price.toFixed(2)}</td>
      `;

      cartTableBody.appendChild(newRow);

      // Add event listener to remove button
      newRow.querySelector(".remove").addEventListener("click", (e) => {
        e.preventDefault();
        removeFromCart(product.name);
        newRow.remove(); // Remove the row
      });
    });
  }
}

// Sproduct

// Load the cart when the cart page loads
document.addEventListener("DOMContentLoaded", loadCart);

function redirectToProductDetails(productElement) {
  // Navigate up to the parent element that contains product details
  const productContainer = productElement.closest(".pro");

  // Extract product details
  const img = productElement.src; // Directly get the src from the image
  const brand = productContainer.querySelector(".pro-desc span").innerText;
  const title = productContainer.querySelector(".pro-desc h5").innerText;
  const price = productContainer.querySelector(".pro-desc h4").innerText;

  // Store details in localStorage
  localStorage.setItem(
    "selectedProduct",
    JSON.stringify({ img, brand, title, price })
  );

  // Redirect to product details page
  window.location.href = "sproduct.html";
}

document.addEventListener("DOMContentLoaded", () => {
  // Retrieve product details from localStorage
  const productDetails = JSON.parse(localStorage.getItem("selectedProduct"));

  if (productDetails) {
    // Update content on the page
    document.getElementById("main-img").src = productDetails.img;
    document.querySelector(
      ".single-pro-details h6"
    ).innerText = `Shop/ ${productDetails.brand}`;
    document.querySelector(".single-pro-details h4").innerText =
      productDetails.title;
    document.querySelector(".single-pro-details h2").innerText =
      productDetails.price;
  }
});

// Indicator

function updateCartIndicator() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartIndicator = document.getElementById("cart-indicator");

  if (cart.length > 0) {
    cartIndicator.style.display = "block"; // Show the red dot
  } else {
    cartIndicator.style.display = "none"; // Hide the red dot
  }
}

// Ensure the cart indicator updates on page load
document.addEventListener("DOMContentLoaded", updateCartIndicator);
