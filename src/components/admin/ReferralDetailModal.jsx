
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar as CalendarIcon,
  FileText, 
  Download,
  ExternalLink,
  Save,
  AlertCircle,
  Clock,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { KidReferral } from '@/api/entities';

export default function ReferralDetailModal({ referral, isOpen, onClose, onUpdate }) {
  const [adminNotes, setAdminNotes] = useState(referral?.admin_notes || '');
  const [status, setStatus] = useState(referral?.status || 'pending');
  const [followUpDate, setFollowUpDate] = useState(
    referral?.follow_up_date ? new Date(referral.follow_up_date) : null
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!referral) return null;

  const getStatusTooltip = (status) => {
    const tooltips = {
      pending: 'Initial submission - Needs admin review',
      reviewing: 'Team is evaluating - Under active consideration',
      approved: "Accepted for program - Moving to production phase",
      completed: "Child's wish fulfilled - Project successfully completed",
      declined: 'Not suitable for program - Application rejected'
    };
    return tooltips[status] || status;
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewing: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    completed: 'bg-purple-100 text-purple-800',
    declined: 'bg-red-100 text-red-800'
  };

  const urgencyColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        admin_notes: adminNotes,
        status,
        follow_up_date: followUpDate ? followUpDate.toISOString().split('T')[0] : null
      };
      
      await KidReferral.update(referral.id, updateData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating referral:', error);
      alert('Error updating referral. Please try again.');
    }
    setIsSaving(false);
  };

  const handleFileDownload = (file) => {
    window.open(file.url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Referral Details: {referral.child_name}</span>
            <div className="relative group">
              <Badge className={statusColors[referral.status]}>
                {referral.status}
              </Badge>
              <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {getStatusTooltip(referral.status)}
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Child Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Child Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">Name</Label>
                <p className="font-semibold">{referral.child_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Age</Label>
                <p>{referral.child_age} years old</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Urgency Level</Label>
                <Badge className={urgencyColors[referral.urgency_level]} variant="outline">
                  {referral.urgency_level}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Submitted</Label>
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {format(new Date(referral.created_date), 'MMM d, yyyy @ h:mm a')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Guardian Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">Name</Label>
                <p className="font-semibold">{referral.guardian_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${referral.guardian_email}`} className="text-blue-600 hover:underline">
                    {referral.guardian_email}
                  </a>
                </p>
              </div>
              {referral.guardian_phone && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${referral.guardian_phone}`} className="text-blue-600 hover:underline">
                      {referral.guardian_phone}
                    </a>
                  </p>
                </div>
              )}
              {referral.referral_source && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">How they heard about us</Label>
                  <p>{referral.referral_source}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Creative Wish */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Creative Wish Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                {referral.wish_description}
              </p>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {referral.uploaded_files && referral.uploaded_files.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Uploaded Files ({referral.uploaded_files.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {referral.uploaded_files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFileDownload(file)}
                        className="ml-2 flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Admin Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="reviewing">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Follow-up Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {followUpDate ? format(followUpDate, 'PPP') : 'Set follow-up date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={followUpDate}
                        onSelect={setFollowUpDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this referral..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                  <Save className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
