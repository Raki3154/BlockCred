// Minimal JS to replace PHP views with a clean SPA
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

// Tabs + nav
const switchTo = (tab) => {
  $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab===tab));
  $$(".nav-btn").forEach(t => t.classList.toggle("active", t.dataset.tab===tab));
  $$(".panel").forEach(p => p.classList.toggle("active", p.id === `panel-${tab}`));
  window.location.hash = tab;
};

$$(".tab, .nav .nav-btn, .hero-cta .primary, .hero-cta .ghost").forEach(b => {
  b.addEventListener("click", (e) => switchTo(e.currentTarget.dataset.tab));
});

// Theme toggle
$("#themeToggle").addEventListener("click", () => {
  document.documentElement.classList.toggle("light");
  toast(document.documentElement.classList.contains("light") ? "Light theme on" : "Dark theme on");
});

// Toast
const toast = (msg) => {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 1800);
};

// Local storage "DB"
const KEY = "credentialx.items";
const loadItems = () => JSON.parse(localStorage.getItem(KEY) || "[]");
const saveItems = (items) => localStorage.setItem(KEY, JSON.stringify(items));

// Hashing helper: SHA-256 (Web Crypto)
async function sha256Hex(buffer) {
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

// Upload flow
$("#uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const name = fd.get("name").trim();
  const course = fd.get("course").trim();
  const institution = fd.get("institution").trim();
  const file = fd.get("file");

  if(!file) return toast("Please choose a file");

  const buf = await file.arrayBuffer();
  const fileHash = await sha256Hex(buf);
  const payload = {
    name, course, institution,
    filename: file.name,
    mime: file.type || "application/octet-stream",
    size: file.size,
    createdAt: new Date().toISOString(),
    hash: fileHash
  };

  const items = loadItems();
  items.push(payload);
  saveItems(items);
  renderTable(items);

  $("#uploadResult").classList.remove("hide");
  $("#uploadResult").innerHTML = `
    <div><b>Hash:</b> <span class="mono">${fileHash}</span></div>
    <div class="row" style="margin-top:8px">
      <button class="ghost" id="copyHash">Copy Hash</button>
      <button class="ghost" id="downloadJson">Download JSON</button>
      <button class="ghost" data-tab="catalog">View in Catalog</button>
    </div>
  `;
  $("#copyHash").addEventListener("click", async ()=>{
    await navigator.clipboard.writeText(fileHash); toast("Hash copied");
  });
  $("#downloadJson").addEventListener("click", ()=>{
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name.replace(/\s+/g,'_')}_${Date.now()}.json`;
    a.click();
  });
});

$("#clearForm").addEventListener("click", ()=>{
  $("#uploadForm").reset();
  $("#filePreview").textContent = "";
});

// File preview
$('input[name="file"]').addEventListener("change", (e)=>{
  const f = e.target.files[0];
  if(!f) return $("#filePreview").textContent = "";
  $("#filePreview").textContent = `${f.name} · ${(f.size/1024).toFixed(1)} KB`;
});

// Verify flow
$("#verifyForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  try {
    let payloadText = e.currentTarget.payload.value.trim();
    if(!payloadText && e.currentTarget.vf.files[0]) {
      payloadText = await e.currentTarget.vf.files[0].text();
    }
    const data = JSON.parse(payloadText);
    if(!data.hash) throw new Error("No 'hash' field found");

    const items = loadItems();
    const match = items.find(it => it.hash.toLowerCase() === data.hash.toLowerCase());
    $("#verifyResult").classList.remove("hide");
    $("#verifyResult").innerHTML = match
      ? `<div>✅ Valid! Found matching record for <b>${match.name}</b> (${match.course}) at <b>${match.institution}</b>.</div>`
      : `<div>⚠️ Hash not found locally. If you issued this on-chain, also check the blockchain explorer.</div>`;
  } catch (err) {
    $("#verifyResult").classList.remove("hide");
    $("#verifyResult").innerHTML = `<div>❌ Invalid JSON or verification error: ${err.message}</div>`;
  }
});

$("#demoJson").addEventListener("click", ()=>{
  const items = loadItems();
  if(!items.length) return toast("No local credentials yet. Issue one first.");
  const j = JSON.stringify(items[0], null, 2);
  $("#verifyForm textarea[name='payload']").value = j;
  toast("Loaded demo JSON");
});

// Catalog
function renderTable(items = loadItems()) {
  const q = $("#search").value.trim().toLowerCase();
  const tbody = $("#catalogTable tbody");
  tbody.innerHTML = "";
  items
    .filter(it => [it.name, it.course, it.institution, it.hash].some(v => (v||'').toLowerCase().includes(q)))
    .forEach((it, i)=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i+1}</td>
        <td>${it.name}</td>
        <td>${it.course}</td>
        <td>${it.institution}</td>
        <td><span class="mono">${it.hash.slice(0,18)}…${it.hash.slice(-6)}</span></td>
        <td>
          <div class="row-btns">
            <button class="ghost" data-act="copy" data-i="${i}">Copy</button>
            <button class="ghost" data-act="json" data-i="${i}">JSON</button>
            <button class="ghost" data-act="remove" data-i="${i}">Delete</button>
          </div>
        </td>`;
      tbody.appendChild(tr);
    });
}
$("#search").addEventListener("input", ()=>renderTable());

$("#catalogTable").addEventListener("click", (e)=>{
  const b = e.target.closest("button"); if(!b) return;
  const items = loadItems(); const i = +b.dataset.i; const it = items[i];
  if(b.dataset.act==="copy"){ navigator.clipboard.writeText(it.hash); toast("Hash copied"); }
  if(b.dataset.act==="json"){
    const blob = new Blob([JSON.stringify(it,null,2)], {type:"application/json"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${it.name.replace(/\s+/g,'_')}.json`; a.click();
  }
  if(b.dataset.act==="remove"){
    items.splice(i,1); saveItems(items); renderTable(items); toast("Deleted");
  }
});

$("#exportAll").addEventListener("click", ()=>{
  const items = loadItems();
  const blob = new Blob([JSON.stringify(items,null,2)], {type:"application/json"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = `credentialx_export_${Date.now()}.json`; a.click();
});

// Contract config
const CONTRACT_KEY = "credentialx.contract";
const loadContract = () => JSON.parse(localStorage.getItem(CONTRACT_KEY) || "{}");
const saveContract = (c) => localStorage.setItem(CONTRACT_KEY, JSON.stringify(c));

function renderContract() {
  const c = loadContract();
  $("#contractJson").value = JSON.stringify(c, null, 2);
  $("#net").textContent = c.network || "—";
  $("#addr").textContent = c.address || "—";
  $("#rpc").textContent = c.rpc_url || "—";
}
$("#copyContract").addEventListener("click", async ()=>{
  await navigator.clipboard.writeText($("#contractJson").value);
  toast("Config copied");
});
$("#resetContract").addEventListener("click", ()=>{
  localStorage.removeItem(CONTRACT_KEY);
  renderContract(); toast("Reset");
});
$("#contractJson").addEventListener("input", ()=>{
  try { saveContract(JSON.parse($("#contractJson").value)) } catch {}
  renderContract();
});

// Boot
(function init(){
  renderTable();
  renderContract();
  const tab = (location.hash || "#upload").slice(1);
  switchTo(tab);
})();
document.getElementById("fileInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const preview = document.getElementById("filePreview");
  preview.innerHTML = ""; // clear old preview

  if (!file) return;

  // Show image preview
  if (file.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = "200px";
    img.style.borderRadius = "10px";
    img.style.marginTop = "10px";
    preview.appendChild(img);
  }

  // Show PDF preview
  else if (file.type === "application/pdf") {
    const embed = document.createElement("embed");
    embed.src = URL.createObjectURL(file);
    embed.type = "application/pdf";
    embed.width = "300";
    embed.height = "200";
    embed.style.marginTop = "10px";
    preview.appendChild(embed);
  }

  // Show just filename if not previewable
  else {
    const span = document.createElement("span");
    span.textContent = `Selected: ${file.name}`;
    preview.appendChild(span);
  }
});
// file preview for upload form
document.addEventListener('DOMContentLoaded', function(){
  const fileInput = document.getElementById('fileInput');
  const preview = document.getElementById('filePreview');
  if (!fileInput) return;

  fileInput.addEventListener('change', function(e){
    const f = e.target.files[0];
    preview.innerHTML = '';
    if (!f) return;
    if (f.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(f);
      img.style.maxWidth = '260px';
      img.style.borderRadius = '8px';
      preview.appendChild(img);
    } else if (f.type === 'application/pdf') {
      const embed = document.createElement('embed');
      embed.src = URL.createObjectURL(f);
      embed.type = 'application/pdf';
      embed.width = '320';
      embed.height = '220';
      preview.appendChild(embed);
    } else {
      preview.textContent = f.name + ' · ' + Math.round(f.size/1024) + ' KB';
    }
  });
});
