// 1. DATA INITIALIZATION
let events = JSON.parse(localStorage.getItem('factory_ledger')) || [];
let archived = JSON.parse(localStorage.getItem('factory_archive')) || [];
let activeMonth = null; // null = show all

// 2. SETUP: Generate Hours 1-12 in dropdowns
function setupTimeDropdowns() {
      const hours = Array.from({ length: 12 }, (_, i) => i + 1);
      ['start-h', 'end-h'].forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                  select.innerHTML = hours.map(h => `<option value="${h}">${h}</option>`).join('');
            }
      });
}

// 4. SERIES GENERATION
// Given a date, returns which week-of-month it falls on (1st, 2nd, 3rd, 4th, or 5th)
// and what day of week it is (0=Sun … 6=Sat).
function getWeekPattern(dateObj) {
      const dayOfWeek = dateObj.getDay();
      const weekNum = Math.ceil(dateObj.getDate() / 7); // 1–5
      return { weekNum, dayOfWeek };
}

// Given a year+month and a {weekNum, dayOfWeek}, find the actual date.
// e.g. 2nd Saturday of May 2026
function dateFromWeekPattern(year, month, weekNum, dayOfWeek) {
      // Find the first occurrence of dayOfWeek in this month
      const first = new Date(year, month, 1, 12);
      const diff = (dayOfWeek - first.getDay() + 7) % 7;
      const day = 1 + diff + (weekNum - 1) * 7;
      const result = new Date(year, month, day, 12);
      // If it overflowed into the next month (e.g. 5th Saturday doesn't exist),
      // fall back to the 4th occurrence instead.
      if (result.getMonth() !== month) {
            return new Date(year, month, day - 7, 12);
      }
      return result;
}

// Returns array of ISO date strings for all occurrences from startDate through year-end.
// MONTHLY repeat uses "same week-of-month + same day-of-week" pattern (e.g. 1st Saturday).
// Skips any dates strictly in the past (before today).
function generateSeriesDates(startDateStr, repeat) {
      const dates = [];
      const start = new Date(startDateStr + 'T12:00:00');
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      const year = Math.max(start.getFullYear(), today.getFullYear());
      const yearEnd = new Date(`${year}-12-31T12:00:00`);

      if (repeat === 'MONTHLY') {
            // Determine the week pattern from the original start date
            const { weekNum, dayOfWeek } = getWeekPattern(start);

            // Walk month by month from start month through December
            const startMonth = start.getMonth();
            for (let m = startMonth; m <= 11; m++) {
                  const occurrence = dateFromWeekPattern(year, m, weekNum, dayOfWeek);
                  if (occurrence >= today && occurrence <= yearEnd) {
                        dates.push(occurrence.toISOString().split('T')[0]);
                  }
            }
            return dates;
      }

      // WEEKLY / ANNUAL: advance cursor to first occurrence on or after today
      let cursor = new Date(start);

      while (cursor < today) {
            if (repeat === 'WEEKLY') {
                  cursor.setDate(cursor.getDate() + 7);
            } else if (repeat === 'ANNUAL') {
                  cursor.setFullYear(cursor.getFullYear() + 1);
            } else {
                  break;
            }
      }

      while (cursor <= yearEnd) {
            dates.push(cursor.toISOString().split('T')[0]);

            if (repeat === 'WEEKLY') {
                  cursor.setDate(cursor.getDate() + 7);
            } else if (repeat === 'ANNUAL') {
                  cursor.setFullYear(cursor.getFullYear() + 1);
            } else {
                  break;
            }
      }

      return dates;
}

// 5. DATA ACTIONS
function handleSave() {
      const id = document.getElementById('modal-id').value;
      const data = {
            name: document.getElementById('modal-name').value,
            date: document.getElementById('modal-date').value,
            loc: document.getElementById('modal-loc').value,
            contact: document.getElementById('modal-contact').value,
            img: document.getElementById('modal-img').value.trim(),
            startH: document.getElementById('start-h').value,
            startM: document.getElementById('start-m').value,
            startAP: document.getElementById('start-ap').value,
            endH: document.getElementById('end-h').value,
            endM: document.getElementById('end-m').value,
            endAP: document.getElementById('end-ap').value,
            category: document.getElementById('modal-category').value,
            status: document.getElementById('modal-status').value,
            specs: document.getElementById('modal-specs').value,
            repeat: document.getElementById('modal-repeat').value
      };

      if (!data.name || !data.date) return alert("Required: Designation & Operational Date");

      if (id) {
            const existing = events.find(e => e.id == id);
            const wasOrphanSeries = data.repeat && data.repeat !== 'NONE' && existing && !existing.seriesId;

            if (wasOrphanSeries) {
                  // Event has a repeat type but was never expanded into a series.
                  // Remove the old single entry (which may be in the past) and regenerate
                  // all occurrences from today forward through year-end.
                  events = events.filter(e => e.id != id);
                  const seriesId = Date.now();
                  const dates = generateSeriesDates(data.date, data.repeat);
                  dates.forEach((d, i) => {
                        events.push({
                              id: seriesId + i,
                              seriesId,
                              ...data,
                              date: d
                        });
                  });
            } else {
                  // Normal single-entry edit
                  const idx = events.findIndex(e => e.id == id);
                  events[idx] = { ...events[idx], ...data };
            }
      } else {
            // New entry
            if (data.repeat && data.repeat !== 'NONE') {
                  // Generate a series
                  const seriesId = Date.now();
                  const dates = generateSeriesDates(data.date, data.repeat);
                  dates.forEach((d, i) => {
                        events.push({
                              id: seriesId + i,
                              seriesId: seriesId,
                              ...data,
                              date: d
                        });
                  });
            } else {
                  events.push({ id: Date.now(), ...data });
            }
      }

      localStorage.setItem('factory_ledger', JSON.stringify(events));
      renderEvents();
      closeModal();
}

function handleSearch() {
      const term = document.getElementById('search-input').value.toLowerCase();
      const filtered = events.filter(e =>
            e.name.toLowerCase().includes(term) ||
            e.loc.toLowerCase().includes(term) ||
            e.category.toLowerCase().includes(term)
      );
      renderEvents(filtered);
}

function openModalForEdit(id) {
      const e = events.find(event => event.id === id);
      document.getElementById('modal-id').value = e.id;
      document.getElementById('modal-name').value = e.name;
      document.getElementById('modal-date').value = e.date;
      document.getElementById('modal-loc').value = e.loc;
      document.getElementById('modal-contact').value = e.contact;
      document.getElementById('modal-img').value = e.img || "";
      document.getElementById('start-h').value = e.startH;
      document.getElementById('start-m').value = e.startM;
      document.getElementById('start-ap').value = e.startAP;
      document.getElementById('end-h').value = e.endH;
      document.getElementById('end-m').value = e.endM;
      document.getElementById('end-ap').value = e.endAP;
      document.getElementById('modal-category').value = e.category || "CORP";
      document.getElementById('modal-status').value = e.status || "DRAFT";
      document.getElementById('modal-specs').value = e.specs || "";
      document.getElementById('modal-repeat').value = e.repeat || "NONE";

      document.getElementById('event-modal').classList.remove('hidden');
}

function openModalForCreate() {
      document.getElementById('modal-id').value = "";
      const fields = ['modal-name', 'modal-date', 'modal-loc', 'modal-contact', 'modal-img', 'modal-specs'];
      fields.forEach(f => document.getElementById(f).value = "");
      document.getElementById('event-modal').classList.remove('hidden');
}

// 6. DELETE — single or entire series
function deleteEvent(id) {
      const event = events.find(e => e.id === id);
      document.getElementById('delete-id-storage').value = id;

      // Show series delete options if part of a series
      const seriesControls = document.getElementById('delete-series-controls');
      if (event && event.seriesId) {
            const seriesCount = events.filter(e => e.seriesId === event.seriesId).length;
            document.getElementById('delete-series-count').textContent = seriesCount;
            seriesControls.classList.remove('hidden');
      } else {
            seriesControls.classList.add('hidden');
      }

      document.getElementById('delete-modal').classList.remove('hidden');
}

function executeFinalDelete() {
      const id = parseInt(document.getElementById('delete-id-storage').value);
      const event = events.find(e => e.id === id);
      if (event) {
            event.archivedAt = new Date().toISOString();
            archived.push(event);
            localStorage.setItem('factory_archive', JSON.stringify(archived));
      }
      events = events.filter(e => e.id !== id);
      localStorage.setItem('factory_ledger', JSON.stringify(events));
      renderEvents();
      closeDeleteModal();
}

function executeSeriesDelete() {
      const id = parseInt(document.getElementById('delete-id-storage').value);
      const event = events.find(e => e.id === id);
      if (!event || !event.seriesId) return executeFinalDelete();

      const seriesId = event.seriesId;
      const seriesEvents = events.filter(e => e.seriesId === seriesId);

      // Archive all series members
      seriesEvents.forEach(e => {
            e.archivedAt = new Date().toISOString();
            archived.push(e);
      });
      localStorage.setItem('factory_archive', JSON.stringify(archived));

      events = events.filter(e => e.seriesId !== seriesId);
      localStorage.setItem('factory_ledger', JSON.stringify(events));
      renderEvents();
      closeDeleteModal();
}

function restoreEvent(id) {
      const event = archived.find(e => e.id === id);
      if (event) {
            delete event.archivedAt;
            events.push(event);
            archived = archived.filter(e => e.id !== id);
            localStorage.setItem('factory_ledger', JSON.stringify(events));
            localStorage.setItem('factory_archive', JSON.stringify(archived));
            renderEvents();
            renderArchive();
      }
}

function purgeArchived(id) {
      archived = archived.filter(e => e.id !== id);
      localStorage.setItem('factory_archive', JSON.stringify(archived));
      renderArchive();
}

function openSettings() {
      renderArchive();
      document.getElementById('settings-modal').classList.remove('hidden');
}

function closeSettings() {
      document.getElementById('settings-modal').classList.add('hidden');
}

function renderArchive() {
      const container = document.getElementById('archive-list');
      if (archived.length === 0) {
            container.innerHTML = `<p class="font-mono text-[10px] text-gray-400 uppercase text-center py-8">No archived entries.</p>`;
            return;
      }
      container.innerHTML = archived.map(e => {
            const date = e.archivedAt ? new Date(e.archivedAt).toLocaleDateString() : '—';
            return `
            <div class="flex items-center justify-between border-b border-gray-200 py-3 gap-4">
                  <div class="min-w-0">
                        <div class="font-bold uppercase italic text-sm truncate">${e.name}</div>
                        <div class="font-mono text-[9px] text-gray-400 uppercase">Archived ${date} &bull; ${e.category || 'EVENT'}</div>
                  </div>
                  <div class="flex gap-2 flex-shrink-0">
                        <button onclick="restoreEvent(${e.id})" class="text-[9px] font-bold uppercase tracking-widest px-3 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors">Restore</button>
                        <button onclick="purgeArchived(${e.id})" class="text-[9px] font-bold uppercase tracking-widest px-3 py-2 border-2 border-red-800 text-red-800 hover:bg-red-800 hover:text-white transition-colors">Purge</button>
                  </div>
            </div>`;
      }).join('');
}

function closeModal() { document.getElementById('event-modal').classList.add('hidden'); }
function closeDeleteModal() { document.getElementById('delete-modal').classList.add('hidden'); }

// 6b. MONTH FILTER BAR
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function renderMonthBar() {
      const bar = document.getElementById('month-filter-bar');
      if (!bar) return;

      // Which months actually have events?
      const monthsWithEvents = new Set(
            events.map(e => new Date(e.date + 'T12:00:00').getMonth())
      );

      bar.innerHTML = '';

      // "ALL" pill
      const allBtn = document.createElement('button');
      allBtn.type = 'button';
      allBtn.textContent = 'ALL';
      allBtn.className = `month-pill ${activeMonth === null ? 'month-pill-active' : ''}`;
      allBtn.onclick = () => { activeMonth = null; renderMonthBar(); renderEvents(); };
      bar.appendChild(allBtn);

      MONTHS.forEach((label, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = label;
            const hasEvents = monthsWithEvents.has(idx);
            btn.className = `month-pill ${activeMonth === idx ? 'month-pill-active' : ''} ${!hasEvents ? 'month-pill-empty' : ''}`;
            btn.onclick = () => {
                  activeMonth = idx;
                  renderMonthBar();
                  renderEvents();
                  // Scroll to first event card in that month
                  setTimeout(() => {
                        const anchor = document.getElementById(`month-anchor-${idx}`);
                        if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 50);
            };
            bar.appendChild(btn);
      });
}

// Override renderEvents to respect activeMonth filter and inject month anchors
const _baseRenderEvents = renderEvents;
function renderEvents(list = events) {
      // Apply month filter on top of whatever list is passed in
      const filtered = activeMonth !== null
            ? list.filter(e => new Date(e.date + 'T12:00:00').getMonth() === activeMonth)
            : list;

      const container = document.getElementById('event-container');
      container.innerHTML = '';

      const sortedList = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));

      let lastMonth = null;

      sortedList.forEach(event => {
            const dateObj = new Date(event.date + 'T12:00:00');
            const monthIdx = dateObj.getMonth();
            const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
            const timeRange = `${event.startH}:${event.startM} ${event.startAP} — ${event.endH}:${event.endM} ${event.endAP}`;

            // Inject invisible month anchor when month changes
            if (monthIdx !== lastMonth) {
                  const anchor = document.createElement('div');
                  anchor.id = `month-anchor-${monthIdx}`;
                  anchor.className = 'month-section-header';
                  anchor.textContent = MONTHS[monthIdx] + ' ' + dateObj.getFullYear();
                  container.appendChild(anchor);
                  lastMonth = monthIdx;
            }

            const repeatHtml = (event.repeat && event.repeat !== 'NONE')
                  ? `<div class="series-tag">Series: ${event.repeat}</div>`
                  : '';

            const div = document.createElement('div');
            div.className = 'event-card group flex flex-row items-stretch justify-between border-b border-black py-6 md:py-8 gap-4 relative';

            const imgTag = (event.img && event.img.trim() !== '')
                  ? `<img src="${event.img}" onerror="this.remove()" class="w-20 md:w-16 h-20 md:h-16 object-cover border-2 border-black grayscale flex-shrink-0">`
                  : '';

            div.innerHTML = `
            <div class="flex items-stretch gap-4 md:gap-8 flex-1 min-w-0">
                  <div class="w-20 md:w-24 text-center border-r-2 border-black pr-4 flex flex-col justify-center flex-shrink-0">
                        <span class="block text-[10px] md:text-xs font-mono font-bold group-hover:text-red-900 transition-colors">${month}</span>
                        <span class="text-2xl md:text-4xl font-bold leading-none group-hover:text-red-900 transition-colors">${dateObj.getUTCDate()}</span>
                        <span class="block text-[8px] font-mono mt-1">${dateObj.getFullYear()}</span>
                  </div>
                  <div class="flex flex-row items-center gap-4 flex-1 min-w-0">
                        ${imgTag}
                        <div class="min-w-0">
                              <div class="flex items-center gap-2 mb-1">
                                    <span class="badge">[${event.category || 'EVENT'}]</span>
                                    <span class="badge status-${event.status || 'DRAFT'}">${event.status || 'DRAFT'}</span>
                              </div>
                              <h3 class="text-xl md:text-3xl font-bold italic uppercase leading-tight truncate">${event.name}</h3>
                              <div class="flex flex-wrap gap-x-3 gap-y-1 mt-1 font-mono text-[9px] md:text-[10px] uppercase text-gray-500">
                                    <span>${event.loc}</span>
                                    <span class="text-black font-bold">${timeRange}</span>
                              </div>
                              ${repeatHtml}
                              <p class="hidden group-hover:block absolute left-24 bottom-1 bg-black text-white text-[7px] font-mono p-1 z-10 max-w-xs">
                              TECH: ${event.specs ? event.specs.substring(0, 60) : 'NO SPEC DATA'}
                              </p>
                        </div>
                  </div>
            </div>
            <div class="flex flex-col items-center gap-1 pr-2">
                  <button onclick="openModalForEdit(${event.id})" class="text-gray-400 hover:text-black transition-colors p-4">
                        <i data-lucide="pencil" class="w-4 h-4 md:w-6 md:h-5"></i>
                  </button>
                  <button onclick="deleteEvent(${event.id})" class="text-gray-400 hover:text-red-800 transition-colors p-4">
                        <i data-lucide="trash-2" class="w-4 h-4 md:w-6 md:h-5"></i>
                  </button>
            </div>`;
            container.appendChild(div);
      });

      if (sortedList.length === 0) {
            container.innerHTML = `<p class="font-mono text-[10px] text-gray-400 uppercase text-center py-16">No entries for this period.</p>`;
      }

      lucide.createIcons();
      renderMonthBar();
}

// 7. BOOTSTRAP
setupTimeDropdowns();
renderEvents();
