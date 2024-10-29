// Updated product list
const productList = [
  { barcode: "40101", itemCode: "40101", name: "大鱼饼 FISH CAKE (L)", packingSize: "20's" },
  { barcode: "40102", itemCode: "40102", name: "中鱼饼 FISH CAKE (M)", packingSize: "30's" },
  { barcode: "40104", itemCode: "40104", name: "新大饼 FISH CAKE (L) - IMPROVED", packingSize: "20's" },
  { barcode: "40105", itemCode: "40105", name: "金条 GOLDBAR FRIED FISH CAKE", packingSize: "10's" },
  { barcode: "40108", itemCode: "40108", name: "切果片 SLICED FISH CAKE", packingSize: "1kg" },
  { barcode: "40110", itemCode: "40110", name: "圆饼 ROUND FISH CAKE", packingSize: "30's" },
  { barcode: "40113", itemCode: "40113", name: "鲍鱼饼 ABALONE FISH CAKE", packingSize: "30's" },
  { barcode: "40148", itemCode: "40148", name: "白鲍鱼饼 WHITE FISH CAKE - ABALONE", packingSize: "30's" },
  { barcode: "40114", itemCode: "40114", name: "扁大粿 FRIED LARGE FISH CAKE", packingSize: "20's" },
  { barcode: "40117", itemCode: "40117", name: "黑大饼 FISH CAKE (L) - BLACK", packingSize: "20's" },
  { barcode: "40120", itemCode: "40120", name: "大西刀 SAI DOU FISH CAKE (L)", packingSize: "10's" },
  { barcode: "40121", itemCode: "40121", name: "小西刀 SAI DOU FISH CAKE (S)", packingSize: "10's" },
  { barcode: "40123", itemCode: "40123", name: "手工菜饼 HANDMADE VEGETABLE FISHCAKE", packingSize: "10's" },
  { barcode: "40129", itemCode: "40129", name: "扁大粿 FRIED LARGE FISH CAKE", packingSize: "10's" },
  { barcode: "40130", itemCode: "40130", name: "炸鱼丸 FRIED FISH BALL", packingSize: "50's" },
  { barcode: "40133", itemCode: "40133", name: "西刀炸丸 SAI DOU FRIED FISH BALL", packingSize: "30's" },
  { barcode: "40140", itemCode: "40140", name: "真空白粿 WHITE FISH CAKE", packingSize: "5's" },
  { barcode: "40301", itemCode: "40301", name: "大鱼丸 COOKED FISH BALL (L)", packingSize: "1kg" },
  { barcode: "40305", itemCode: "40305", name: "大鱼丸 COOKED FISH BALL (L)", packingSize: "400g" },
  { barcode: "40311", itemCode: "40311", name: "中鱼丸 COOKED FISH BALL (M)", packingSize: "1kg" },
  { barcode: "40315", itemCode: "40315", name: "中熟鱼丸 COOKED FISH BALL (M)", packingSize: "400g" },
  { barcode: "40320", itemCode: "40320", name: "小鱼丸 COOKED FISH BALL (S)", packingSize: "1kg" },
  { barcode: "40332", itemCode: "40332", name: "熟鱼丸 COOKED FISH BALL", packingSize: "200g" },
  { barcode: "40333", itemCode: "40333", name: "熟鱼丸 FISH BALL", packingSize: "50's" },
  { barcode: "40700", itemCode: "40700", name: "(VP)中鱼饼 FRIED FISH CAKE (M)", packingSize: "30's" },
  { barcode: "40706", itemCode: "40706", name: "(VP)金条 GOLDBAR FRIED FISH CAKE", packingSize: "10's" },
  { barcode: "40707", itemCode: "40707", name: "(VP)炸鱼丸 FRIED FISH BALL", packingSize: "50's" },
  { barcode: "40139", itemCode: "40139", name: "特大饼 FISH CAKE (XL) - IMPROVED", packingSize: "20's" },
  { barcode: "40366", itemCode: "40366", name: "潮洲鱼丸 FISH BALL (TEOCHEW)", packingSize: "25's" },
  { barcode: "40132", itemCode: "40132", name: "炸鱼丸 FRIED FISH BALL", packingSize: "25's" },
  { barcode: "40334", itemCode: "40334", name: "OCK 炸鱼丸 OCK FRIED FISH BALL", packingSize: "50's" },
  { barcode: "40135", itemCode: "40135", name: "顶级炸丸 PREMIUM FRIED FISH BALL", packingSize: "10's" }
];

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
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
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

function preventWebRefresh() {
    let startY = 0;
    
    document.addEventListener('touchstart', function(e) {
        startY = e.touches[0].pageY;
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
        const y = e.touches[0].pageY;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        
        if (scrollTop === 0 && y > startY) {
            e.preventDefault();
        }
    }, { passive: false });
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

function refreshApp() {
  const barcodeInput = document.getElementById('barcodeInput');
  barcodeInput.value = '';
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach(input => {
    input.value = '';
  });
  document.getElementById('stockCheckBy').value = '';
  console.log('App refreshed');
  barcodeInput.focus();
}

function submitQuantities(sheetName) {
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
      const product = productList.find(p => p.barcode === barcode);
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

function initScanner() {
  const barcodeInput = document.getElementById('barcodeInput');
  const stockCheckBy = document.getElementById('stockCheckBy');
  const productTable = document.getElementById('productTable');

  const tbody = productTable.getElementsByTagName('tbody')[0];
  productList.forEach(product => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.packingSize}</td>
      <td><input type="number" min="0" data-barcode="${product.barcode}"></td>
    `;
  });

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
    const product = productList.find(p => p.barcode === barcode);
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

  barcodeInput.addEventListener('input', function() {
    const barcode = this.value.trim();
    if (barcode) {
      handleBarcodeScan(barcode);
    }
  });

  stockCheckBy.addEventListener('focus', function() {
    barcodeInput.blur();
  });

  stockCheckBy.addEventListener('blur', function() {
    setTimeout(() => barcodeInput.focus(), 100);
  });

  productTable.addEventListener('click', function(event) {
    if (event.target.tagName !== 'INPUT') {
      barcodeInput.focus();
    }
  });

  barcodeInput.focus();
}

// Initialize the application
window.addEventListener('load', () => {
    initScanner();
    updateDateTimeDisplay();
    preventWebRefresh();
});

// Set up interval for updating date/time
setInterval(updateDateTimeDisplay, 1000);

// Service Worker registration
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
