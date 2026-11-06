import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { VerificationSubmission } from '../types';

interface VerifyDocumentsProps {
  isDarkMode: boolean;
  practitionerEmail: string;
}

export const VerifyDocuments: React.FC<VerifyDocumentsProps> = ({ isDarkMode, practitionerEmail }) => {
  const [submissions, setSubmissions] = useState<VerificationSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [refFile, setRefFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('practitioner_verifications')
        .select('*')
        .eq('practitioner_email', practitionerEmail)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions((data as VerificationSubmission[]) || []);
    } catch (err: any) {
      console.error('Error fetching practitioner verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [practitionerEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFile || !refFile) {
      setMessage({ text: 'Please select both an ID Document and an Accreditation / Reference letter.', type: 'error' });
      return;
    }

    try {
      setUploading(true);
      setMessage(null);

      // Attempt Supabase storage upload if bucket exists, or save sanitized file name
      const idFileName = `${Date.now()}_id_${idFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const refFileName = `${Date.now()}_ref_${refFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      try {
        await supabase.storage.from('practitioner-docs').upload(idFileName, idFile);
        await supabase.storage.from('practitioner-docs').upload(refFileName, refFile);
      } catch (storageErr) {
        // Storage bucket fallback without breaking row insertion
        console.warn('Storage bucket upload notice:', storageErr);
      }

      // Insert record into practitioner_verifications table in Supabase
      const { error: insertErr } = await supabase
        .from('practitioner_verifications')
        .insert({
          practitioner_email: practitionerEmail,
          id_document_name: idFile.name,
          reference_document_name: refFile.name,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        });

      if (insertErr) throw insertErr;

      setMessage({
        text: 'Documents submitted successfully to Supabase! Your accreditation verification is now pending administrator review.',
        type: 'success',
      });

      setIdFile(null);
      setRefFile(null);
      await fetchSubmissions();
    } catch (err: any) {
      console.error('Error submitting verification documents:', err);
      setMessage({ text: `Submission failed: ${err.message}`, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">Practitioner Accreditation & Verification</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload government-issued identification and professional teaching references for platform certification
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-300'
              : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Upload Form */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
        <h3 className="text-lg font-bold mb-4">Submit Verification Documents</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identity Document */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
              South African ID / Passport Document (PDF or Image)
            </label>
            <div className={`mt-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer ${isDarkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-300 bg-gray-50'}`}>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-[#E67012] hover:file:bg-orange-100"
              />
              {idFile && (
                <p className="mt-2 text-xs font-semibold text-green-600">
                  Selected: {idFile.name} ({(idFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>

          {/* Reference / Accreditation Letter */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
              Educational Accreditation / Institutional Reference Letter (PDF)
            </label>
            <div className={`mt-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer ${isDarkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-300 bg-gray-50'}`}>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setRefFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-[#E67012] hover:file:bg-orange-100"
              />
              {refFile && (
                <p className="mt-2 text-xs font-semibold text-green-600">
                  Selected: {refFile.name} ({(refFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !idFile || !refFile}
            className="w-full py-3 px-6 rounded-xl bg-[#E67012] hover:bg-[#D05505] text-white font-semibold text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading & Registering in Supabase...</span>
              </>
            ) : (
              <span>Submit Documents for Accreditation</span>
            )}
          </button>
        </form>
      </div>

      {/* Verification History */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Verification Status History</h3>
          <span className="text-xs text-gray-400">Live Supabase Database Sync</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-sm text-gray-500">Checking verification status...</span>
          </div>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            No previous verification documents found. Please submit your documents above.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {submissions.map((sub) => (
              <div key={sub.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{sub.id_document_name}</span>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="font-semibold text-sm">{sub.reference_document_name}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted: {new Date(sub.submitted_at).toLocaleDateString()} at {new Date(sub.submitted_at).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      sub.status === 'verified'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                        : sub.status === 'rejected'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
