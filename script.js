/* மளிகை கடை Stock Register — plain JS, localStorage backed */

const STORAGE_KEY = 'maligai_stock_v1';

let items = loadItems();
let currentFilter = 'all';
let searchTerm = '';
let editingId = null;

// ---------- storage ----------
function loadItems(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.error('Load failed', e);
    return [];
  }
}

function saveItems(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function uid(){
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,7);
}

// ---------- DOM refs ----------
const addCard = document.getElementById('addCard');
const openAddBtn = document.getElementById('openAddBtn');
const cancelBtn = document.getElementById('cancelBtn');
const itemForm = document.getElementById('itemForm');
const categoriesEl = document.getElementById('categories');
const emptyState = document.getElementById('emptyState');
const searchBox = document.getElementById('searchBox');
const filtersEl = document.getElementById('filters');
const catList = document.getElementById('catList');

const statCount = document.getElementById('statCount');
const statValue = document.getElementById('statValue');
const statLow = document.getElementById('statLow');

// ---------- UI: add card open/close ----------
openAddBtn.addEventListener('click', () => {
  editingId = null;
  itemForm.reset();
  document.getElementById('fId').value = '';
  addCard.hidden = false;
  document.getElementById('fName').focus();
});

cancelBtn.addEventListener('click', () => {
  addCard.hidden = true;
  itemForm.reset();
  editingId = null;
});

// ---------- form submit ----------
itemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('fName').value.trim();
  const category = document.getElementById('fCategory').value.trim() || 'மற்றவை';
  const qty = parseFloat(document.getElementById('fQty').value) || 0;
  const unit = document.getElementById('fUnit').value;
  const price = parseFloat(document.getElementById('fPrice').value) || 0;
  const threshold = parseFloat(document.getElementById('fThreshold').value) || 0;

  if(!name) return;

  if(editingId){
    const idx = items.findIndex(i => i.id === editingId);
    if(idx > -1){
      items[idx] = { ...items[idx], name, category, qty, unit, price, threshold };
    }
  } else {
    items.push({ id: uid(), name, category, qty, unit, price, threshold, createdAt: Date.now() });
  }

  saveItems();
  addCard.hidden = true;
  itemForm.reset();
  editingId = null;
  render();
});

// ---------- search / filter ----------
searchBox.addEventListener('input', (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  render();
});

filtersEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if(!btn) return;
  currentFilter = btn.dataset.filter;
  [...filtersEl.children].forEach(c => c.classList.toggle('active', c === btn));
  render();
});

// ---------- edit / delete ----------
function editItem(id){
  const item = items.find(i => i.id === id);
  if(!item) return;
  editingId = id;
  document.getElementById('fId').value = item.id;
  document.getElementById('fName').value = item.name;
  document.getElementById('fCategory').value = item.category;
  document.getElementById('fQty').value = item.qty;
  document.getElementById('fUnit').value = item.unit;
  document.getElementById('fPrice').value = item.price;
  document.getElementById('fThreshold').value = item.threshold;
  addCard.hidden = false;
  document.getElementById('fName').focus();
}

function deleteItem(id){
  const item = items.find(i => i.id === id);
  if(!item) return;
  if(!confirm(`"${item.name}" ஐ நீக்கணுமா? (Delete this item?)`)) return;
  items = items.filter(i => i.id !== id);
  saveItems();
  render();
}

function quickAdjust(id, delta){
  const item = items.find(i => i.id === id);
  if(!item) return;
  item.qty = Math.max(0, Math.round((item.qty + delta) * 100) / 100);
  saveItems();
  render();
}

// ---------- export / import ----------
document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0,10);
  a.href = url;
  a.download = `maligai-stock-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = JSON.parse(reader.result);
      if(!Array.isArray(data)) throw new Error('Invalid format');
      if(items.length && !confirm('இருக்குற stock data மேல எழுதப்படும். தொடரவா? (This will overwrite current data. Continue?)')){
        return;
      }
      items = data;
      saveItems();
      render();
      alert('Restore ஆயிடுச்சு ✓');
    }catch(err){
      alert('கோப்பு தவறு / Invalid backup file');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// ---------- render ----------
function render(){
  // stats
  const totalCount = items.length;
  const totalValue = items.reduce((sum, i) => sum + (i.qty * i.price), 0);
  const lowCount = items.filter(i => i.threshold > 0 && i.qty <= i.threshold).length;

  statCount.textContent = totalCount;
  statValue.textContent = '₹' + totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  statLow.textContent = lowCount;

  // category datalist
  const cats = [...new Set(items.map(i => i.category))];
  catList.innerHTML = cats.map(c => `<option value="${escapeHtml(c)}">`).join('');

  // filtered items
  let filtered = items;
  if(currentFilter === 'low'){
    filtered = filtered.filter(i => i.threshold > 0 && i.qty <= i.threshold);
  }
  if(searchTerm){
    filtered = filtered.filter(i =>
      i.name.toLowerCase().includes(searchTerm) ||
      i.category.toLowerCase().includes(searchTerm)
    );
  }

  emptyState.hidden = items.length > 0;
  categoriesEl.innerHTML = '';

  if(filtered.length === 0 && items.length > 0){
    categoriesEl.innerHTML = `<p class="empty-state">தேடலுக்கு எதுவும் கிடைக்கல் / No items match.</p>`;
    return;
  }

  // group by category
  const grouped = {};
  filtered.forEach(item => {
    if(!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  Object.keys(grouped).sort().forEach(cat => {
    const block = document.createElement('div');
    block.className = 'category-block';

    const title = document.createElement('div');
    title.className = 'category-title';
    title.textContent = cat;
    block.appendChild(title);

    grouped[cat]
      .sort((a,b) => a.name.localeCompare(b.name))
      .forEach(item => block.appendChild(renderRow(item)));

    categoriesEl.appendChild(block);
  });
}

function renderRow(item){
  const row = document.createElement('div');
  row.className = 'item-row';

  const isLow = item.threshold > 0 && item.qty <= item.threshold;

  row.innerHTML = `
    <div class="item-name-wrap">
      <div class="item-name">${escapeHtml(item.name)}</div>
      <div class="item-meta">₹${item.price.toLocaleString('en-IN')} / ${escapeHtml(item.unit)}</div>
    </div>
    <div class="item-qty">
      ${item.qty} <span class="unit">${escapeHtml(item.unit)}</span>
    </div>
    <span class="badge ${isLow ? 'badge-warn' : 'badge-ok'}">
      ${isLow ? 'குறைவு · Low' : 'சரி · OK'}
    </span>
    <div class="row-actions">
      <button class="icon-btn" data-action="minus" title="Decrease">−</button>
      <button class="icon-btn" data-action="plus" title="Increase">+</button>
      <button class="icon-btn" data-action="edit" title="Edit">✎</button>
      <button class="icon-btn" data-action="delete" title="Delete">🗑</button>
    </div>
  `;

  row.querySelector('[data-action="edit"]').addEventListener('click', () => editItem(item.id));
  row.querySelector('[data-action="delete"]').addEventListener('click', () => deleteItem(item.id));
  row.querySelector('[data-action="plus"]').addEventListener('click', () => quickAdjust(item.id, 1));
  row.querySelector('[data-action="minus"]').addEventListener('click', () => quickAdjust(item.id, -1));

  return row;
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- init ----------
render();
