import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

import { Subject, UserSettings } from '../types';
import { getColorBand, roundedAttendance } from '../utils/attendance';
import { formatFullDate } from '../utils/dates';

const PDF_MIME = 'application/pdf';
const EXCEL_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const safeFileName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'attendance';

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const statusLabel = (status: string) =>
  status
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const subjectRows = (subjects: Subject[], settings: UserSettings) =>
  subjects.map((subject) => {
    const percentage = roundedAttendance(
      subject.classesAttended,
      subject.classesHeld,
    );
    const band = getColorBand(percentage, settings.colorBands);
    return {
      Subject: subject.name,
      Professor: subject.professor ?? '',
      Attended: subject.classesAttended,
      Held: subject.classesHeld,
      'Attendance %': percentage,
      'Target %': settings.targetPercentage,
      Status: band.label,
    };
  });

const recordRows = (subjects: Subject[]) =>
  subjects.flatMap((subject) =>
    Object.values(subject.records)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((record) => ({
        Subject: subject.name,
        Date: record.date,
        Status: statusLabel(record.status),
        Note: record.note ?? '',
        Updated: record.updatedAt,
      })),
  );

const reportHtml = (
  title: string,
  subjects: Subject[],
  settings: UserSettings,
) => {
  const summaries = subjectRows(subjects, settings);
  const details = recordRows(subjects);
  const generated = new Date().toLocaleString('en-IN');
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page { margin: 34px; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #102033; font-family: Arial, Helvetica, sans-serif; font-size: 11px; }
        .brand { display: flex; align-items: center; gap: 12px; padding-bottom: 18px; border-bottom: 3px solid #175CFF; }
        .mark { width: 58px; height: 58px; border: 5px solid #175CFF; border-right-color: #10BFA8; border-bottom-color: transparent; border-radius: 50%; color: #102A72; font-size: 25px; font-style: italic; font-weight: 900; display: flex; align-items: center; justify-content: center; }
        h1 { margin: 0; color: #071B59; font-size: 25px; }
        .tagline { margin-top: 3px; color: #175CFF; font-size: 10px; font-weight: 700; }
        .tagline strong { color: #16B86A; }
        .meta { margin: 16px 0; display: flex; justify-content: space-between; color: #5A6B7B; }
        h2 { margin: 20px 0 8px; color: #071322; font-size: 14px; text-transform: uppercase; letter-spacing: .6px; }
        table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
        tr { page-break-inside: avoid; }
        th { background: #175CFF; color: white; padding: 8px 7px; text-align: left; font-size: 9px; }
        td { padding: 7px; border-bottom: 1px solid #D9E2EA; vertical-align: top; }
        tr:nth-child(even) td { background: #F4F7F9; }
        .score { color: #16A765; font-weight: 700; }
        .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #D9E2EA; color: #708090; font-size: 8px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="brand">
        <div class="mark">75</div>
        <div>
          <h1>Streak75 · ${escapeHtml(title)}</h1>
          <div class="tagline">Stay on track, <strong>stress less.</strong></div>
        </div>
      </div>
      <div class="meta">
        <span>Target attendance: <strong>${settings.targetPercentage}%</strong></span>
        <span>Generated ${escapeHtml(generated)}</span>
      </div>
      <h2>Attendance summary</h2>
      <table>
        <thead>
          <tr>
            <th>Subject</th><th>Professor</th><th>Attended</th><th>Held</th><th>Attendance</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${summaries
            .map(
              (row) => `<tr>
                <td><strong>${escapeHtml(row.Subject)}</strong></td>
                <td>${escapeHtml(row.Professor || '—')}</td>
                <td>${row.Attended}</td>
                <td>${row.Held}</td>
                <td class="score">${row['Attendance %']}%</td>
                <td>${escapeHtml(row.Status)}</td>
              </tr>`,
            )
            .join('')}
        </tbody>
      </table>
      <h2>Daily records</h2>
      <table>
        <thead>
          <tr><th>Subject</th><th>Date</th><th>Status</th><th>Note</th></tr>
        </thead>
        <tbody>
          ${
            details.length
              ? details
                  .map(
                    (row) => `<tr>
                      <td>${escapeHtml(row.Subject)}</td>
                      <td>${escapeHtml(formatFullDate(row.Date))}</td>
                      <td>${escapeHtml(row.Status)}</td>
                      <td>${escapeHtml(row.Note || '—')}</td>
                    </tr>`,
                  )
                  .join('')
              : '<tr><td colspan="4">No daily records have been marked yet.</td></tr>'
          }
        </tbody>
      </table>
      <div class="footer">Generated locally by Streak75. Your attendance data was not sent to an export server.</div>
    </body>
  </html>`;
};

async function share(uri: string, mimeType: string, dialogTitle: string) {
  if (!(await Sharing.isAvailableAsync())) return uri;
  await Sharing.shareAsync(uri, {
    mimeType,
    dialogTitle,
    ...(mimeType === EXCEL_MIME
      ? { UTI: 'org.openxmlformats.spreadsheetml.sheet' }
      : { UTI: 'com.adobe.pdf' }),
  });
  return uri;
}

async function createPdf(
  title: string,
  subjects: Subject[],
  settings: UserSettings,
) {
  const result = await Print.printToFileAsync({
    html: reportHtml(title, subjects, settings),
    base64: false,
  });
  const source = new File(result.uri);
  const destination = new File(
    Paths.cache,
    `streak75-${safeFileName(title)}-${Date.now()}.pdf`,
  );
  if (destination.exists) destination.delete();
  source.copy(destination);
  return share(destination.uri, PDF_MIME, `Share ${title}`);
}

async function createExcel(
  title: string,
  subjects: Subject[],
  settings: UserSettings,
) {
  const workbook = XLSX.utils.book_new();
  const summary = XLSX.utils.json_to_sheet(subjectRows(subjects, settings));
  summary['!cols'] = [
    { wch: 28 },
    { wch: 22 },
    { wch: 11 },
    { wch: 8 },
    { wch: 14 },
    { wch: 10 },
    { wch: 15 },
  ];
  const records = XLSX.utils.json_to_sheet(recordRows(subjects));
  records['!cols'] = [
    { wch: 28 },
    { wch: 13 },
    { wch: 13 },
    { wch: 52 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(workbook, summary, 'Summary');
  XLSX.utils.book_append_sheet(workbook, records, 'Daily Records');
  workbook.Props = {
    Title: `Streak75 - ${title}`,
    Subject: 'Attendance report',
    Author: 'Streak75',
    CreatedDate: new Date(),
  };

  const output = XLSX.write(workbook, {
    type: 'array',
    bookType: 'xlsx',
    compression: true,
  }) as ArrayBuffer;
  const destination = new File(
    Paths.cache,
    `streak75-${safeFileName(title)}-${Date.now()}.xlsx`,
  );
  if (destination.exists) destination.delete();
  destination.create();
  destination.write(new Uint8Array(output));
  return share(destination.uri, EXCEL_MIME, `Share ${title}`);
}

export const exportSubjectPdf = (subject: Subject, settings: UserSettings) =>
  createPdf(`${subject.name} report`, [subject], settings);

export const exportAllPdf = (subjects: Subject[], settings: UserSettings) =>
  createPdf('All subjects report', subjects, settings);

export const exportSubjectExcel = (subject: Subject, settings: UserSettings) =>
  createExcel(`${subject.name} report`, [subject], settings);

export const exportAllExcel = (subjects: Subject[], settings: UserSettings) =>
  createExcel('All subjects report', subjects, settings);
