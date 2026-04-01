const STORAGE_KEY = "weight-tracker-entries-v1";

const form = document.getElementById("entry-form");
const dateInput = document.getElementById("date");
const weightInput = document.getElementById("weight");
const noteInput = document.getElementById("note");
const entriesBody = document.getElementById("entries-body");
const latestValue = document.getElementById("latest-value");
const avgValue = document.getElementById("avg-value");
const chart = document.getElementById("chart");
const csvButton = document.getElementById("download-csv");
const csvImportInput = document.getElementById("csv-import");
const resetAllBtn = document.getElementById("reset-all");

dateInput.value = todayAsText();
fillFormForDate(dateInput.value);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const date = dateInput.value;
  const weight = Number(weightInput.value);
  const note = noteInput.value.trim();

  if (!date || Number.isNaN(weight) || weight < 20 || weight > 300) {
    alert("入力内容を確認してください。体重は20〜300kgの範囲です。");
    return;
  }

  const entries = loadEntries();
  const duplicates = entries.filter((e) => e.date === date);
  if (duplicates.length > 0) {
    const ok = confirm(`同じ日付（${date}）に既に ${duplicates.length} 件の記録があります。上書きしますか？`);
    if (!ok) return;
  }
  const nextEntries = entries.filter((e) => e.date !== date);
  const newEntry = {
    id: newId(),
    date,
    weight: round1(weight),
    note,
    createdAt: new Date().toISOString()
  };

  nextEntries.push(newEntry);
  saveEntries(nextEntries);
  render();

  weightInput.value = "";
  noteInput.value = "";
  dateInput.value = todayAsText();
  weightInput.focus();
});

dateInput.addEventListener("change", () => {
  fillFormForDate(dateInput.value);
});

resetAllBtn.addEventListener("click", () => {
  const ok = confirm("本当に全ての記録を削除しますか？この操作は戻せません。");
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  dateInput.value = todayAsText();
  weightInput.value = "";
  noteInput.value = "";
  fillFormForDate(dateInput.value);
  render();
});

csvButton.addEventListener("click", () => {
  const sorted = getSortedEntries();
  if (sorted.length === 0) {
    alert("出力できるデータがありません。");
    return;
  }

  const lines = ["date,weight,note"];
  for (const entry of sorted) {
    const escapedNote = `"${(entry.note || "").replaceAll('"', '""')}"`;
    lines.push(`${entry.date},${entry.weight},${escapedNote}`);
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `weights-${todayAsText()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

csvImportInput.addEventListener("change", async () => {
  const file = csvImportInput.files && csvImportInput.files[0];
  if (!file) return;

  // Excel由来などでBOMが先頭に入ることがあるため除去しておく
  const text = (await file.text()).replace(/^\uFEFF/, "");
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    alert("CSVが空です。");
    csvImportInput.value = "";
    return;
  }

  // Header: date,weight,note を想定（先頭行がヘッダでなければそのまま処理します）
  const startIndex = lines[0].toLowerCase().startsWith("date,") ? 1 : 0;

  // CSV内で同じ日付が複数あった場合は、最後の行だけを採用する
  const importedByDate = new Map();
  for (let i = startIndex; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length < 2) continue;
    const date = (fields[0] || "").trim();
    const weight = Number((fields[1] || "").trim());
    const note = (fields[2] || "").trim();

    if (!isValidDate(date)) continue;
    if (!Number.isFinite(weight) || weight < 20 || weight > 300) continue;

    importedByDate.set(date, {
      id: newId(),
      date,
      weight: round1(weight),
      note,
      createdAt: new Date().toISOString()
    });
  }

  const imported = Array.from(importedByDate.values());

  if (imported.length === 0) {
    alert("CSVの形式を読み取れませんでした（date,weight,note を想定）。");
    csvImportInput.value = "";
    return;
  }

  const existing = loadEntries();
  const importedDates = new Set(imported.map((e) => e.date));
  const overwrittenCount = existing.filter((e) => importedDates.has(e.date)).length;

  const ok = confirm(
    `CSVから ${imported.length} 日分読み込みました（同日が複数ある場合は最後の行を採用）。\n既存の同日記録を ${overwrittenCount} 件上書きして取り込みます。よろしいですか？`
  );
  if (!ok) {
    csvImportInput.value = "";
    return;
  }

  const merged = existing.filter((e) => !importedDates.has(e.date)).concat(imported);
  saveEntries(merged);
  render();

  csvImportInput.value = "";
});

function render() {
  const sorted = getSortedEntries();
  renderTable(sorted);
  renderStats(sorted);
  renderChart(sorted);
}

function renderTable(sortedEntries) {
  if (sortedEntries.length === 0) {
    entriesBody.innerHTML = '<tr><td colspan="4" class="empty">まだ記録がありません。</td></tr>';
    return;
  }

  const rows = sortedEntries
    .slice()
    .reverse()
    .map(
      (entry) => `
      <tr>
        <td>${entry.date}</td>
        <td>${entry.weight.toFixed(1)}</td>
        <td>${escapeHtml(entry.note || "")}</td>
        <td><button class="danger" data-id="${entry.id}">削除</button></td>
      </tr>
    `
    )
    .join("");

  entriesBody.innerHTML = rows;
  for (const button of entriesBody.querySelectorAll("button[data-id]")) {
    button.addEventListener("click", () => {
      if (!confirm("この記録を削除しますか？")) {
        return;
      }
      const entries = loadEntries().filter((e) => e.id !== button.dataset.id);
      saveEntries(entries);
      render();
    });
  }
}

function renderStats(sortedEntries) {
  if (sortedEntries.length === 0) {
    latestValue.textContent = "-";
    avgValue.textContent = "-";
    return;
  }
  const latest = sortedEntries[sortedEntries.length - 1];
  latestValue.textContent = `${latest.weight.toFixed(1)} kg`;

  const lastSeven = sortedEntries.slice(-7);
  const sum = lastSeven.reduce((acc, cur) => acc + cur.weight, 0);
  avgValue.textContent = `${(sum / lastSeven.length).toFixed(1)} kg`;
}

function renderChart(sortedEntries) {
  const ctx = chart.getContext("2d");
  const width = chart.width;
  const height = chart.height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  if (sortedEntries.length === 0) {
    ctx.fillStyle = "#475569";
    ctx.font = "16px sans-serif";
    ctx.fillText("データがありません", 24, 40);
    return;
  }

  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;
  const weights = sortedEntries.map((e) => e.weight);
  const min = Math.min(...weights) - 1;
  const max = Math.max(...weights) + 1;
  const range = Math.max(max - min, 1);

  ctx.strokeStyle = "#dbe2ea";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, height - pad.bottom);
  ctx.lineTo(width - pad.right, height - pad.bottom);
  ctx.stroke();

  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2;
  ctx.beginPath();

  sortedEntries.forEach((entry, index) => {
    const x =
      sortedEntries.length === 1
        ? pad.left + chartWidth / 2
        : pad.left + (index / (sortedEntries.length - 1)) * chartWidth;
    const y = pad.top + ((max - entry.weight) / range) * chartHeight;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = "#0f172a";
  ctx.font = "12px sans-serif";
  ctx.fillText(max.toFixed(1), 10, pad.top + 4);
  ctx.fillText(min.toFixed(1), 10, height - pad.bottom + 4);

  const first = sortedEntries[0].date;
  const last = sortedEntries[sortedEntries.length - 1].date;
  ctx.fillText(first, pad.left, height - 12);
  ctx.fillText(last, width - pad.right - ctx.measureText(last).width, height - 12);
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && item.date && Number.isFinite(item.weight))
      .map((item) => ({ ...item, weight: Number(item.weight) }));
  } catch (_error) {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getSortedEntries() {
  return loadEntries().slice().sort((a, b) => a.date.localeCompare(b.date));
}

function findLatestEntryForDate(date) {
  // CSVインポートや過去データで「同日が複数件」になっても、表示/入力は最新(createdAt)を使う
  const entries = loadEntries().filter((e) => e.date === date);
  if (entries.length === 0) return null;
  return entries
    .slice()
    .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")))
    .pop();
}

function fillFormForDate(date) {
  const entry = findLatestEntryForDate(date);
  if (!entry) {
    // 新規入力を邪魔しないよう、値が未入力でなければクリアしない方針でもよいが
    // 今回は「日付を変えたらその日を反映」を優先してクリアする
    weightInput.value = "";
    noteInput.value = "";
    return;
  }
  weightInput.value = entry.weight.toString();
  noteInput.value = entry.note || "";
}

function todayAsText() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function newId() {
  // modern browsers: crypto.randomUUID
  if (typeof crypto !== "undefined" && crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // fallback: unique enough for local-only use
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isValidDate(ymd) {
  // YYYY-MM-DD strict check
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const d = new Date(`${ymd}T00:00:00`);
  return !Number.isNaN(d.getTime());
}

function parseCsvLine(line) {
  // Minimal CSV parser for quoted fields with commas/quotes
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // Escaped quote: "" inside quoted field
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      fields.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  fields.push(current);
  return fields;
}

render();
