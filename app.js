// --- Supabase Config Setup ---
// NOTE: You must replace these placeholders with your actual Supabase Project URL and Anon Key
const SUPABASE_URL = 'https://oxumxstpfttqrxmfinfo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dW14c3RwZnR0cXJ4bWZpbmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTE3NjYsImV4cCI6MjA5MjI4Nzc2Nn0.sF7DXiPp0e10DHYnV7V_egNNXgH1p8XGl9FRXqD3D1E';
let dbClient = null;
if (window.supabase && SUPABASE_URL.startsWith('http')) {
  dbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const state = {
  mode: 'edit', // 'edit' or 'inventory'
  currentTool: 'shelf', // shelf, cooler, register, door, eraser
  gridRows: 15,
  gridCols: 25,
  fixtures: {}, // id: { type, row, col, products: [] }
  selectedFixtureId: null,
  logistics: [], // [{ id, type, vendor, date, items: [], status }]
  salesData: {} // { [prodName]: { revenue: 0, qtySold: 0 } }
};

// DOM Elements
const storeGrid = document.getElementById('store-grid');
const toolBtns = document.querySelectorAll('.tool-btn');
const viewEditBtn = document.getElementById('view-edit');
const viewInventoryBtn = document.getElementById('view-inventory');
const clearGridBtn = document.getElementById('clear-grid-btn');

const invPanel = document.getElementById('inventory-panel');
const closeInvBtn = document.getElementById('close-inventory');
const statFixtures = document.getElementById('stat-fixtures');
const statProducts = document.getElementById('stat-products');

// Inventory Form Elements
const invFixtureIcon = document.getElementById('inv-fixture-icon');
const invFixtureName = document.getElementById('inv-fixture-name');
const invFixtureLoc = document.getElementById('inv-fixture-loc');
const addProductBtn = document.getElementById('add-product-btn');
const prodBarcodeInput = document.getElementById('prod-barcode');
const prodNameInput = document.getElementById('prod-name');
const prodQtyInput = document.getElementById('prod-qty');
const prodPriceInput = document.getElementById('prod-price');
const prodCostInput = document.getElementById('prod-cost');
const prodVendorInput = document.getElementById('prod-vendor');
const productList = document.getElementById('product-list');

// Scanner & CSV Elements
const cameraScanBtn = document.getElementById('camera-scan-btn');
const readerContainer = document.getElementById('reader-container');
const closeReaderBtn = document.getElementById('close-reader-btn');
const csvUpload = document.getElementById('csv-upload');

let html5QrCode = null;
let posQrCode = null;

// Cart State
const posState = {
  cart: [] // { id, name, price, qtyToSell, sourceFixtureId }
};

// Auth Elements
const authModal = document.getElementById('auth-modal');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const btnLogin = document.getElementById('btn-login');
const btnSignup = document.getElementById('btn-signup');
const authError = document.getElementById('auth-error');
const authLogoutBtn = document.getElementById('auth-logout-btn');

// POS Elements
const posPanel = document.getElementById('pos-panel');
const posClose = document.getElementById('close-pos');
const posFixtureLoc = document.getElementById('pos-fixture-loc');
const posBarcode = document.getElementById('pos-barcode');
const posCamBtn = document.getElementById('pos-camera-scan-btn');
const posReaderCont = document.getElementById('pos-reader-container');
const posCloseCam = document.getElementById('pos-close-reader-btn');
const posQuickAdd = document.getElementById('pos-quick-add');
const posCartList = document.getElementById('pos-cart-list');
const posSub = document.getElementById('pos-subtotal');
const posTax = document.getElementById('pos-tax');
const posTotal = document.getElementById('pos-total');
const posCheckout = document.getElementById('pos-checkout-btn');

// Master Inventory Elements
const masterInvBtn = document.getElementById('master-inv-btn');
const masterInvModal = document.getElementById('master-inv-modal');
const closeMasterInvBtn = document.getElementById('close-master-inv');
const masterSearch = document.getElementById('master-search');
const masterFilter = document.getElementById('master-filter');
const masterInvBody = document.getElementById('master-inv-body');
const masterTotalItems = document.getElementById('master-total-items');
const masterTotalValue = document.getElementById('master-total-value');
const masterProfValue = document.getElementById('master-prof-value');

// Logistics Elements
const logisticsBtn = document.getElementById('logistics-btn');
const logisticsModal = document.getElementById('logistics-modal');
const closeLogisticsBtn = document.getElementById('close-logistics');
const btnNewInbound = document.getElementById('btn-new-inbound');
const btnNewOutbound = document.getElementById('btn-new-outbound');
const logisticsFilter = document.getElementById('logistics-filter');
const logisticsBody = document.getElementById('logistics-body');

// Analytics Elements
const analyticsBtn = document.getElementById('analytics-btn');
const analyticsModal = document.getElementById('analytics-modal');
const closeAnalyticsBtn = document.getElementById('close-analytics');
const analyticsTotalRev = document.getElementById('analytics-total-rev');
let revenueChartInstance = null;

// Table & Receipt Elements
const tablePanel = document.getElementById('table-panel');
const closeTableBtn = document.getElementById('close-table');
const tableServiceName = document.getElementById('table-service-name');
const tableServiceStatus = document.getElementById('table-service-status');
const tableSeatsInput = document.getElementById('table-seats');
const btnSeatTable = document.getElementById('btn-seat-table');
const btnClearTable = document.getElementById('btn-clear-table');
const tableOrdersContainer = document.getElementById('table-orders-container');
const tableMenuAdd = document.getElementById('table-menu-add');
const tableOrderList = document.getElementById('table-order-list');
const btnSendKitchen = document.getElementById('btn-send-kitchen');
const btnCheckoutTable = document.getElementById('btn-checkout-table');

const receiptModal = document.getElementById('receipt-modal');
const receiptDate = document.getElementById('receipt-date');
const receiptOrderId = document.getElementById('receipt-order-id');
const receiptItems = document.getElementById('receipt-items');
const receiptSubtotal = document.getElementById('receipt-subtotal');
const receiptTax = document.getElementById('receipt-tax');
const receiptTotal = document.getElementById('receipt-total');
const btnCloseReceipt = document.getElementById('btn-close-receipt');
const btnPrintReceipt = document.getElementById('btn-print-receipt');

// Icons Mapping
const icons = {
  shelf: 'shelves',
  cooler: 'kitchen',
  register: 'point_of_sale',
  door: 'door_front',
  table: 'table_restaurant',
  kitchen: 'soup_kitchen'
};

const labels = {
  shelf: 'Aisle Shelf',
  cooler: 'Cooler',
  register: 'Register',
  door: 'Entrance Door',
  table: 'Dining Table',
  kitchen: 'Prep Kitchen'
};

// Persistence
const DB_KEY = 'topfloor_cstore_layout';

function saveState() {
  localStorage.setItem(DB_KEY, JSON.stringify({
    fixtures: state.fixtures,
    logistics: state.logistics,
    salesData: state.salesData
  }));
}

function loadState() {
  const saved = localStorage.getItem(DB_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.fixtures !== undefined) {
        // New save format
        state.fixtures = parsed.fixtures;
        state.logistics = parsed.logistics || [];
        state.salesData = parsed.salesData || {};
      } else {
        // Legacy save format
        state.fixtures = parsed;
        state.logistics = [];
        state.salesData = {};
      }
    } catch(e) {
      console.error("Save data corrupted. Starting fresh.");
      state.fixtures = {};
      state.logistics = [];
      state.salesData = {};
    }
  }
}

// ----- Supabase Auth -----
async function handleAuth() {
  if (!dbClient) {
    authError.textContent = "Supabase Database not configured. Please enter your SUPABASE_URL and SUPABASE_ANON_KEY at the top of app.js.";
    authError.style.display = 'block';
    return;
  }

  // Check active session on load
  const { data: { session }, error } = await dbClient.auth.getSession();
  if (session) {
    authModal.classList.add('hidden');
    authLogoutBtn.style.display = 'block';
  } else {
    authModal.classList.remove('hidden');
    authLogoutBtn.style.display = 'none';
  }

  // Listen for changes
  dbClient.auth.onAuthStateChange((event, session) => {
    if (session) {
      authModal.classList.add('hidden');
      authLogoutBtn.style.display = 'block';
    } else {
      authModal.classList.remove('hidden');
      authLogoutBtn.style.display = 'none';
    }
  });
}

function showAuthError(msg) {
  authError.textContent = msg;
  authError.style.display = 'block';
}

btnLogin.addEventListener('click', async () => {
  if (!dbClient) return showAuthError("Supabase not configured in app.js.");
  const email = authEmail.value;
  const password = authPassword.value;
  if (!email || !password) return showAuthError("Please enter email and password.");
  
  btnLogin.textContent = "Logging in...";
  const { error } = await dbClient.auth.signInWithPassword({ email, password });
  btnLogin.textContent = "Log In";
  
  if (error) showAuthError(error.message);
});

btnSignup.addEventListener('click', async () => {
  if (!dbClient) return showAuthError("Supabase not configured in app.js.");
  const email = authEmail.value;
  const password = authPassword.value;
  if (!email || !password) return showAuthError("Please enter email and password.");
  
  btnSignup.textContent = "Signing up...";
  const { error } = await dbClient.auth.signUp({ email, password });
  btnSignup.textContent = "Sign Up";
  
  if (error) {
    showAuthError(error.message);
  } else {
    authError.textContent = "Check your email for the confirmation link. You will not be able to log in until confirmed.";
    authError.style.display = 'block';
    authError.style.color = 'var(--accent-success)';
  }
});

authLogoutBtn.addEventListener('click', async () => {
  if (dbClient) await dbClient.auth.signOut();
});

// Initialize App
function init() {
  handleAuth();
  loadState();
  createGrid();
  setupEventListeners();
  renderFixtures();
  updateStats();
}

// Generate the 2D Grid Cells
function createGrid() {
  storeGrid.innerHTML = '';
  // Set explicit CSS grid inline if changed from CSS variables
  storeGrid.style.gridTemplateColumns = `repeat(${state.gridCols}, var(--grid-size))`;
  storeGrid.style.gridTemplateRows = `repeat(${state.gridRows}, var(--grid-size))`;

  for (let r = 0; r < state.gridRows; r++) {
    for (let c = 0; c < state.gridCols; c++) {
      const cell = document.createElement('div');
      cell.classList.add('grid-cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      
      cell.addEventListener('mousedown', (e) => handleCellInteraction(e, r, c));
      cell.addEventListener('mouseenter', (e) => {
        if (e.buttons === 1) handleCellInteraction(e, r, c); // Drag support for drawing
      });
      
      // Native Mobile Touch Binding
      cell.addEventListener('touchstart', (e) => {
        handleCellInteraction(e, r, c);
      }, {passive: true});

      storeGrid.appendChild(cell);
    }
  }

  // Handle continuous finger sliding across the grid on phones
  storeGrid.addEventListener('touchmove', (e) => {
    if (state.mode !== 'edit') return;
    e.preventDefault(); // Stop Android Chrome pull-to-refresh / native scrolling
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target) {
       const cell = target.closest('.grid-cell');
       if (cell) {
         handleCellInteraction(e, cell.dataset.row, cell.dataset.col);
       }
    }
  }, { passive: false });
}

// Event Listeners setup
function setupEventListeners() {
  // Toolbar buttons
  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.mode !== 'edit') switchMode('edit');
      
      toolBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentTool = btn.dataset.type;
    });
  });

  // Mode Toggle
  viewEditBtn.addEventListener('click', () => switchMode('edit'));
  viewInventoryBtn.addEventListener('click', () => switchMode('inventory'));

  // Clear Grid
  clearGridBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear the entire store layout?")) {
      state.fixtures = {};
      closeInventory();
      renderFixtures();
      updateStats();
      saveState();
    }
  });

  // Master Inventory
  masterInvBtn.addEventListener('click', openMasterInventory);
  closeMasterInvBtn.addEventListener('click', closeMasterInventory);
  masterSearch.addEventListener('input', renderMasterInventory);
  masterFilter.addEventListener('change', renderMasterInventory);

  // Logistics
  logisticsBtn.addEventListener('click', openLogistics);
  closeLogisticsBtn.addEventListener('click', closeLogistics);
  btnNewInbound.addEventListener('click', () => createLogisticsShipment('Inbound'));
  btnNewOutbound.addEventListener('click', () => createLogisticsShipment('Outbound'));
  logisticsFilter.addEventListener('change', renderLogistics);

  // Analytics
  analyticsBtn.addEventListener('click', openAnalytics);
  closeAnalyticsBtn.addEventListener('click', closeAnalytics);

  // Inventory Panel
  closeInvBtn.addEventListener('click', closeInventory);
  addProductBtn.addEventListener('click', addProduct);

  // Scanner Keyboard Wedge support (pressing enter in barcode field)
  prodBarcodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBarcodeScanned(prodBarcodeInput.value.trim());
    }
  });

  // Camera Scanning
  cameraScanBtn.addEventListener('click', startCameraScan);
  closeReaderBtn.addEventListener('click', stopCameraScan);

  // CSV Import
  csvUpload.addEventListener('change', handleCsvUpload);

  // POS Listeners
  posClose.addEventListener('click', closePos);
  posBarcode.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePosBarcodeScanned(posBarcode.value.trim());
    }
  });

  posCamBtn.addEventListener('click', startPosCameraScan);
  posCloseCam.addEventListener('click', stopPosCameraScan);
  posCheckout.addEventListener('click', handleCheckout);
  
  posQuickAdd.addEventListener('change', (e) => {
    if (e.target.value) {
      handlePosQuickAdd(e.target.value);
      posQuickAdd.value = ''; // reset dropdown
    }
  });

  // Table Service Listeners
  closeTableBtn.addEventListener('click', closeTablePanel);
  btnSeatTable.addEventListener('click', handleSeatTable);
  btnClearTable.addEventListener('click', handleClearTable);
  tableMenuAdd.addEventListener('change', handleTableMenuAdd);
  btnSendKitchen.addEventListener('click', handleSendKitchen);
  btnCheckoutTable.addEventListener('click', handleTableCheckout);
  
  btnCloseReceipt.addEventListener('click', () => receiptModal.classList.add('hidden'));
  btnPrintReceipt.addEventListener('click', () => window.print());
}

// Switch between Edit Layout and Manage Inventory modes
function switchMode(newMode) {
  state.mode = newMode;
  
  if (newMode === 'edit') {
    viewEditBtn.classList.add('btn-active');
    viewInventoryBtn.classList.remove('btn-active');
    storeGrid.classList.remove('mode-inventory');
    storeGrid.classList.add('mode-edit');
    closeInventory();
  } else {
    viewInventoryBtn.classList.add('btn-active');
    viewEditBtn.classList.remove('btn-active');
    storeGrid.classList.remove('mode-edit');
    storeGrid.classList.add('mode-inventory');
    // Ensure selected tool highlights are removed slightly visually or ignored
  }
  
  closePos(); // make sure POS is closed if mode switching
  renderFixtures(); // Re-render to clear selection styles
}

// Handle clicking or dragging on grid
function handleCellInteraction(e, row, col) {
  // If in inventory mode, clicking empty cells does nothing except maybe close panel
  if (state.mode === 'inventory') {
    return;
  }

  // Edit Mode Logic
  const id = `${row}-${col}`;
  
  if (state.currentTool === 'eraser') {
    delete state.fixtures[id];
  } else {
    // Cannot replace door with multiple or place if something is there, just overwrite
    state.fixtures[id] = {
      id,
      type: state.currentTool,
      row,
      col,
      products: state.fixtures[id]?.products || [] // retain products if replacing
    };
  }
  
  renderFixtures();
  updateStats();
  saveState();
}

// Click on an existing fixture (Delegated or Direct)
function handleFixtureClick(e, id) {
  e.stopPropagation(); // prevent triggering underlying cell grab
  
  if (state.mode === 'edit') {
    if (state.currentTool === 'eraser') {
      delete state.fixtures[id];
      renderFixtures();
      updateStats();
      saveState();
    }
  } else if (state.mode === 'inventory') {
    state.selectedFixtureId = id;
    renderFixtures(); // Updates active outline
    const f = state.fixtures[id];
    if (f && f.type === 'register') {
      openPos(id);
    } else if (f && f.type === 'table') {
      openTablePanel(id);
    } else if (f && f.type === 'kitchen') {
      alert("Kitchen Area: Use this space to visually manage layout. Orders are routed from Tables directly.");
    } else {
      openInventory(id);
    }
  }
}

// Render fixtures onto the grid
function renderFixtures() {
  // Clear existing rendered fixtures
  document.querySelectorAll('.fixture').forEach(f => f.remove());

  // Generate DOM nodes for fixtures
  Object.values(state.fixtures).forEach(fixture => {
    // Find parent cell
    const cell = document.querySelector(`.grid-cell[data-row="${fixture.row}"][data-col="${fixture.col}"]`);
    if (!cell) return;

    const fDiv = document.createElement('div');
    fDiv.className = `fixture type-${fixture.type}`;
    if (state.selectedFixtureId === fixture.id && state.mode === 'inventory') {
      fDiv.classList.add('selected');
    }
    if (fixture.type === 'table' && fixture.status === 'seated') {
      fDiv.classList.add('table-seated');
    }

    fDiv.innerHTML = `<span class="material-symbols-outlined">${icons[fixture.type]}</span>`;
    
    // Fixture click listener
    fDiv.addEventListener('mousedown', (e) => handleFixtureClick(e, fixture.id));
    fDiv.addEventListener('touchstart', (e) => handleFixtureClick(e, fixture.id), {passive: true});

    cell.appendChild(fDiv);
  });
}

// Inventory UI
function openInventory(fixtureId) {
  const fixture = state.fixtures[fixtureId];
  if (!fixture) return;

  closePos(); // Ensure pos is closed
  if (typeof closeTablePanel === 'function') closeTablePanel(); // Ensure table is closed

  if (fixture.type === 'door') {
    alert("Cannot assign inventory to an entrance.");
    state.selectedFixtureId = null;
    renderFixtures();
    return;
  }

  invPanel.classList.remove('hidden');
  
  invFixtureIcon.textContent = icons[fixture.type];
  invFixtureName.textContent = labels[fixture.type];
  invFixtureLoc.textContent = `Position: Row ${fixture.row + 1}, Col ${fixture.col + 1}`;

  // Reset Form
  prodBarcodeInput.value = '';
  prodNameInput.value = '';
  prodQtyInput.value = '';
  prodPriceInput.value = '';
  prodCostInput.value = '';
  prodVendorInput.value = '';

  stopCameraScan(); // ensure stopped if opening/re-opening
  renderProducts();
}

function closeInventory() {
  invPanel.classList.add('hidden');
  state.selectedFixtureId = null;
  stopCameraScan();
  renderFixtures();
}

// ----- POS System -----

function openPos(fixtureId) {
  closeInventory(); // Ensure standard inventory panel is closed
  if (typeof closeTablePanel === 'function') closeTablePanel(); // Ensure table is closed
  const fixture = state.fixtures[fixtureId];
  if (!fixture) return;

  posPanel.classList.remove('hidden');
  posFixtureLoc.textContent = `Register Location: Row ${fixture.row + 1}, Col ${fixture.col + 1}`;
  
  posBarcode.value = '';
  stopPosCameraScan();
  populatePosDropdown(); // Build store-wide dropdown
  renderPosCart();
}

function closePos() {
  posPanel.classList.add('hidden');
  stopPosCameraScan();
  if (state.mode === 'inventory') {
     // Don't kill selection if we just switched to another fixture, but otherwise safe to drop
     // We will let the parent handler manage selection.
  }
}

// Gets a list of all products in the entire store
function getAllStoreProducts() {
  const allProds = [];
  Object.values(state.fixtures).forEach(f => {
    if (f.products) {
      f.products.forEach(p => {
        // Group them up by name/barcode just for display
        allProds.push({ ...p, sourceFixtureId: f.id });
      });
    }
  });
  return allProds;
}

function populatePosDropdown() {
  posQuickAdd.innerHTML = '<option value="">- Or Select Product from Store -</option>';
  const products = getAllStoreProducts();
  
  // Dedup for dropdown but we need source
  products.forEach(p => {
    // Only show products with actual stock
    if (p.qty > 0) {
       const opt = document.createElement('option');
       opt.value = `${p.sourceFixtureId}|${p.id}`; // store location info
       opt.textContent = `${p.name} ($${p.price.toFixed(2)}) - In stock: ${p.qty}`;
       posQuickAdd.appendChild(opt);
    }
  });
}

function handlePosQuickAdd(valString) {
  const [fId, pId] = valString.split('|');
  const fixture = state.fixtures[fId];
  if (!fixture) return;
  const prod = fixture.products.find(p => p.id === pId);
  if (prod) {
    addToCart(prod, fId);
  }
}

function handlePosBarcodeScanned(barcode) {
  if (!barcode) return;
  posBarcode.value = ''; // clear immediately
  
  // Search entire store for barcode
  const products = getAllStoreProducts();
  const matched = products.find(p => p.barcode === barcode && p.qty > 0);
  
  if (matched) {
    addToCart(matched, matched.sourceFixtureId);
  } else {
    // If we have barcode but out of stock or doesn't exist
    const exists = products.find(p => p.barcode === barcode);
    if(exists) {
      alert(`Product ${exists.name} is OUT OF STOCK. Cannot sell.`);
    } else {
      alert("Barcode not recognized in store inventory.");
    }
  }
}

function addToCart(product, fixtureId) {
  // Check if we have enough stock (considering what is already in cart)
  const existingCartItem = posState.cart.find(c => c.id === product.id && c.sourceFixtureId === fixtureId);
  const currentCartQty = existingCartItem ? existingCartItem.qtyToSell : 0;
  
  if (currentCartQty + 1 > product.qty) {
    alert(`Cannot add more of ${product.name}. Max stock is ${product.qty} on this shelf.`);
    return;
  }

  if (existingCartItem) {
    existingCartItem.qtyToSell += 1;
  } else {
    posState.cart.push({
      id: product.id,
      barcode: product.barcode,
      name: product.name,
      price: product.price,
      qtyToSell: 1,
      sourceFixtureId: fixtureId
    });
  }
  
  renderPosCart();
}

function removeFromCart(index) {
  posState.cart.splice(index, 1);
  renderPosCart();
}

function renderPosCart() {
  posCartList.innerHTML = '';
  let subtotal = 0;
  
  if (posState.cart.length === 0) {
    posCartList.innerHTML = `<li class="instruction-text" style="text-align:center; padding: 2rem 0; color:#fff;">Register empty. Scan item to begin.</li>`;
  }
  
  posState.cart.forEach((item, index) => {
    subtotal += (item.price * item.qtyToSell);
    
    const li = document.createElement('li');
    li.className = 'product-item';
    li.style.background = 'rgba(0,0,0,0.5)';
    li.innerHTML = `
      <div class="prod-info">
        <h4>${item.name}</h4>
        <div class="prod-details">
          Qty: ${item.qtyToSell} <span style="margin:0 5px">•</span> <span class="prod-price" style="color:var(--accent-success);">$${item.price.toFixed(2)}</span>
        </div>
      </div>
      <button class="icon-btn del-btn" style="position:static;" onclick="removeFromCart(${index})">
        <span class="material-symbols-outlined">delete</span>
      </button>
    `;
    posCartList.appendChild(li);
  });
  
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  
  posSub.textContent = `$${subtotal.toFixed(2)}`;
  posTax.textContent = `$${tax.toFixed(2)}`;
  posTotal.textContent = `$${total.toFixed(2)}`;
}

function handleCheckout() {
  if (posState.cart.length === 0) return;
  
  // Deduct from actual inventory state
  posState.cart.forEach(item => {
    const fixture = state.fixtures[item.sourceFixtureId];
    if(fixture) {
      const realProd = fixture.products.find(p => p.id === item.id);
      if(realProd) {
        realProd.qty -= item.qtyToSell;
      }
    }
    
    // Log Sale
    const revVal = item.price * item.qtyToSell;
    if (!state.salesData[item.name]) {
      state.salesData[item.name] = { revenue: 0, qtySold: 0 };
    }
    state.salesData[item.name].revenue += revVal;
    state.salesData[item.name].qtySold += item.qtyToSell;
  });
  saveState(); // Save stock deductions

  // Generate Receipt
  let subtotal = 0; 
  posState.cart.forEach(i => subtotal += (i.price * i.qtyToSell));
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  
  generateReceiptModal(posState.cart, subtotal, tax, total, "POS Sale");

  // Clear cart
  posState.cart = [];
  renderPosCart();
  populatePosDropdown(); // Refresh stock in dropdown
  updateStats(); // Update dashboard stats
}

// POS Camera Logic
function startPosCameraScan() {
  posReaderCont.classList.remove('hidden');
  if (!posQrCode) {
    posQrCode = new Html5Qrcode("pos-reader");
  }
  
  const config = { fps: 10, qrbox: { width: 250, height: 150 } };
  
  posQrCode.start(
    { facingMode: "environment" }, 
    config,
    (decodedText) => {
      // On Success
      stopPosCameraScan();
      handlePosBarcodeScanned(decodedText);
    },
    (errorMessage) => { }
  ).catch((err) => {
    posReaderCont.classList.add('hidden');
  });
}

function stopPosCameraScan() {
  if (posQrCode && posQrCode.isScanning) {
    posQrCode.stop().then(() => {
      posReaderCont.classList.add('hidden');
    }).catch(err => {});
  } else {
    posReaderCont.classList.add('hidden');
  }
}

// ----- Inventory Scanner Logic -----
function handleBarcodeScanned(barcode) {
  if (!barcode) return;
  
  // Try to find if this product is already on the shelf to increment qty
  const fixture = state.fixtures[state.selectedFixtureId];
  if (fixture) {
    const existing = fixture.products.find(p => p.barcode === barcode);
    if (existing) {
      existing.qty += 1;
      prodBarcodeInput.value = '';
      renderProducts();
      updateStats();
      saveState();
      return;
    }
  }

  // If new, autofill the barcode and focus name input to define it
  prodBarcodeInput.value = barcode;
  if (!prodNameInput.value) {
    prodNameInput.focus();
  }
}

function startCameraScan() {
  readerContainer.classList.remove('hidden');
  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("reader");
  }
  
  const config = { fps: 10, qrbox: { width: 250, height: 150 } };
  
  html5QrCode.start(
    { facingMode: "environment" }, 
    config,
    (decodedText) => {
      // On Success
      stopCameraScan();
      prodBarcodeInput.value = decodedText;
      handleBarcodeScanned(decodedText);
    },
    (errorMessage) => {
      // On Error (ignore, it errors continually while looking)
    }
  ).catch((err) => {
    console.error("Camera error:", err);
    alert("Unable to start camera. Please ensure you have given permissions.");
    readerContainer.classList.add('hidden');
  });
}

function stopCameraScan() {
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop().then(() => {
      readerContainer.classList.add('hidden');
    }).catch(err => {
      console.error("Error stopping scanner:", err);
    });
  } else {
    readerContainer.classList.add('hidden');
  }
}

function handleCsvUpload(e) {
  if (!state.selectedFixtureId) return;
  
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target.result;
    const lines = text.split('\n');
    const fixture = state.fixtures[state.selectedFixtureId];
    
    let addedCount = 0;
    
    // Skip empty lines, and assume header might exist but parse if valid data
    // Format: Barcode, Name, Qty, Price, Cost, Vendor (or Name,Qty,Price)
    lines.forEach((line, index) => {
      if (!line.trim()) return;
      
      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 2) return; // Need at least name and qty
      
      // Let's deduce what format they provided.
      let barcode = '', name = '', qty = 0, price = 0, cost = 0, vendor = '';
      
      if (parts.length >= 6) {
        barcode = parts[0];
        name = parts[1];
        qty = parseInt(parts[2]) || 1;
        price = parseFloat(parts[3]) || 0;
        cost = parseFloat(parts[4]) || 0;
        vendor = parts[5] || '';
      } else if (parts.length >= 4) {
        barcode = parts[0];
        name = parts[1];
        qty = parseInt(parts[2]) || 1;
        price = parseFloat(parts[3]) || 0;
      } else {
        // Assume [Name, Qty, Price]
        name = parts[0];
        qty = parseInt(parts[1]) || 1;
        price = parseFloat(parts[2]) || 0;
      }
      
      // Ignore header row roughly
      if (index === 0 && (name.toLowerCase() === 'name' || qty.toString() === 'NaN')) return;

      fixture.products.push({
        id: Date.now().toString() + addedCount,
        barcode: barcode || null,
        name,
        qty,
        price,
        cost,
        vendor
      });
      addedCount++;
    });

    if (addedCount > 0) {
      renderProducts();
      updateStats();
      saveState();
      alert(`Successfully imported ${addedCount} products to the shelf.`);
    } else {
      alert("No valid products found in the CSV. Format should be: Barcode, Name, Qty, Price");
    }
    
    // Reset file input
    csvUpload.value = '';
  };
  
  reader.readAsText(file);
}

function addProduct() {
  if (!state.selectedFixtureId) return;

  const barcode = prodBarcodeInput.value.trim();
  const name = prodNameInput.value.trim();
  const qty = parseInt(prodQtyInput.value) || 0;
  const price = parseFloat(prodPriceInput.value) || 0;
  const cost = parseFloat(prodCostInput.value) || 0;
  const vendor = prodVendorInput.value.trim() || '';

  if (!name || qty <= 0) {
    alert("Please enter a valid product name and quantity greater than 0.");
    return;
  }

  const fixture = state.fixtures[state.selectedFixtureId];
  
  fixture.products.push({
    id: Date.now().toString(),
    barcode: barcode || null,
    name,
    qty,
    price,
    cost,
    vendor
  });

  prodBarcodeInput.value = '';
  prodNameInput.value = '';
  prodQtyInput.value = '';
  prodPriceInput.value = '';
  prodCostInput.value = '';
  prodVendorInput.value = '';

  renderProducts();
  updateStats();
  saveState();
}

function deleteProduct(productId) {
  if (!state.selectedFixtureId) return;
  const fixture = state.fixtures[state.selectedFixtureId];
  
  fixture.products = fixture.products.filter(p => p.id !== productId);
  renderProducts();
  updateStats();
  saveState();
}

function renderProducts() {
  productList.innerHTML = '';
  const fixture = state.fixtures[state.selectedFixtureId];
  if (!fixture) return;

  if (fixture.products.length === 0) {
    productList.innerHTML = `<li class="instruction-text" style="text-align:center; padding: 2rem 0;">No items stocked here yet.</li>`;
    return;
  }

  fixture.products.forEach(p => {
    const li = document.createElement('li');
    li.className = 'product-item';
    
    const badgeHtml = p.barcode ? `<span class="prod-barcode-badge"><span class="material-symbols-outlined" style="font-size:10px;vertical-align:middle;">barcode</span> ${p.barcode}</span>` : '';

    li.innerHTML = `
      <div class="prod-info">
        <h4>${p.name} ${badgeHtml}</h4>
        <div class="prod-details">
          Qty: ${p.qty} <span style="margin:0 5px">•</span> <span class="prod-price">$${p.price.toFixed(2)}</span>
        </div>
      </div>
      <button class="icon-btn del-btn" style="position:static;" onclick="deleteProduct('${p.id}')">
        <span class="material-symbols-outlined">delete</span>
      </button>
    `;
    
    productList.appendChild(li);
  });
}

function updateStats() {
  const fCount = Object.keys(state.fixtures).length;
  let pCount = 0;
  
  Object.values(state.fixtures).forEach(f => {
    pCount += f.products.length;
  });

  statFixtures.textContent = fCount;
  statProducts.textContent = pCount;
}

// Ensure deleteProduct is accessible globally due to inline onclick
window.deleteProduct = deleteProduct;

// ----- Master Inventory Logic -----
function openMasterInventory() {
  masterInvModal.classList.remove('hidden');
  masterSearch.value = '';
  masterFilter.value = 'all';
  renderMasterInventory();
}

function closeMasterInventory() {
  masterInvModal.classList.add('hidden');
}

function renderMasterInventory() {
  masterInvBody.innerHTML = '';
  const products = getAllStoreProducts();
  const search = masterSearch.value.toLowerCase().trim();
  const filter = masterFilter.value;
  
  let totalUnique = 0;
  let totalVal = 0;
  let totalProfit = 0;
  
  products.forEach(p => {
    // Filter
    if (filter === 'low' && p.qty > 5) return;
    if (filter === 'out' && p.qty > 0) return;
    
    // Search
    if (search && !p.name.toLowerCase().includes(search) && (!p.barcode || !p.barcode.includes(search))) return;
    
    const fixture = state.fixtures[p.sourceFixtureId];
    const locString = fixture ? `${labels[fixture.type]} (R${fixture.row+1}, C${fixture.col+1})` : 'Unknown';
    const cost = p.cost || 0;
    const vendor = p.vendor || 'N/A';
    const margin = p.price > 0 ? (((p.price - cost) / p.price) * 100).toFixed(1) : '0.0';
    const val = p.qty * p.price;
    const profitVal = (p.price - cost) * p.qty;
    
    totalUnique++;
    totalVal += val;
    totalProfit += profitVal;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.name}<br><small class="prod-barcode-badge" style="display:inline-block; margin-top:4px;">${p.barcode || 'N/A'}</small></td>
      <td>${vendor}</td>
      <td>${locString}</td>
      <td>${p.qty}</td>
      <td>$${cost.toFixed(2)}</td>
      <td>$${p.price.toFixed(2)}</td>
      <td style="color: ${margin > 0 ? 'var(--accent-success)' : (margin < 0 ? 'var(--accent-danger)' : 'var(--text-muted)')}">${margin}%</td>
      <td>$${val.toFixed(2)}</td>
      <td class="action-cell">
        <button class="btn-icon-tiny edit" onclick="editMasterProduct('${p.sourceFixtureId}', '${p.id}')">
          <span class="material-symbols-outlined" style="font-size:16px;">edit</span>
        </button>
        <button class="btn-icon-tiny delete" onclick="deleteMasterProduct('${p.sourceFixtureId}', '${p.id}')">
          <span class="material-symbols-outlined" style="font-size:16px;">delete</span>
        </button>
      </td>
    `;
    masterInvBody.appendChild(tr);
  });
  
  if(totalUnique === 0) {
     masterInvBody.innerHTML = `<tr><td colspan="9" style="text-align:center; color: var(--text-muted); padding: 2rem;">No items found.</td></tr>`;
  }
  
  masterTotalItems.textContent = totalUnique;
  masterTotalValue.textContent = `$${totalVal.toFixed(2)}`;
  
  const overallMargin = totalVal > 0 ? ((totalProfit / totalVal) * 100).toFixed(1) : '0.0';
  if (masterProfValue) masterProfValue.textContent = `$${totalProfit.toFixed(2)} (${overallMargin}%)`;
}

function deleteMasterProduct(fixtureId, productId) {
  if (confirm("Are you sure you want to delete this item?")) {
    const fixture = state.fixtures[fixtureId];
    if (fixture) {
      fixture.products = fixture.products.filter(p => p.id !== productId);
      saveState();
      updateStats();
      renderMasterInventory();
      // If the inventory panel is currently open to this fixture, re-render it
      if (state.selectedFixtureId === fixtureId) {
        renderProducts();
      }
    }
  }
}

function editMasterProduct(fixtureId, productId) {
  const fixture = state.fixtures[fixtureId];
  if (!fixture) return;
  const prod = fixture.products.find(p => p.id === productId);
  if (!prod) return;
  
  const newName = prompt("Edit Name:", prod.name);
  if (newName === null) return;
  
  const newBarcode = prompt("Edit Barcode (or leave empty):", prod.barcode || '');
  if (newBarcode === null) return;
  
  const newQtyStr = prompt("Edit Qty:", prod.qty);
  if (newQtyStr === null) return;
  
  const newPriceStr = prompt("Edit Price:", prod.price);
  if (newPriceStr === null) return;
  
  const newCostStr = prompt("Edit Cost (Optional):", prod.cost || 0);
  if (newCostStr === null) return;
  
  const newVendor = prompt("Edit Vendor (Optional):", prod.vendor || '');
  if (newVendor === null) return;
  
  const newQty = parseInt(newQtyStr);
  const newPrice = parseFloat(newPriceStr);
  const newCost = parseFloat(newCostStr) || 0;
  
  if (newName.trim() === '' || isNaN(newQty) || newQty < 0 || isNaN(newPrice) || newPrice < 0) {
     alert("Invalid input. Product not updated.");
     return;
  }
  
  prod.name = newName.trim();
  prod.barcode = newBarcode.trim() || null;
  prod.qty = newQty;
  prod.price = newPrice;
  prod.cost = newCost;
  prod.vendor = newVendor.trim();
  
  saveState();
  updateStats();
  renderMasterInventory();
  if (state.selectedFixtureId === fixtureId) {
    renderProducts();
  }
}

window.deleteMasterProduct = deleteMasterProduct;
window.editMasterProduct = editMasterProduct;

// ----- Logistics System -----
function openLogistics() {
  logisticsModal.classList.remove('hidden');
  renderLogistics();
}

function closeLogistics() {
  logisticsModal.classList.add('hidden');
}

function createLogisticsShipment(type) {
  const vendor = prompt(`Enter ${type === 'Inbound' ? 'Vendor' : 'Destination'} Name:`);
  if (!vendor) return;
  
  const date = prompt("Enter Expected Date (e.g. 2026-05-01):", new Date().toISOString().split('T')[0]);
  if (!date) return;
  
  state.logistics.push({
    id: 'TRK-' + Math.floor(Math.random() * 1000000),
    type: type,
    vendor: vendor,
    date: date,
    items: [],
    status: 'pending' // pending, completed
  });
  
  saveState();
  renderLogistics();
}

function renderLogistics() {
  if(!logisticsBody) return;
  logisticsBody.innerHTML = '';
  const filter = logisticsFilter.value;
  
  let visibleCount = 0;
  
  state.logistics.forEach((ship) => {
    if (filter !== 'all' && ship.status !== filter) return;
    
    visibleCount++;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong style="color:var(--accent-primary);">${ship.id}</strong></td>
      <td>${ship.type === 'Inbound' ? '<span style="color:var(--accent-success);">Inbound</span>' : '<span style="color:var(--accent-danger);">Outbound</span>'}</td>
      <td>${ship.vendor}</td>
      <td>${ship.date}</td>
      <td>${ship.items.length} Lines</td>
      <td>
        <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; background: ${ship.status === 'pending' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}; color: ${ship.status === 'pending' ? '#fde68a' : '#a7f3d0'};">
          ${ship.status.toUpperCase()}
        </span>
      </td>
      <td class="action-cell">
        ${ship.status === 'pending' ? `<button class="btn-icon-tiny edit" onclick="manageShipmentItems('${ship.id}')" title="Manage Items"><span class="material-symbols-outlined" style="font-size:16px;">category</span></button>` : ''}
        ${ship.status === 'pending' ? `<button class="btn-icon-tiny edit" onclick="processShipment('${ship.id}')" title="Process Shipment"><span class="material-symbols-outlined" style="font-size:16px;">check_circle</span></button>` : ''}
        <button class="btn-icon-tiny delete" onclick="deleteShipment('${ship.id}')" title="Delete"><span class="material-symbols-outlined" style="font-size:16px;">delete</span></button>
      </td>
    `;
    logisticsBody.appendChild(tr);
  });
  
  if(visibleCount === 0) {
    logisticsBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-muted); padding: 2rem;">No shipments found.</td></tr>`;
  }
}

function deleteShipment(id) {
  if (confirm("Are you sure you want to delete this tracking record?")) {
    state.logistics = state.logistics.filter(s => s.id !== id);
    saveState();
    renderLogistics();
  }
}

function manageShipmentItems(id) {
  const ship = state.logistics.find(s => s.id === id);
  if (!ship) return;
  
  const action = prompt("Type 'Add' to add an item, or 'Clear' to remove all items:");
  if (action && action.toLowerCase() === 'clear') {
    ship.items = [];
    saveState();
    renderLogistics();
    alert("Items cleared.");
    return;
  }
  
  if (action && action.toLowerCase() === 'add') {
    const prodName = prompt("Enter exact Product Name to track:");
    if (!prodName) return;
    const qtyStr = prompt("Enter Qty:");
    if (!qtyStr) return;
    
    ship.items.push({
      name: prodName.trim(),
      qty: parseInt(qtyStr) || 0
    });
    saveState();
    renderLogistics();
    alert("Item added to shipment.");
  }
}

function processShipment(id) {
  const ship = state.logistics.find(s => s.id === id);
  if (!ship) return;
  
  if (ship.items.length === 0) {
    if(!confirm("This shipment has 0 items logged. Mark as completed anyway?")) return;
  } else {
    if(!confirm(`Process shipment and adjust inventory by ${ship.items.length} line items automatically?`)) return;
    
    // Attempt auto-resolve items
    let updatedItems = 0;
    ship.items.forEach(shipItem => {
      // Find matching items throughout store
      let resolved = false;
      Object.values(state.fixtures).forEach(f => {
        if (resolved) return;
        const matchingProd = f.products.find(p => p.name.toLowerCase() === shipItem.name.toLowerCase());
        if (matchingProd) {
          if (ship.type === 'Inbound') {
            matchingProd.qty += shipItem.qty;
          } else {
            // Outbound
            matchingProd.qty = Math.max(0, matchingProd.qty - shipItem.qty);
          }
          resolved = true;
          updatedItems++;
        }
      });
      if(!resolved && ship.type === 'Inbound') {
        alert(`Warning: Product "${shipItem.name}" was not found on any shelf. It was not automatically added. Please manually place it in the store.`);
      }
    });
    alert(`Successfully processed. Adjusted inventory for ${updatedItems} matching items!`);
  }
  
  ship.status = 'completed';
  saveState();
  renderLogistics();
  updateStats(); // Updates UI
}

window.deleteShipment = deleteShipment;
window.manageShipmentItems = manageShipmentItems;
window.processShipment = processShipment;

// ----- Analytics System -----
function openAnalytics() {
  analyticsModal.classList.remove('hidden');
  renderRevenueChart();
}

function closeAnalytics() {
  analyticsModal.classList.add('hidden');
}

function renderRevenueChart() {
  const ctx = document.getElementById('revenue-chart').getContext('2d');
  
  // Prepare data
  const labels = [];
  const data = [];
  let totalRev = 0;
  
  // Sort by revenue descending
  const sortedSales = Object.entries(state.salesData || {}).sort((a,b) => b[1].revenue - a[1].revenue);
  
  sortedSales.forEach(([name, stats]) => {
    labels.push(name);
    data.push(stats.revenue);
    totalRev += stats.revenue;
  });
  
  analyticsTotalRev.textContent = `$${totalRev.toFixed(2)}`;

  if (revenueChartInstance) {
    revenueChartInstance.destroy();
  }
  
  // Dark theme chart configuration
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
  
  revenueChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Revenue ($)',
        data: data,
        backgroundColor: 'rgba(56, 189, 248, 0.5)',
        borderColor: 'rgba(56, 189, 248, 1)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#fff',
          bodyColor: '#38bdf8',
          callbacks: {
            label: function(context) {
              return 'Revenue: $' + context.raw.toFixed(2);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value;
            }
          }
        }
      }
    }
  });
}

// --- Barcode Camera Scanning Logic ---
function startCameraScan() {
  if (!window.Html5Qrcode) { alert("Camera library not loaded!"); return; }
  readerContainer.classList.remove('hidden');
  html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 150 } }, (decodedText) => {
    prodBarcodeInput.value = decodedText;
    stopCameraScan();
  }).catch(err => console.warn("Scanner error:", err));
}

function stopCameraScan() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
      html5QrCode = null;
      readerContainer.classList.add('hidden');
    }).catch(err => console.warn(err));
  } else {
    readerContainer.classList.add('hidden');
  }
}

function startPosCameraScan() {
  if (!window.Html5Qrcode) { alert("Camera library not loaded!"); return; }
  posReaderCont.classList.remove('hidden');
  posQrCode = new Html5Qrcode("pos-reader");
  posQrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 150 } }, (decodedText) => {
    posBarcode.value = decodedText;
    handlePosBarcodeScanned(decodedText);
    stopPosCameraScan();
  }).catch(err => console.warn("POS Scanner error:", err));
}

function stopPosCameraScan() {
  if (posQrCode) {
    posQrCode.stop().then(() => {
      posQrCode.clear();
      posQrCode = null;
      posReaderCont.classList.add('hidden');
    }).catch(err => console.warn(err));
  } else {
    posReaderCont.classList.add('hidden');
  }
}

// ----- Table Service System -----
function openTablePanel(fixtureId) {
  closeInventory();
  closePos();
  
  const fixture = state.fixtures[fixtureId];
  if(!fixture) return;
  
  tablePanel.classList.remove('hidden');
  renderTablePanel(fixture);
}

function closeTablePanel() {
  tablePanel.classList.add('hidden');
}

function renderTablePanel(fixture) {
  tableServiceName.textContent = `Table (Row ${fixture.row+1}, Col ${fixture.col+1})`;
  if (fixture.status === 'seated') {
     tableServiceStatus.textContent = `Seated (${fixture.seats} Customers)`;
     tableOrdersContainer.style.opacity = '1';
     tableOrdersContainer.style.pointerEvents = 'auto';
     btnSeatTable.disabled = true;
  } else {
     tableServiceStatus.textContent = `Available`;
     tableOrdersContainer.style.opacity = '0.5';
     tableOrdersContainer.style.pointerEvents = 'none';
     btnSeatTable.disabled = false;
  }
  
  // Build menu
  tableMenuAdd.innerHTML = '<option value="">- Add Menu Item (from Inventory) -</option>';
  const products = getAllStoreProducts();
  products.forEach(p => {
    if (p.qty > 0) {
       const opt = document.createElement('option');
       opt.value = `${p.sourceFixtureId}|${p.id}`;
       opt.textContent = `${p.name} ($${p.price.toFixed(2)}) - ${p.qty} in stock`;
       tableMenuAdd.appendChild(opt);
    }
  });
  
  tableOrderList.innerHTML = '';
  if (!fixture.order || fixture.order.length === 0) {
     tableOrderList.innerHTML = `<li class="instruction-text" style="text-align:center; padding: 1rem 0;">No items ordered.</li>`;
  } else {
     fixture.order.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'product-item';
        li.style.background = item.sent ? 'rgba(0,0,0,0.5)' : 'rgba(245, 158, 11, 0.1)';
        li.innerHTML = `
          <div class="prod-info">
            <h4>${item.name} ${item.sent ? '<span style="color:#6366f1; font-size:0.7rem; vertical-align:top;">(Sent to Kitchen)</span>' : ''}</h4>
            <div class="prod-details">Qty: ${item.qtyToSell} • <span style="color:var(--accent-warning);">$${item.price.toFixed(2)}</span></div>
          </div>
          <button class="icon-btn del-btn" style="position:static" onclick="removeTableOrderItem('${fixture.id}', ${idx})">
             <span class="material-symbols-outlined">delete</span>
          </button>
        `;
        tableOrderList.appendChild(li);
     });
  }
}

function handleSeatTable() {
  const f = state.fixtures[state.selectedFixtureId];
  if(f && f.type === 'table') {
    f.status = 'seated';
    f.seats = parseInt(tableSeatsInput.value) || 1;
    f.order = f.order || [];
    renderTablePanel(f);
    renderFixtures();
    saveState();
  }
}

function handleClearTable() {
  const f = state.fixtures[state.selectedFixtureId];
  if(f && f.type === 'table') {
    if (f.order && f.order.length > 0) {
      if (!confirm("This table still has open orders. Clean anyway?")) return;
    }
    f.status = 'available';
    f.seats = 0;
    f.order = [];
    tableSeatsInput.value = '';
    renderTablePanel(f);
    renderFixtures();
    saveState();
  }
}

function handleTableMenuAdd(e) {
  const valString = e.target.value;
  if(!valString) return;
  const [fId, pId] = valString.split('|');
  const sourceF = state.fixtures[fId];
  const prod = sourceF?.products.find(p => p.id === pId);
  const f = state.fixtures[state.selectedFixtureId];
  
  if (prod && f && f.type === 'table') {
     f.order = f.order || [];
     const existing = f.order.find(o => o.id === prod.id && !o.sent);
     
     // Stock Check
     const totalOrdered = f.order.reduce((sum, o) => o.id === prod.id ? sum + o.qtyToSell : sum, 0);
     if (totalOrdered + 1 > prod.qty) {
        alert("Not enough stock for this menu item!");
        e.target.value = '';
        return;
     }

     if (existing) existing.qtyToSell += 1;
     else {
       f.order.push({
         id: prod.id,
         name: prod.name,
         price: prod.price,
         sourceFixtureId: fId,
         qtyToSell: 1,
         sent: false
       });
     }
     renderTablePanel(f);
     saveState();
  }
  e.target.value = '';
}

window.removeTableOrderItem = function(fixtureId, orderIdx) {
  const f = state.fixtures[fixtureId];
  if(f && f.order) {
    if (f.order[orderIdx].sent) {
       if(!confirm("Item is already cooking! Are you sure you want to remove it?")) return;
    }
    f.order.splice(orderIdx, 1);
    renderTablePanel(f);
    saveState();
  }
}

function handleSendKitchen() {
  const f = state.fixtures[state.selectedFixtureId];
  if(f && f.order) {
    if(f.order.length === 0) return alert("Nothing to send.");
    f.order.forEach(o => o.sent = true);
    renderTablePanel(f);
    saveState();
  }
}

function handleTableCheckout() {
  const f = state.fixtures[state.selectedFixtureId];
  if(!f || !f.order || f.order.length === 0) return alert("No items on table to checkout.");
  
  let subtotal = 0;
  f.order.forEach(item => {
    subtotal += (item.price * item.qtyToSell);
    // Deduct stock
    const sourceFixture = state.fixtures[item.sourceFixtureId];
    if(sourceFixture) {
       const realProd = sourceFixture.products.find(p => p.id === item.id);
       if(realProd) realProd.qty -= item.qtyToSell;
    }
    
    // Log target Sales Data
    const revVal = item.price * item.qtyToSell;
    if (!state.salesData[item.name]) state.salesData[item.name] = { revenue: 0, qtySold: 0 };
    state.salesData[item.name].revenue += revVal;
    state.salesData[item.name].qtySold += item.qtyToSell;
  });
  
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  
  generateReceiptModal(f.order, subtotal, tax, total, `Table ${f.row+1}-${f.col+1}`);
  
  f.status = 'available';
  f.seats = 0;
  f.order = [];
  tableSeatsInput.value = '';
  
  renderTablePanel(f);
  renderFixtures();
  saveState();
  updateStats();
}

// ----- Receipt Generator -----
function generateReceiptModal(items, subtotal, tax, total, transactionType) {
  receiptDate.textContent = `Date: ${new Date().toLocaleString()}`;
  receiptOrderId.textContent = `Txn: ${transactionType} | ID: ${Math.floor(Math.random()*90000)+10000}`;
  
  receiptItems.innerHTML = '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.style.marginBottom = '0.3rem';
    
    // Formatting name length for receipt ticker
    const maxName = item.name.length > 20 ? item.name.substring(0,18)+'..' : item.name;
    const namePart = `${item.qtyToSell}x ${maxName}`;
    const pricePart = `$${(item.price * item.qtyToSell).toFixed(2)}`;
    
    div.innerHTML = `<span>${namePart}</span><span>${pricePart}</span>`;
    receiptItems.appendChild(div);
  });
  
  receiptSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  receiptTax.textContent = `$${tax.toFixed(2)}`;
  receiptTotal.textContent = `$${total.toFixed(2)}`;
  
  receiptModal.classList.remove('hidden');
}

// Boot
init();

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(registration => {
      console.log('SW registered successfully:', registration.scope);
    }).catch(error => {
      console.log('SW registration failed:', error);
    });
  });
}
