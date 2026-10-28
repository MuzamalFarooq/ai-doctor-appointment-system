'use client';
import { useState, useRef, useId } from 'react';
import { Camera, Trash2, Upload, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { uploadPatientAvatar, removePatientAvatar } from '@/actions/patient.actions';
import { uploadDoctorAvatar, removeDoctorAvatar } from '@/actions/doctor.actions';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export function ProfilePictureUploader({
  currentImage,
  name,
  accountType = 'PATIENT', // 'PATIENT' or 'DOCTOR'
  onImageChange,
}) {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const inputId = useId();

  const [imageSrc, setImageSrc] = useState(currentImage || null);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Trigger file browser dialog
  const handleOpenFileDialog = () => {
    if (isUploading || isRemoving) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Keyboard accessibility (Space or Enter opens dialog)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenFileDialog();
    }
  };

  // Client-side file validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error('Unsupported format. Please select a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      toast.error(`File is too large (${sizeMb} MB). Maximum allowed size is 5 MB.`);
      return;
    }

    // Generate preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewFile(file);
    setPreviewUrl(objectUrl);
  };

  // Cancel preview
  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Save and upload selected image
  const handleSaveUpload = async () => {
    if (!previewFile || isUploading) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', previewFile);

    try {
      let result;
      if (accountType === 'DOCTOR') {
        result = await uploadDoctorAvatar(formData);
      } else {
        result = await uploadPatientAvatar(formData);
      }

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.success && result?.url) {
        // Immediate UI update
        setImageSrc(result.url);
        onImageChange?.(result.url);

        // Update client session token & revalidate
        try {
          await updateSession({ user: { image: result.url } });
        } catch (sessErr) {
          console.warn('Session refresh notice:', sessErr);
        }

        router.refresh();
        toast.success('Profile picture updated successfully!');
        handleCancelPreview();
      } else {
        toast.error('Failed to upload picture. Please try again.');
      }
    } catch (err) {
      console.error('Upload exception:', err);
      toast.error('Network error during upload. Please check your connection.');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove profile picture
  const handleConfirmRemove = async () => {
    if (isRemoving) return;

    setIsRemoving(true);
    try {
      let result;
      if (accountType === 'DOCTOR') {
        result = await removeDoctorAvatar();
      } else {
        result = await removePatientAvatar();
      }

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.success) {
        // Immediate UI update
        setImageSrc(null);
        onImageChange?.(null);

        // Update client session token & revalidate
        try {
          await updateSession({ user: { image: null } });
        } catch (sessErr) {
          console.warn('Session refresh notice:', sessErr);
        }

        router.refresh();
        setShowRemoveConfirm(false);
        toast.success('Profile picture removed. Default avatar restored.');
      } else {
        toast.error('Failed to remove picture. Please try again.');
      }
    } catch (err) {
      console.error('Remove picture exception:', err);
      toast.error('Failed to remove profile picture.');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(',')}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload profile picture"
        disabled={isUploading || isRemoving}
      />

      {/* Profile Picture with Camera Action Button */}
      <div className="relative group">
        <div
          role="button"
          tabIndex={0}
          onClick={handleOpenFileDialog}
          onKeyDown={handleKeyDown}
          title="Click to change profile picture"
          aria-label="Change profile picture"
          className="cursor-pointer rounded-full outline-hidden focus:ring-4 focus:ring-emerald-400/50 transition-all"
        >
          <Avatar
            src={imageSrc}
            name={name}
            size="2xl"
            className="ring-4 ring-white/40 shadow-xl group-hover:brightness-95 transition-all"
          />
        </div>

        {/* Camera / Edit Badge Button */}
        <button
          type="button"
          onClick={handleOpenFileDialog}
          disabled={isUploading || isRemoving}
          title="Upload new picture"
          aria-label="Upload new picture"
          className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-lg hover:scale-110 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Controls & Quick Actions */}
      <div className="flex flex-col justify-center sm:text-left text-center">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
          <button
            type="button"
            onClick={handleOpenFileDialog}
            disabled={isUploading || isRemoving}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur border border-white/30 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Photo
          </button>

          {imageSrc && (
            <button
              type="button"
              onClick={() => setShowRemoveConfirm(true)}
              disabled={isUploading || isRemoving}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-red-500/20 hover:bg-red-500/30 text-white border border-red-300/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-200" />
              Remove
            </button>
          )}
        </div>
        <p className="text-[11px] text-white/75 mt-2">
          JPG, PNG or WebP • Max 5 MB
        </p>
      </div>

      {/* Preview Confirmation Modal */}
      {previewUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700 text-center animate-in zoom-in-95 duration-200">
            <h2 id="preview-modal-title" className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Preview Profile Picture
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              Review how your new photo will look on your profile.
            </p>

            <div className="flex justify-center mb-5">
              <div className="relative">
                <Avatar
                  src={previewUrl}
                  name={name}
                  size="2xl"
                  className="ring-4 ring-emerald-500/30 shadow-xl"
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-5 text-xs text-left text-gray-600 dark:text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">File Name:</span>
                <span className="font-medium truncate max-w-[160px]">{previewFile?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">File Size:</span>
                <span className="font-medium">
                  {previewFile ? (previewFile.size / (1024 * 1024)).toFixed(2) + ' MB' : ''}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancelPreview}
                disabled={isUploading}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveUpload}
                disabled={isUploading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 text-white text-sm font-bold hover:opacity-95 shadow-md shadow-green-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Picture Confirmation Modal */}
      {showRemoveConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto mb-4 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <h2 id="remove-modal-title" className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Remove Profile Picture?
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to remove your profile picture? Your profile will restore the default initials avatar.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(false)}
                disabled={isRemoving}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

