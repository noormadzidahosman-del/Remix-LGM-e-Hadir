import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Meeting, MeetingInvitation } from '../types';
import { formatDateMalay, formatTimeMalay } from './formatters';

export function exportToCSV(meeting: Meeting, invitations: MeetingInvitation[]): void {
  const headers = [
    'Bil',
    'Nama Penerima',
    'Jawatan / Unit',
    'E-mel',
    'No. Telefon (WhatsApp)',
    'Status Kehadiran',
    'Nama Pegawai Wakil',
    'Sebab Tidak Hadir',
    'Masa Respon',
    'Pautan RSVP Unik',
  ];

  const rows = invitations.map((inv, index) => {
    let statusText = 'Belum Respon';
    if (inv.rsvp_status === 'attending') statusText = 'HADIR';
    if (inv.rsvp_status === 'not_attending') statusText = 'TIDAK HADIR';

    const clean = (val: string | null | undefined) => {
      if (!val) return '""';
      return `"${val.replace(/"/g, '""')}"`;
    };

    const host = typeof window !== 'undefined' ? window.location.origin : '';

    return [
      index + 1,
      clean(inv.invitee_name),
      clean(inv.invitee_position),
      clean(inv.invitee_email),
      clean(inv.invitee_phone),
      clean(statusText),
      clean(inv.representative_name || '-'),
      clean(inv.absence_reason || '-'),
      clean(inv.responded_at ? new Date(inv.responded_at).toLocaleString('ms-MY') : '-'),
      clean(`${host}/rsvp/${inv.rsvp_token}`),
    ].join(',');
  });

  // UTF-8 BOM (\uFEFF) ensures Excel reads Malaysian names & special characters properly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = meeting.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  a.download = `Kehadiran_${safeTitle}_${meeting.meeting_date}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type PdfExportMode = 'status_report' | 'sign_in_sheet';

export function exportToPDF(
  meeting: Meeting,
  invitations: MeetingInvitation[],
  mode: PdfExportMode = 'status_report'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const total = invitations.length;
  const attending = invitations.filter(i => i.rsvp_status === 'attending').length;
  const notAttending = invitations.filter(i => i.rsvp_status === 'not_attending').length;
  const pending = invitations.filter(i => i.rsvp_status === 'pending').length;

  // Header Bar (LGM Emerald Green #064E3B)
  doc.setFillColor(6, 78, 59);
  doc.rect(0, 0, 210, 26, 'F');

  // Accent Line (LGM Gold #D97706)
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 26, 210, 2.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('LEMBAGA GETAH MALAYSIA (LGM)', 14, 11);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const docSubtitle =
    mode === 'sign_in_sheet'
      ? 'BORANG PENDAFTARAN & TANDATANGAN KEHADIRAN FIZIKAL (MEJA URUS SETIA)'
      : 'SISTEM LGM e-HADIR — LAPORAN PENGESAHAN KEHADIRAN MESYUARAT';
  doc.text(docSubtitle, 14, 18);

  // Meeting Details Box
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const splitTitle = doc.splitTextToSize(meeting.title, 180);
  doc.text(splitTitle, 14, 36);

  let currentY = 36 + splitTitle.length * 5;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tarikh: ${formatDateMalay(meeting.meeting_date)}`, 14, currentY);
  doc.text(
    `Masa: ${formatTimeMalay(meeting.start_time)} - ${formatTimeMalay(meeting.end_time)}`,
    85,
    currentY
  );
  currentY += 4.5;

  const locText = `Lokasi / Pautan: ${meeting.location_or_link}`;
  const splitLoc = doc.splitTextToSize(locText, 180);
  doc.text(splitLoc, 14, currentY);
  currentY += splitLoc.length * 4 + 2;

  if (mode === 'status_report') {
    // Summary Metrics Badges for Status Report
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, currentY, 182, 13, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`JUMLAH JEMPUTAN: ${total}`, 18, currentY + 8);

    doc.setTextColor(6, 95, 70); // Green
    doc.text(`HADIR: ${attending}`, 68, currentY + 8);

    doc.setTextColor(185, 28, 28); // Red
    doc.text(`TIDAK HADIR: ${notAttending}`, 108, currentY + 8);

    doc.setTextColor(180, 83, 9); // Amber
    doc.text(`BELUM RESPON: ${pending}`, 148, currentY + 8);

    currentY += 17;

    // Table Data for Status Report
    const tableData = invitations.map((inv, index) => {
      let statusBadge = 'Belum Respon';
      if (inv.rsvp_status === 'attending') statusBadge = 'HADIR';
      if (inv.rsvp_status === 'not_attending') statusBadge = 'TIDAK HADIR';

      let details = '-';
      if (inv.rsvp_status === 'not_attending') {
        const parts = [];
        if (inv.representative_name) parts.push(`Wakil: ${inv.representative_name}`);
        if (inv.absence_reason) parts.push(`Sebab: ${inv.absence_reason}`);
        details = parts.join('\n') || 'Tiada maklumat';
      } else if (inv.rsvp_status === 'attending') {
        details = inv.responded_at
          ? `Disahkan: ${new Date(inv.responded_at).toLocaleTimeString('ms-MY', {
              hour: '2-digit',
              minute: '2-digit',
            })}`
          : 'Disahkan Hadir';
      }

      return [
        (index + 1).toString(),
        inv.invitee_name,
        inv.invitee_position,
        statusBadge,
        details,
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [
        ['Bil', 'Nama Pengarah / Pegawai', 'Jawatan / Bahagian', 'Status', 'Catatan / Nama Wakil / Sebab'],
      ],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [6, 78, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 48 },
        2: { cellWidth: 50 },
        3: { cellWidth: 26, fontStyle: 'bold' },
        4: { cellWidth: 48 },
      },
      didParseCell: data => {
        if (data.section === 'body' && data.column.index === 3) {
          if (data.cell.raw === 'HADIR') {
            data.cell.styles.textColor = [5, 150, 105];
          } else if (data.cell.raw === 'TIDAK HADIR') {
            data.cell.styles.textColor = [220, 38, 38];
          } else {
            data.cell.styles.textColor = [217, 119, 6];
          }
        }
      },
    });
  } else {
    // MODE: SIGN-IN SHEET (Borang Pendaftaran Meja Urus Setia dengan Kolum Tandatangan)
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(14, currentY, 182, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(6, 78, 59);
    doc.text(
      '* Sila tandatangan di ruangan yang disediakan bagi mengesahkan kehadiran fizikal di dewan mesyuarat.',
      18,
      currentY + 6.5
    );

    currentY += 14;

    const tableData = invitations.map((inv, index) => {
      let displayName = inv.invitee_name;
      if (inv.rsvp_status === 'not_attending' && inv.representative_name) {
        displayName = `${inv.representative_name}\n(Wakil kepada: ${inv.invitee_name})`;
      }

      return [
        (index + 1).toString(),
        displayName,
        inv.invitee_position,
        '', // Ruangan masa ketibaan kosong
        '', // Ruangan tandatangan kosong yang luas
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          'Bil',
          'Nama Pegawai / Wakil Hadir',
          'Jawatan / Bahagian',
          'Waktu Ketibaan',
          'Tandatangan Fizikal',
        ],
      ],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 4, // Higher padding for signature spacing
        valign: 'middle',
        minCellHeight: 12, // Sufficient space for pen signature
      },
      headStyles: {
        fillColor: [6, 78, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 55 },
        2: { cellWidth: 55 },
        3: { cellWidth: 24, halign: 'center' },
        4: { cellWidth: 38, halign: 'center' },
      },
    });
  }

  // Footer / Certification note
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    const dateGen = new Date().toLocaleString('ms-MY');
    doc.text(
      `Dokumen rasmi janaan automatik sistem LGM e-Hadir | Cetakan: ${dateGen} | Muka Surat ${i} daripada ${pageCount}`,
      14,
      288
    );
  }

  const modePrefix = mode === 'sign_in_sheet' ? 'Lembaran_Tandatangan_Meja' : 'Senarai_Kehadiran_Rasmi';
  const safeTitle = meeting.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 25);
  doc.save(`${modePrefix}_${safeTitle}.pdf`);
}
