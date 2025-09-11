import fs from "fs";
import path from "path";
import { ChangelogClient } from "./changelog-client";

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
	const baseDir = path.join(process.cwd(), "src", "app", "changelog", "content");
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

export default function ChangelogsPage() {
	const entries = getChangelogEntries();
	return <ChangelogClient entries={entries} />;
}
