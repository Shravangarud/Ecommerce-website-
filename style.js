// Combined JS (style.js)

/* Utilities */
function debounce(fn, wait=300){ let t; return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn.apply(this,args), wait); }; }
function formatCurrency(n){ return n.toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:2}); }
function discounted(price, disc){ return +(price * (1 - disc/100)).toFixed(2); }

/* Local storage helpers for cart */
function getCartItems(){ try{ return JSON.parse(localStorage.getItem('sp_cart_items')||'{}'); }catch(e){ return {}; } }
function setCartItems(items){ localStorage.setItem('sp_cart_items', JSON.stringify(items)); updateHeaderBadge(); }
function getCartCount(){ const items = getCartItems(); const sum = Object.values(items).reduce((s,q)=>s + Number(q || 0), 0); if(sum>0) return sum; return Number(localStorage.getItem('sp_cart') || 0); }

/* User storage */
function getUsers(){ try{return JSON.parse(localStorage.getItem('sp_users')||'[]'); }catch(e){ return []; } }
function setUsers(u){ localStorage.setItem('sp_users', JSON.stringify(u)); }
function setCurrentUser(user){ localStorage.setItem('sp_current_user', JSON.stringify(user)); renderAuthLinks(); }
function clearCurrentUser(){ localStorage.removeItem('sp_current_user'); renderAuthLinks(); }
function findUserByEmailOrNumber(when){ const users = getUsers(); return users.find(u => (u.email && u.email.toLowerCase()===when.toLowerCase()) || (u.number && u.number===when)); }

/* Header badge */
function updateHeaderBadge(){ const el = document.getElementById('sp-cart'); if(!el) return; const items = getCartItems(); const sum = Object.values(items).reduce((s,q)=>s + Number(q||0),0); if(sum>0) el.textContent = sum; else el.textContent = (Number(localStorage.getItem('sp_cart')||0)); }

/* Navigation: sections inside index.html */
function navigateTo(section){ const sections = document.querySelectorAll('[data-section]'); sections.forEach(s=>{ s.style.display = s.dataset.section===section ? '' : 'none'; });
	// Update history (hash) for convenience
	try{ history.pushState(null, '', '#' + section); }catch(e){}
	// trigger lazy load actions
	if(section === 'products'){ if(window._initProducts) window._initProducts(); }
	if(section === 'cart'){ if(window.renderCart) window.renderCart(); }
	if(section === 'order'){ if(window.loadSummary) window.loadSummary(); }
}

/* Auth UI */
function renderAuthLinks(){ try{ const authEl = document.getElementById('auth-links'); if(!authEl) return; const cu = JSON.parse(localStorage.getItem('sp_current_user')||'null'); authEl.innerHTML = '';
	if(cu){ const initials = (cu.name || '').split(' ').map(s=>s[0]||'').slice(0,2).join('').toUpperCase() || 'U'; const wrap = document.createElement('div'); wrap.style.position='relative'; const av = document.createElement('button'); av.type='button'; av.className='avatar'; av.textContent = initials; av.addEventListener('click', (e)=>{ e.stopPropagation(); const dd = wrap.querySelector('.account-dropdown'); if(dd) dd.remove(); else wrap.appendChild(createAccountDropdown()); }); wrap.appendChild(av); authEl.appendChild(wrap); }
	else { authEl.innerHTML = '<a href="#login" onclick="navigateTo(\'login\')">Log in</a><a href="#signup" onclick="navigateTo(\'signup\')" style="margin-left:10px">Sign up</a>'; }
 }catch(e){}
}
function createAccountDropdown(){ const d = document.createElement('div'); d.className='account-dropdown'; const orders = document.createElement('a'); orders.href='#orders'; orders.textContent='Orders'; orders.addEventListener('click', (e)=>{ e.preventDefault(); navigateTo('orders'); }); d.appendChild(orders); const profile = document.createElement('a'); profile.href='#profile'; profile.textContent='Profile'; profile.addEventListener('click', (e)=>{ e.preventDefault(); navigateTo('profile'); }); d.appendChild(profile); const logout = document.createElement('button'); logout.type='button'; logout.textContent='Logout'; logout.addEventListener('click', ()=>{ clearCurrentUser(); d.remove(); }); d.appendChild(logout); return d; }

/* Product list module (initialized once) */
let products = [];
let _productsInitiated = false;
function _initProducts(){ if(_productsInitiated) return; _productsInitiated = true; // fetch products and render
	const grid = document.getElementById('sp-grid'); const catsEl = document.getElementById('sp-cats'); const emptyEl = document.getElementById('sp-empty');
	function uniqueCats(list){ const s = new Set(list.map(p => p.category)); return ['All', ...Array.from(s)]; }
	function renderCats(cats){ catsEl.innerHTML=''; cats.forEach((c,i)=>{ const b = document.createElement('button'); b.className='cat'; b.textContent=c; b.dataset.cat=c; if(i===0) b.classList.add('active'); b.addEventListener('click', ()=>{ Array.from(catsEl.children).forEach(x=>x.classList.remove('active')); b.classList.add('active'); applyFilter(c); }); catsEl.appendChild(b); }); }
	function getActiveCategory(){ const btn = catsEl.querySelector('.cat.active'); return btn ? btn.dataset.cat : 'All'; }
	function applySearchLocal(query){ query = (query||'').trim().toLowerCase(); const active = getActiveCategory(); let list = products.slice(); if(active && active !== 'All') list = list.filter(p=>p.category === active); if(query){ list = list.filter(p=> (p.title||'').toLowerCase().includes(query) || (p.desc||'').toLowerCase().includes(query) || (p.category||'').toLowerCase().includes(query)); } renderProducts(list); }
	function renderProducts(list){ grid.innerHTML=''; if(!list.length){ emptyEl.hidden=false; return } emptyEl.hidden=true; list.forEach(p=>{ const card = document.createElement('article'); card.className='card'; const media = document.createElement('div'); media.className='media'; const img = document.createElement('img'); img.src = p.image || ('https://picsum.photos/seed/' + encodeURIComponent(p.title) + '/600/400'); img.alt=p.title; media.appendChild(img); const body = document.createElement('div'); body.className='body'; const h = document.createElement('h3'); h.className='title'; h.textContent=p.title; const d = document.createElement('p'); d.className='desc'; d.textContent=p.desc; const meta = document.createElement('div'); meta.className='meta'; if(p.discount && p.discount>0){ const newp = discounted(p.price,p.discount); const sp = document.createElement('div'); sp.className='price'; sp.textContent = formatCurrency(newp); const old = document.createElement('div'); old.className='old'; old.textContent = formatCurrency(p.price); const badge = document.createElement('div'); badge.className='badge'; badge.textContent = p.discount + '% off'; meta.appendChild(sp); meta.appendChild(old); meta.appendChild(badge); } else { const sp = document.createElement('div'); sp.className='price'; sp.textContent = formatCurrency(p.price); meta.appendChild(sp); } body.appendChild(h); body.appendChild(d); body.appendChild(meta); const actions = document.createElement('div'); actions.className = 'card-actions'; const addBtn = document.createElement('button'); addBtn.className = 'add-btn'; addBtn.type = 'button'; addBtn.textContent = 'Add to cart'; addBtn.addEventListener('click', ()=>{ addToCart(p.id); flashAdded(addBtn); }); actions.appendChild(addBtn);
		// add Buy now button: adds to cart then navigate to order/checkout
		const buyBtn = document.createElement('button'); buyBtn.className = 'buy-btn'; buyBtn.type = 'button'; buyBtn.textContent = 'Buy now'; buyBtn.addEventListener('click', ()=>{ addToCart(p.id); flashAdded(buyBtn); setTimeout(()=>{ navigateTo('order'); }, 250); }); actions.appendChild(buyBtn);
		body.appendChild(actions); card.appendChild(media); card.appendChild(body); grid.appendChild(card); }); }
	function applyFilter(cat){ if(cat==='All') renderProducts(products); else renderProducts(products.filter(p=>p.category===cat)); }
	// cart helpers local to product module
	function flashAdded(btn){ if(!btn) return; const prev = btn.textContent; btn.textContent = 'Added'; btn.disabled = true; btn.classList.add('added'); setTimeout(()=>{ btn.textContent = prev; btn.disabled = false; btn.classList.remove('added'); }, 900); }
	function addToCart(productId){ const items = getCartItems(); const id = String(productId); items[id] = (Number(items[id] || 0) + 1); setCartItems(items); localStorage.setItem('sp_cart', String(getCartCount())); }
	// wire search input
	const searchInput = document.getElementById('sp-search'); const searchBtn = document.getElementById('sp-search-btn'); if(searchInput){ const deb = debounce(()=>{ applySearchLocal(searchInput.value); }, 250); searchInput.addEventListener('input', deb); searchInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); applySearchLocal(searchInput.value); } }); } if(searchBtn){ searchBtn.addEventListener('click', ()=>{ const si = document.getElementById('sp-search'); if(si) applySearchLocal(si.value); }); }

	// fetch products
	fetch('data.json', {cache:'no-store'}).then(r=>{ if(!r.ok) throw new Error('data.json not found'); return r.json(); }).then(data=>{ products = data; renderCats(uniqueCats(products)); renderProducts(products); updateHeaderBadge(); }).catch(e=>{ console.error(e); emptyEl.hidden=false; emptyEl.textContent = 'Could not load products.' });
}
// expose for navigateTo to call
window._initProducts = _initProducts;

/* Cart rendering (uses getCartItems) */
function loadCart(){ fetch('data.json', {cache:'no-store'}).then(r=>{ if(!r.ok) throw new Error('data.json not found'); return r.json(); }).then(products=>{
	const items = getCartItems(); const ids = Object.keys(items); const container = document.getElementById('cart-items'); const emptyEl = document.getElementById('cart-empty'); const summaryEl = document.getElementById('cart-summary'); container.innerHTML = '';
	if(ids.length===0){ if(emptyEl) emptyEl.hidden = false; if(summaryEl) summaryEl.hidden = true; updateHeaderBadge(); return }
	if(emptyEl) emptyEl.hidden = true; if(summaryEl) summaryEl.hidden = false; let subtotal = 0; ids.forEach(id=>{ const qty = Number(items[id]||0); const prod = products.find(p=>String(p.id)===String(id)); const row = document.createElement('div'); row.className = 'cart-row'; const img = document.createElement('img'); img.src = prod?.image || ('https://picsum.photos/seed/' + encodeURIComponent(id) + '/300/200'); img.alt = prod?.title || ('Product ' + id); const meta = document.createElement('div'); meta.className = 'meta'; const title = document.createElement('div'); title.className = 'title'; title.textContent = prod?.title || ('Item ' + id); const priceDiv = document.createElement('div'); const price = prod?.price || 0; const disc = prod?.discount || 0; const unit = disc>0 ? discounted(price, disc) : price; priceDiv.textContent = formatCurrency(unit); meta.appendChild(title); meta.appendChild(priceDiv); const controls = document.createElement('div'); controls.style.display='flex'; controls.style.flexDirection='column'; controls.style.gap='8px'; const qtyInput = document.createElement('input'); qtyInput.type='number'; qtyInput.min=1; qtyInput.value = qty; qtyInput.className='qty-input'; qtyInput.addEventListener('change', ()=>{ let v = Number(qtyInput.value) || 1; if(v<1) v=1; qtyInput.value = v; items[id] = v; setCartItems(items); renderCart(); }); const remove = document.createElement('button'); remove.className='remove-btn'; remove.type='button'; remove.textContent='Remove'; remove.addEventListener('click', ()=>{ delete items[id]; setCartItems(items); renderCart(); }); controls.appendChild(qtyInput); controls.appendChild(remove); row.appendChild(img); row.appendChild(meta); row.appendChild(controls); container.appendChild(row); subtotal += unit * qty; }); const tax = +(subtotal * 0.10).toFixed(2); const total = +(subtotal + tax).toFixed(2); const subEl = document.getElementById('cart-subtotal'); if(subEl) subEl.textContent = formatCurrency(subtotal); const taxEl = document.getElementById('cart-tax'); if(taxEl) taxEl.textContent = formatCurrency(tax); const totalEl = document.getElementById('cart-total'); if(totalEl) totalEl.textContent = formatCurrency(total); updateHeaderBadge(); }).catch(e=>{ console.error(e); }); }
function renderCart(){ loadCart(); }
window.renderCart = renderCart;

/* Order page behaviour */
function loadSummary(){ return fetch('data.json', {cache:'no-store'}).then(r=>{ if(!r.ok) throw new Error('data.json not found'); return r.json(); }).then(products=>{ const items = getCartItems(); const ids = Object.keys(items); const container = document.getElementById('summary-items'); const emptyNotice = document.getElementById('order-empty'); const formEl = document.getElementById('order-form'); const summaryBox = document.getElementById('summary-box'); if(!container) return; container.innerHTML = ''; let subtotal = 0; if(ids.length === 0){ if(emptyNotice) emptyNotice.hidden = false; if(formEl) formEl.hidden = true; if(summaryBox) summaryBox.hidden = true; updateHeaderBadge(); return; } if(emptyNotice) emptyNotice.hidden = true; ids.forEach(id=>{ const qty = Number(items[id]||0); const prod = products.find(p=>String(p.id)===String(id)); const row = document.createElement('div'); row.className = 'cart-row'; const img = document.createElement('img'); img.src = prod?.image || ('https://picsum.photos/seed/' + encodeURIComponent(id) + '/300/200'); img.alt = prod?.title || ('Product ' + id); const meta = document.createElement('div'); meta.className = 'meta'; const title = document.createElement('div'); title.className = 'title'; title.textContent = prod?.title || ('Item ' + id); const priceDiv = document.createElement('div'); const price = prod?.price || 0; const disc = prod?.discount || 0; const unit = disc>0 ? discounted(price, disc) : price; priceDiv.textContent = `${formatCurrency(unit)} × ${qty}`; meta.appendChild(title); meta.appendChild(priceDiv); row.appendChild(img); row.appendChild(meta); container.appendChild(row); subtotal += unit * qty; }); const tax = +(subtotal * 0.10).toFixed(2); const total = +(subtotal + tax).toFixed(2); const subEl = document.getElementById('summary-sub'); if(subEl) subEl.textContent = formatCurrency(subtotal); const taxEl = document.getElementById('summary-tax'); if(taxEl) taxEl.textContent = formatCurrency(tax); const totalEl = document.getElementById('summary-total'); if(totalEl) totalEl.textContent = formatCurrency(total); updateHeaderBadge(); }).catch(e=>{ console.error(e); }); }
function validateOrderForm(form){ const data = {}; const fm = new FormData(form); for(const [k,v] of fm.entries()){ if(!v && (k==='name' || k==='email' || k==='address1' || k==='city' || k==='zip')){ return {ok:false, message: 'Please fill required fields.'}; } data[k]=v; } return {ok:true, data}; }
function placeOrder(data){ const items = getCartItems(); const orderId = 'ORD-' + Date.now(); const order = { id: orderId, created: new Date().toISOString(), customer: data, items }; try{ const existing = JSON.parse(localStorage.getItem('sp_orders')||'[]'); existing.push(order); localStorage.setItem('sp_orders', JSON.stringify(existing)); } catch(e){ localStorage.setItem('sp_orders', JSON.stringify([order])); } localStorage.setItem('sp_last_customer', JSON.stringify(data)); localStorage.removeItem('sp_cart_items'); localStorage.removeItem('sp_cart'); updateHeaderBadge(); return orderId; }

/* Signup & Login handling */
function wireAuthForms(){ const signupForm = document.getElementById('signup-form'); if(signupForm){ signupForm.addEventListener('submit', function(ev){ ev.preventDefault(); const fm = new FormData(signupForm); const name = (fm.get('name')||'').trim(); const address = (fm.get('address')||'').trim(); const number = (fm.get('number')||'').trim(); const email = (fm.get('email')||'').trim(); const password = (fm.get('password')||'').toString(); const confirm = (fm.get('confirm')||'').toString(); const msgEl = document.getElementById('signup-msg'); if(!name || !number || !email || !password){ if(msgEl) msgEl.textContent='Please complete required fields'; return; } if(password.length < 4){ if(msgEl) msgEl.textContent='Password must be at least 4 characters'; return; } if(password !== confirm){ if(msgEl) msgEl.textContent='Passwords do not match'; return; } if(findUserByEmailOrNumber(email) || findUserByEmailOrNumber(number)){ if(msgEl) msgEl.textContent='User with that email or number already exists'; return; } const users = getUsers(); const id = Date.now(); const user = { id, name, address, number, email, password }; users.push(user); setUsers(users); setCurrentUser({ id: user.id, name: user.name, email: user.email, number: user.number }); if(msgEl) msgEl.textContent='Account created — redirecting...'; setTimeout(()=>{ navigateTo('products'); }, 900); }); }
	const loginForm = document.getElementById('login-form'); if(loginForm){ loginForm.addEventListener('submit', function(ev){ ev.preventDefault(); const fm = new FormData(loginForm); const who = (fm.get('who')||'').trim(); const password = (fm.get('password')||'').toString(); const msgEl = document.getElementById('login-msg'); if(!who || !password){ if(msgEl) msgEl.textContent='Please fill required fields'; return; } const user = findUserByEmailOrNumber(who); if(!user){ if(msgEl) msgEl.textContent='User not found'; return; } if(user.password !== password){ if(msgEl) msgEl.textContent='Invalid password'; return; } setCurrentUser({ id: user.id, name: user.name, email: user.email, number: user.number }); if(msgEl) msgEl.textContent='Logged in — redirecting...'; setTimeout(()=>{ navigateTo('products'); }, 600); }); }
}

/* Wire password toggles and small inline validation */
function wireSmallAuthUX(){ document.querySelectorAll('.password-toggle').forEach(btn=>{ btn.addEventListener('click', ()=>{ const targetName = btn.dataset.target; const form = btn.closest('form') || document; const input = form.querySelector(`input[name="${targetName}"]`); if(!input) return; if(input.type === 'password'){ input.type = 'text'; btn.textContent = 'Hide'; } else { input.type = 'password'; btn.textContent = 'Show'; } }); }); document.querySelectorAll('form').forEach(f=>{ f.addEventListener('submit', ()=>{ f.querySelectorAll('[required]').forEach(el=>{ el.classList.remove('input-error'); if(!el.value || String(el.value).trim()==='') el.classList.add('input-error'); }); }); }); }

/* Initialization */
function initAll(){ renderAuthLinks(); wireAuthForms(); wireSmallAuthUX(); updateHeaderBadge(); // show products by default
	const hash = (location.hash||'#products').replace('#',''); navigateTo(hash || 'products'); }

/* Expose order/cart functions used by navigation */
window.loadSummary = loadSummary;

/* Start on DOM ready */
document.addEventListener('DOMContentLoaded', initAll);


