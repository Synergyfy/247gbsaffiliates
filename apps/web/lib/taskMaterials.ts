export interface TaskMaterialFile {
    name: string;
    url: string;
}

export interface ParsedTaskMaterials {
    notes: string;
    files: TaskMaterialFile[];
    links: string[];
}

/**
 * Central Hub stores supplied materials as plain text so the same value works
 * across systems. It writes uploaded files as `File: name — url` and links as
 * `Link: url`; this parser turns those lines back into download/open actions.
 */
export function parseTaskMaterials(value?: string | null): ParsedTaskMaterials {
    const notes: string[] = [];
    const files: TaskMaterialFile[] = [];
    const links: string[] = [];

    for (const rawLine of String(value ?? '').split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line) continue;

        const fileMatch = line.match(/^file:\s*(.+?)\s*[—–-]\s*(https?:\/\/\S+)\s*$/i);
        if (fileMatch) {
            files.push({ name: fileMatch[1].trim(), url: fileMatch[2].trim() });
            continue;
        }

        const linkMatch = line.match(/^link:\s*(https?:\/\/\S+)\s*$/i);
        if (linkMatch) {
            links.push(linkMatch[1]);
            continue;
        }

        const urls = line.match(/https?:\/\/\S+/g) ?? [];
        if (urls.length > 0) {
            urls.forEach((url) => links.push(url));
            const withoutUrls = line.replace(/https?:\/\/\S+/g, '').replace(/\s{2,}/g, ' ').trim();
            if (withoutUrls) notes.push(withoutUrls);
            continue;
        }

        notes.push(line);
    }

    return {
        notes: notes.join('\n').trim(),
        files: files.filter(
            (file, index, list) =>
                list.findIndex((candidate) => candidate.url === file.url) === index,
        ),
        links: Array.from(new Set(links)),
    };
}
