import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Calendar as CalendarIcon, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { UploadFile } from '@/api/integrations';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';

export default function EventForm({ event, onSubmit, onCancel, isSubmitting }) {
  const [currentEvent, setCurrentEvent] = useState({
    title: '',
    description: '',
    event_date: null,
    location: '',
    fundraising_goal: '',
    image_url: '',
    is_active: true,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (event) {
      setCurrentEvent({
        ...event,
        event_date: event.event_date ? new Date(event.event_date) : null,
        fundraising_goal: event.fundraising_goal || '',
        is_active: event.is_active !== undefined ? event.is_active : true
      });
    } else {
      setCurrentEvent({
        title: '',
        description: '',
        event_date: null,
        location: '',
        fundraising_goal: '',
        image_url: '',
        is_active: true,
      });
    }
  }, [event]);

  const validate = () => {
    const errors = {};
    if (!currentEvent.title.trim()) errors.title = "Title is required.";
    if (!currentEvent.event_date) errors.event_date = "Event date and time are required.";
    if (!currentEvent.location.trim()) errors.location = "Location is required.";
    if (!currentEvent.image_url) errors.image_url = "An event image is required.";
    if (currentEvent.fundraising_goal === '' || isNaN(parseFloat(currentEvent.fundraising_goal)) || parseFloat(currentEvent.fundraising_goal) < 0) {
        errors.fundraising_goal = "Please enter a valid, non-negative goal.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
            if (prev >= 95) {
                clearInterval(progressInterval);
                return prev;
            }
            return prev + 5;
        });
    }, 100);

    try {
      const { file_url } = await UploadFile({ file });
      setCurrentEvent(prev => ({ ...prev, image_url: file_url }));
      setFormErrors(prev => ({...prev, image_url: ''}));
    } catch (error) {
      setFormErrors(prev => ({...prev, image_url: 'Upload failed. Please try again.'}));
    } finally {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => setIsUploading(false), 500);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    onSubmit({
      ...currentEvent,
      fundraising_goal: parseFloat(currentEvent.fundraising_goal),
      event_date: currentEvent.event_date ? currentEvent.event_date.toISOString() : null,
    });
  };
  
  const clearImage = () => {
    setCurrentEvent(prev => ({ ...prev, image_url: '' }));
  };

  return (
    <Card className="mb-8 border-blue-200 border">
      <CardHeader>
        <CardTitle>{event ? 'Edit Event' : 'Add New Event'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="event-image">Event Image *</Label>
            {currentEvent.image_url ? (
                <div className="mt-2 relative w-full aspect-video rounded-lg overflow-hidden group">
                    <img src={currentEvent.image_url} alt="Event Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="destructive" size="sm" onClick={clearImage} disabled={isSubmitting}>
                            <X className="w-4 h-4 mr-2" /> Remove Image
                        </Button>
                    </div>
                </div>
            ) : (
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="event-image-upload"
                  disabled={isUploading || isSubmitting}
                />
                <label htmlFor="event-image-upload" className={`cursor-pointer ${isUploading || isSubmitting ? 'cursor-not-allowed' : ''}`}>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Click to upload an image</p>
                  <p className="text-xs text-gray-400 mt-1">Recommended size: 16:9 aspect ratio</p>
                </label>
                {isUploading && (
                  <div className="mt-4">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
                  </div>
                )}
              </div>
            )}
            {formErrors.image_url && <p className="text-red-500 text-sm mt-1">{formErrors.image_url}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={currentEvent.title}
                onChange={(e) => setCurrentEvent({...currentEvent, title: e.target.value})}
                disabled={isSubmitting}
              />
              {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
            </div>

            <div>
              <Label htmlFor="event_date">Event Date & Time *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left font-normal"
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentEvent.event_date ? format(currentEvent.event_date, 'PPP p') : 'Select date and time'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={currentEvent.event_date}
                    onSelect={(date) => {
                        const newDate = new Date(date);
                        if (currentEvent.event_date) {
                            newDate.setHours(currentEvent.event_date.getHours());
                            newDate.setMinutes(currentEvent.event_date.getMinutes());
                        }
                        setCurrentEvent({...currentEvent, event_date: newDate});
                    }}
                  />
                  <div className="p-3 border-t border-gray-200">
                    <Label className="text-xs">Time</Label>
                    <Input
                      type="time"
                      value={currentEvent.event_date ? format(currentEvent.event_date, 'HH:mm') : ''}
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const time = e.target.value.split(':');
                        const newDate = new Date(currentEvent.event_date || new Date());
                        newDate.setHours(parseInt(time[0]), parseInt(time[1]));
                        setCurrentEvent({...currentEvent, event_date: newDate});
                      }}
                      disabled={isSubmitting}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              {formErrors.event_date && <p className="text-red-500 text-sm mt-1">{formErrors.event_date}</p>}
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Online or 123 Main St, Detroit, MI"
                value={currentEvent.location}
                onChange={(e) => setCurrentEvent({...currentEvent, location: e.target.value})}
                disabled={isSubmitting}
              />
              {formErrors.location && <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>}
            </div>

            <div>
              <Label htmlFor="fundraising_goal">Fundraising Goal ($) *</Label>
              <Input
                id="fundraising_goal"
                type="number"
                min="0"
                step="100"
                value={currentEvent.fundraising_goal}
                onChange={(e) => setCurrentEvent({...currentEvent, fundraising_goal: e.target.value})}
                disabled={isSubmitting}
              />
              {formErrors.fundraising_goal && <p className="text-red-500 text-sm mt-1">{formErrors.fundraising_goal}</p>}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell attendees about the event, its purpose, and what to expect."
                value={currentEvent.description}
                onChange={(e) => setCurrentEvent({...currentEvent, description: e.target.value})}
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_active" 
                checked={currentEvent.is_active} 
                onCheckedChange={(checked) => setCurrentEvent({...currentEvent, is_active: checked})}
                disabled={isSubmitting}
              />
              <Label htmlFor="is_active" className="text-sm font-medium">
                Make this event active and visible on the public site
              </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                event ? 'Update Event' : 'Create Event'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}