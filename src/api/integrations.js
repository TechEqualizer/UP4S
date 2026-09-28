import { supabase } from './supabaseClient';

function objectPath(file) {
  const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
  return `${crypto.randomUUID()}${extension ? `.${extension}` : ''}`;
}

// Admin uploads for gallery and event images. Returns a public URL.
export async function UploadFile({ file }) {
  const path = objectPath(file);
  const { error } = await supabase.storage
    .from('public-media')
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from('public-media').getPublicUrl(path);
  return { file_url: data.publicUrl, path };
}

// Public uploads attached to a kid referral. The bucket is private, so this
// returns a storage path; admins open it with getReferralFileUrl.
export async function UploadReferralFile({ file }) {
  const path = `referrals/${objectPath(file)}`;
  const { error } = await supabase.storage
    .from('referral-uploads')
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return { path };
}

export async function getReferralFileUrl(path, expiresInSeconds = 300) {
  const { data, error } = await supabase.storage
    .from('referral-uploads')
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
