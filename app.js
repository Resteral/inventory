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
  draggingFixtureId: null,
  gridRows: 15,
  gridCols: 25,
  gridCellSize: 45,
  floorTheme: 'default',
  storeName: 'My Store',
  menu: [], // [{ id, name, price, category, description }]
  menuCategories: ['Appetizers', 'Entrees', 'Sides', 'Drinks', 'Desserts', 'Specials'],
  fixtures: {}, // id: { type, row, col, products: [] }
  selectedFixtureId: null,
  logistics: [], // [{ id, type, vendor, date, items: [], status }]
  salesData: {}, // { [prodName]: { revenue: 0, qtySold: 0 } }
  opsMode: 'restaurant'
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
const invFixtureTypeSelect = document.getElementById('inv-fixture-type-select');
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
const tableSeatSelect = document.getElementById('table-seat-select');
const tableMenuAdd = document.getElementById('table-menu-add');
const tableOrderList = document.getElementById('table-order-list');
const tableRunningTotal = document.getElementById('table-running-total');
const btnSendKitchen = document.getElementById('btn-send-kitchen');
const btnCheckoutTable = document.getElementById('btn-checkout-table');

// Mobile UI Elements
const sidePanel = document.getElementById('side-panel');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileCloseSidebar = document.getElementById('mobile-close-sidebar');
const mobileMoreToggle = document.getElementById('mobile-more-toggle');
const mobileMoreMenu = document.getElementById('mobile-more-menu');

const mobileMenuLink = document.getElementById('mobile-menu-link');
const mobileInventoryLink = document.getElementById('mobile-inventory-link');
const mobileLogisticsLink = document.getElementById('mobile-logistics-link');
const mobileAnalyticsLink = document.getElementById('mobile-analytics-link');
const opsModeSelect = document.getElementById('ops-mode-select');

const receiptModal = document.getElementById('receipt-modal');
const receiptDate = document.getElementById('receipt-date');
const receiptOrderId = document.getElementById('receipt-order-id');
const receiptTableInfo = document.getElementById('receipt-table-info');
const receiptServerInfo = document.getElementById('receipt-server-info');
const receiptItems = document.getElementById('receipt-items');
const receiptSubtotal = document.getElementById('receipt-subtotal');
const receiptTax = document.getElementById('receipt-tax');
const receiptTotal = document.getElementById('receipt-total');
const receiptCheckInfo = document.getElementById('receipt-check-info');
const btnCloseReceipt = document.getElementById('btn-close-receipt');
const btnNextReceipt = document.getElementById('btn-next-receipt');
const btnPrintReceipt = document.getElementById('btn-print-receipt');

// Floor Plan Settings Elements
const floorSettingsToggle = document.getElementById('floor-settings-toggle');
const floorSettings = document.getElementById('floor-settings');
const gridRowsSlider = document.getElementById('grid-rows-slider');
const gridColsSlider = document.getElementById('grid-cols-slider');
const gridCellSlider = document.getElementById('grid-cell-slider');
const gridRowsVal = document.getElementById('grid-rows-val');
const gridColsVal = document.getElementById('grid-cols-val');
const gridCellVal = document.getElementById('grid-cell-val');
const floorThemeSelect = document.getElementById('floor-theme-select');
const applyGridBtn = document.getElementById('apply-grid-btn');

// Split Check Elements
const splitCheckModal = document.getElementById('split-check-modal');
const closeSplitCheck = document.getElementById('close-split-check');
const btnSingleCheck = document.getElementById('btn-single-check');
const btnPerSeatCheck = document.getElementById('btn-per-seat-check');
const btnCustomSplit = document.getElementById('btn-custom-split');
const splitCheckSeats = document.getElementById('split-check-seats');
const splitCheckSummary = document.getElementById('split-check-summary');
const btnProcessChecks = document.getElementById('btn-process-checks');

// Receipt queue for multi-check display
let receiptQueue = [];
let receiptQueueIndex = 0;

// Icons Mapping
const icons = {
  shelf: 'shelves',
  cooler: 'kitchen',
  register: 'point_of_sale',
  door: 'door_front',
  table: 'table_restaurant',
  kitchen: 'soup_kitchen',
  eraser: 'delete'
};

const labels = {
  shelf: 'Aisle Shelf',
  cooler: 'Cooler',
  register: 'Register',
  door: 'Entrance Door',
  table: 'Dining Table',
  kitchen: 'Prep Kitchen',
  eraser: 'Eraser'
};

function getIcon(type) { return icons[type] || 'help'; }
function getLabel(type) { return labels[type] || type || 'Unknown'; }

// Persistence
const DB_KEY = 'topfloor_cstore_layout';

function saveState() {
  localStorage.setItem(DB_KEY, JSON.stringify({
    fixtures: state.fixtures,
    logistics: state.logistics,
    salesData: state.salesData,
    gridRows: state.gridRows,
    gridCols: state.gridCols,
    gridCellSize: state.gridCellSize || 45,
    floorTheme: state.floorTheme || 'default',
    storeName: state.storeName || 'My Store',
    menu: state.menu || [],
    menuCategories: state.menuCategories,
    opsMode: state.opsMode
  }));
}

function loadState() {
  const saved = localStorage.getItem(DB_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.fixtures !== undefined) {
        state.fixtures = parsed.fixtures;
        state.logistics = parsed.logistics || [];
        state.salesData = parsed.salesData || {};
        if (parsed.gridRows) state.gridRows = parsed.gridRows;
        if (parsed.gridCols) state.gridCols = parsed.gridCols;
        if (parsed.gridCellSize) state.gridCellSize = parsed.gridCellSize;
        if (parsed.floorTheme) state.floorTheme = parsed.floorTheme;
        if (parsed.storeName) state.storeName = parsed.storeName;
        if (parsed.menu) state.menu = parsed.menu;
        if (parsed.menuCategories) state.menuCategories = parsed.menuCategories;
        if (parsed.opsMode) state.opsMode = parsed.opsMode;
      } else {
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

async function handleAuth() {
  if (!dbClient) {
    authError.textContent = "Database not configured. Running in local-only mode.";
    authError.style.display = 'block';
    authError.style.color = 'var(--accent-warning)';
    // Allow using the app without auth
    setTimeout(() => authModal.classList.add('hidden'), 1500);
    return;
  }

  try {
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
  } catch(e) {
    console.warn('Auth check failed:', e);
    authModal.classList.add('hidden');
  }
}

function showAuthError(msg) {
  authError.textContent = msg;
  authError.style.display = 'block';
}

function updateOpsMode() {
  const mode = opsModeSelect.value;
  state.opsMode = mode;
  
  // Update mobile header text
  const mobileHeaders = document.querySelectorAll('.mobile-header div');
  mobileHeaders.forEach(el => {
    if (el.textContent.includes('OPS') || el.textContent.includes('STORE')) {
        el.textContent = mode === 'restaurant' ? '🍴 RESTAURANT OPS' : '🏪 C-STORE OPS';
    }
  });

  // Filter tools
  toolBtns.forEach(btn => {
    const niche = btn.dataset.niche;
    if (!niche || niche === mode) {
      btn.style.display = 'flex';
    } else {
      btn.style.display = 'none';
      btn.classList.remove('active');
    }
  });

  // Filter Action Buttons
  const actionBtns = document.querySelectorAll('.action-buttons button[data-niche]');
  actionBtns.forEach(btn => {
    const niche = btn.dataset.niche;
    if (niche === mode) {
      btn.style.display = 'flex';
    } else {
      btn.style.display = 'none';
    }
  });

  // Ensure an active tool is selected
  const currentVisible = Array.from(toolBtns).find(b => b.dataset.type === state.currentTool && b.style.display !== 'none');
  if (!currentVisible) {
    const firstVisible = Array.from(toolBtns).find(b => b.style.display !== 'none');
    if (firstVisible) {
      toolBtns.forEach(b => b.classList.remove('active'));
      firstVisible.classList.add('active');
      state.currentTool = firstVisible.dataset.type;
    }
  } else {
      toolBtns.forEach(b => b.classList.remove('active'));
      currentVisible.classList.add('active');
  }

  saveState();
}

function closeSidebarOnMobile() {
  if (window.innerWidth <= 900 && sidePanel) {
    sidePanel.classList.remove('show');
  }
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


const btnGuest = document.getElementById('btn-guest');
if (btnGuest) {
  btnGuest.addEventListener('click', () => {
    // Force immediate hide without transition for guest mode
    authModal.style.transition = 'none';
    authModal.classList.add('hidden');
    console.log("Running in guest mode (local storage only).");
    // Restore transition for other modals later
    setTimeout(() => { if(authModal) authModal.style.transition = ''; }, 100);
  });
}

function applyStoreName() {
  const name = state.storeName || 'My Store';
  document.getElementById('store-name-display').textContent = name;
  document.getElementById('receipt-store-name').textContent = name;
  document.title = `${name} - Layout & Inventory Mapper`;
}

// Initialize App
function init() {
  loadState();
  
  // Apply store name
  applyStoreName();
  
  // Click to rename store
  document.getElementById('store-name-container').addEventListener('click', () => {
    const newName = prompt('Enter your store name:', state.storeName);
    if (newName && newName.trim()) {
      state.storeName = newName.trim();
      applyStoreName();
      saveState();
    }
  });
  
  // Apply saved grid settings to sliders and CSS
  gridRowsSlider.value = state.gridRows;
  gridColsSlider.value = state.gridCols;
  gridRowsVal.textContent = state.gridRows;
  gridColsVal.textContent = state.gridCols;
  gridCellSlider.value = state.gridCellSize;
  gridCellVal.textContent = state.gridCellSize + 'px';
  document.documentElement.style.setProperty('--grid-size', state.gridCellSize + 'px');
  floorThemeSelect.value = state.floorTheme;
  applyFloorTheme(state.floorTheme);
  
  // Initialize Ops Mode
  if (opsModeSelect) {
    opsModeSelect.value = state.opsMode || 'restaurant';
    updateOpsMode();
  }
  
  // Build grid, attach listeners, render — all synchronous
  createGrid();
  setupEventListeners();
  renderFixtures();
  updateStats();
  
  // Auth is best-effort — errors must not break the app
  try {
    handleAuth();
  } catch(e) {
    console.warn('Auth initialization failed:', e);
  }
}

// Generate the 2D Grid Cells
let gridTouchMoveHandler = null;
function createGrid() {
  storeGrid.innerHTML = '';
  // Set explicit CSS grid template using current state
  const cellSize = state.gridCellSize + 'px';
  storeGrid.style.gridTemplateColumns = `repeat(${state.gridCols}, ${cellSize})`;
  storeGrid.style.gridTemplateRows = `repeat(${state.gridRows}, ${cellSize})`;

  for (let r = 0; r < state.gridRows; r++) {
    for (let c = 0; c < state.gridCols; c++) {
      const cell = document.createElement('div');
      cell.classList.add('grid-cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      
      cell.addEventListener('mousedown', (e) => handleCellInteraction(e, r, c));
      cell.addEventListener('mouseenter', (e) => {
        if (e.buttons === 1 && !state.draggingFixtureId) handleCellInteraction(e, r, c); 
      });
      
      // Drag and Drop
      cell.addEventListener('dragover', (e) => {
        e.preventDefault(); // Required to allow drop
        cell.classList.add('drag-over');
      });
      cell.addEventListener('dragleave', () => cell.classList.remove('drag-over'));
      cell.addEventListener('drop', (e) => {
        e.preventDefault();
        cell.classList.remove('drag-over');
        const fixtureId = e.dataTransfer.getData('text/plain');
        if (fixtureId && state.fixtures[fixtureId]) {
          state.fixtures[fixtureId].row = parseInt(cell.dataset.row);
          state.fixtures[fixtureId].col = parseInt(cell.dataset.col);
          renderFixtures();
          saveState();
        }
      });

      cell.addEventListener('touchstart', (e) => {
        handleCellInteraction(e, r, c);
      }, {passive: true});

      storeGrid.appendChild(cell);
    }
  }

  // Remove old touchmove handler to prevent stacking
  if (gridTouchMoveHandler) {
    storeGrid.removeEventListener('touchmove', gridTouchMoveHandler);
  }
  // Handle continuous finger sliding across the grid on phones
  gridTouchMoveHandler = (e) => {
    if (state.mode !== 'edit') return;
    e.preventDefault();
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target) {
       const cell = target.closest('.grid-cell');
       if (cell) {
         handleCellInteraction(e, cell.dataset.row, cell.dataset.col);
       }
    }
  };
  storeGrid.addEventListener('touchmove', gridTouchMoveHandler, { passive: false });
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
      
      // Auto-hide sidebar on mobile after choosing a tool
      if (window.innerWidth <= 900) {
        sidePanel.classList.remove('show');
      }
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
  tableSeatSelect.addEventListener('change', handleSeatFilterChange);
  // Use event delegation on the panel for table-menu-add in case innerHTML rebuilds
  tablePanel.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'table-menu-add') {
      handleTableMenuAdd(e);
    }
  });
  btnSendKitchen.addEventListener('click', handleSendKitchen);
  btnCheckoutTable.addEventListener('click', handleTableCheckout);
  
  btnCloseReceipt.addEventListener('click', handleCloseReceipt);
  btnNextReceipt.addEventListener('click', handleNextReceipt);
  btnPrintReceipt.addEventListener('click', () => window.print());

  // Floor Plan Settings
  floorSettingsToggle.addEventListener('click', () => {
    floorSettings.classList.toggle('hidden');
    // Hide sidebar on mobile if opening floor settings
    if (window.innerWidth <= 900) sidePanel.classList.remove('show');
  });

  // Mobile Specific Listeners
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      sidePanel.classList.add('show');
    });
  }
  if (mobileCloseSidebar) {
    mobileCloseSidebar.addEventListener('click', () => {
      sidePanel.classList.remove('show');
    });
  }
  
  if (mobileMoreToggle) {
    mobileMoreToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMoreMenu.classList.toggle('hidden');
      
      // Filter menu items by niche
      const menuItems = mobileMoreMenu.querySelectorAll('button[data-niche]');
      menuItems.forEach(item => {
        if (item.dataset.niche === state.opsMode || !item.dataset.niche) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // Mobile Menu Links
  if (mobileMenuLink) mobileMenuLink.addEventListener('click', () => { menuModal.classList.remove('hidden'); mobileMoreMenu.classList.add('hidden'); renderMenuTable(); });
  if (mobileInventoryLink) mobileInventoryLink.addEventListener('click', () => { openMasterInventory(); mobileMoreMenu.classList.add('hidden'); });
  if (mobileLogisticsLink) mobileLogisticsLink.addEventListener('click', () => { openLogistics(); mobileMoreMenu.classList.add('hidden'); });
  if (mobileAnalyticsLink) mobileAnalyticsLink.addEventListener('click', () => { openAnalytics(); mobileMoreMenu.classList.add('hidden'); });

  // Close menu when clicking outside
  window.addEventListener('click', () => {
    if (mobileMoreMenu) mobileMoreMenu.classList.add('hidden');
  });

  // Handle generic modal closures for mobile
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        if (typeof stopScanner === 'function') stopScanner();
      }
    });
  });
  gridRowsSlider.addEventListener('input', () => {
    gridRowsVal.textContent = gridRowsSlider.value;
  });
  gridColsSlider.addEventListener('input', () => {
    gridColsVal.textContent = gridColsSlider.value;
  });
  gridCellSlider.addEventListener('input', () => {
    gridCellVal.textContent = gridCellSlider.value + 'px';
  });
  applyGridBtn.addEventListener('click', applyGridSettings);

  // Fixture Type Change
  if (invFixtureTypeSelect) {
    invFixtureTypeSelect.addEventListener('change', () => {
      const fixtureId = state.selectedFixtureId;
      if (!fixtureId || !state.fixtures[fixtureId]) return;
      
      const newType = invFixtureTypeSelect.value;
      state.fixtures[fixtureId].type = newType;
      invFixtureIcon.textContent = getIcon(newType);
      
      renderFixtures();
      saveState();
    });
  }

  // Ops Mode Switch
  if (opsModeSelect) {
    opsModeSelect.addEventListener('change', updateOpsMode);
  }

  // Split Check
  closeSplitCheck.addEventListener('click', () => splitCheckModal.classList.add('hidden'));
  btnSingleCheck.addEventListener('click', () => applySplitPreset('single'));
  btnPerSeatCheck.addEventListener('click', () => applySplitPreset('per-seat'));
  btnCustomSplit.addEventListener('click', () => applySplitPreset('custom'));
  btnProcessChecks.addEventListener('click', processAndPrintChecks);
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

  // Count table numbers for labeling
  let tableCounter = 0;
  const tableNumbers = {};
  Object.values(state.fixtures)
    .filter(f => f.type === 'table')
    .sort((a, b) => (a.row * 100 + a.col) - (b.row * 100 + b.col))
    .forEach(f => {
      tableCounter++;
      tableNumbers[f.id] = tableCounter;
    });

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

    // Add label for tables (T1, T2...) and registers (R1, R2...)
    let labelHtml = '';
    if (fixture.type === 'table' && tableNumbers[fixture.id]) {
      labelHtml = `<span class="fixture-label">T${tableNumbers[fixture.id]}</span>`;
    }

    const invDot = (fixture.products && fixture.products.length > 0) ? '<span class="inv-dot"></span>' : '';
    fDiv.innerHTML = `<span class="material-symbols-outlined">${getIcon(fixture.type)}</span>${labelHtml}${invDot}`;
    
    // Drag & Drop for Layout Changes
    fDiv.draggable = state.mode === 'edit';
    fDiv.addEventListener('dragstart', (e) => {
      state.draggingFixtureId = fixture.id;
      e.dataTransfer.setData('text/plain', fixture.id);
      fDiv.style.opacity = '0.4';
    });
    fDiv.addEventListener('dragend', () => {
      state.draggingFixtureId = null;
      fDiv.style.opacity = '1';
    });

    // Fixture click listener
    fDiv.addEventListener('mousedown', (e) => handleFixtureClick(e, fixture.id));
    fDiv.addEventListener('touchstart', (e) => handleFixtureClick(e, fixture.id), {passive: true});

    cell.appendChild(fDiv);
  });
}

// Inventory UI
function openInventory(fixtureId) {
  closeSidebarOnMobile();
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
  
  invFixtureIcon.textContent = getIcon(fixture.type);
  invFixtureTypeSelect.value = fixture.type;
  invFixtureLoc.textContent = `Location: Row ${fixture.row + 1}, Col ${fixture.col + 1}`;

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
  closeSidebarOnMobile();
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
  if (!fixture || !fixture.products) return;

  if (fixture.products.length === 0) {
    productList.innerHTML = `<div class="empty-state" style="grid-column:1/-1; padding:3rem; text-align:center; opacity:0.5;">
      <span class="material-symbols-outlined" style="font-size:3rem; margin-bottom:1rem;">inventory_2</span>
      <p>No items on this ${fixture.type} yet.</p>
    </div>`;
    return;
  }

  fixture.products.forEach((p, index) => {
    const div = document.createElement('div');
    div.className = 'product-card glass-panel';
    div.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      position: relative;
    `;

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <span class="material-symbols-outlined" style="color:var(--accent-primary); font-size:24px;">package_2</span>
        <div style="display:flex; gap:0.25rem;">
          <button class="btn-icon-tiny tag" onclick="showDigitalTag('${p.barcode}', '${p.name.replace(/'/g, "\\'")}', ${p.price}, ${p.qty})" title="Show Digital Tag">
            <span class="material-symbols-outlined" style="font-size:16px;">label_important</span>
          </button>
          <button class="btn-icon-tiny delete" onclick="deleteProduct(${index})" title="Remove Item">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
      <div style="font-weight:700; font-size:1rem; margin-top:0.5rem; color:var(--text-main);">${p.name}</div>
      <div style="font-size:0.75rem; color:var(--text-muted); font-family:monospace; margin-bottom:0.5rem;">#${p.barcode || 'N/A'}</div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:0.5rem; border-top:1px solid var(--border-color);">
        <div style="font-size:1rem; font-weight:800; color:var(--accent-success);">$${parseFloat(p.price).toFixed(2)}</div>
        <div style="background:rgba(56,189,248,0.1); color:var(--accent-primary); padding:2px 8px; border-radius:10px; font-size:0.7rem; font-weight:800;">QTY: ${p.qty}</div>
      </div>
    `;
    productList.appendChild(div);
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
  closeSidebarOnMobile();
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
    const locString = fixture ? `${getLabel(fixture.type)} (R${fixture.row+1}, C${fixture.col+1})` : 'Unknown';
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
        <button class="btn-icon-tiny tag" onclick="showDigitalTag('${p.barcode}', '${p.name.replace(/'/g, "\\'")}', ${p.price}, ${p.qty})" title="Digital Price Tag">
          <span class="material-symbols-outlined" style="font-size:16px;">label_important</span>
        </button>
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
  closeSidebarOnMobile();
  logisticsModal.classList.remove('hidden');
  renderLogistics();
  if (window.innerWidth <= 900) sidePanel.classList.remove('show');
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
  closeSidebarOnMobile();
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
  closeSidebarOnMobile();
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
     
     // Build seat selector dropdown
     const currentFilter = tableSeatSelect.value;
     tableSeatSelect.innerHTML = '<option value="all">All Seats</option>';
     for (let s = 1; s <= fixture.seats; s++) {
       const opt = document.createElement('option');
       opt.value = s;
       opt.textContent = `Seat ${s}`;
       tableSeatSelect.appendChild(opt);
     }
     // Restore previous selection if still valid
     if (currentFilter !== 'all' && parseInt(currentFilter) <= fixture.seats) {
       tableSeatSelect.value = currentFilter;
     } else {
       tableSeatSelect.value = 'all';
     }
  } else {
     tableServiceStatus.textContent = `Available`;
     tableOrdersContainer.style.opacity = '0.5';
     tableOrdersContainer.style.pointerEvents = 'none';
     btnSeatTable.disabled = false;
     tableSeatSelect.innerHTML = '<option value="all">All Seats</option>';
  }
  
  // Build menu dropdown — includes restaurant menu + inventory
  const selectedSeat = tableSeatSelect.value;
  const seatLabel = selectedSeat === 'all' ? '' : ` (Seat ${selectedSeat})`;
  tableMenuAdd.innerHTML = `<option value="">- Add Item${seatLabel} -</option>`;
  
  // Restaurant menu items first
  if (state.menu && state.menu.length > 0) {
    const menuGroup = document.createElement('optgroup');
    menuGroup.label = '🍽️ Restaurant Menu';
    // Group by category
    const catOrder = {};
    state.menu.forEach(m => {
      if (!catOrder[m.category]) catOrder[m.category] = [];
      catOrder[m.category].push(m);
    });
    Object.keys(catOrder).sort().forEach(cat => {
      catOrder[cat].forEach(m => {
        const opt = document.createElement('option');
        opt.value = `menu|${m.id}`;
        opt.textContent = `${m.name} ($${m.price.toFixed(2)}) — ${cat}`;
        menuGroup.appendChild(opt);
      });
    });
    tableMenuAdd.appendChild(menuGroup);
  }
  
  // Inventory items (from shelves, coolers, etc.)
  const products = getAllStoreProducts();
  const invItems = products.filter(p => p.qty > 0);
  if (invItems.length > 0) {
    const invGroup = document.createElement('optgroup');
    invGroup.label = '📦 Inventory';
    invItems.forEach(p => {
       const opt = document.createElement('option');
       opt.value = `${p.sourceFixtureId}|${p.id}`;
       opt.textContent = `${p.name} ($${p.price.toFixed(2)}) - ${p.qty} in stock`;
       invGroup.appendChild(opt);
    });
    tableMenuAdd.appendChild(invGroup);
  }
  
  // Render orders grouped by seat
  tableOrderList.innerHTML = '';
  const orders = fixture.order || [];
  let runningTotal = 0;
  orders.forEach(item => runningTotal += (item.price * item.qtyToSell));
  
  if (orders.length === 0) {
     tableOrderList.innerHTML = `<li class="instruction-text" style="text-align:center; padding: 1rem 0;">No items ordered.</li>`;
  } else {
     // Group by seat
     const seatGroups = {};
     orders.forEach((item, idx) => {
        const seatNum = item.seat || 1;
        if (!seatGroups[seatNum]) seatGroups[seatNum] = [];
        seatGroups[seatNum].push({ ...item, _idx: idx });
     });
     
     const seatFilter = tableSeatSelect.value;
     const seatKeys = Object.keys(seatGroups).sort((a, b) => parseInt(a) - parseInt(b));
     
     seatKeys.forEach(seatNum => {
        if (seatFilter !== 'all' && seatFilter !== seatNum) return;
        
        // Seat header
        const headerLi = document.createElement('li');
        headerLi.style.cssText = 'padding:0.5rem 0.8rem; margin-bottom:0.3rem; background:rgba(245,158,11,0.15); border-radius:6px; font-weight:700; font-size:0.82rem; letter-spacing:1px; color:#f59e0b; text-transform:uppercase; display:flex; align-items:center; gap:6px;';
        headerLi.innerHTML = `<span class="material-symbols-outlined" style="font-size:1rem;">person</span> Seat ${seatNum}`;
        tableOrderList.appendChild(headerLi);
        
        // Items for this seat
        seatGroups[seatNum].forEach(item => {
           const li = document.createElement('li');
           li.className = 'product-item';
           li.style.background = item.sent ? 'rgba(0,0,0,0.5)' : 'rgba(245, 158, 11, 0.08)';
           li.style.marginLeft = '0.5rem';
           li.style.borderLeft = '3px solid rgba(245,158,11,0.4)';
           li.innerHTML = `
             <div class="prod-info">
               <h4>${item.name} ${item.sent ? '<span style="color:#6366f1; font-size:0.7rem; vertical-align:top;">(Sent to Kitchen)</span>' : ''}</h4>
               <div class="prod-details">Qty: ${item.qtyToSell} • <span style="color:var(--accent-warning);">$${(item.price * item.qtyToSell).toFixed(2)}</span></div>
             </div>
             <button class="icon-btn del-btn" style="position:static" onclick="removeTableOrderItem('${fixture.id}', ${item._idx})">
                <span class="material-symbols-outlined">delete</span>
             </button>
           `;
           tableOrderList.appendChild(li);
        });
     });
  }
  
  // Update running total
  if (tableRunningTotal) {
    tableRunningTotal.textContent = `$${runningTotal.toFixed(2)}`;
  }
}

function handleSeatFilterChange() {
  const f = state.fixtures[state.selectedFixtureId];
  if (f && f.type === 'table') {
    renderTablePanel(f);
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
  const f = state.fixtures[state.selectedFixtureId];
  if (!f || f.type !== 'table') { e.target.value = ''; return; }
  
  // Determine which seat to assign this item to
  let seatNum = parseInt(tableSeatSelect.value);
  if (isNaN(seatNum) || tableSeatSelect.value === 'all') {
    seatNum = 1;
  }
  
  f.order = f.order || [];
  const [prefix, itemId] = valString.split('|');
  
  if (prefix === 'menu') {
    // Restaurant menu item (no inventory deduction)
    const menuItem = state.menu.find(m => m.id === itemId);
    if (!menuItem) { e.target.value = ''; return; }
    
    const existing = f.order.find(o => o.id === menuItem.id && !o.sent && o.seat === seatNum);
    if (existing) {
      existing.qtyToSell += 1;
    } else {
      f.order.push({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        sourceFixtureId: 'menu',
        qtyToSell: 1,
        sent: false,
        seat: seatNum
      });
    }
    renderTablePanel(f);
    saveState();
  } else {
    // Inventory item (deducts stock on checkout)
    const sourceF = state.fixtures[prefix];
    const prod = sourceF?.products.find(p => p.id === itemId);
    
    if (prod) {
      const existing = f.order.find(o => o.id === prod.id && !o.sent && o.seat === seatNum);
      
      // Stock Check across all seats
      const totalOrdered = f.order.reduce((sum, o) => o.id === prod.id ? sum + o.qtyToSell : sum, 0);
      if (totalOrdered + 1 > prod.qty) {
        alert("Not enough stock for this item!");
        e.target.value = '';
        return;
      }

      if (existing) existing.qtyToSell += 1;
      else {
        f.order.push({
          id: prod.id,
          name: prod.name,
          price: prod.price,
          sourceFixtureId: prefix,
          qtyToSell: 1,
          sent: false,
          seat: seatNum
        });
      }
      renderTablePanel(f);
      saveState();
    }
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
  
  // Open the split check modal instead of immediately generating receipt
  openSplitCheckModal(f);
}

// ===== Floor Plan Settings =====
function applyGridSettings() {
  const newRows = parseInt(gridRowsSlider.value);
  const newCols = parseInt(gridColsSlider.value);
  const newCellSize = parseInt(gridCellSlider.value);
  const newTheme = floorThemeSelect.value;
  
  // Remove fixtures that would be out of bounds
  Object.keys(state.fixtures).forEach(id => {
    const f = state.fixtures[id];
    if (parseInt(f.row) >= newRows || parseInt(f.col) >= newCols) {
      delete state.fixtures[id];
    }
  });
  
  state.gridRows = newRows;
  state.gridCols = newCols;
  state.gridCellSize = newCellSize;
  state.floorTheme = newTheme;
  
  document.documentElement.style.setProperty('--grid-size', newCellSize + 'px');
  applyFloorTheme(newTheme);
  
  createGrid();
  renderFixtures();
  updateStats();
  saveState();
}

function applyFloorTheme(theme) {
  const grid = document.getElementById('store-grid');
  // Remove existing theme classes
  grid.classList.remove('floor-theme-default', 'floor-theme-hardwood', 'floor-theme-marble', 'floor-theme-tile', 'floor-theme-blueprint');
  grid.classList.add(`floor-theme-${theme}`);
}

// ===== Split Check System =====
let splitCheckFixture = null;
let splitCheckMode = 'single'; // 'single', 'per-seat', 'custom'

function openSplitCheckModal(fixture) {
  splitCheckFixture = fixture;
  splitCheckModal.classList.remove('hidden');
  applySplitPreset('single');
}

function applySplitPreset(mode) {
  splitCheckMode = mode;
  
  // Update preset button styles
  [btnSingleCheck, btnPerSeatCheck, btnCustomSplit].forEach(b => b.classList.remove('btn-active'));
  if (mode === 'single') btnSingleCheck.classList.add('btn-active');
  if (mode === 'per-seat') btnPerSeatCheck.classList.add('btn-active');
  if (mode === 'custom') btnCustomSplit.classList.add('btn-active');
  
  renderSplitCheckSeats();
}

function renderSplitCheckSeats() {
  if (!splitCheckFixture || !splitCheckFixture.order) return;
  splitCheckSeats.innerHTML = '';
  
  // Group orders by seat
  const seatGroups = {};
  splitCheckFixture.order.forEach(item => {
    const s = item.seat || 1;
    if (!seatGroups[s]) seatGroups[s] = [];
    seatGroups[s].push(item);
  });
  
  const seatKeys = Object.keys(seatGroups).sort((a, b) => parseInt(a) - parseInt(b));
  const maxCheckNum = seatKeys.length;
  
  seatKeys.forEach(seatNum => {
    const items = seatGroups[seatNum];
    let seatTotal = 0;
    const itemNames = [];
    items.forEach(i => {
      seatTotal += i.price * i.qtyToSell;
      itemNames.push(`${i.qtyToSell}x ${i.name}`);
    });
    
    // Determine default check assignment based on mode
    let defaultCheck = 1;
    if (splitCheckMode === 'per-seat') defaultCheck = parseInt(seatNum);
    if (splitCheckMode === 'custom') defaultCheck = 1;
    
    const card = document.createElement('div');
    card.className = 'split-seat-card';
    card.dataset.seat = seatNum;
    
    // Build check options
    let optionsHtml = '';
    for (let c = 1; c <= maxCheckNum; c++) {
      optionsHtml += `<option value="${c}" ${c === defaultCheck ? 'selected' : ''}>Check ${c}</option>`;
    }
    
    card.innerHTML = `
      <div class="split-seat-icon">
        <span class="material-symbols-outlined">person</span>
      </div>
      <div class="split-seat-info">
        <h4>Seat ${seatNum}</h4>
        <small>${itemNames.join(', ')}</small>
      </div>
      <div style="text-align:right; margin-right:0.5rem;">
        <span style="font-weight:800; color:var(--accent-warning);">$${seatTotal.toFixed(2)}</span>
      </div>
      <select class="split-seat-select" data-seat="${seatNum}">
        ${optionsHtml}
      </select>
    `;
    
    const select = card.querySelector('select');
    select.addEventListener('change', updateSplitCheckSummary);
    
    splitCheckSeats.appendChild(card);
  });
  
  updateSplitCheckSummary();
}

function updateSplitCheckSummary() {
  if (!splitCheckFixture) return;
  
  const seatAssignments = {};
  splitCheckSeats.querySelectorAll('.split-seat-select').forEach(sel => {
    seatAssignments[sel.dataset.seat] = parseInt(sel.value);
  });
  
  // Group items by check
  const checks = {};
  splitCheckFixture.order.forEach(item => {
    const seatNum = item.seat || 1;
    const checkNum = seatAssignments[seatNum] || 1;
    if (!checks[checkNum]) checks[checkNum] = { items: [], subtotal: 0 };
    checks[checkNum].items.push(item);
    checks[checkNum].subtotal += item.price * item.qtyToSell;
  });
  
  splitCheckSummary.innerHTML = '';
  Object.keys(checks).sort((a,b) => a - b).forEach(checkNum => {
    const check = checks[checkNum];
    const tax = check.subtotal * 0.08;
    const total = check.subtotal + tax;
    const seatList = [];
    Object.entries(seatAssignments).forEach(([seat, chk]) => {
      if (chk === parseInt(checkNum)) seatList.push(`S${seat}`);
    });
    
    const div = document.createElement('div');
    div.className = 'split-check-total-card';
    div.innerHTML = `
      <span>
        <span class="check-label">Check ${checkNum}</span>
        <span style="color:var(--text-muted); font-size:0.75rem; margin-left:0.5rem;">(${seatList.join(', ')})</span>
      </span>
      <span class="check-amount">$${total.toFixed(2)}</span>
    `;
    splitCheckSummary.appendChild(div);
  });
}

function processAndPrintChecks() {
  if (!splitCheckFixture) return;
  const f = splitCheckFixture;
  
  // Get seat assignments
  const seatAssignments = {};
  splitCheckSeats.querySelectorAll('.split-seat-select').forEach(sel => {
    seatAssignments[sel.dataset.seat] = parseInt(sel.value);
  });
  
  // Deduct stock and log sales for ALL items first
  f.order.forEach(item => {
    // Only deduct stock for inventory items (not restaurant menu items)
    if (item.sourceFixtureId !== 'menu') {
      const sourceFixture = state.fixtures[item.sourceFixtureId];
      if(sourceFixture) {
         const realProd = sourceFixture.products.find(p => p.id === item.id);
         if(realProd) realProd.qty -= item.qtyToSell;
      }
    }
    const revVal = item.price * item.qtyToSell;
    if (!state.salesData[item.name]) state.salesData[item.name] = { revenue: 0, qtySold: 0 };
    state.salesData[item.name].revenue += revVal;
    state.salesData[item.name].qtySold += item.qtyToSell;
  });
  
  // Build receipts per check
  const checks = {};
  f.order.forEach(item => {
    const seatNum = item.seat || 1;
    const checkNum = seatAssignments[seatNum] || 1;
    if (!checks[checkNum]) checks[checkNum] = [];
    checks[checkNum].push(item);
  });
  
  const checkKeys = Object.keys(checks).sort((a,b) => a - b);
  const totalChecks = checkKeys.length;
  
  // Build receipt queue
  receiptQueue = [];
  receiptQueueIndex = 0;
  
  checkKeys.forEach(checkNum => {
    const items = checks[checkNum];
    let subtotal = 0;
    items.forEach(i => subtotal += i.price * i.qtyToSell);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    
    // Which seats are on this check
    const seatsOnCheck = [];
    Object.entries(seatAssignments).forEach(([seat, chk]) => {
      if (chk === parseInt(checkNum)) seatsOnCheck.push(seat);
    });
    
    receiptQueue.push({
      fixture: f,
      items,
      subtotal,
      tax,
      total,
      checkNum: parseInt(checkNum),
      totalChecks,
      seatsOnCheck,
      // Payment info filled in later
      paymentMethod: null,
      tip: 0,
      cashTendered: 0,
      changeDue: 0
    });
  });
  
  // Clear the table
  f.status = 'available';
  f.seats = 0;
  f.order = [];
  tableSeatsInput.value = '';
  
  renderTablePanel(f);
  renderFixtures();
  saveState();
  updateStats();
  
  // Close split check modal and start payment flow
  splitCheckModal.classList.add('hidden');
  closeTablePanel();
  openPaymentForCurrentCheck();
}

// ===== Payment Terminal System =====
const paymentModal = document.getElementById('payment-modal');
const closePaymentBtn = document.getElementById('close-payment');
const payCheckLabel = document.getElementById('pay-check-label');
const payCheckSeats = document.getElementById('pay-check-seats');
const payTotalDue = document.getElementById('pay-total-due');
const paySubtax = document.getElementById('pay-subtax');
const payTipDisplay = document.getElementById('pay-tip-display');
const payFinalTotal = document.getElementById('pay-final-total');
const payCustomTipRow = document.getElementById('pay-custom-tip-row');
const payCustomTip = document.getElementById('pay-custom-tip');
const payCashSection = document.getElementById('pay-cash-section');
const payCashTendered = document.getElementById('pay-cash-tendered');
const payQuickCash = document.getElementById('pay-quick-cash');
const payChangeDue = document.getElementById('pay-change-due');
const payChangeAmount = document.getElementById('pay-change-amount');
const btnCompletePayment = document.getElementById('btn-complete-payment');
const tipBtns = document.querySelectorAll('.pay-tip-btn');
const methodBtns = document.querySelectorAll('.pay-method-btn');

// Receipt payment info elements
const receiptPaymentInfo = document.getElementById('receipt-payment-info');
const receiptTipAmount = document.getElementById('receipt-tip-amount');
const receiptGrandWithTip = document.getElementById('receipt-grand-with-tip');
const receiptPayMethodLabel = document.getElementById('receipt-pay-method-label');
const receiptPaidAmount = document.getElementById('receipt-paid-amount');
const receiptChangeRow = document.getElementById('receipt-change-row');
const receiptChangeAmt = document.getElementById('receipt-change-amount');

let payCurrentTipPct = 20;
let payCurrentMethod = 'card';
let payCurrentCheckTotal = 0; // total before tip

// Setup payment listeners
closePaymentBtn.addEventListener('click', () => {
  paymentModal.classList.add('hidden');
});

tipBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tipBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const pct = btn.dataset.tipPct;
    if (pct === 'custom') {
      payCustomTipRow.classList.remove('hidden');
      payCurrentTipPct = -1; // signals custom
      payCustomTip.focus();
    } else {
      payCustomTipRow.classList.add('hidden');
      payCurrentTipPct = parseInt(pct);
    }
    updatePaymentTotals();
  });
});

payCustomTip.addEventListener('input', updatePaymentTotals);

methodBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    methodBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    payCurrentMethod = btn.dataset.method;
    if (payCurrentMethod === 'cash') {
      payCashSection.classList.remove('hidden');
      generateQuickCashButtons();
    } else {
      payCashSection.classList.add('hidden');
    }
  });
});

payCashTendered.addEventListener('input', updateCashChange);

btnCompletePayment.addEventListener('click', completePayment);

function openPaymentForCurrentCheck() {
  if (receiptQueueIndex >= receiptQueue.length) return;
  
  const r = receiptQueue[receiptQueueIndex];
  payCurrentCheckTotal = r.total;
  payCurrentTipPct = 20;
  payCurrentMethod = 'card';
  
  // Reset UI
  payCheckLabel.textContent = r.totalChecks > 1 ? `Check ${r.checkNum} of ${r.totalChecks}` : 'Check';
  payCheckSeats.textContent = `Seats: ${r.seatsOnCheck.join(', ')}`;
  payTotalDue.textContent = `$${r.total.toFixed(2)}`;
  paySubtax.textContent = `$${r.total.toFixed(2)}`;
  
  // Reset tips
  tipBtns.forEach(b => b.classList.remove('active'));
  document.querySelector('.pay-tip-btn[data-tip-pct="20"]').classList.add('active');
  payCustomTipRow.classList.add('hidden');
  payCustomTip.value = '';
  
  // Pre-calculate tip values for display
  const preSubtotal = r.subtotal; // use pre-tax subtotal for tip calculation
  document.getElementById('tip-15-val').textContent = `$${(preSubtotal * 0.15).toFixed(2)}`;
  document.getElementById('tip-18-val').textContent = `$${(preSubtotal * 0.18).toFixed(2)}`;
  document.getElementById('tip-20-val').textContent = `$${(preSubtotal * 0.20).toFixed(2)}`;
  document.getElementById('tip-25-val').textContent = `$${(preSubtotal * 0.25).toFixed(2)}`;
  
  // Reset payment method
  methodBtns.forEach(b => b.classList.remove('active'));
  document.querySelector('.pay-method-btn[data-method="card"]').classList.add('active');
  payCashSection.classList.add('hidden');
  payCashTendered.value = '';
  payChangeDue.classList.add('hidden');
  
  updatePaymentTotals();
  paymentModal.classList.remove('hidden');
}

function updatePaymentTotals() {
  const r = receiptQueue[receiptQueueIndex];
  if (!r) return;
  
  let tipAmount = 0;
  if (payCurrentTipPct === -1) {
    // Custom tip
    tipAmount = parseFloat(payCustomTip.value) || 0;
  } else {
    tipAmount = r.subtotal * (payCurrentTipPct / 100);
  }
  
  const finalTotal = r.total + tipAmount;
  
  paySubtax.textContent = `$${r.total.toFixed(2)}`;
  payTipDisplay.textContent = `$${tipAmount.toFixed(2)}`;
  payFinalTotal.textContent = `$${finalTotal.toFixed(2)}`;
  
  // Update cash change if visible
  if (payCurrentMethod === 'cash') {
    updateCashChange();
  }
}

function generateQuickCashButtons() {
  payQuickCash.innerHTML = '';
  const r = receiptQueue[receiptQueueIndex];
  if (!r) return;
  
  let tipAmount = 0;
  if (payCurrentTipPct === -1) {
    tipAmount = parseFloat(payCustomTip.value) || 0;
  } else {
    tipAmount = r.subtotal * (payCurrentTipPct / 100);
  }
  const finalTotal = r.total + tipAmount;
  
  // Generate smart quick-tender amounts
  const amounts = [];
  const rounded = Math.ceil(finalTotal);
  if (rounded > finalTotal) amounts.push(rounded);
  
  // Common bills
  [5, 10, 20, 50, 100].forEach(bill => {
    if (bill >= finalTotal && !amounts.includes(bill)) {
      amounts.push(bill);
    }
  });
  
  // Exact amount
  amounts.unshift(parseFloat(finalTotal.toFixed(2)));
  
  // Deduplicate and limit
  const unique = [...new Set(amounts)].slice(0, 5);
  
  unique.forEach(amt => {
    const btn = document.createElement('button');
    btn.textContent = `$${amt.toFixed(2)}`;
    btn.addEventListener('click', () => {
      payCashTendered.value = amt.toFixed(2);
      updateCashChange();
    });
    payQuickCash.appendChild(btn);
  });
}

function updateCashChange() {
  const r = receiptQueue[receiptQueueIndex];
  if (!r) return;
  
  let tipAmount = 0;
  if (payCurrentTipPct === -1) {
    tipAmount = parseFloat(payCustomTip.value) || 0;
  } else {
    tipAmount = r.subtotal * (payCurrentTipPct / 100);
  }
  const finalTotal = r.total + tipAmount;
  const tendered = parseFloat(payCashTendered.value) || 0;
  
  if (tendered > 0 && tendered >= finalTotal) {
    const change = tendered - finalTotal;
    payChangeDue.classList.remove('hidden');
    payChangeAmount.textContent = `$${change.toFixed(2)}`;
  } else if (tendered > 0) {
    payChangeDue.classList.remove('hidden');
    payChangeAmount.textContent = `Short $${(finalTotal - tendered).toFixed(2)}`;
    payChangeAmount.style.color = 'var(--accent-danger)';
  } else {
    payChangeDue.classList.add('hidden');
  }
  // Reset color
  if (tendered >= finalTotal) {
    payChangeAmount.style.color = 'var(--accent-success)';
  }
}

function completePayment() {
  const r = receiptQueue[receiptQueueIndex];
  if (!r) return;
  
  let tipAmount = 0;
  if (payCurrentTipPct === -1) {
    tipAmount = parseFloat(payCustomTip.value) || 0;
  } else {
    tipAmount = r.subtotal * (payCurrentTipPct / 100);
  }
  const finalTotal = r.total + tipAmount;
  
  // Validate cash
  if (payCurrentMethod === 'cash') {
    const tendered = parseFloat(payCashTendered.value) || 0;
    if (tendered < finalTotal) {
      alert(`Insufficient cash. Need $${finalTotal.toFixed(2)}, received $${tendered.toFixed(2)}.`);
      return;
    }
    r.cashTendered = tendered;
    r.changeDue = tendered - finalTotal;
  }
  
  // Store payment info on receipt queue entry
  r.paymentMethod = payCurrentMethod;
  r.tip = tipAmount;
  r.finalTotal = finalTotal;
  
  // Close payment and show receipt
  paymentModal.classList.add('hidden');
  showReceiptFromQueue();
}

function showReceiptFromQueue() {
  if (receiptQueueIndex >= receiptQueue.length) return;
  
  const r = receiptQueue[receiptQueueIndex];
  const now = new Date();
  const orderId = Math.floor(Math.random()*90000)+10000;
  
  receiptDate.textContent = now.toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  receiptOrderId.textContent = `Order #${orderId}`;
  receiptTableInfo.textContent = `Table: Row ${r.fixture.row+1}, Col ${r.fixture.col+1}`;
  receiptServerInfo.textContent = `Server: ${state.storeName} POS`;
  
  // Check info
  if (r.totalChecks > 1) {
    receiptCheckInfo.textContent = `CHECK ${r.checkNum} of ${r.totalChecks} — Seat${r.seatsOnCheck.length > 1 ? 's' : ''} ${r.seatsOnCheck.join(', ')}`;
    receiptCheckInfo.style.display = 'block';
  } else {
    receiptCheckInfo.textContent = '';
    receiptCheckInfo.style.display = 'none';
  }
  
  receiptItems.innerHTML = '';
  
  // Group items by seat for this check
  const seatGroups = {};
  r.items.forEach(item => {
    const seatNum = item.seat || 1;
    if (!seatGroups[seatNum]) seatGroups[seatNum] = [];
    seatGroups[seatNum].push(item);
  });
  
  const seatKeys = Object.keys(seatGroups).sort((a, b) => parseInt(a) - parseInt(b));
  
  seatKeys.forEach(seatNum => {
    const section = document.createElement('div');
    section.className = 'receipt-seat-section';
    
    if (seatKeys.length > 1 || r.totalChecks > 1) {
      const header = document.createElement('div');
      header.className = 'receipt-seat-header';
      header.textContent = `Seat ${seatNum}`;
      section.appendChild(header);
    }
    
    let seatTotal = 0;
    seatGroups[seatNum].forEach(item => {
      const row = document.createElement('div');
      row.className = 'receipt-item-row';
      const maxName = item.name.length > 22 ? item.name.substring(0, 20) + '..' : item.name;
      const lineTotal = item.price * item.qtyToSell;
      seatTotal += lineTotal;
      row.innerHTML = `
        <span class="item-name">${item.qtyToSell}x ${maxName}</span>
        <span class="item-price">$${lineTotal.toFixed(2)}</span>
      `;
      section.appendChild(row);
    });
    
    if (seatKeys.length > 1) {
      const seatSub = document.createElement('div');
      seatSub.className = 'receipt-seat-subtotal';
      seatSub.innerHTML = `<span>Seat ${seatNum} subtotal</span><span>$${seatTotal.toFixed(2)}</span>`;
      section.appendChild(seatSub);
    }
    
    receiptItems.appendChild(section);
  });
  
  receiptSubtotal.textContent = `$${r.subtotal.toFixed(2)}`;
  receiptTax.textContent = `$${r.tax.toFixed(2)}`;
  receiptTotal.textContent = `$${r.total.toFixed(2)}`;
  
  // Payment info section
  if (r.paymentMethod) {
    receiptPaymentInfo.style.display = 'block';
    receiptTipAmount.textContent = `$${r.tip.toFixed(2)}`;
    receiptGrandWithTip.textContent = `$${r.finalTotal.toFixed(2)}`;
    
    const methodLabels = { card: 'Card', cash: 'Cash', gift: 'Gift Card' };
    receiptPayMethodLabel.textContent = `Paid (${methodLabels[r.paymentMethod]}):`;
    
    if (r.paymentMethod === 'cash') {
      receiptPaidAmount.textContent = `$${r.cashTendered.toFixed(2)}`;
      receiptChangeRow.style.display = 'flex';
      receiptChangeAmt.textContent = `$${r.changeDue.toFixed(2)}`;
    } else {
      receiptPaidAmount.textContent = `$${r.finalTotal.toFixed(2)}`;
      receiptChangeRow.style.display = 'none';
    }
  } else {
    receiptPaymentInfo.style.display = 'none';
  }
  
  // Show/hide "Next Check" button
  if (receiptQueueIndex < receiptQueue.length - 1) {
    btnNextReceipt.style.display = 'block';
    btnNextReceipt.textContent = `Ring Up Next Check (${receiptQueueIndex + 2} of ${receiptQueue.length}) ▶`;
  } else {
    btnNextReceipt.style.display = 'none';
  }
  
  receiptModal.classList.remove('hidden');
}

function handleCloseReceipt() {
  receiptModal.classList.add('hidden');
  receiptQueue = [];
  receiptQueueIndex = 0;
  btnNextReceipt.style.display = 'none';
}

function handleNextReceipt() {
  receiptModal.classList.add('hidden');
  receiptQueueIndex++;
  // Open payment for next check
  openPaymentForCurrentCheck();
}

// ----- Receipt Generator (POS flat receipts) -----

function generateReceiptModal(items, subtotal, tax, total, transactionType) {
  const now = new Date();
  const orderId = Math.floor(Math.random()*90000)+10000;
  
  receiptDate.textContent = now.toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  receiptOrderId.textContent = `Order #${orderId}`;
  receiptTableInfo.textContent = transactionType;
  receiptServerInfo.textContent = `Cashier: ${state.storeName} POS`;
  receiptCheckInfo.textContent = '';
  receiptCheckInfo.style.display = 'none';
  btnNextReceipt.style.display = 'none';
  receiptPaymentInfo.style.display = 'none';
  
  receiptItems.innerHTML = '';
  
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'receipt-item-row';
    const maxName = item.name.length > 22 ? item.name.substring(0, 20) + '..' : item.name;
    const lineTotal = item.price * item.qtyToSell;
    
    row.innerHTML = `
      <span class="item-name">${item.qtyToSell}x ${maxName}</span>
      <span class="item-price">$${lineTotal.toFixed(2)}</span>
    `;
    receiptItems.appendChild(row);
  });
  
  receiptSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  receiptTax.textContent = `$${tax.toFixed(2)}`;
  receiptTotal.textContent = `$${total.toFixed(2)}`;
  
  receiptQueue = [];
  receiptQueueIndex = 0;
  receiptModal.classList.remove('hidden');
}

// ===== Menu Management System =====
const menuModal = document.getElementById('menu-modal');
const closeMenuModal = document.getElementById('close-menu-modal');
const menuFormTitle = document.getElementById('menu-form-title');
const menuItemCategory = document.getElementById('menu-item-category');
const menuItemName = document.getElementById('menu-item-name');
const menuItemPrice = document.getElementById('menu-item-price');
const menuItemDesc = document.getElementById('menu-item-desc');
const btnAddMenuItem = document.getElementById('btn-add-menu-item');
const btnCancelMenuEdit = document.getElementById('btn-cancel-menu-edit');
const menuCustomCat = document.getElementById('menu-custom-cat');
const btnAddCategory = document.getElementById('btn-add-category');
const menuCsvUpload = document.getElementById('menu-csv-upload');
const menuCategoryTabs = document.getElementById('menu-category-tabs');
const menuItemsBody = document.getElementById('menu-items-body');
const menuTotalItems = document.getElementById('menu-total-items');
const menuTotalCats = document.getElementById('menu-total-cats');

let menuEditId = null; // null = add mode, string = editing
let menuFilterCategory = 'All';

// Open/close
document.getElementById('menu-mgmt-btn').addEventListener('click', () => {
  closeSidebarOnMobile();
  menuModal.classList.remove('hidden');
  menuEditId = null;
  clearMenuForm();
  syncMenuCategoryDropdown();
  renderMenuTable();
  renderMenuCategoryTabs();
});
closeMenuModal.addEventListener('click', () => menuModal.classList.add('hidden'));

// Add / Edit item
btnAddMenuItem.addEventListener('click', () => {
  const name = menuItemName.value.trim();
  const price = parseFloat(menuItemPrice.value);
  const category = menuItemCategory.value;
  const desc = menuItemDesc.value.trim();
  
  if (!name) return alert('Enter an item name.');
  if (isNaN(price) || price < 0) return alert('Enter a valid price.');
  
  if (menuEditId) {
    // Edit existing
    const item = state.menu.find(m => m.id === menuEditId);
    if (item) {
      item.name = name;
      item.price = price;
      item.category = category;
      item.description = desc;
    }
    menuEditId = null;
    menuFormTitle.textContent = 'Add Menu Item';
    btnAddMenuItem.textContent = 'Add to Menu';
    btnCancelMenuEdit.style.display = 'none';
  } else {
    // Add new
    state.menu.push({
      id: 'mi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name,
      price,
      category,
      description: desc
    });
  }
  
  clearMenuForm();
  renderMenuTable();
  renderMenuCategoryTabs();
  saveState();
});

// Cancel edit
btnCancelMenuEdit.addEventListener('click', () => {
  menuEditId = null;
  menuFormTitle.textContent = 'Add Menu Item';
  btnAddMenuItem.textContent = 'Add to Menu';
  btnCancelMenuEdit.style.display = 'none';
  clearMenuForm();
});

// Add custom category
btnAddCategory.addEventListener('click', () => {
  const cat = menuCustomCat.value.trim();
  if (!cat) return;
  if (!state.menuCategories.includes(cat)) {
    state.menuCategories.push(cat);
    syncMenuCategoryDropdown();
    renderMenuCategoryTabs();
    saveState();
  }
  menuCustomCat.value = '';
  menuItemCategory.value = cat;
});

// CSV Import
menuCsvUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (ev) => {
    const text = ev.target.result;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    let imported = 0;
    
    lines.forEach((line, idx) => {
      // Skip header row if it looks like one
      if (idx === 0 && line.toLowerCase().includes('category') && line.toLowerCase().includes('name')) return;
      
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        const category = parts[0];
        const name = parts[1];
        const price = parseFloat(parts[2]);
        const desc = parts[3] || '';
        
        if (name && !isNaN(price)) {
          // Add category if new
          if (!state.menuCategories.includes(category)) {
            state.menuCategories.push(category);
          }
          
          state.menu.push({
            id: 'mi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) + '_' + idx,
            name,
            price,
            category,
            description: desc
          });
          imported++;
        }
      }
    });
    
    syncMenuCategoryDropdown();
    renderMenuTable();
    renderMenuCategoryTabs();
    saveState();
    alert(`Imported ${imported} menu items.`);
  };
  reader.readAsText(file);
  e.target.value = '';
});

function clearMenuForm() {
  menuItemName.value = '';
  menuItemPrice.value = '';
  menuItemDesc.value = '';
}

function syncMenuCategoryDropdown() {
  const currentVal = menuItemCategory.value;
  menuItemCategory.innerHTML = '';
  state.menuCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    menuItemCategory.appendChild(opt);
  });
  if (state.menuCategories.includes(currentVal)) {
    menuItemCategory.value = currentVal;
  }
}

function renderMenuCategoryTabs() {
  menuCategoryTabs.innerHTML = '';
  
  const allBtn = document.createElement('button');
  allBtn.className = `btn btn-sm ${menuFilterCategory === 'All' ? 'btn-active' : ''}`;
  allBtn.textContent = `All (${state.menu.length})`;
  allBtn.addEventListener('click', () => { menuFilterCategory = 'All'; renderMenuTable(); renderMenuCategoryTabs(); });
  menuCategoryTabs.appendChild(allBtn);
  
  // Only show categories that have items
  const usedCats = {};
  state.menu.forEach(m => {
    usedCats[m.category] = (usedCats[m.category] || 0) + 1;
  });
  
  Object.keys(usedCats).sort().forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `btn btn-sm ${menuFilterCategory === cat ? 'btn-active' : ''}`;
    btn.textContent = `${cat} (${usedCats[cat]})`;
    btn.addEventListener('click', () => { menuFilterCategory = cat; renderMenuTable(); renderMenuCategoryTabs(); });
    menuCategoryTabs.appendChild(btn);
  });
  
  // Update stats
  menuTotalItems.textContent = state.menu.length;
  menuTotalCats.textContent = Object.keys(usedCats).length;
}

function renderMenuTable() {
  menuItemsBody.innerHTML = '';
  
  const filtered = menuFilterCategory === 'All'
    ? state.menu
    : state.menu.filter(m => m.category === menuFilterCategory);
  
  if (filtered.length === 0) {
    menuItemsBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-muted);">No menu items. Add items using the form or import a CSV.</td></tr>`;
    return;
  }
  
  // Sort by category then name
  const sorted = [...filtered].sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });
  
  sorted.forEach(item => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border-color)';
    tr.innerHTML = `
      <td style="padding:0.6rem 0.8rem;"><span style="background:rgba(245,158,11,0.15); color:var(--accent-warning); padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:600;">${item.category}</span></td>
      <td style="padding:0.6rem 0.8rem; font-weight:600;">${item.name}</td>
      <td style="padding:0.6rem 0.8rem; color:var(--accent-success); font-weight:700;">$${item.price.toFixed(2)}</td>
      <td style="padding:0.6rem 0.8rem; color:var(--text-muted); font-size:0.85rem;">${item.description || '—'}</td>
      <td style="padding:0.6rem 0.8rem;">
        <div style="display:flex; gap:0.3rem;">
          <button class="btn-icon-tiny edit" onclick="editMenuItem('${item.id}')" title="Edit"><span class="material-symbols-outlined" style="font-size:16px;">edit</span></button>
          <button class="btn-icon-tiny delete" onclick="deleteMenuItem('${item.id}')" title="Delete"><span class="material-symbols-outlined" style="font-size:16px;">delete</span></button>
        </div>
      </td>
    `;
    menuItemsBody.appendChild(tr);
  });
}

window.editMenuItem = function(id) {
  const item = state.menu.find(m => m.id === id);
  if (!item) return;
  
  menuEditId = id;
  menuFormTitle.textContent = 'Edit Menu Item';
  btnAddMenuItem.textContent = 'Save Changes';
  btnCancelMenuEdit.style.display = 'block';
  
  menuItemCategory.value = item.category;
  menuItemName.value = item.name;
  menuItemPrice.value = item.price;
  menuItemDesc.value = item.description || '';
};

window.deleteMenuItem = function(id) {
  if (!confirm('Delete this menu item?')) return;
  state.menu = state.menu.filter(m => m.id !== id);
  renderMenuTable();
  renderMenuCategoryTabs();
  saveState();
};

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

// ----- Digital Tag Logic -----
const tagModal = document.getElementById('tag-modal');
const tagPreviewContainer = document.getElementById('tag-preview-container');
const closeTagModalBtn = document.getElementById('close-tag-modal');
const printTagBtn = document.getElementById('print-tag-btn');

function showDigitalTag(barcode, name, price, qty) {
  const isLowStock = qty <= 5;
  const isOutStack = qty <= 0;
  
  // Calculate a fake unit price for realism
  const unitPrice = (price / 12).toFixed(2); // assuming 12oz for beverage feel

  tagPreviewContainer.innerHTML = `
    <div class="digital-tag ${isLowStock ? 'sale' : ''}" style="${isOutStack ? 'opacity: 0.8; filter: grayscale(1);' : ''}">
      ${isLowStock && !isOutStack ? '<div class="sale-badge">SALE</div>' : ''}
      <div class="tag-left">
        <div class="product-category">DIGITAL LABEL</div>
        <h2 class="product-name">${name}</h2>
        <div class="unit-price">$${unitPrice} / UNIT</div>
        <div class="price-block" style="${isOutStack ? 'text-decoration: line-through; opacity: 0.5;' : ''}">
          <span class="price-currency">$</span>
          <span class="price-value">${parseFloat(price).toFixed(2)}</span>
        </div>
      </div>
      <div class="tag-right">
        <div class="stock-status" style="${isOutStack ? 'background:#e11d48;' : ''}">${isOutStack ? 'OUT OF STOCK' : (isLowStock ? 'LOW STOCK' : 'IN STOCK')}</div>
        <div class="qr-code-sim"></div>
        <div class="tag-barcode-container">
          <div class="barcode-sim" style="${isLowStock ? 'background: repeating-linear-gradient(90deg, #e11d48, #e11d48 2px, #fff 2px, #fff 5px);' : ''}"></div>
          <div class="barcode-text">${barcode !== 'null' ? barcode : 'NO BARCODE'}</div>
        </div>
      </div>
    </div>
  `;
  
  tagModal.classList.remove('hidden');
}

// Close tag modal
if (closeTagModalBtn) {
  closeTagModalBtn.addEventListener('click', () => {
    tagModal.classList.add('hidden');
  });
}

// Download/Print Tag (Mock)
if (printTagBtn) {
  printTagBtn.addEventListener('click', () => {
    alert("In a production environment, this would generate a high-resolution PNG for the E-Ink display system.");
  });
}

// Global reveal
window.showDigitalTag = showDigitalTag;
