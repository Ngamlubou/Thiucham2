/* ========= GLOBAL STATE ========= */
let baseSongs = [];
let currentDatasetKey = "hiuna";
let currentView = "list";
let lastView = "list";
let currentIndex = -1;
let favCache = null;
let activeItem = null;
let isfavOutdated = true;
let isFavPanelOpen = false;
let isSearchInputOpen = false;
let isListDirty = false;
const paragraph = [];
let cSlide = 0;
const DATASETS = {
  hiuna: Hiuna_Khomlui,
  khristen: Khristen_Madui_Lui,
  luisan: Luisan
};

const listEl = document.getElementById("songList");
const detailEl = document.getElementById("songDetail");
const viewNameEl = document.getElementById("viewName");
const topLeftBtn = document.getElementById("topLeft");
const topSearch = document.getElementById("topRight");
const searchInput = document.getElementById("searchInput");
const searchOverlay = document.getElementById("searchOverlay");
const searchListEl = document.getElementById("searchResults");
const sideMenu = document.getElementById("sideMenu");
const favPanel = document.getElementById("favPanel");
const favList  = document.getElementById("favList");
const projection  = document.getElementById("projectionView");
/* ========= VIEW HANDLERS ========= */
function setActiveItem(el) {
  if (activeItem) activeItem.classList.remove("active");
if (!el) { activeItem = null;
    return;  }
  el.classList.add("active");
  activeItem = el;
}
function updateFavStar(index) {
  const star = document.getElementById("favStar");  if (!star) return;
  const favs = readFav()[currentDatasetKey] || [];
  star.textContent = favs.includes(index) ? "⭐" : "☆";
}
function closeFavouritePanel() { favPanel.classList.remove("open");
isFavPanelOpen = false;
if (currentView !== "detail") setActiveItem(null);
} 
function favouriteBtn(event) { if (isFavPanelOpen) { closeFavouritePanel();
return; }
  setActiveItem(event.currentTarget);
 openFavouritePanel();
}
function handleTopLeftClick() { clearSearch(); 
  if (currentView === "detail") {
    closeDetail(); } 
else { sideMenu.classList.toggle("open"); }
 }
function clearSearch() {
  searchInput.value = "";
  searchOverlay.classList.remove("open");
  searchListEl.innerHTML = "";
}
function openSearch() { 
searchOverlay.classList.add("open");
searchInput.classList.add("open");
  topSearch.textContent = "⌫";
isSearchInputOpen = true;
  searchInput.focus();
}
function closeSearch() { clearSearch(); 
   searchInput.classList.remove("open");
   topSearch.textContent = "🔍";
  isSearchInputOpen = false;
}
function toggleSearch() { isSearchInputOpen?  closeSearch():
 openSearch();
  }
function closeDetail() {
detailEl.style.display = "none";
topLeftBtn.textContent = "☰"; 
currentView = lastView; 
if (isListDirty) {
      if (lastView === "category") {
    renderCategoryView(baseSongs);  } 
else {  renderSongList(baseSongs); }
isListDirty = false; } 
}
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
  sideMenu.classList.remove("open");
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
function switchDataset(key, event) { 
if (key === currentDatasetKey && currentView === "detail") {
    closeDetail(); return; }
setActiveItem(event?.currentTarget);
detailEl.style.display = "none";
 activateDataset(key, "list");
}
function openCategoryView(datasetKey, event) {  setActiveItem(event.currentTarget);
closeFavouritePanel();
 window.scrollTo(0, 0);
  activateDataset(datasetKey, "category");
}
/* ========= SEARCH ========= */
function normalize(str) {  return (str || "")
    .toLowerCase()
    .replace(/[ !,.?]/g, "");
}
searchInput.addEventListener("input", () => { const q = normalize(searchInput.value);

  if (q === "") {
searchOverlay.classList.remove("open");
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
    li.onclick = () => { closeSearch();  
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
   li.onclick = () =>   showSongDetail(song, index);
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
    li.onclick = () =>     showSongDetail(song, index);
    fragment.appendChild(li);
  });
 listEl.innerHTML = "";
  listEl.appendChild(fragment);
 currentView = "list"; lastView = "list";
  listEl.style.display = "block";
} 
/* ========= DETAIL ========= */
const DETAIL_ORDER = [
  ["V1", "CH-"], ["CH", "V1-"], ["V2", "V2-"],["V3", "V3-"],  ["V4", "V4-"], ["V5", "V5-"], ["V6", "V6-"], ["V7", "V7-"],  ["V8", "V8-"], ["V9", "V9-"], ["V10", "V10-"], ["V11", "V11-"] ];
function showSongDetail(song, index) {  
  if (!song) return;
history.pushState(null, "");
currentIndex = index;
  const translationBlock = song.Translation
    ? `<div class="translation">${song.Translation}</div>`
    : "";
const lyricsParts = [];
for (const [a,b] of DETAIL_ORDER) {
  const key = song[a] ? a : song[b] ? b : null;
  if (!key) continue;
  lyricsParts.push(`<div class="lyrics">${song[key]}</div>`);}
const lyricsBlock = lyricsParts.join("");

 detailEl.innerHTML = `
  <div class="detail-head">
    <div> <span id="favStar" onclick="toggleFav(${index})">☆</span> <span>${song.ID}</span> </div>
  <div>${song.Title}</div>
  </div>
    ${translationBlock}
    <p class="song-meta"><strong>Key:</strong> ${song.Key || "⚪"}</p>
    <p class="song-meta"><strong>Time signature:</strong> ${song["Time signature"] || "⚪"}</p>
    <div>${lyricsBlock}</div>
  `;
  currentView = "detail";
  detailEl.style.display = "block";
  topLeftBtn.textContent = "〈 ";
updateFavStar(currentIndex); 
 sideMenu.classList.remove("open");
closeFavouritePanel();
detailEl.scrollTo(0, 0) ;
}
detailEl.addEventListener("click", e => {
  const x = e.clientX; const y = e.clientY;
  const w = window.innerWidth; const h = window.innerHeight;   
if (y < h * 0.15 || y > h * 0.9 ) return;
if (x < w * 0.24)
{const newIndex = currentIndex - 1;
showSongDetail(baseSongs[newIndex], newIndex); }
  else if (x > w * 0.76) 
{const newIndex = currentIndex + 1;
showSongDetail(baseSongs[newIndex], newIndex); }
});
detailEl.addEventListener("dblclick", e => { openProjection(baseSongs[currentIndex]);
}); 
/* ========= PROJECTION ========= */
const PROJECTION_ORDER = [
  ["V1", "CH-"],  ["CH", "V1-"],  ["V2", "CH-"],
 ["CH", "V2-"], ["V3", "CH-"], ["CH", "V3-"],
["V4", "CH-"], ["CH", "V4-"],  ["V5", "CH-"], ["CH", "V5-"], ["V6", "CH-"],  ["CH", "V6-"], ["V7",  "CH-"], ["CH",  "V7-"], ["V8",  "CH-"], ["CH",  "V8-"], ["V9",  "CH-"], ["CH",  "V9-"],["V10", "CH-"], ["CH",  "V10-"], ["V11", "CH-"], ["CH",  "V11-"] ];
function openProjection(song) { projection.style.display = "block"; 
currentView = "project";
history.pushState(null, "");
let useA = null;
paragraph.length = 0;
cSlide = 0;
for (const [a, b] of PROJECTION_ORDER) {
  if (useA === null) { if (song[a]) useA = true;
    else if (song[b]) useA = false;  
else continue; }
  const key = useA ? a : b;
  if (!song[key]) {
  if (key.startsWith("CH")) continue;
  break;}
 paragraph.push(`<div class="lyrics">${song[key]}</div>`);
} 
paragraph[paragraph.length - 1] +=
  `<div class="pCloseSlide" onclick="closeProjection()">❌</div>`;
projection.innerHTML = paragraph[cSlide];
}
function closeProjection() { projection.style.display = "none";
currentView = "detail";
}
projection.addEventListener("click", e => {
  if (e.clientX < window.innerWidth * 0.26) prevSlide();
  else if (e.clientX > window.innerWidth * 0.74) nextSlide();
});
document.addEventListener("keydown", e => {
  if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") nextSlide();
 else if (e.key === "ArrowUp" || e.key === "ArrowLeft") prevSlide();
else if (e.key === "Escape")
    closeProjection();
});
function nextSlide() { 
if (cSlide === paragraph.length - 1) { projection.scrollBy(0, 500); return; } 
projection.innerHTML = paragraph[++cSlide];
}
function prevSlide() {
  if (cSlide === 0) { closeProjection(); return; }
  projection.innerHTML = paragraph[--cSlide];
}
/* ========= BOOT ========= */
switchDataset("hiuna");

window.addEventListener("popstate", () => {
  if (currentView === "project") {
    closeProjection();
  } else if (currentView === "detail") {
    closeDetail(); }  
});
