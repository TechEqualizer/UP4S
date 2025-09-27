import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GalleryForm({ item, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    media_url: item?.media_url || '',
    media_type: item?.media_type || 'image',
    category: item?.category || 'wishes-granted',
    child_name: item?.child_name || '',
    child_age: item?.child_age || '',
    is_featured: item?.is_featured || false,
    is_external_url: item?.is_external_url || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{item ? 'Edit Gallery Item' : 'Add Gallery Item'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Media URL</label>
            <input
              type="url"
              value={formData.media_url}
              onChange={(e) => handleChange('media_url', e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Media Type</label>
              <select
                value={formData.media_type}
                onChange={(e) => handleChange('media_type', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="wishes-granted">Wishes Granted</option>
                <option value="events">Events</option>
                <option value="behind-scenes">Behind Scenes</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Child Name</label>
              <input
                type="text"
                value={formData.child_name}
                onChange={(e) => handleChange('child_name', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Child Age</label>
              <input
                type="number"
                value={formData.child_age}
                onChange={(e) => handleChange('child_age', e.target.value)}
                className="w-full p-2 border rounded-md"
                min="1"
                max="18"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => handleChange('is_featured', e.target.checked)}
                className="mr-2"
              />
              Featured Item
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_external_url}
                onChange={(e) => handleChange('is_external_url', e.target.checked)}
                className="mr-2"
              />
              External URL
            </label>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit">
              {item ? 'Update' : 'Create'} Item
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}