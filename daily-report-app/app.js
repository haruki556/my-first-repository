const STORAGE_KEY = "daily-report-entries-v1";
const WEEKLY_STORAGE_KEY = "weekly-report-entries-v1";
const MONTHLY_STORAGE_KEY = "monthly-report-entries-v1";

const form = document.getElementById("report-form");
const dateInput = document.getElementById("date");
const doneInput = document.getElementById("done");
const goodInput = document.getElementById("good");
const reflectInput = document.getElementById("reflect");
const thanksInput = document.getElementById("thanks");
const tomorrowInput = document.getElementById("tomorrow");
const entriesList = document.getElementById("entries-list");

const weeklyForm = document.getElementById("weekly-form");
const weekDateInput = document.getElementById("week-date");
const weekDoneInput = document.getElementById("week-done");
const weekLearningInput = document.getElementById("week-learning");
const weekTomorrowInput = document.getElementById("week-tomorrow");
const weekMemoInput = document.getElementById("week-memo");
const weeklyEntriesList = document.getElementById("weekly-entries-list");

const monthlyForm = document.getElementById("monthly-form");
const monthInput = document.getElementById("month");
const monthDoneInput = document.getElementById("month-done");
const monthLearningInput = document.getElementById("month-learning");
const monthReflectInput = document.getElementById("month-reflect");
const monthTomorrowInput = document.getElementById("month-tomorrow");
const monthMemoInput = document.getElementById("month-memo");
const monthlyEntriesList = document.getElementById("monthly-entries-list");
const resetAllBtn = document.getElementById("reset-all");
const downloadJsonBtn = document.getElementById("download-json");
const downloadDailyMarkdownBtn = document.getElementById("download-daily-markdown");
const downloadDailyCompactMarkdownBtn = document.getElementById("download-daily-compact-markdown");
const downloadWeeklyMarkdownBtn = document.getElementById("download-weekly-markdown");
const downloadMonthlyMarkdownBtn = document.getElementById("download-monthly-markdown");
const jsonImportInput = document.getElementById("json-import");

// 既存で書いていた日報（daily-reports/2026-03.md）を、初期データとして取り込む
// ※アプリの5項目へ“できるだけ内容を分配”して保持します（ラベル完全一致ではなく内容重視）
const SEED_DAILY_ENTRIES = [
  {
    date: "2026-03-06",
    done: ["ブログの「話し合いの講座」を55%まで進めた。", "ブログ解説パートで、楽天証券の解説方法を約30%作成。", "SWELLを使って、少しずつ発信の準備・作業を進めた。"].join("\n"),
    good: ["ブログと発信の準備が同時に少しずつでも進むと、前に進んでいる感覚があって良い。", "「何％進んだか」で振り返ると、小さな前進も見えやすい。"].join(
      "\n"
    ),
    reflect: ["ブログと発信の準備が同時に少しずつでも進むと、前に進んでいる感覚があって良い。", "「何％進んだか」で振り返ると、小さな前進も見えやすい。"].join(
      "\n"
    ),
    thanks: ["ブログと発信の準備が同時に少しずつでも進むと、前に進んでいる感覚があって良い。"].join("\n"),
    tomorrow: ["ブログの講座を今日より少しでも進める（＋10〜20%を目標）。", "楽天証券の解説パートを、具体的な手順や画像イメージまで固める。", "SWELLでトップページや記事ページのレイアウトを1つ決める。"].join(
      "\n"
    )
  },
  {
    date: "2026-03-10",
    done: ["ライティング講座を70%まで進めた。", "AIの動画を1つ視聴して学習を進めた。", "noteに関する初回打ち合わせを実施。", "ブログやインスタ発信のリサーチを進め、発信内容の方向性を少しずつ整理した。"].join(
      "\n"
    ),
    good: [
      "家族でおしゃれなカフェに行き、良い時間を過ごせた。",
      "自分の「好き」が詰まった空間に触れて、感性が刺激された。",
      "発信の迷いがある中でも、リサーチをきちんと進められた。"
    ].join("\n"),
    reflect: [
      "お金ジャンルは意欲が湧きにくいと分かったので、「稼げそう」より「続けられそう」でテーマを再整理する。",
      "ブログ・インスタ・SNS運用代行の方針がやや重なっているため、まずは軸を1つ決める。",
      "良いカフェで感じたことのように、日常で気づいた「好き」をその場で言語化する習慣をつくる。",
      "今日は「進めながら、自分の本音にも気づけた1日」。迷いは後退ではなく、方向を整えるための大事な材料だと感じた。"
    ].join("\n"),
    thanks: [
      "家族でおしゃれなカフェに行き、良い時間を過ごせた。",
      "自分の「好き」が詰まった空間に触れて、感性が刺激された。"
    ].join("\n"),
    tomorrow: [
      "発信ジャンル候補を3つ書き出し、「興味」「続けやすさ」「収益化」の3軸で整理する。",
      "ブログとインスタで発信したいテーマをそれぞれ3案ずつ出す。",
      "SNS運用代行について、「誰に・何を・どの媒体で支援するか」をメモで整理する。"
    ].join("\n")
  }
];

ensureSeeded();

dateInput.value = todayAsText();
fillFormForDate(dateInput.value);

weekDateInput.value = todayAsText();
fillWeeklyFormForDate(weekDateInput.value);

monthInput.value = monthAsText();
fillMonthlyFormForMonth(monthInput.value);

renderWeeklyList();
renderMonthlyList();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const date = dateInput.value;
  const draft = buildDraft();

  if (!date || !isAllFilled(draft)) {
    alert("全ての項目を入力してください。");
    return;
  }

  const entries = loadEntries();
  const exists = entries.some((entry) => entry.date === date);
  if (exists) {
    const ok = confirm(`日付 ${date} の記録は既にあります。上書きしますか？`);
    if (!ok) return;
  }

  const nextEntries = entries.filter((entry) => entry.date !== date);
  nextEntries.push({
    id: newId(),
    date,
    ...draft,
    createdAt: new Date().toISOString()
  });
  saveEntries(nextEntries);
  render();
  alert("保存しました。");
});

dateInput.addEventListener("change", () => {
  fillFormForDate(dateInput.value);
});

weeklyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const date = weekDateInput.value;
  if (!date) return;
  const draft = buildWeeklyDraft();
  if (!isWeeklyAllFilled(draft)) {
    alert("週報の全項目を入力してください。");
    return;
  }

  const weekStart = mondayOfWeek(date);
  const entries = loadWeeklyEntries();
  const exists = entries.some((entry) => entry.weekStart === weekStart);
  if (exists) {
    const ok = confirm(`週（${weekStart}）の記録は既にあります。上書きしますか？`);
    if (!ok) return;
  }

  const nextEntries = entries.filter((entry) => entry.weekStart !== weekStart);
  nextEntries.push({
    id: newId(),
    weekStart,
    done: draft.done,
    learning: draft.learning,
    tomorrow: draft.tomorrow,
    memo: draft.memo,
    createdAt: new Date().toISOString()
  });
  saveWeeklyEntries(nextEntries);
  renderWeeklyList();
  alert("週報を保存しました。");
});

weekDateInput.addEventListener("change", () => {
  fillWeeklyFormForDate(weekDateInput.value);
});

monthlyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const ym = monthInput.value;
  if (!ym) return;
  const draft = buildMonthlyDraft();
  if (!isMonthlyAllFilled(draft)) {
    alert("月報の全項目を入力してください。");
    return;
  }

  const entries = loadMonthlyEntries();
  const exists = entries.some((entry) => entry.month === ym);
  if (exists) {
    const ok = confirm(`月（${ym}）の記録は既にあります。上書きしますか？`);
    if (!ok) return;
  }

  const nextEntries = entries.filter((entry) => entry.month !== ym);
  nextEntries.push({
    id: newId(),
    month: ym,
    done: draft.done,
    learning: draft.learning,
    reflect: draft.reflect,
    tomorrow: draft.tomorrow,
    memo: draft.memo,
    createdAt: new Date().toISOString()
  });
  saveMonthlyEntries(nextEntries);
  renderMonthlyList();
  alert("月報を保存しました。");
});

monthInput.addEventListener("change", () => {
  fillMonthlyFormForMonth(monthInput.value);
});

resetAllBtn.addEventListener("click", () => {
  const ok = confirm("本当に全データを削除しますか？この操作は戻せません。");
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(WEEKLY_STORAGE_KEY);
  localStorage.removeItem(MONTHLY_STORAGE_KEY);
  dateInput.value = todayAsText();
  clearFormFields();
  weekDateInput.value = todayAsText();
  clearWeeklyFormFields();
  monthInput.value = monthAsText();
  clearMonthlyFormFields();
  render();
  renderWeeklyList();
  renderMonthlyList();
});

downloadJsonBtn.addEventListener("click", () => {
  const entries = getSortedEntries();
  if (entries.length === 0) {
    alert("出力できるデータがありません。");
    return;
  }

  const blob = new Blob([JSON.stringify(entries, null, 2)], {
    type: "application/json;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `daily-reports-${todayAsText()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

downloadDailyMarkdownBtn.addEventListener("click", () => {
  const ym = dateInput.value ? dateInput.value.slice(0, 7) : "";
  if (!/^\d{4}-\d{2}$/.test(ym)) return alert("日付の形式が正しくありません。");

  const monthEntries = getSortedEntries().filter((entry) => entry.date.startsWith(ym));
  if (monthEntries.length === 0) return alert("対象月の記録がありません。");

  const markdown = buildDailyMonthlyMarkdown(monthEntries);
  downloadTextFile(markdown, `daily-${ym}.md`);
});

downloadDailyCompactMarkdownBtn.addEventListener("click", () => {
  const ym = dateInput.value ? dateInput.value.slice(0, 7) : "";
  if (!/^\d{4}-\d{2}$/.test(ym)) return alert("日付の形式が正しくありません。");

  const dailyEntriesAll = loadEntries();
  const monthEntries = dailyEntriesAll.filter((entry) => entry.date.startsWith(ym));
  if (monthEntries.length === 0) return alert("対象月の記録がありません。");

  const markdown = buildDailyWeeklyGroupedMarkdown(ym, monthEntries);
  downloadTextFile(markdown, `daily-compact-${ym}.md`);
});

downloadWeeklyMarkdownBtn.addEventListener("click", () => {
  const ym = dateInput.value ? dateInput.value.slice(0, 7) : "";
  if (!/^\d{4}-\d{2}$/.test(ym)) return alert("日付の形式が正しくありません。");

  const dailyEntriesAll = loadEntries();
  const weeklyEntriesAll = loadWeeklyEntries();
  if (dailyEntriesAll.length === 0 && weeklyEntriesAll.length === 0) return alert("対象月の記録がありません。");

  const markdown = buildWeeklyMarkdownForMonth(ym, dailyEntriesAll, weeklyEntriesAll);
  downloadTextFile(markdown, `weekly-${ym}.md`);
});

downloadMonthlyMarkdownBtn.addEventListener("click", () => {
  const ym = dateInput.value ? dateInput.value.slice(0, 7) : "";
  if (!/^\d{4}-\d{2}$/.test(ym)) return alert("日付の形式が正しくありません。");

  const dailyEntriesAll = loadEntries();
  const monthlyEntriesAll = loadMonthlyEntries();
  if (dailyEntriesAll.length === 0 && monthlyEntriesAll.length === 0) return alert("対象月の記録がありません。");

  const markdown = buildMonthlyMarkdownForMonth(ym, dailyEntriesAll, monthlyEntriesAll);
  downloadTextFile(markdown, `monthly-${ym}.md`);
});

jsonImportInput.addEventListener("change", async () => {
  const file = jsonImportInput.files && jsonImportInput.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      throw new Error("invalid");
    }

    const importedByDate = new Map();
    for (const item of parsed) {
      const normalized = normalizeEntry(item);
      if (!normalized) continue;
      importedByDate.set(normalized.date, normalized);
    }
    const imported = Array.from(importedByDate.values());
    if (imported.length === 0) {
      alert("読み込めるデータがありません。");
      jsonImportInput.value = "";
      return;
    }

    const existing = loadEntries();
    const importedDates = new Set(imported.map((entry) => entry.date));
    const overwrittenCount = existing.filter((entry) => importedDates.has(entry.date)).length;
    const ok = confirm(
      `${imported.length}件の記録を読み込みます。\n既存の同日記録を${overwrittenCount}件上書きします。よろしいですか？`
    );
    if (!ok) {
      jsonImportInput.value = "";
      return;
    }

    const merged = existing.filter((entry) => !importedDates.has(entry.date)).concat(imported);
    saveEntries(merged);
    render();
  } catch (_error) {
    alert("JSONの形式が正しくありません。");
  } finally {
    jsonImportInput.value = "";
  }
});

function render() {
  const entries = getSortedEntries().slice().reverse();
  if (entries.length === 0) {
    entriesList.innerHTML = '<p class="empty">まだ記録がありません。</p>';
    return;
  }

  entriesList.innerHTML = entries
    .map(
      (entry) => `
      <article class="entry">
        <div class="entry-head">
          <h3 class="entry-date">${entry.date}</h3>
          <button type="button" class="danger" data-id="${entry.id}">削除</button>
        </div>
        <div class="entry-grid">
          <section class="entry-item"><h4>やったこと</h4><p>${escapeHtml(entry.done)}</p></section>
          <section class="entry-item"><h4>良かったこと</h4><p>${escapeHtml(entry.good)}</p></section>
          <section class="entry-item"><h4>反省点</h4><p>${escapeHtml(entry.reflect)}</p></section>
          <section class="entry-item"><h4>感謝すること</h4><p>${escapeHtml(entry.thanks)}</p></section>
          <section class="entry-item"><h4>明日やること</h4><p>${escapeHtml(entry.tomorrow)}</p></section>
        </div>
      </article>
    `
    )
    .join("");

  for (const button of entriesList.querySelectorAll("button[data-id]")) {
    button.addEventListener("click", () => {
      const ok = confirm("この日報を削除しますか？");
      if (!ok) return;
      const nextEntries = loadEntries().filter((entry) => entry.id !== button.dataset.id);
      saveEntries(nextEntries);
      render();
    });
  }
}

function buildDraft() {
  return {
    done: doneInput.value.trim(),
    good: goodInput.value.trim(),
    reflect: reflectInput.value.trim(),
    thanks: thanksInput.value.trim(),
    tomorrow: tomorrowInput.value.trim()
  };
}

function isAllFilled(draft) {
  return draft.done && draft.good && draft.reflect && draft.thanks && draft.tomorrow;
}

function fillFormForDate(date) {
  const entry = loadEntries().find((item) => item.date === date);
  if (!entry) {
    clearFormFields();
    return;
  }
  doneInput.value = entry.done;
  goodInput.value = entry.good;
  reflectInput.value = entry.reflect;
  thanksInput.value = entry.thanks;
  tomorrowInput.value = entry.tomorrow;
}

function clearFormFields() {
  doneInput.value = "";
  goodInput.value = "";
  reflectInput.value = "";
  thanksInput.value = "";
  tomorrowInput.value = "";
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => normalizeEntry(item)).filter(Boolean);
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

function normalizeEntry(item) {
  if (!item || typeof item !== "object") return null;
  const date = String(item.date || "").trim();
  const done = String(item.done || "").trim();
  const good = String(item.good || "").trim();
  const reflect = String(item.reflect || "").trim();
  const thanks = String(item.thanks || "").trim();
  const tomorrow = String(item.tomorrow || "").trim();

  if (!isValidDate(date)) return null;
  if (!done || !good || !reflect || !thanks || !tomorrow) return null;

  return {
    id: item.id ? String(item.id) : newId(),
    date,
    done,
    good,
    reflect,
    thanks,
    tomorrow,
    createdAt: item.createdAt ? String(item.createdAt) : new Date().toISOString()
  };
}

function todayAsText() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidDate(ymd) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const d = new Date(`${ymd}T00:00:00`);
  return !Number.isNaN(d.getTime());
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
  if (typeof crypto !== "undefined" && crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function downloadTextFile(text, filename) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function ensureSeeded() {
  const existing = loadEntries();
  const existingDates = new Set(existing.map((e) => e.date));
  const toAdd = SEED_DAILY_ENTRIES.filter((e) => !existingDates.has(e.date)).map((e) => ({
    id: newId(),
    ...e,
    createdAt: new Date().toISOString()
  }));
  if (toAdd.length === 0) return;
  saveEntries(existing.concat(toAdd));
}

function buildDailyMonthlyMarkdown(sortedMonthEntries) {
  const first = sortedMonthEntries[0];
  const ym = String(first.date).slice(0, 7);
  const [year, mm] = ym.split("-");
  const monthNumber = String(parseInt(mm, 10));

  const lines = [];
  lines.push(`# ${year}年${monthNumber}月の日報`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 日報テンプレート（コピーして日付を変えて使う）");
  lines.push("");

  sortedMonthEntries.forEach((entry, idx) => {
    lines.push(`### ${entry.date}（${weekdayJa(entry.date)}）`);
    lines.push(`- **やったこと**：`);
    pushFieldBullets(lines, entry.done);
    lines.push(`- **良かったこと**：`);
    pushFieldBullets(lines, entry.good);
    lines.push(`- **反省点**：`);
    pushFieldBullets(lines, entry.reflect);
    lines.push(`- **感謝すること**：`);
    pushFieldBullets(lines, entry.thanks);
    lines.push(`- **明日やること**：`);
    pushFieldBullets(lines, entry.tomorrow);
    if (idx !== sortedMonthEntries.length - 1) {
      lines.push("---");
      lines.push("");
    }
  });

  return lines.join("\n");
}

function buildDailyWeeklyGroupedMarkdown(ym, monthEntries) {
  const [year, mm] = ym.split("-");
  const monthNumber = String(parseInt(mm, 10));

  const byWeekStart = new Map();
  for (const entry of monthEntries) {
    const weekStart = mondayOfWeek(entry.date);
    if (!byWeekStart.has(weekStart)) byWeekStart.set(weekStart, []);
    byWeekStart.get(weekStart).push(entry);
  }

  const weekStarts = Array.from(byWeekStart.keys()).sort((a, b) => a.localeCompare(b));

  const lines = [];
  lines.push(`# ${year}年${monthNumber}月の日報（週ごと集約）`);
  lines.push("");
  lines.push("---");
  lines.push("");

  weekStarts.forEach((weekStart, idx) => {
    const weekEnd = addDaysYmd(weekStart, 6);
    const weekEntries = byWeekStart.get(weekStart).slice().sort((a, b) => a.date.localeCompare(b.date));

    lines.push(`### ${weekStart}〜${weekEnd.slice(5)}`);
    lines.push(`- **やったこと**：`);
    pushAccumulatedBullets(lines, weekEntries, "done");
    lines.push(`- **良かったこと**：`);
    pushAccumulatedBullets(lines, weekEntries, "good");
    lines.push(`- **反省点**：`);
    pushAccumulatedBullets(lines, weekEntries, "reflect");
    lines.push(`- **感謝すること**：`);
    pushAccumulatedBullets(lines, weekEntries, "thanks");
    lines.push(`- **明日やること**：`);
    pushAccumulatedBullets(lines, weekEntries, "tomorrow");

    if (idx !== weekStarts.length - 1) {
      lines.push("");
      lines.push("---");
      lines.push("");
    }
  });

  return lines.join("\n").trim() + "\n";
}

function buildWeeklyMonthlyMarkdown(sortedMonthEntries) {
  const first = sortedMonthEntries[0];
  const ym = String(first.date).slice(0, 7);
  const [year] = ym.split("-");

  const byWeekStart = new Map();
  for (const entry of sortedMonthEntries) {
    const weekStart = mondayOfWeek(entry.date);
    if (!byWeekStart.has(weekStart)) byWeekStart.set(weekStart, []);
    byWeekStart.get(weekStart).push(entry);
  }

  const weekStarts = Array.from(byWeekStart.keys()).sort((a, b) => a.localeCompare(b));
  const lines = [];
  const [_, mm] = ym.split("-");
  const monthNumber = String(parseInt(mm, 10));
  lines.push(`# ${year}年${monthNumber}月の週報`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 週報テンプレート（コピーして日付を変えて使う）");
  lines.push("");

  for (const weekStart of weekStarts) {
    const weekEnd = addDaysYmd(weekStart, 6);
    const headingStart = weekStart;
    const headingEnd = weekEnd.slice(5); // MM-DD
    lines.push(`### ${headingStart}〜${headingEnd}`);

    const weekEntries = byWeekStart.get(weekStart).slice().sort((a, b) => a.date.localeCompare(b.date));
    lines.push(`- **今週やったこと**：`);
    pushAccumulatedBullets(lines, weekEntries, "done");
    lines.push(`- **うまくいったこと・学び**：`);
    // 良かったこと + 反省点（学びとしてまとめる）
    pushAccumulatedBullets(lines, weekEntries, ["good", "reflect"]);
    lines.push(`- **来週やること**：`);
    pushAccumulatedBullets(lines, weekEntries, "tomorrow");
    lines.push(`- **メモ**：`);
    pushAccumulatedBullets(lines, weekEntries, "thanks");

    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}

function buildMonthlyMonthlyMarkdown(sortedMonthEntries) {
  const first = sortedMonthEntries[0];
  const ym = String(first.date).slice(0, 7);
  const [year, mm] = ym.split("-");
  const monthNumber = String(parseInt(mm, 10));

  const doneBullets = accumulateMonthBullets(sortedMonthEntries, "done");
  const goodAndLearnBullets = accumulateMonthBullets(sortedMonthEntries, ["good", "reflect"]);
  const reflectBullets = accumulateMonthBullets(sortedMonthEntries, "reflect");
  const tomorrowBullets = accumulateMonthBullets(sortedMonthEntries, "tomorrow");
  const memoBullets = accumulateMonthBullets(sortedMonthEntries, "thanks");

  const lines = [];
  lines.push(`# ${year}年${monthNumber}月の月報`);
  lines.push("");
  lines.push("---");
  lines.push("");

  lines.push(`- **今月やったこと・達成したこと**：`);
  pushBulletsLines(lines, doneBullets);
  lines.push(`- **うまくいったこと・学び**：`);
  pushBulletsLines(lines, goodAndLearnBullets);
  lines.push(`- **うまくいかなかったこと・反省**：`);
  pushBulletsLines(lines, reflectBullets);
  lines.push(`- **来月やること・テーマ**：`);
  pushBulletsLines(lines, tomorrowBullets);
  lines.push(`- **メモ**：`);
  pushBulletsLines(lines, memoBullets);

  return lines.join("\n") + "\n";
}

function monthAsText() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function buildWeeklyDraft() {
  return {
    done: weekDoneInput.value.trim(),
    learning: weekLearningInput.value.trim(),
    tomorrow: weekTomorrowInput.value.trim(),
    memo: weekMemoInput.value.trim()
  };
}

function isWeeklyAllFilled(draft) {
  return draft.done && draft.learning && draft.tomorrow && draft.memo;
}

function clearWeeklyFormFields() {
  weekDoneInput.value = "";
  weekLearningInput.value = "";
  weekTomorrowInput.value = "";
  weekMemoInput.value = "";
}

function fillWeeklyFormForDate(date) {
  const weekStart = mondayOfWeek(date);
  const entry = loadWeeklyEntries().find((e) => e.weekStart === weekStart);
  if (!entry) {
    clearWeeklyFormFields();
    return;
  }
  weekDoneInput.value = entry.done;
  weekLearningInput.value = entry.learning;
  weekTomorrowInput.value = entry.tomorrow;
  weekMemoInput.value = entry.memo;
}

function loadWeeklyEntries() {
  try {
    const raw = localStorage.getItem(WEEKLY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => normalizeWeeklyEntry(item)).filter(Boolean);
  } catch (_error) {
    return [];
  }
}

function saveWeeklyEntries(entries) {
  localStorage.setItem(WEEKLY_STORAGE_KEY, JSON.stringify(entries));
}

function normalizeWeeklyEntry(item) {
  if (!item || typeof item !== "object") return null;
  const weekStart = String(item.weekStart || "").trim();
  const done = String(item.done || "").trim();
  const learning = String(item.learning || "").trim();
  const tomorrow = String(item.tomorrow || "").trim();
  const memo = String(item.memo || "").trim();
  if (!isValidDate(weekStart)) return null;
  if (!done || !learning || !tomorrow || !memo) return null;
  return {
    id: item.id ? String(item.id) : newId(),
    weekStart,
    done,
    learning,
    tomorrow,
    memo,
    createdAt: item.createdAt ? String(item.createdAt) : new Date().toISOString()
  };
}

function getSortedWeeklyEntries() {
  return loadWeeklyEntries().slice().sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

function renderWeeklyList() {
  const entries = getSortedWeeklyEntries().slice().reverse();
  if (entries.length === 0) {
    weeklyEntriesList.innerHTML = '<p class="empty">まだ週報がありません。</p>';
    return;
  }

  weeklyEntriesList.innerHTML = entries
    .map(
      (entry) => `
      <article class="entry">
        <div class="entry-head">
          <h3 class="entry-date">${entry.weekStart}〜${addDaysYmd(entry.weekStart, 6).slice(5)}</h3>
          <button type="button" class="danger" data-id="${entry.id}">削除</button>
        </div>
        <div class="entry-grid">
          <section class="entry-item"><h4>今週やったこと</h4><p>${escapeHtml(entry.done)}</p></section>
          <section class="entry-item"><h4>うまくいったこと・学び</h4><p>${escapeHtml(entry.learning)}</p></section>
          <section class="entry-item"><h4>来週やること</h4><p>${escapeHtml(entry.tomorrow)}</p></section>
          <section class="entry-item"><h4>メモ</h4><p>${escapeHtml(entry.memo)}</p></section>
        </div>
      </article>
    `
    )
    .join("");

  for (const button of weeklyEntriesList.querySelectorAll("button[data-id]")) {
    button.addEventListener("click", () => {
      const ok = confirm("この週報を削除しますか？");
      if (!ok) return;
      const next = loadWeeklyEntries().filter((entry) => entry.id !== button.dataset.id);
      saveWeeklyEntries(next);
      renderWeeklyList();
    });
  }
}

function buildMonthlyDraft() {
  return {
    done: monthDoneInput.value.trim(),
    learning: monthLearningInput.value.trim(),
    reflect: monthReflectInput.value.trim(),
    tomorrow: monthTomorrowInput.value.trim(),
    memo: monthMemoInput.value.trim()
  };
}

function isMonthlyAllFilled(draft) {
  return draft.done && draft.learning && draft.reflect && draft.tomorrow && draft.memo;
}

function clearMonthlyFormFields() {
  monthDoneInput.value = "";
  monthLearningInput.value = "";
  monthReflectInput.value = "";
  monthTomorrowInput.value = "";
  monthMemoInput.value = "";
}

function fillMonthlyFormForMonth(ym) {
  const entry = loadMonthlyEntries().find((e) => e.month === ym);
  if (!entry) {
    clearMonthlyFormFields();
    return;
  }
  monthDoneInput.value = entry.done;
  monthLearningInput.value = entry.learning;
  monthReflectInput.value = entry.reflect;
  monthTomorrowInput.value = entry.tomorrow;
  monthMemoInput.value = entry.memo;
}

function loadMonthlyEntries() {
  try {
    const raw = localStorage.getItem(MONTHLY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => normalizeMonthlyEntry(item)).filter(Boolean);
  } catch (_error) {
    return [];
  }
}

function saveMonthlyEntries(entries) {
  localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(entries));
}

function normalizeMonthlyEntry(item) {
  if (!item || typeof item !== "object") return null;
  const month = String(item.month || "").trim();
  const done = String(item.done || "").trim();
  const learning = String(item.learning || "").trim();
  const reflect = String(item.reflect || "").trim();
  const tomorrow = String(item.tomorrow || "").trim();
  const memo = String(item.memo || "").trim();

  if (!/^\d{4}-\d{2}$/.test(month)) return null;
  if (!done || !learning || !reflect || !tomorrow || !memo) return null;

  return {
    id: item.id ? String(item.id) : newId(),
    month,
    done,
    learning,
    reflect,
    tomorrow,
    memo,
    createdAt: item.createdAt ? String(item.createdAt) : new Date().toISOString()
  };
}

function getSortedMonthlyEntries() {
  return loadMonthlyEntries().slice().sort((a, b) => a.month.localeCompare(b.month));
}

function renderMonthlyList() {
  const entries = getSortedMonthlyEntries().slice().reverse();
  if (entries.length === 0) {
    monthlyEntriesList.innerHTML = '<p class="empty">まだ月報がありません。</p>';
    return;
  }

  monthlyEntriesList.innerHTML = entries
    .map(
      (entry) => `
      <article class="entry">
        <div class="entry-head">
          <h3 class="entry-date">${entry.month}</h3>
          <button type="button" class="danger" data-id="${entry.id}">削除</button>
        </div>
        <div class="entry-grid">
          <section class="entry-item"><h4>今月やったこと・達成したこと</h4><p>${escapeHtml(entry.done)}</p></section>
          <section class="entry-item"><h4>うまくいったこと・学び</h4><p>${escapeHtml(entry.learning)}</p></section>
          <section class="entry-item"><h4>うまくいかなかったこと・反省</h4><p>${escapeHtml(entry.reflect)}</p></section>
          <section class="entry-item"><h4>来月やること・テーマ</h4><p>${escapeHtml(entry.tomorrow)}</p></section>
          <section class="entry-item"><h4>メモ</h4><p>${escapeHtml(entry.memo)}</p></section>
        </div>
      </article>
    `
    )
    .join("");

  for (const button of monthlyEntriesList.querySelectorAll("button[data-id]")) {
    button.addEventListener("click", () => {
      const ok = confirm("この月報を削除しますか？");
      if (!ok) return;
      const next = loadMonthlyEntries().filter((entry) => entry.id !== button.dataset.id);
      saveMonthlyEntries(next);
      renderMonthlyList();
    });
  }
}

function weekIntersectsMonth(weekStart, ym) {
  const weekEnd = addDaysYmd(weekStart, 6);
  const monthStart = `${ym}-01`;
  const monthEnd = lastDayOfMonthYmd(ym);
  return !(weekEnd < monthStart || weekStart > monthEnd);
}

function lastDayOfMonthYmd(ym) {
  const [year, mm] = ym.split("-").map((x) => parseInt(x, 10));
  const d = new Date(year, mm, 0); // day 0 of next month = last day
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function buildWeeklyMarkdownForMonth(ym, dailyEntriesAll, weeklyEntriesAll) {
  const [year, mm] = ym.split("-");
  const monthNumber = String(parseInt(mm, 10));

  const weekStartsFromDaily = new Set(
    dailyEntriesAll
      .filter((e) => e.date.startsWith(ym))
      .map((e) => mondayOfWeek(e.date))
  );
  const weekStartsFromWeekly = new Set(
    weeklyEntriesAll
      .filter((e) => weekIntersectsMonth(e.weekStart, ym))
      .map((e) => e.weekStart)
  );
  const allWeekStarts = Array.from(new Set([...weekStartsFromDaily, ...weekStartsFromWeekly])).sort((a, b) =>
    a.localeCompare(b)
  );

  const lines = [];
  lines.push(`# ${year}年${monthNumber}月の週報`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 週報テンプレート（コピーして日付を変えて使う）");
  lines.push("");

  for (const weekStart of allWeekStarts) {
    const weekEnd = addDaysYmd(weekStart, 6);
    const weekRecord = weeklyEntriesAll.find((e) => e.weekStart === weekStart);

    lines.push(`### ${weekStart}〜${weekEnd.slice(5)}`);

    if (weekRecord) {
      lines.push(`- **今週やったこと**：`);
      pushFieldBullets(lines, weekRecord.done);
      lines.push(`- **うまくいったこと・学び**：`);
      pushFieldBullets(lines, weekRecord.learning);
      lines.push(`- **来週やること**：`);
      pushFieldBullets(lines, weekRecord.tomorrow);
      lines.push(`- **メモ**：`);
      pushFieldBullets(lines, weekRecord.memo);
    } else {
      const weekEntries = dailyEntriesAll.filter((e) => mondayOfWeek(e.date) === weekStart);
      lines.push(`- **今週やったこと**：`);
      pushAccumulatedBullets(lines, weekEntries, "done");
      lines.push(`- **うまくいったこと・学び**：`);
      pushAccumulatedBullets(lines, weekEntries, ["good", "reflect"]);
      lines.push(`- **来週やること**：`);
      pushAccumulatedBullets(lines, weekEntries, "tomorrow");
      lines.push(`- **メモ**：`);
      pushAccumulatedBullets(lines, weekEntries, "thanks");
    }

    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}

function buildMonthlyMarkdownForMonth(ym, dailyEntriesAll, monthlyEntriesAll) {
  const [year, mm] = ym.split("-");
  const monthNumber = String(parseInt(mm, 10));

  const record = monthlyEntriesAll.find((e) => e.month === ym);
  if (record) {
    const lines = [];
    lines.push(`# ${year}年${monthNumber}月の月報`);
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push(`- **今月やったこと・達成したこと**：`);
    pushFieldBullets(lines, record.done);
    lines.push(`- **うまくいったこと・学び**：`);
    pushFieldBullets(lines, record.learning);
    lines.push(`- **うまくいかなかったこと・反省**：`);
    pushFieldBullets(lines, record.reflect);
    lines.push(`- **来月やること・テーマ**：`);
    pushFieldBullets(lines, record.tomorrow);
    lines.push(`- **メモ**：`);
    pushFieldBullets(lines, record.memo);
    return lines.join("\n") + "\n";
  }

  const monthEntries = dailyEntriesAll.filter((e) => e.date.startsWith(ym));
  if (monthEntries.length === 0) return `# ${year}年${monthNumber}月の月報\n\n---\n\n`;

  return buildMonthlyMonthlyMarkdown(monthEntries);
}

function mondayOfWeek(ymd) {
  const d = new Date(`${ymd}T00:00:00`);
  const day = d.getDay(); // 0=日..6=土
  const diff = (day + 6) % 7; // 月曜=0, 日曜=6
  d.setDate(d.getDate() - diff);
  return toYmd(d);
}

function addDaysYmd(ymd, days) {
  const d = new Date(`${ymd}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toYmd(d);
}

function toYmd(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function splitToBulletItems(text) {
  const value = String(text || "").trim();
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function pushBulletsLines(lines, items) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) {
    lines.push("  - ");
    return;
  }
  for (const item of list) {
    lines.push(`  - ${item}`);
  }
}

function pushAccumulatedBullets(lines, entries, fieldNames) {
  const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
  const collected = [];
  for (const entry of entries) {
    for (const field of fields) {
      collected.push(...splitToBulletItems(entry[field]));
    }
  }

  // そのまま並べる（必要なら重複排除は後で追加可能）
  pushBulletsLines(lines, collected);
}

function accumulateMonthBullets(entries, fieldNames) {
  const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
  const collected = [];
  for (const entry of entries) {
    for (const field of fields) {
      collected.push(...splitToBulletItems(entry[field]));
    }
  }
  return collected;
}

function pushFieldBullets(lines, text) {
  const value = String(text || "").trim();
  if (!value) {
    lines.push("  - ");
    return;
  }

  const items = value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const normalized = items.length > 0 ? items : [value];
  for (const item of normalized) {
    lines.push(`  - ${item}`);
  }
}

function weekdayJa(ymd) {
  // JS: 0=日,1=月,...,6=土
  const d = new Date(`${ymd}T00:00:00`);
  const map = ["日", "月", "火", "水", "木", "金", "土"];
  return map[d.getDay()] || "";
}

render();
