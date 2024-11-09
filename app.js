// Updated product list
const productList = [
  { barcode: "20303", itemCode: "20303", name: "酿豆腐  YONG TAU FOO", packingSize: "10's" },
  { barcode: "40131", itemCode: "40131", name: "炸鱼丸  FRIED FISH BALL", packingSize: "10's" },
  { barcode: "40141", itemCode: "40141", name: "白粿  WHITE FISH CAKE", packingSize: "5's" },
  { barcode: "40201", itemCode: "40201", name: "大饼 FISH CAKE (L)", packingSize: "3's" },
  { barcode: "40202", itemCode: "40202", name: "炸圆饼 ROUND FISH CAKE", packingSize: "5's" },
  { barcode: "40203", itemCode: "40203", name: "炸圆菜饼 ROUND VEGETABLE FISH CAKE", packingSize: "5's" },
  { barcode: "40204", itemCode: "40204", name: "扁大粿 FRIED LARGE FISH CAKE", packingSize: "3's" },
  { barcode: "40205", itemCode: "40205", name: "正西刀小粿 SAI DOU PILLOW FISH CAKE (S)", packingSize: "4's" },
  { barcode: "40206", itemCode: "40206", name: "小西刀 SAI DOU FISH CAKE (S)", packingSize: "5's" },
  { barcode: "40313", itemCode: "40313", name: "中鱼丸 COOKED FISH BALL (M)", packingSize: "20's" },
  { barcode: "85001", itemCode: "85001", name: "PC 熟鱼丸 PC COOKED FISHBALL (M)", packingSize: "20's" },
  { barcode: "85003", itemCode: "85003", name: "PC 炸鱼丸 PC FRIED FISH BALL", packingSize: "10's" },
  { barcode: "85004", itemCode: "85004", name: "PC 扁大粿 PC FRIED FISH CAKE (L", packingSize: "3's" },
  { barcode: "85006", itemCode: "85006", name: "PC 圆菜饼 PC VEGETABLE FISH CAKE", packingSize: "5's" },
  { barcode: "85005", itemCode: "85005", name: "PC 小西刀 PC SAITO FISH CAKE (S", packingSize: "5's" },
  { barcode: "85007", itemCode: "85007", name: "PC 白粿 PC WHITE FISH CAKE", packingSize: "5's" },
  { barcode: "85010", itemCode: "85010", name: "PC 螃蟹丸 PC FLAVOURED CRAB BALL", packingSize: "10's" },
  { barcode: "85011", itemCode: "85011", name: "PC 蟹味柳 PC KANIMI CHUNK", packingSize: "8's" },
  { barcode: "85012", itemCode: "85012", name: "PC 皇帝蟹丸 PC FLAVOURED KING CRAB BALL", packingSize: "8's" },
  { barcode: "40541", itemCode: "40541", name: "海鲜粒 SEAFOOD BALL", packingSize: "8's" },
  { barcode: "26021", itemCode: "26021", name: "螃蟹丸 FLAVOURED CRAB BALL", packingSize: "10's" },
  { barcode: "85002", itemCode: "85002", name: "PC 香菇丸 PC MUSHROOM BALL", packingSize: "10's" },
  { barcode: "25030", itemCode: "25030", name: "海鲜条 SEAFOOD STICK", packingSize: "10's" }
];

function initializeProducts() {
    // Store the master product list in localStorage when online
    if (navigator.onLine) {
        localStorage.setItem('masterProductList', JSON.stringify(productList));
    }
    
    // Always use the stored product list if available
    const storedProducts = localStorage.getItem('masterProductList');
    if (storedProducts) {
        return JSON.parse(storedProducts);
    }
    return productList; // Fallback to default list
}

function initScanner() {
  const barcodeInput = document.getElementById('barcodeInput');
  const stockCheckBy = document.getElementById('stockCheckBy');
  const productTable = document.getElementById('productTable');
  
  const currentProducts = initializeProducts(); // You have this line correct

  // Change this part - use currentProducts instead of productList
  const tbody = productTable.getElementsByTagName('tbody')[0];
  currentProducts.forEach(product => {  // Changed from productList to currentProducts
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.packingSize}</td>
      <td><input type="number" min="0" data-barcode="${product.barcode}"></td>
    `;
  });

  // Add focus event listeners to all quantity inputs
  const quantityInputs = document.querySelectorAll('input[type="number"]');
  quantityInputs.forEach(input => {
    input.addEventListener('focus', function() {
      setTimeout(() => {
        barcodeInput.focus();
        console.log('Auto-returned focus to barcode input');
      }, 5000);
    });
  });

  function handleBarcodeScan(barcode) {
    console.log('Scanned barcode:', barcode);
    const product = currentProducts.find(p => p.barcode === barcode); // Changed from productList to currentProducts
    if (product) {
      console.log('Found product:', product);
      const quantityInput = document.querySelector(`input[data-barcode="${barcode}"]`);
      if (quantityInput) {
        quantityInput.focus();
        quantityInput.select();
        console.log('Focused on quantity input');
      }
    } else {
      showToast('Product not found');
      barcodeInput.focus();
    }
    barcodeInput.value = '';
  }
  
  // Listen for the 'input' event on the barcode input field
  barcodeInput.addEventListener('input', function() {
    const barcode = this.value.trim();
    if (barcode) {
      handleBarcodeScan(barcode);
    }
  });

  // Prevent the dropdown from interfering with scanning
  stockCheckBy.addEventListener('focus', function() {
    barcodeInput.blur(); // Remove focus from barcode input when dropdown is focused
  });

  stockCheckBy.addEventListener('blur', function() {
    // Small delay to allow for dropdown selection before refocusing
    setTimeout(() => barcodeInput.focus(), 100);
  });

  // Add click event listener to the table to refocus on barcode input
  productTable.addEventListener('click', function(event) {
    if (event.target.tagName !== 'INPUT') {
      barcodeInput.focus();
    }
  });

  // Ensure barcode input is focused when the page loads
  barcodeInput.focus();
}

function submitQuantities(sheetName) {
  const currentProducts = initializeProducts(); // Add this line
  const quantities = [];
  const inputs = document.querySelectorAll('input[type="number"]');
  const currentDate = formatDate(new Date());
  const currentTime = formatTime(new Date());
  const stockCheckBy = document.getElementById('stockCheckBy').value;
  
  if (!stockCheckBy) {
    showToast('Please select who is performing the stock check');
    return;
  }
  
  inputs.forEach(input => {
    const barcode = input.getAttribute('data-barcode');
    const quantity = input.value.trim();
    if (quantity !== '') {
      const product = currentProducts.find(p => p.barcode === barcode); // Change this line from productList to currentProducts
      if (product) {
        quantities.push({
          Date: currentDate,
          Time: currentTime,
          ItemCode: product.itemCode,
          Product: product.name,
          PackingSize: product.packingSize,
          Quantity: parseInt(quantity, 10),
          StockCheckBy: stockCheckBy
        });
      }
    }
  });
  
  if (quantities.length > 0) {
    showLoadingOverlay();
    sendToGoogleScript(quantities, sheetName);
  } else {
    showToast('No quantities entered');
  }
}

function refreshApp() {
  const barcodeInput = document.getElementById('barcodeInput');
  barcodeInput.value = '';
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach(input => {
    input.value = '';
  });
  document.getElementById('stockCheckBy').value = ''; // Reset the dropdown
  console.log('App refreshed');
  barcodeInput.focus(); // Refocus on the barcode input after refresh
}

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${minutes} ${ampm}`;
}

function updateDateTimeDisplay() {
  const dateDisplay = document.getElementById('currentDate');
  const timeDisplay = document.getElementById('currentTime');
  const now = new Date();
  
  if (dateDisplay) {
    dateDisplay.textContent = formatDate(now);
  }
  
  if (timeDisplay) {
    timeDisplay.textContent = formatTime(now);
  }
}

function showLoadingOverlay() {
  document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoadingOverlay() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  toast.textContent = message;
  toast.className = 'show';
  setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
}

function sendToGoogleScript(data, sheetName) {
  const url = 'https://script.google.com/macros/s/AKfycbxtkp0U6W1YL9ixCfFERGAkgVNnhatwhGoBkLSWBfg0BhtvFlru6tz2Lc8IpZTIQHLPzA/exec';
  
  const payload = {
    data: data,
    sheetName: sheetName
  };

  fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })
  .then(() => {
    hideLoadingOverlay();
    showToast('成功保存 Data submitted successfully!');
    refreshApp();
  })
  .catch(error => {
    console.error('Error:', error);
    hideLoadingOverlay();
    showToast('保存失误 Error submitting data. Please try again.');
  });
}

// Update the date and time every second
setInterval(updateDateTimeDisplay, 1000);

window.addEventListener('load', () => {
    initScanner();
    updateDateTimeDisplay();
    preventWebRefresh();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/CR3T-Stock-Take/service-worker.js').then(reg => {
    reg.update();
  });
}

function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg) reg.update();
    });
  }
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    checkForUpdates();
  }
});

window.addEventListener('online', () => {
    localStorage.setItem('masterProductList', JSON.stringify(productList));
});

function preventWebRefresh() {
    let startY = 0;
    
    document.addEventListener('touchstart', function(e) {
        startY = e.touches[0].pageY;
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
        const y = e.touches[0].pageY;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        
        // Only prevent default when we're at the top of the page and trying to scroll up
        if (scrollTop === 0 && y > startY) {
            e.preventDefault();
        }
    }, { passive: false });
}
