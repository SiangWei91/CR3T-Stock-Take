// ============================================================================
// CR3T Stock Take PWA (Coldroom 3 Tray)
// Product list comes from Supabase (list_key='cr3t-stock-take').
// Staff list is shared with CR3 (list_key='cr3-stock-take') — same warehouse team.
// Lists cached in localStorage; re-fetched only when user clicks the title (and no quantities are entered).
// ============================================================================

const SUPABASE_URL = 'https://jbpvqlvlokvqpkulisxi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpicHZxbHZsb2t2cXBrdWxpc3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTE3NzYsImV4cCI6MjA3NTYyNzc3Nn0.cwCoHFCy3K_HdTIIk_jJUCgMXIdub2HbnxqTETBKans';
const PRODUCT_LIST_KEY = 'cr3t-stock-take';
const STAFF_LIST_KEY = 'cr3-stock-take';
const STORAGE_PRODUCTS = 'masterProductList_cr3t';
const STORAGE_STAFF = 'masterStaffList_cr3t';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchProductsFromDB() {
  const { data, error } = await supabaseClient
    .from('app_product_list_items')
    .select('barcode, item_code, name, packing_size')
    .eq('list_key', PRODUCT_LIST_KEY)
    .order('sort_order');
  if (error) throw error;
  return data.map(r => ({
    barcode: r.barcode,
    itemCode: r.item_code,
    name: r.name,
    packingSize: r.packing_size || ''
  }));
}

async function fetchStaffFromDB() {
  const { data, error } = await supabaseClient
    .from('app_staff_lists')
    .select('name')
    .eq('list_key', STAFF_LIST_KEY)
    .order('sort_order');
  if (error) throw error;
  return data.map(r => r.name);
}

async function ensureDataLoaded() {
  const cachedProducts = localStorage.getItem(STORAGE_PRODUCTS);
  const cachedStaff = localStorage.getItem(STORAGE_STAFF);
  if (cachedProducts && cachedStaff) return;

  if (!navigator.onLine) {
    showToast('需要联网下载列表 Need internet to download list');
    return;
  }

  try {
    const [products, staff] = await Promise.all([fetchProductsFromDB(), fetchStaffFromDB()]);
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
    localStorage.setItem(STORAGE_STAFF, JSON.stringify(staff));
  } catch (e) {
    console.error('Failed to load lists from DB:', e);
    showToast('下载失败 Failed to download lists');
  }
}

function getProducts() {
  const cached = localStorage.getItem(STORAGE_PRODUCTS);
  return cached ? JSON.parse(cached) : [];
}

function getStaff() {
  const cached = localStorage.getItem(STORAGE_STAFF);
  return cached ? JSON.parse(cached) : [];
}

function hasEnteredQuantities() {
  const inputs = document.querySelectorAll('input[type="number"]');
  for (const input of inputs) {
    if (input.value.trim() !== '') return true;
  }
  return false;
}

async function onTitleClick() {
  if (hasEnteredQuantities()) {
    return;
  }
  if (!navigator.onLine) {
    showToast('离线状态 Cannot update while offline');
    return;
  }
  if (!confirm('确认从数据库更新列表? Reload list from database?')) return;
  showLoadingOverlay();
  try {
    const [products, staff] = await Promise.all([fetchProductsFromDB(), fetchStaffFromDB()]);
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
    localStorage.setItem(STORAGE_STAFF, JSON.stringify(staff));
    hideLoadingOverlay();
    showToast('列表已更新 List updated');
    setTimeout(() => location.reload(), 800);
  } catch (e) {
    hideLoadingOverlay();
    console.error('Update failed:', e);
    showToast('更新失败 Update failed');
  }
}

function populateStaffDropdown() {
  const select = document.getElementById('stockCheckBy');
  const staff = getStaff();
  staff.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name === 'New Worker' ? '*新员工 New Worker' : name;
    select.appendChild(option);
  });
}

function initScanner() {
  const barcodeInput = document.getElementById('barcodeInput');
  const stockCheckBy = document.getElementById('stockCheckBy');
  const productTable = document.getElementById('productTable');

  const currentProducts = getProducts();

  const tbody = productTable.getElementsByTagName('tbody')[0];
  currentProducts.forEach(product => {
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
    const product = currentProducts.find(p => p.barcode === barcode);
    if (product) {
      const quantityInput = document.querySelector(`input[data-barcode="${barcode}"]`);
      if (quantityInput) {
        quantityInput.focus();
        quantityInput.select();
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

function submitQuantities(sheetName) {
  const currentProducts = getProducts();
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
      const product = currentProducts.find(p => p.barcode === barcode);
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
  document.getElementById('stockCheckBy').value = '';
  barcodeInput.focus();
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
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

function updateDateTimeDisplay() {
  const dateDisplay = document.getElementById('currentDate');
  const timeDisplay = document.getElementById('currentTime');
  const now = new Date();
  if (dateDisplay) dateDisplay.textContent = formatDate(now);
  if (timeDisplay) timeDisplay.textContent = formatTime(now);
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
  const payload = { data: data, sheetName: sheetName };

  fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
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

setInterval(updateDateTimeDisplay, 1000);

window.addEventListener('load', async () => {
  await ensureDataLoaded();
  populateStaffDropdown();
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
