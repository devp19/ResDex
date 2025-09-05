import fs from "fs";
import path from "path";

type ChangelogEntry = {
	fileName: string;
	title: string;
	description: string;
	date: string; // ISO string
	version?: string;
	tags?: string[];
	features?: string[];
	bugFixes?: string[];
};

function parseFrontmatter(mdxContent: string): Omit<ChangelogEntry, "fileName"> {
	// Expect frontmatter in MDX between --- lines
	// Example keys: title, description, date, tags, version, features, bugFixes
	const frontmatterMatch = mdxContent.match(/^---[\s\S]*?---/);
	const defaults = {
		title: "Untitled",
		description: "",
		date: "1970-01-01",
		version: undefined as string | undefined,
		tags: undefined as string[] | undefined,
		features: undefined as string[] | undefined,
		bugFixes: undefined as string[] | undefined,
	};
	if (!frontmatterMatch) return defaults;
	const block = frontmatterMatch[0]
		.replace(/^---\n?/, "")
		.replace(/\n?---$/, "");

	const lines = block.split(/\r?\n/);
	const data: Record<string, unknown> = {};

	function parseArrayValue(raw: string): string[] {
		// Accept YAML-ish arrays: ["A", "B"], [A, B], or multiline "- item" format
		const value = raw.trim();
		if (value.startsWith("[")) {
			const inside = value.replace(/^\[/, "").replace(/\]$/, "");
			return inside
				.split(",")
				.map((t) => t.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, ""))
				.filter(Boolean);
		}
		return [];
	}

	for (const rawLine of lines) {
		const line = rawLine.trim();
		if (!line || line.startsWith("#")) continue;
		const sep = line.indexOf(":");
		if (sep === -1) continue;
		const key = line.slice(0, sep).trim();
		let value = line.slice(sep + 1).trim();
		if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
			value = value.slice(1, -1);
		}
		if (key === "tags" || key === "features" || key === "bugFixes") {
			data[key] = parseArrayValue(line.slice(sep + 1));
		} else {
			data[key] = value;
		}
	}

	return {
		title: (data.title as string) || defaults.title,
		description: (data.description as string) || defaults.description,
		date: (data.date as string) || defaults.date,
		version: (data.version as string) || defaults.version,
		tags: (data.tags as string[]) || defaults.tags,
		features: (data.features as string[]) || defaults.features,
		bugFixes: (data.bugFixes as string[]) || defaults.bugFixes,
	};
}

function getChangelogEntries(): ChangelogEntry[] {
	const baseDir = path.join(process.cwd(), "src", "app", "changelogs", "content");
	let files: string[] = [];
	try {
		files = fs
			.readdirSync(baseDir)
			.filter((f) => f.endsWith(".mdx"))
			.map((f) => path.join(baseDir, f));
	} catch {
		return [];
	}

	const entries: ChangelogEntry[] = files.map((fullPath) => {
		const fileName = path.basename(fullPath);
		const raw = fs.readFileSync(fullPath, "utf8");
		const meta = parseFrontmatter(raw);
		return { fileName, ...meta } as ChangelogEntry;
	});

	return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const metadata = {
	title: "Changelog",
	description: "Product updates, fixes, and improvements over time.",
};

function Section({ title, items }: { title: string; items?: string[] }) {
	if (!items || items.length === 0) return null;
	return (
		<details className="group rounded-md border bg-card/50 p-3 open:bg-card">
			<summary className="flex cursor-pointer list-none items-center justify-between gap-2">
				<span className="text-sm font-medium">{title}</span>
				<span className="text-xs text-muted-foreground group-open:hidden">Show</span>
				<span className="text-xs text-muted-foreground hidden group-open:inline">Hide</span>
			</summary>
			<ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
				{items.map((it, idx) => (
					<li key={idx} className="text-foreground/90">{it}</li>
				))}
			</ul>
		</details>
	);
}

export default function ChangelogsPage() {
	const entries = getChangelogEntries();
	return (
		<div className="mx-auto max-w-5xl px-4 py-12">
			<h1 className="text-3xl font-bold tracking-tight">Changelog</h1>
			<p className="mt-2 text-muted-foreground">Latest updates, fixes, and improvements.</p>
			<div className="mt-10 space-y-16">
				{entries.length === 0 ? (
					<p className="text-sm text-muted-foreground">No changelog entries found yet.</p>
				) : (
					<ul className="space-y-16">
						{entries.map((entry, index) => (
							<li key={entry.fileName} className="grid grid-cols-1 gap-6 md:grid-cols-12">
								{/* Left sticky date */}
								<div className="md:col-span-3">
									<div className="sticky top-24 flex items-start gap-2">
										<div className="mt-2 hidden h-full w-px bg-border md:block" />
										<div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary md:mt-2" />
										<div>
											<p className="text-xs text-muted-foreground">{index === 0 ? "Latest" : ""}</p>
											<p className="text-sm font-medium">{new Date(entry.date).toLocaleDateString()}</p>
										</div>
									</div>
								</div>
								{/* Right content card */}
								<div className="md:col-span-9">
									<div className="rounded-xl border bg-card p-5 shadow-sm">
										<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
											<h2 className="text-xl font-semibold">{entry.title}</h2>
											{entry.version && (
												<span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">v{entry.version}</span>
											)}
											{entry.tags && entry.tags.length > 0 && (
												<div className="flex flex-wrap gap-2">
													{entry.tags.map((tag) => (
														<span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-xs text-foreground/80">
															{tag}
														</span>
													))}
												</div>
											)}
										</div>
										{entry.description && (
											<p className="mt-2 text-sm text-muted-foreground">{entry.description}</p>
										)}
										<div className="mt-4 space-y-3">
											<Section title="Features" items={entry.features} />
											<Section title="Bug Fixes" items={entry.bugFixes} />
										</div>
									</div>
								</div>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
