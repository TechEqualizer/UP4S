
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link as LinkIcon, Film } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { getVideoThumbnail } from '../gallery/VideoEmbed'; // Added import

export default function GalleryForm({ item, onSubmit, onCancel }) {
  const [currentItem, setCurrentItem] = useState(item || {
    title: '',
    description: '',
    media_url: '',
    media_type: 'image',
    is_external_url: false,
    category: 'wishes-granted',
    child_name: '',
    child_age: '',
    is_featured: false,
    display_order: 0
  });
  const [isUploading, setIsUploading] = useState(false);
  const [mediaInputType, setMediaInputType] = useState('upload');
  const [thumbnailUrl, setThumbnailUrl] = useState(''); // Added state

  useEffect(() => {
    if (item) {
      setCurrentItem({
        ...item,
        child_age: item.child_age || '',
        display_order: item.display_order || 0
      });
      setMediaInputType(item.is_external_url ? 'url' : 'upload');
      
      // Generate thumbnail for existing external video URLs
      if (item.is_external_url && item.media_type === 'video') {
        const thumbnail = getVideoThumbnail(item.media_url);
        setThumbnailUrl(thumbnail?.thumbnail || '');
      } else {
        setThumbnailUrl(''); // Clear thumbnail if not external video
      }
    } else {
      setThumbnailUrl(''); // Clear thumbnail when creating a new item
    }
  }, [item]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      
      setCurrentItem(prev => ({
        ...prev,
        media_url: file_url,
        media_type: mediaType,
        is_external_url: false,
        title: prev.title || file.name.split('.')[0]
      }));
      setThumbnailUrl(''); // Clear thumbnail for file upload
    } catch (error) {
      alert('Error uploading file. Please try again.');
    }
    setIsUploading(false);
  };

  const handleExternalUrl = (url) => {
    const isImage = /\.(jpeg|jpg|gif|png|webp|avif|heic)$/i.test(url.split('?')[0]);
    const mediaType = isImage ? 'image' : 'video';
    
    setCurrentItem(prev => ({
      ...prev,
      media_url: url,
      media_type: mediaType,
      is_external_url: true
    }));

    // Generate thumbnail for video URLs
    if (mediaType === 'video' && url) {
      const thumbnail = getVideoThumbnail(url);
      setThumbnailUrl(thumbnail?.thumbnail || '');
    } else {
      setThumbnailUrl('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...currentItem,
      child_age: currentItem.child_age ? parseInt(currentItem.child_age) : null,
      display_order: parseInt(currentItem.display_order)
    });
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{item ? 'Edit Gallery Item' : 'Add New Gallery Item'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Media Source</Label>
            <Tabs value={mediaInputType} onValueChange={setMediaInputType} className="mt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload File
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" /> External URL
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {mediaInputType === 'upload' ? (
            <div>
              <Label>Upload Media File</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" id="media-upload" />
                <label htmlFor="media-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">{isUploading ? 'Uploading...' : 'Click to upload image or video'}</p>
                </label>
                {currentItem.media_url && !currentItem.is_external_url && (
                  <div className="mt-4">
                    <img src={currentItem.media_url} alt="Preview" className="w-32 mx-auto rounded-lg" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="external-url">Video or Image URL</Label>
              <Input 
                id="external-url" 
                placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..." // Updated placeholder
                value={currentItem.is_external_url ? currentItem.media_url : ''} 
                onChange={(e) => handleExternalUrl(e.target.value)} 
              />
              {thumbnailUrl && ( // Conditional rendering for thumbnail
                <div className="mt-4">
                  <Label className="text-sm text-gray-600">Video Thumbnail Preview:</Label>
                  <div className="mt-2">
                    <img 
                      src={thumbnailUrl} 
                      alt="Video thumbnail" 
                      className="w-48 rounded-lg shadow-sm"
                      onError={(e) => {
                        // Fallback to lower quality thumbnail
                        const thumbnail = getVideoThumbnail(currentItem.media_url);
                        if (thumbnail?.fallback && e.target.src !== thumbnail.fallback) {
                          e.target.src = thumbnail.fallback;
                        } else {
                          // If no fallback or already tried, hide the broken image
                          e.target.style.display = 'none';
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" required value={currentItem.title} onChange={(e) => setCurrentItem({...currentItem, title: e.target.value})} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={currentItem.category} onValueChange={(value) => setCurrentItem({...currentItem, category: value})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="wishes-granted">Wishes Granted</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="behind-scenes">Behind the Scenes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="child-name">Child's Name</Label>
              <Input id="child-name" value={currentItem.child_name} onChange={(e) => setCurrentItem({...currentItem, child_name: e.target.value})} />
            </div>
            <div>
              <Label htmlFor="child-age">Child's Age</Label>
              <Input id="child-age" type="number" min="3" max="18" value={currentItem.child_age} onChange={(e) => setCurrentItem({...currentItem, child_age: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={currentItem.description} onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})} rows={3} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="is-featured" checked={currentItem.is_featured} onCheckedChange={(checked) => setCurrentItem({...currentItem, is_featured: checked})} />
              <Label htmlFor="is-featured">Feature this item on the homepage</Label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={!currentItem.media_url || !currentItem.title} className="bg-blue-600 hover:bg-blue-700">
              {item ? 'Update Item' : 'Create Item'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
