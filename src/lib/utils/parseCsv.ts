import Papa from "papaparse";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseCsvEmails(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (result) => {
        const emails: string[] = [];

        for (const row of result.data as string[][]) {
          for (const cell of row) {
            const trimmed = cell?.trim().toLowerCase();
            if (trimmed && EMAIL_REGEX.test(trimmed)) {
              emails.push(trimmed);
            }
          }
        }

        resolve([...new Set(emails)]);
      },
      error: reject,
    });
  });
}