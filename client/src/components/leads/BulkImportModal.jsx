import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Download, Check, RefreshCw } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { leadsApi } from '../../api/leads.api.js';

const SAMPLE_CSV = `firstName,lastName,email,phone,companyName,source,notes
Elena,Rostova,elena@novasystems.de,+49 30 123456,Nova Systems,website,Interested in enterprise tier
Marcus,Vance,marcus.v@vancetech.io,+1 (555) 234-5678,Vance Tech,referral,Looking for HIPAA compliance
Arthur,Dent,arthur@hitchhiker.org,+44 20 7946 0123,Megadodo Pub,linkedin,Needs multi-tenant setup`;

export default function BulkImportModal({ isOpen, onClose, onImportSuccess }) {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Parse CSV string into structured objects
  const parseCSV = (text) => {
    setError(null);
    setResult(null);
    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setParsedRows([]);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      // Split on comma, taking basic quotes into account
      const values = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });

      // Basic validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = Boolean(row.firstName && row.email && emailRegex.test(row.email));

      rows.push({
        data: row,
        isValid,
        issue: !row.firstName ? 'Missing first name' : !row.email ? 'Missing email' : !emailRegex.test(row.email) ? 'Invalid email format' : null,
      });
    }

    setParsedRows(rows);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setCsvText(content);
      parseCSV(content);
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_leads_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSample = () => {
    setCsvText(SAMPLE_CSV);
    parseCSV(SAMPLE_CSV);
  };

  const handleImportSubmit = async () => {
    const validLeads = parsedRows.filter((r) => r.isValid).map((r) => r.data);
    if (!validLeads.length) {
      setError('No valid lead rows found to import.');
      return;
    }

    setIsImporting(true);
    setError(null);
    try {
      const res = await leadsApi.bulkImport({
        leads: validLeads,
        skipDuplicates,
      });

      setResult(res.data);
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Bulk import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Import Leads"
      subtitle="Upload or paste a CSV file to import multiple leads into your tenant organization"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-ove-error/10 text-ove-error border border-ove-error/20 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="p-4 bg-ove-success/10 border border-ove-success/20 rounded-xl space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-ove-success font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Import Completed Successfully!</span>
            </div>
            <div className="flex items-center space-x-4 text-ove-text pt-1">
              <span>• Total Processed: <strong>{result.totalProcessed}</strong></span>
              <span>• Newly Imported: <strong className="text-ove-forest">{result.importedCount}</strong></span>
              <span>• Skipped (Duplicates): <strong className="text-ove-muted">{result.skippedCount}</strong></span>
            </div>
            <div className="pt-2">
              <Button size="sm" variant="primary" onClick={onClose}>
                Done & View Leads
              </Button>
            </div>
          </div>
        )}

        {!result && (
          <>
            {/* Top CSV Actions & Template */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-ove-soft/80 border border-ove-border rounded-xl text-xs">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-ove-forest flex-shrink-0" />
                <span className="font-medium text-ove-text">
                  Format: <code>firstName, lastName, email, phone, companyName, source, notes</code>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-ove-primary hover:underline font-semibold"
                >
                  Load Sample Data
                </button>
                <span className="text-ove-muted">•</span>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="inline-flex items-center space-x-1 text-ove-forest hover:underline font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Template</span>
                </button>
              </div>
            </div>

            {/* File Upload Dropzone & Text Area */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <label className="cursor-pointer inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-ove-border bg-white hover:bg-ove-soft text-xs font-semibold text-ove-text shadow-2xs transition-colors">
                  <Upload className="w-3.5 h-3.5 text-ove-primary" />
                  <span>Upload .CSV File</span>
                  <input
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-ove-muted">or paste CSV rows below:</span>
              </div>

              <textarea
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  parseCSV(e.target.value);
                }}
                rows={4}
                placeholder="firstName,lastName,email,phone,companyName,source,notes&#10;Alice,Smith,alice@example.com,+1555123456,Apex Corp,website,Inquiry notes"
                className="w-full text-xs font-mono p-3 rounded-lg border border-ove-border bg-white text-ove-text placeholder-ove-muted/60 focus:outline-none focus:ring-2 focus:ring-ove-primary/50"
              />
            </div>

            {/* Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-ove-text">
                    Import Preview ({parsedRows.length} total rows)
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-ove-success font-medium">✓ {validCount} valid</span>
                    {invalidCount > 0 && (
                      <span className="text-ove-error font-medium">✕ {invalidCount} invalid</span>
                    )}
                  </div>
                </div>

                <div className="max-h-52 overflow-y-auto border border-ove-border rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-ove-soft/80 sticky top-0 border-b border-ove-border text-[11px] font-semibold text-ove-muted uppercase">
                      <tr>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">Company</th>
                        <th className="py-2 px-3">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ove-border">
                      {parsedRows.map((r, idx) => (
                        <tr
                          key={idx}
                          className={r.isValid ? 'hover:bg-ove-soft/40' : 'bg-ove-error/5'}
                        >
                          <td className="py-2 px-3">
                            {r.isValid ? (
                              <span className="inline-flex items-center space-x-1 text-ove-success font-semibold text-[11px]">
                                <Check className="w-3 h-3" />
                                <span>Valid</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-ove-error font-semibold text-[11px]">
                                <AlertCircle className="w-3 h-3" />
                                <span>{r.issue}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-medium text-ove-text">
                            {r.data.firstName} {r.data.lastName}
                          </td>
                          <td className="py-2 px-3 text-ove-muted">{r.data.email}</td>
                          <td className="py-2 px-3 text-ove-muted">{r.data.companyName || '—'}</td>
                          <td className="py-2 px-3 capitalize text-ove-muted">{r.data.source || 'website'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Duplicate policy & Submit Bar */}
            <div className="pt-3 border-t border-ove-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="flex items-center space-x-2 text-xs text-ove-text cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="rounded border-ove-border text-ove-forest focus:ring-ove-primary"
                />
                <span>Skip duplicate leads with existing email addresses in organization</span>
              </label>

              <div className="flex items-center space-x-2">
                <Button variant="secondary" onClick={onClose} disabled={isImporting}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleImportSubmit}
                  isLoading={isImporting}
                  disabled={validCount === 0}
                >
                  Import {validCount} Lead{validCount !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

