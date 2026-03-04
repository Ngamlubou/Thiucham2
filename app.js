/* ========= GLOBAL STATE ========= */
let baseSongs = [];
let currentDatasetKey = "hiuna";
let currentView = "list";
let lastView = "list";
let lastListScrollY = 0;
let currentIndex = -1;
let favCache = null;
let isfavOutdated = true;
let isFavPanelOpen = false;
let isSideMenuOpen = false;
let isSearchInputOpen = false;
let isrestoreScroll = false;
let isListDirty = false;
const DATASETS = {
  hiuna: Hiuna_Khomlui,
  khristen: Khristen_Madui_Lui,
  luisan: Luisan
};

const listEl = document.getElementById("songList");
const detailEl = document.getElementById("songDetail");
const viewNameEl = document.getElementById("viewName");
const topLeftBtn = document.getElementById("topLeft");
const topSearch = document.getElementById("top-search");
const searchInput = document.getElementById("searchInput");
const searchOverlay = document.getElementById("searchOverlayxyz");
const searchListEl = document.getElementById("searchResults");
const sideMenu = document.getElementById("sideMenu");
const favPanel = document.getElementById("favPanel");
const favList  = document.getElementById("favList");

/* ========= VIEW HANDLERS ========= */
function updateFavStar(index) {
  const star = document.getElementById("favStar");  if (!star) return;
  const favs = readFav()[currentDatasetKey] || [];
  star.textContent = favs.includes(index) ? "⭐" : "☆";
}
function closeFavouritePanel() { favPanel.classList.remove("open");
isFavPanelOpen = false;
} 
function openFavouriteView(event) { if (isFavPanelOpen){ closeFavouritePanel(); clearSideMenuActive(); return;
  }
  clearSideMenuActive();
event.currentTarget?.classList.add("active");
 openFavouritePanel();
}
function updateTopLeftButton() {
  if (currentView === "detail") {
    topLeftBtn.textContent = "〈 ";
updateFavStar(currentIndex);
  } else {
    topLeftBtn.textContent = "☰";
  }}
function handleTopLeftClick() {
  if (currentView === "detail") {
    clearSearch();
    backToListView();
  } else {
    if (isSideMenuOpen) {
      closeSideMenu();
    } else {
      openSideMenu();
    }  } }
function openSideMenu() {
  sideMenu.classList.add("open");
isSideMenuOpen = true; clearSearch(); }
function closeSideMenu() {
sideMenu.classList.remove("open");
isSideMenuOpen = false;
}
function clearSideMenuActive() {
document.querySelectorAll(".side-item").forEach(i =>
    i.classList.remove("active") );
}
function clearSearch() {
  searchInput.value = "";
searchOverlay.classList.remove("open");
  searchListEl.innerHTML = "";
}
function openSearch() { closeFavouritePanel();
 searchOverlay.classList.add("open");
  searchInput.classList.add("open");
  topSearch.textContent = "⌫";
isSearchInputOpen = true;
  searchInput.focus();
}
function closeSearch() { clearSearch(); 
searchOverlay.classList.remove("open");
  searchInput.classList.remove("open");
   topSearch.textContent = "🔍";
  isSearchInputOpen = false;
}
function toggleSearch() { isSearchInputOpen?  closeSearch():
 openSearch();
  }
function backToListView() { isrestoreScroll = true;
  if (!isListDirty) { showListView();
    return; }
  if (lastView === "list") { renderSongList(baseSongs);  } 
else { renderCategoryView(baseSongs); updateTopLeftButton(); }
}
function showListView() { currentView = "list"; lastView = "list";
  detailEl.style.display = "none";
  listEl.style.display = "block";
  updateTopLeftButton();
if (isrestoreScroll) {
    window.scrollTo(0, lastListScrollY);
isrestoreScroll = false;}
}
function showDetailView() {
  currentView = "detail";
  listEl.style.display = "none";
  detailEl.style.display = "block";
  updateTopLeftButton();
 closeSideMenu();
closeFavouritePanel();
window.scrollTo(0, 0) ;
}
detailEl.addEventListener("click", e => {
  const x = e.clientX; const y = e.clientY;
  const w = window.innerWidth; const h = window.innerHeight;   
if (y < h * 0.15 || y > h * 0.9 ) return;
if (x < w * 0.26)
{const newIndex = currentIndex - 1;
showSongDetail(baseSongs[newIndex], newIndex); }
  else if (x > w * 0.74) 
{const newIndex = currentIndex + 1;
showSongDetail(baseSongs[newIndex], newIndex); }
});
function renderSongLine(song, index, favSet) {
  const isFav = favSet?.has(index);
 const star = isFav
    ? `<span>⭐</span>`
    : "";
 const translation = song.Translation
    ? `<div class="translation">${song.Translation}</div>`
    : "";
 return `
    <span class="id">${song.ID}</span>
    <span>${song.Title}</span>${star} ${translation} `;
}
/* ======= FAVOURITE ======= */
function readFav() {
  if (!isfavOutdated) {
    return favCache;   }
  favCache = JSON.parse(
localStorage.getItem("favourite_indexes") || "{}" );
  isfavOutdated = false;
 return favCache;
}
function toggleFav(index) {
  const favs = readFav();
const group = currentDatasetKey; 
  if (!Array.isArray(favs[group])) { favs[group] = [];
  }
 const list = favs[group];
  const i = list.indexOf(index);
  if (i === -1) list.push(index);
  else list.splice(i, 1);
 writeFav(favs);
isListDirty = true;
 updateFavStar(index);
}
function writeFav(storage) { localStorage.setItem("favourite_indexes", JSON.stringify(storage));
isfavOutdated = true;
}
function collectFavouriteSongs() {
  const fav = readFav();
  const result = [];
  Object.keys(DATASETS).forEach(key => {
    const favIndexes = fav[key];
    if (!Array.isArray(favIndexes)) return;
   favIndexes.forEach(i => {
      result.push({
        song: DATASETS[key][i],
index: i,
        dataset: key  
 });    });  });
  return result;
}
function getDatasetLabel(key) {
  return key === "hiuna" ? "Hiuna Khomlui"
       : key === "khristen" ? "Khristen Madui Lui"
       : key === "luisan" ? "Luisan"
       : key;
}
function openFavouritePanel() {
  const favSongs = collectFavouriteSongs();
  const fragment = document.createDocumentFragment(); let lastDataset = null;
 favSongs.forEach(({ song, dataset, index }) => {
    if (dataset !== lastDataset) {
      const header = document.createElement("li");
      header.className = "id";
      header.textContent = getDatasetLabel(dataset);
    fragment.appendChild(header);
      lastDataset = dataset;
    }
const li = document.createElement("li");
    li.innerHTML = renderSongLine(song);
  li.onclick = () => {  switchDataset(dataset);
      showSongDetail(song, index);
    };
 fragment.appendChild(li); });
 favList.innerHTML = "";
  favList.appendChild(fragment);
  favPanel.classList.add("open");
isFavPanelOpen = true;
}
/* ======== DATASET ======== */
function activateDataset(key, view = "list") {
  closeSideMenu();
  clearSearch(); 
  currentDatasetKey = key;
  baseSongs = DATASETS[key];
  currentView = view;

  viewNameEl.textContent =
    key === "hiuna" ? "Hiuna Khomlui" :
    key === "khristen" ? "Khristen Madui Lui" :
    key === "luisan" ? "Luisan" : "";

  if (view === "category") {
    viewNameEl.textContent += " Categories";
    renderCategoryView(baseSongs);
  } else {
    renderSongList(baseSongs);}
}
function switchDataset(key) { 
if (key === currentDatasetKey && currentView === "detail") {
    backToListView(); return; }
clearSideMenuActive();   activateDataset(key, "list");
}
function openCategoryView(datasetKey, event) {  clearSideMenuActive(); 
closeFavouritePanel();
event.currentTarget?.classList.add("active"); window.scrollTo(0, 0) ;
  activateDataset(datasetKey, "category");
}
/* ========= SEARCH ========= */
function normalize(str) {  return (str || "")
    .toLowerCase()
    .replace(/[ !,.?]/g, "");
}
searchInput.addEventListener("input", () => {
  const q = normalize(searchInput.value);

  if (q === "") {
    clearSearch();
       return; }

  const matches = baseSongs
    .map((song, index) => ({ song, index }))
    .filter(({ song }) =>
      song.ID.toString().includes(q) ||
      normalize(song.Title).includes(q) || 
       normalize(song.Translation).includes(q)
    );

  renderSearchResults(matches);
  searchOverlay.classList.add("open");
});
function renderSearchResults(results) {
  const fragment = document.createDocumentFragment();
const favSet = new Set(readFav()[currentDatasetKey] || []);
  results.forEach(({ song, index }) => { const li = document.createElement("li");
    li.innerHTML = renderSongLine(song, index, favSet);
    li.onclick = () => { clearSearch();  
      showSongDetail(song, index);
    };
    fragment.appendChild(li);  });
searchListEl.innerHTML = "";
searchListEl.appendChild(fragment);
}
/* ========= CATEGORIES ========= */
function groupByCategory(songs) {  const map = {};
 songs.forEach((song, index) => {
    const cat = song.Category || "Others";
    if (!map[cat]) map[cat] = [];
    map[cat].push({ song, index });
  });
  return map;
}
function renderCategoryView(songs) {
  currentView = "category"; lastView = "category";
  listEl.innerHTML = "";
  detailEl.style.display = "none";
  listEl.style.display = "block";
const grouped = groupByCategory(songs);
  const mainFragment = document.createDocumentFragment();
const favSet = new Set(readFav()[currentDatasetKey] || []);
Object.keys(grouped).forEach(category => {
    const header = document.createElement("li");
    header.innerHTML = `<h3>${category} (${grouped[category].length})</h3>`;
    header.className = "category-header";
const container = document.createElement("ul");
    container.style.display = "none";
const containerFragment = document.createDocumentFragment();
grouped[category].forEach(({ song, index }) => {
      const li = document.createElement("li");
      li.innerHTML = renderSongLine(song, index, favSet);
   li.onclick = () => { lastListScrollY = window.scrollY;
        showSongDetail(song, index);
      };
containerFragment.appendChild(li);
    });
container.appendChild(containerFragment);
header.onclick = () => { container.style.display =
        container.style.display === "none" ? "block" : "none";
    };
mainFragment.appendChild(header);
mainFragment.appendChild(container);
  });
listEl.appendChild(mainFragment);
}
/* ========= LIST ========= */
function renderSongList(songArray) { const fragment = document.createDocumentFragment();
const favSet = new Set(readFav()[currentDatasetKey] || []);
songArray.forEach((song, index) => { const li = document.createElement("li");
    li.innerHTML = renderSongLine(song, index, favSet);
    li.addEventListener("click", (e) => {
  if (e.detail === 2) {
    projectionMode(song);
  } else { lastListScrollY = window.scrollY;
    showSongDetail(song, index);
  }});
    fragment.appendChild(li);
  });
 listEl.innerHTML = "";
  listEl.appendChild(fragment);
 showListView();
}
/* ========= DETAIL ========= */
function renderLyrics(song, order) {
  let html = "";
  for (const pair of order) {
    let key = null;
 if (song[pair[0]]) key = pair[0];
    else if (song[pair[1]]) key = pair[1];
 if (!key) break;
 html += `<div>${song[key]}</div>`; }
  return html;
}
const DETAIL_ORDER = [
  ["V1", "CH-"], ["CH", "V1-"], ["V2", "V2-"],["V3", "V3-"],  ["V4", "V4-"], ["V5", "V5-"], ["V6", "V6-"], ["V7", "V7-"],  ["V8", "V8-"], ["V9", "V9-"], ["V10", "V10-"], ["V11", "V11-"] ];
function showSongDetail(song, index) { 
  if (!song) return;
currentIndex = index;
  const translationBlock = song.Translation
    ? `<div class="translation">${song.Translation}</div>`
    : "";
const lyricsBlock = renderLyrics(song, DETAIL_ORDER);
 detailEl.innerHTML = `
  <div class="detail-head">
    <div> <span id="favStar" onclick="toggleFav(${index})">☆</span> <span>${song.ID}</span> </div>
  <div>${song.Title}</div>
  </div>
    ${translationBlock}
    <p><strong>Key:</strong> ${song.Key || "⚪"}</p>
    <p><strong>Time signature:</strong> ${song["Time signature"] || "⚪"}</p>
    <div class="lyrics">${lyricsBlock}</div>
  `;
showDetailView();
}
/* ========= BOOT ========= */
switchDataset("hiuna");
/* ========= PWA ========= */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => { navigator.serviceWorker.register("./sw.js"); });
}
