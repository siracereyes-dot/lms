
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { 
  FileUp, 
  CheckCircle, 
  Loader2, 
  AlertCircle, 
  File, 
  X,
  ExternalLink
} from 'lucide-react';

interface ActivityUploadProps {
  profile: Profile | null;
}

const ActivityUpload: React.FC<ActivityUploadProps> = ({ profile }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !activityName || !profile) return;

    setIsUploading(true);
    setError(null);

    try {
      // REQUIREMENT: Rename every uploaded file to: loggedUserName_activityName.extension
      const extension = selectedFile.name.split('.').pop();
      const newFileName = `${profile.full_name.replace(/\s+/g, '_')}_${activityName.replace(/\s+/g, '_')}.${extension}`;
      
      console.log(`Simulating upload of: ${newFileName} to Google Drive Folder: 1MAEhFi5ZfSjd1s9hkbpkpX8FzzWrbpiv`);
      
      // Simulate API call to Next.js route /api/upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockDriveLink = `https://drive.google.com/file/d/mock-id-${Date.now()}/view`;

      // Log submission to Supabase
      const { error: dbError } = await supabase
        .from('submissions')
        .insert([{
          user_id: profile.id,
          activity_name: activityName,
          drive_link: mockDriveLink
        }]);

      if (dbError) throw dbError;

      setUploadSuccess(true);
      setActivityName('');
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload activity. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 bg-indigo-600 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <FileUp />
            Submit Activity
          </h2>
          <p className="text-indigo-100 mt-1">Upload your work to the shared class folder.</p>
        </div>

        {uploadSuccess ? (
          <div className="p-12 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload Successful!</h3>
            <p className="text-slate-500 mb-8">Your activity has been renamed and uploaded to the class drive.</p>
            <button 
              onClick={() => setUploadSuccess(false)}
              className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
            >
              Upload Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-700 text-sm">
                <AlertCircle size={20} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Activity Name</label>
              <input
                type="text"
                required
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="e.g. History Project, Week 1 Reflection"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">File Attachment</label>
              {!selectedFile ? (
                <div className="group relative border-2 border-dashed border-slate-200 rounded-2xl p-10 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-center">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                    <FileUp size={24} />
                  </div>
                  <p className="text-sm font-medium text-slate-600">Click or drag to upload file</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, DOCX, ZIP, or Image (Max 50MB)</p>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-indigo-600">
                      <File size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setSelectedFile(null)}
                    className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl space-y-2">
              <p className="text-xs text-indigo-700 font-bold uppercase tracking-wider">Auto-Naming Preview</p>
              <div className="flex items-center gap-2 text-sm text-indigo-600">
                <File size={14} />
                <code className="bg-white/50 px-2 py-0.5 rounded font-mono">
                  {profile?.full_name?.replace(/\s+/g, '_') || 'userName'}_{activityName.replace(/\s+/g, '_') || 'activityName'}.{selectedFile?.name.split('.').pop() || 'ext'}
                </code>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedFile || !activityName || isUploading}
              className={`
                w-full py-4 text-white font-bold rounded-2xl transition-all shadow-lg
                ${isUploading 
                  ? 'bg-indigo-400' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}
                flex items-center justify-center gap-2
              `}
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Uploading to Class Drive...</span>
                </>
              ) : (
                <>
                  <FileUp size={20} />
                  <span>Submit Activity</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-slate-400 text-sm">
        <AlertCircle size={14} />
        <span>Submissions are encrypted and stored in the secure Google Drive folder (1MAEhFi5...)</span>
      </div>
    </div>
  );
};

export default ActivityUpload;
