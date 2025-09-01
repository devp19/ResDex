// deno-lint-ignore-file no-explicit-any
// index.ts — ResDex arXiv fetcher (Deno, Supabase Edge Functions)
// Enhanced with full category support, prefixing, and safety knobs

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ===== Subject lists =====
const ALL_SUBJECTS = [
  // Computer Science (cs.*)
  "cs.AI","cs.AR","cs.CC","cs.CE","cs.CG","cs.CL","cs.CR","cs.CV","cs.CY","cs.DB","cs.DC","cs.DL","cs.DM","cs.DS",
  "cs.ET","cs.FL","cs.GL","cs.GR","cs.GT","cs.HC","cs.IR","cs.IT","cs.LG","cs.LO","cs.MA","cs.MM","cs.MS","cs.NA",
  "cs.NE","cs.NI","cs.OH","cs.OS","cs.PF","cs.PL","cs.RO","cs.SC","cs.SE","cs.SI","cs.SY",

  // Mathematics (math.*) + math-ph
  "math.AG","math.AP","math.AT","math.CA","math.CO","math.CT","math.CV","math.DG","math.DS","math.FA","math.GM","math.GN",
  "math.GR","math.GT","math.HO","math.IT","math.KT","math.LO","math.MG","math.MP","math.NA","math.NT","math.OA","math.OC",
  "math.PR","math.QA","math.RA","math.RT","math.SG","math.SP","math.ST","math-ph",

  // Nonlinear Sciences (nlin.*)
  "nlin.AO","nlin.CD","nlin.CG","nlin.PS","nlin.SI",

  // Statistics (stat.*)
  "stat.AP","stat.CO","stat.ME","stat.ML","stat.OT","stat.TH",

  // Quantitative Biology (q-bio.*)
  "q-bio.BM","q-bio.CB","q-bio.GN","q-bio.MN","q-bio.NC","q-bio.OT","q-bio.PE","q-bio.QM","q-bio.SC","q-bio.TO",

  // Quantitative Finance (q-fin.*)
  "q-fin.CP","q-fin.EC","q-fin.GN","q-fin.MF","q-fin.PM","q-fin.PR","q-fin.RM","q-fin.ST","q-fin.TR",

  // Electrical Engineering & Systems Science (eess.*)
  "eess.AS","eess.IV","eess.SP","eess.SY",

  // Economics (econ.*)
  "econ.EM","econ.GN","econ.TH",

  // Physics general/subfields
  "physics.acc-ph","physics.ao-ph","physics.app-ph","physics.atm-clus","physics.atom-ph","physics.bio-ph","physics.chem-ph",
  "physics.class-ph","physics.comp-ph","physics.data-an","physics.ed-ph","physics.flu-dyn","physics.gen-ph","physics.geo-ph",
  "physics.hist-ph","physics.ins-det","physics.med-ph","physics.optics","physics.plasm-ph","physics.pop-ph","physics.soc-ph",
  "physics.space-ph",

  // High-energy / nuclear / quantum
  "gr-qc","hep-ex","hep-lat","hep-ph","hep-th","nucl-ex","nucl-th","quant-ph",

  // Condensed Matter (cond-mat.*)
  "cond-mat.dis-nn","cond-mat.mes-hall","cond-mat.mtrl-sci","cond-mat.other","cond-mat.quant-gas","cond-mat.soft",
  "cond-mat.stat-mech","cond-mat.str-el","cond-mat.supr-con",

  // Astronomy & Astrophysics (astro-ph.*)
  "astro-ph.CO","astro-ph.EP","astro-ph.GA","astro-ph.HE","astro-ph.IM","astro-ph.SR",
];

// Optional archive roots (broad buckets – can cause overlap/duplicates)
const ARCHIVE_ROOTS = [
  "astro-ph","cond-mat","gr-qc","hep-ex","hep-lat","hep-ph","hep-th","math-ph","nlin","nucl-ex","nucl-th","physics","quant-ph",
  "math","cs","q-bio","q-fin","stat","eess","econ"
];

// ===== Env parsing =====
const RAW = (Deno.env.get("ARXIV_CATEGORIES") ?? "").trim();
const INCLUDE_ARCHIVE_ROOTS = (Deno.env.get("INCLUDE_ARCHIVE_ROOTS") ?? "false").toLowerCase() === "true";
const DEFAULT_STARTER = ["cs.AI","cs.LG","cs.CV","cs.CL","stat.ML","eess.IV"];

let CATS: string[] =
  RAW === "" ? DEFAULT_STARTER
  : (RAW === "*" || RAW.toUpperCase() === "ALL") ? ALL_SUBJECTS.slice()
  : RAW.split(",").map(s => s.trim()).filter(Boolean);

if (INCLUDE_ARCHIVE_ROOTS && (RAW === "*" || RAW.toUpperCase() === "ALL")) {
  CATS = [...new Set([...CATS, ...ARCHIVE_ROOTS])];
}

// ===== Knobs =====
const PAGE = Number(Deno.env.get("PAGE") ?? 100);
const WINDOW_HOURS = Number(Deno.env.get("WINDOW_HOURS") ?? 36);
const SLEEP_MS = Number(Deno.env.get("SLEEP_MS") ?? 600);
const MAX_TOTAL = Number(Deno.env.get("MAX_TOTAL") ?? 2000); // stop early if too big

// Prefix-aware tables & RPCs
const TABLE_PREFIX = (Deno.env.get("TABLE_PREFIX") ?? "dev").trim();
const T_ARTICLES = `${TABLE_PREFIX}_articles`;
const T_DIGEST = `${TABLE_PREFIX}_daily_digest_items`;

const RPC_POP_PREF = `recompute_${TABLE_PREFIX}_popularity`;
const RPC_POP = `recompute_popularity`;
const RPC_DIGEST_PREF = `build_${TABLE_PREFIX}_daily_digest`;
const RPC_DIGEST = `build_daily_digest`;

// Required function secrets
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET") || null;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

// Tunables
const UA = "ResDex/1.0 (metadata-only; https://export.arxiv.org)";
const TZ = "America/Toronto";

type Row = {
  id: string; title: string; abstract?: string; authors?: string[];
  categories?: string[]; link_abs?: string; published_at?: string;
  topic?: string; source?: string; image_url?: string; ai_summary?: string;
};

// helper: call pref RPC if exists, else fallback
async function callPopularityRPC(hours = 48) {
  let { error } = await supabase.rpc(RPC_POP_PREF as any, { p_hours: hours });
  if (error) {
    console.log(`Falling back to unprefixed RPC: ${RPC_POP}`);
    await supabase.rpc(RPC_POP as any, { p_hours: hours }); // ignore error here; surface at top-level if needed
  }
}

async function callBuildDigestRPC(dayISO: string, perTopic = 6) {
  let { error } = await supabase.rpc(RPC_DIGEST_PREF as any, { p_day: dayISO, p_per_topic: perTopic });
  if (error) {
    console.log(`Falling back to unprefixed RPC: ${RPC_DIGEST}`);
    await supabase.rpc(RPC_DIGEST as any, { p_day: dayISO, p_per_topic: perTopic });
  }
}

function baseId(input: string): string {
  const raw = input.split("/abs/").pop() || input;
  const m = raw.match(/^(\d{4}\.\d{4,5})/);
  return m ? m[1] : raw.split("?")[0];
}

function topicFromCats(cats: string[] = []): string {
  // Computer Science & AI
  if (cats.some(c => /^cs\.(CV|AI|LG|NE|CL|RO|IR|DM|CR|SE|PL|CG|GR|AR|DC|DS|SY|OS|CR|SE|PL|CG|GR|AR|DC|DS|SY|OS|CR|SE|PL|CG|GR|AR|DC|DS|SY|OS)/.test(c))) {
    if (cats.some(c => /^cs\.CV/.test(c))) return "Computer Vision";
    if (cats.some(c => /^cs\.CL/.test(c))) return "Natural Language Processing";
    if (cats.some(c => /^cs\.AI/.test(c))) return "Artificial Intelligence";
    if (cats.some(c => /^cs\.LG/.test(c))) return "Machine Learning";
    if (cats.some(c => /^cs\.NE/.test(c))) return "Neural Networks";
    if (cats.some(c => /^cs\.RO/.test(c))) return "Robotics";
    if (cats.some(c => /^cs\.IR/.test(c))) return "Information Retrieval";
    if (cats.some(c => /^cs\.DM/.test(c))) return "Data Mining";
    if (cats.some(c => /^cs\.CR/.test(c))) return "Cryptography & Security";
    if (cats.some(c => /^cs\.SE/.test(c))) return "Software Engineering";
    if (cats.some(c => /^cs\.PL/.test(c))) return "Programming Languages";
    if (cats.some(c => /^cs\.CG/.test(c))) return "Computer Graphics";
    if (cats.some(c => /^cs\.GR/.test(c))) return "Graphics & Visualization";
    if (cats.some(c => /^cs\.AR/.test(c))) return "Computer Architecture";
    if (cats.some(c => /^cs\.DC/.test(c))) return "Distributed Computing";
    if (cats.some(c => /^cs\.DS/.test(c))) return "Data Structures";
    if (cats.some(c => /^cs\.SY/.test(c))) return "Systems";
    if (cats.some(c => /^cs\.OS/.test(c))) return "Operating Systems";
    return "Computer Science";
  }

  // Statistics & Machine Learning
  if (cats.some(c => /^stat\.(ML|TH|AP|ME|CO|GE|OR|ME|CO|GE|OR|ME|CO|GE|OR)/.test(c))) {
    if (cats.some(c => /^stat\.ML/.test(c))) return "Statistical Machine Learning";
    if (cats.some(c => /^stat\.TH/.test(c))) return "Statistical Theory";
    if (cats.some(c => /^stat\.AP/.test(c))) return "Statistical Applications";
    if (cats.some(c => /^stat\.ME/.test(c))) return "Statistical Methodology";
    if (cats.some(c => /^stat\.CO/.test(c))) return "Statistical Computing";
    if (cats.some(c => /^stat\.GE/.test(c))) return "Statistical Genetics";
    if (cats.some(c => /^stat\.OR/.test(c))) return "Operations Research";
    return "Statistics";
  }

  // Mathematics
  if (cats.some(c => /^math\.(OC|ST|PR|NA|AP|CT|AG|AT|CA|CO|FA|GT|HO|IT|KT|LO|MP|NT|OA|RA|RT|SG|SP|ST|TO|AC|AG|AT|CA|CO|FA|GT|HO|IT|KT|LO|MP|NT|OA|RA|RT|SG|SP|ST|TO|AC)/.test(c))) {
    if (cats.some(c => /^math\.OC/.test(c))) return "Optimization & Control";
    if (cats.some(c => /^math\.ST/.test(c))) return "Statistics Theory";
    if (cats.some(c => /^math\.PR/.test(c))) return "Probability";
    if (cats.some(c => /^math\.NA/.test(c))) return "Numerical Analysis";
    if (cats.some(c => /^math\.AP/.test(c))) return "Applied Mathematics";
    if (cats.some(c => /^math\.CT/.test(c))) return "Category Theory";
    if (cats.some(c => /^math\.AG/.test(c))) return "Algebraic Geometry";
    if (cats.some(c => /^math\.AT/.test(c))) return "Algebraic Topology";
    if (cats.some(c => /^math\.CA/.test(c))) return "Classical Analysis";
    if (cats.some(c => /^math\.CO/.test(c))) return "Combinatorics";
    if (cats.some(c => /^math\.FA/.test(c))) return "Functional Analysis";
    if (cats.some(c => /^math\.GT/.test(c))) return "Geometric Topology";
    if (cats.some(c => /^math\.HO/.test(c))) return "History & Overview";
    if (cats.some(c => /^math\.IT/.test(c))) return "Information Theory";
    if (cats.some(c => /^math\.KT/.test(c))) return "K-Theory";
    if (cats.some(c => /^math\.LO/.test(c))) return "Logic";
    if (cats.some(c => /^math\.MP/.test(c))) return "Mathematical Physics";
    if (cats.some(c => /^math\.NT/.test(c))) return "Number Theory";
    if (cats.some(c => /^math\.OA/.test(c))) return "Operator Algebras";
    if (cats.some(c => /^math\.RA/.test(c))) return "Rings & Algebras";
    if (cats.some(c => /^math\.RT/.test(c))) return "Representation Theory";
    if (cats.some(c => /^math\.SG/.test(c))) return "Symplectic Geometry";
    if (cats.some(c => /^math\.SP/.test(c))) return "Spectral Theory";
    if (cats.some(c => /^math\.TO/.test(c))) return "Topology";
    if (cats.some(c => /^math\.AC/.test(c))) return "Commutative Algebra";
    return "Mathematics";
  }

  // Physics
  if (cats.some(c => /^physics\.(app|flu|opt|acc|ao|atm|bio|chem|comp|data|ed|gen|geo|hist|ins|med|opt|plasm|pop|soc|space|accel|app|atm|bio|chem|comp|data|ed|gen|geo|hist|ins|med|opt|plasm|pop|soc|space)/.test(c))) {
    if (cats.some(c => /^physics\.app/.test(c))) return "Applied Physics";
    if (cats.some(c => /^physics\.flu/.test(c))) return "Fluid Dynamics";
    if (cats.some(c => /^physics\.opt/.test(c))) return "Optics";
    if (cats.some(c => /^physics\.acc/.test(c))) return "Accelerator Physics";
    if (cats.some(c => /^physics\.ao/.test(c))) return "Atmospheric Physics";
    if (cats.some(c => /^physics\.bio/.test(c))) return "Biological Physics";
    if (cats.some(c => /^physics\.chem/.test(c))) return "Chemical Physics";
    if (cats.some(c => /^physics\.comp/.test(c))) return "Computational Physics";
    if (cats.some(c => /^physics\.data/.test(c))) return "Data Analysis";
    if (cats.some(c => /^physics\.ed/.test(c))) return "Education";
    if (cats.some(c => /^physics\.gen/.test(c))) return "General Physics";
    if (cats.some(c => /^physics\.geo/.test(c))) return "Geophysics";
    if (cats.some(c => /^physics\.hist/.test(c))) return "History of Physics";
    if (cats.some(c => /^physics\.ins/.test(c))) return "Instrumentation";
    if (cats.some(c => /^physics\.med/.test(c))) return "Medical Physics";
    if (cats.some(c => /^physics\.plasm/.test(c))) return "Plasma Physics";
    if (cats.some(c => /^physics\.pop/.test(c))) return "Popular Physics";
    if (cats.some(c => /^physics\.soc/.test(c))) return "Physics & Society";
    if (cats.some(c => /^physics\.space/.test(c))) return "Space Physics";
    return "Physics";
  }

  // Astrophysics
  if (cats.some(c => /^astro-ph\.(CO|EP|GA|HE|IM|SR|CO|EP|GA|HE|IM|SR)/.test(c))) {
    if (cats.some(c => /^astro-ph\.CO/.test(c))) return "Cosmology";
    if (cats.some(c => /^astro-ph\.EP/.test(c))) return "Earth & Planetary Astrophysics";
    if (cats.some(c => /^astro-ph\.GA/.test(c))) return "Galaxy Astrophysics";
    if (cats.some(c => /^astro-ph\.HE/.test(c))) return "High Energy Astrophysics";
    if (cats.some(c => /^astro-ph\.IM/.test(c))) return "Instrumentation & Methods";
    if (cats.some(c => /^astro-ph\.SR/.test(c))) return "Solar & Stellar Astrophysics";
    return "Astrophysics";
  }

  // Condensed Matter Physics
  if (cats.some(c => /^cond-mat\.(dis|mes|mtrl|other|quant|soft|stat|str|supr|dis|mes|mtrl|other|quant|soft|stat|str|supr)/.test(c))) {
    if (cats.some(c => /^cond-mat\.dis/.test(c))) return "Disordered Systems";
    if (cats.some(c => /^cond-mat\.mes/.test(c))) return "Mesoscale Physics";
    if (cats.some(c => /^cond-mat\.mtrl/.test(c))) return "Materials Science";
    if (cats.some(c => /^cond-mat\.quant/.test(c))) return "Quantum Condensed Matter";
    if (cats.some(c => /^cond-mat\.soft/.test(c))) return "Soft Condensed Matter";
    if (cats.some(c => /^cond-mat\.stat/.test(c))) return "Statistical Mechanics";
    if (cats.some(c => /^cond-mat\.str/.test(c))) return "Strongly Correlated Electrons";
    if (cats.some(c => /^cond-mat\.supr/.test(c))) return "Superconductivity";
    return "Condensed Matter Physics";
  }

  // High Energy Physics
  if (cats.some(c => /^hep-(ex|lat|ph|th)/.test(c))) {
    if (cats.some(c => /^hep-ex/.test(c))) return "High Energy Physics - Experiment";
    if (cats.some(c => /^hep-lat/.test(c))) return "High Energy Physics - Lattice";
    if (cats.some(c => /^hep-ph/.test(c))) return "High Energy Physics - Phenomenology";
    if (cats.some(c => /^hep-th/.test(c))) return "High Energy Physics - Theory";
    return "High Energy Physics";
  }

  // Nuclear Physics
  if (cats.some(c => /^nucl-(ex|th)/.test(c))) {
    if (cats.some(c => /^nucl-ex/.test(c))) return "Nuclear Experiment";
    if (cats.some(c => /^nucl-th/.test(c))) return "Nuclear Theory";
    return "Nuclear Physics";
  }

  // Quantum Physics
  if (cats.some(c => /^quant-ph/.test(c))) return "Quantum Physics";

  // Mathematical Physics
  if (cats.some(c => /^math-ph/.test(c))) return "Mathematical Physics";

  // Nonlinear Sciences
  if (cats.some(c => /^nlin\.(AO|CD|CG|PS|SI|SI|SI)/.test(c))) {
    if (cats.some(c => /^nlin\.AO/.test(c))) return "Adaptation & Self-Organizing Systems";
    if (cats.some(c => /^nlin\.CD/.test(c))) return "Chaotic Dynamics";
    if (cats.some(c => /^nlin\.CG/.test(c))) return "Cellular Automata & Lattice Gases";
    if (cats.some(c => /^nlin\.PS/.test(c))) return "Pattern Formation & Solitons";
    if (cats.some(c => /^nlin\.SI/.test(c))) return "Exactly Solvable & Integrable Systems";
    return "Nonlinear Sciences";
  }

  // General Relativity & Quantum Cosmology
  if (cats.some(c => /^gr-qc/.test(c))) return "General Relativity & Quantum Cosmology";

  // Electrical Engineering & Systems Science
  if (cats.some(c => /^eess\.(AS|IV|SP|SS|SY|AS|IV|SP|SS|SY)/.test(c))) {
    if (cats.some(c => /^eess\.AS/.test(c))) return "Audio & Speech Processing";
    if (cats.some(c => /^eess\.IV/.test(c))) return "Image & Video Processing";
    if (cats.some(c => /^eess\.SP/.test(c))) return "Signal Processing";
    if (cats.some(c => /^eess\.SS/.test(c))) return "Systems & Control";
    if (cats.some(c => /^eess\.SY/.test(c))) return "Systems & Control";
    return "Electrical Engineering";
  }

  // Quantitative Biology
  if (cats.some(c => /^q-bio\.(BM|CB|GN|MN|NC|OT|PE|QM|SC|TO|BM|CB|GN|MN|NC|OT|PE|QM|SC|TO)/.test(c))) {
    if (cats.some(c => /^q-bio\.BM/.test(c))) return "Biomolecules";
    if (cats.some(c => /^q-bio\.CB/.test(c))) return "Cell Behavior";
    if (cats.some(c => /^q-bio\.GN/.test(c))) return "Genomics";
    if (cats.some(c => /^q-bio\.MN/.test(c))) return "Molecular Networks";
    if (cats.some(c => /^q-bio\.NC/.test(c))) return "Neurons & Cognition";
    if (cats.some(c => /^q-bio\.OT/.test(c))) return "Other Quantitative Biology";
    if (cats.some(c => /^q-bio\.PE/.test(c))) return "Populations & Evolution";
    if (cats.some(c => /^q-bio\.QM/.test(c))) return "Quantitative Methods";
    if (cats.some(c => /^q-bio\.SC/.test(c))) return "Subcellular Processes";
    if (cats.some(c => /^q-bio\.TO/.test(c))) return "Tissues & Organs";
    return "Quantitative Biology";
  }

  // Quantitative Finance
  if (cats.some(c => /^q-fin\.(CP|EC|GN|MF|PM|PR|RM|ST|TR|CP|EC|GN|MF|PM|PR|RM|ST|TR)/.test(c))) {
    if (cats.some(c => /^q-fin\.CP/.test(c))) return "Computational Finance";
    if (cats.some(c => /^q-fin\.EC/.test(c))) return "Economics";
    if (cats.some(c => /^q-fin\.GN/.test(c))) return "General Finance";
    if (cats.some(c => /^q-fin\.MF/.test(c))) return "Mathematical Finance";
    if (cats.some(c => /^q-fin\.PM/.test(c))) return "Portfolio Management";
    if (cats.some(c => /^q-fin\.PR/.test(c))) return "Pricing";
    if (cats.some(c => /^q-fin\.RM/.test(c))) return "Risk Management";
    if (cats.some(c => /^q-fin\.ST/.test(c))) return "Statistical Finance";
    if (cats.some(c => /^q-fin\.TR/.test(c))) return "Trading & Market Microstructure";
    return "Quantitative Finance";
  }

  // Economics
  if (cats.some(c => /^econ\.(EM|GN|TH|EM|GN|TH)/.test(c))) {
    if (cats.some(c => /^econ\.EM/.test(c))) return "Econometrics";
    if (cats.some(c => /^econ\.GN/.test(c))) return "General Economics";
    if (cats.some(c => /^econ\.TH/.test(c))) return "Theoretical Economics";
    return "Economics";
  }

  // Biology
  if (cats.some(c => /^bio/.test(c))) return "Biology";

  // Medicine
  if (cats.some(c => /^med/.test(c))) return "Medicine";

  // Default fallback - should rarely happen now
  return "Research";
}

function parseAtom(xml: string): Row[] {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => m[1]);
  return entries.map(e => {
    const g = (re: RegExp) => e.match(re)?.[1]?.trim();
    const idUrl = g(/<id>(.*?)<\/id>/) ?? "";
    const title = (g(/<title>([\s\S]*?)<\/title>/) ?? "").replace(/\s+/g, " ").trim();
    const summary = (g(/<summary>([\s\S]*?)<\/summary>/) ?? "").replace(/\s+/g, " ").trim();
    const published = g(/<published>(.*?)<\/published>/);
    const authorNames = [...e.matchAll(/<name>(.*?)<\/name>/g)].map(m => m[1].trim());
    const cats = [...e.matchAll(/term="(.*?)"/g)].map(m => m[1]);
    return {
      id: baseId(idUrl),
      title,
      abstract: summary,
      authors: authorNames,
      categories: cats,
      link_abs: idUrl.replace("/pdf/", "/abs/"),
      published_at: published ?? null,
      topic: topicFromCats(cats),
      source: "arXiv",
      image_url: null
    };
  });
}

async function fetchSince(cat: string, hours = WINDOW_HOURS): Promise<Row[]> {
  const cutoff = Date.now() - hours * 3600 * 1000;
  let start = 0;
  const rows: Row[] = [];

  while (true) {
    const url = `https://export.arxiv.org/api/query?search_query=cat:${encodeURIComponent(cat)}&sortBy=submittedDate&sortOrder=descending&start=${start}&max_results=${PAGE}`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) {
      console.error("arXiv fetch error", res.status, await res.text());
      break;
    }
    const xml = await res.text();
    const page = parseAtom(xml);
    if (page.length === 0) break;

    rows.push(...page);

    const lastTs = page.at(-1)?.published_at ? new Date(page.at(-1)!.published_at!).getTime() : 0;
    if (lastTs && lastTs < cutoff) break;

    start += PAGE;
    await new Promise(r => setTimeout(r, SLEEP_MS));
  }

  return rows;
}

async function upsertArticles(rows: Row[]) {
  if (!rows.length) return;
  const slim = rows.map(r => ({
    id: r.id, title: r.title, abstract: r.abstract,
    authors: r.authors, categories: r.categories, topic: r.topic,
    link_abs: r.link_abs, published_at: r.published_at,
    source: "arXiv", image_url: r.image_url ?? null
  }));
  const CHUNK = 200;
  for (let i = 0; i < slim.length; i += CHUNK) {
    const chunk = slim.slice(i, i + CHUNK);
    const { error } = await supabase.from(T_ARTICLES).upsert(chunk, { onConflict: "id" }).select("id");
    if (error) throw error;
  }
}

function torontoDay(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = fmt.formatToParts(date);
  const y = parts.find(p => p.type === 'year')!.value;
  const m = parts.find(p => p.type === 'month')!.value;
  const d = parts.find(p => p.type === 'day')!.value;
  return `${y}-${m}-${d}`;
}

serve(async (req) => {
  try {
    if (CRON_SECRET) {
      const key = req.headers.get("x-cron-key");
      if (key !== CRON_SECRET) return new Response("unauthorized", { status: 401 });
    }

    console.log("Configuration:");
    console.log("- TABLE_PREFIX:", TABLE_PREFIX);
    console.log("- T_ARTICLES:", T_ARTICLES);
    console.log("- T_DIGEST:", T_DIGEST);
    console.log("- CATS count:", CATS.length);
    console.log("- WINDOW_HOURS:", WINDOW_HOURS);
    console.log("- SLEEP_MS:", SLEEP_MS);
    console.log("- MAX_TOTAL:", MAX_TOTAL);
    console.log("- INCLUDE_ARCHIVE_ROOTS:", INCLUDE_ARCHIVE_ROOTS);

    const all: Row[] = [];
    for (const cat of CATS) {
      if (all.length >= MAX_TOTAL) {
        console.log(`Stopping early: reached MAX_TOTAL (${MAX_TOTAL})`);
        break;
      }
      console.log("fetching category", cat);
      const batch = await fetchSince(cat, WINDOW_HOURS);
      console.log("fetched", cat, batch.length);
      
      for (const r of batch) {
        if (all.length >= MAX_TOTAL) break;
        all.push(r);
      }
    }

    const map = new Map<string, Row>();
    for (const r of all) if (r.id) map.set(r.id, r);
    console.log("unique to upsert:", map.size);

    await upsertArticles([...map.values()]);
    await callPopularityRPC(48);

    // Build yesterday + today (Toronto local date)
    const today = torontoDay();
    const yesterday = torontoDay(new Date(Date.now() - 24 * 60 * 60 * 1000));

    await callBuildDigestRPC(yesterday, 6);
    await callBuildDigestRPC(today, 6);

    // OPTIONAL: Trigger Next.js revalidate so /digest updates immediately
    const site = Deno.env.get('SITE_URL');
    const secret = Deno.env.get('REVALIDATE_SECRET');
    if (site && secret) {
      // revalidate today's digest view
      await fetch(`${site}/api/revalidate-digest?secret=${secret}`, { method: 'POST' });
    }

    const body = { 
      upserted: map.size, 
      days: { yesterday, today },
      categories: CATS.length,
      maxTotal: MAX_TOTAL,
      tablePrefix: TABLE_PREFIX
    };
    console.log("done", body);
    return new Response(JSON.stringify(body), { status: 200 });
  } catch (e) {
    console.error("handler error", e);
    return new Response("error", { status: 500 });
  }
});
