import React, { useState } from 'react';
import { CheckCircle, Circle, AlertTriangle, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ProductionChecklist() {
  const [checkedItems, setCheckedItems] = useState(new Set());

  const toggleItem = (itemId) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const ChecklistItem = ({ id, text, priority = "important" }) => {
    const isChecked = checkedItems.has(id);
    const priorityColors = {
      critical: "text-red-600",
      important: "text-yellow-600", 
      nice: "text-green-600"
    };

    return (
      <div 
        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
          isChecked ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
        }`}
        onClick={() => toggleItem(id)}
      >
        {isChecked ? (
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
        )}
        <span className={`${isChecked ? 'line-through text-gray-500' : 'text-gray-700'}`}>
          {text}
        </span>
      </div>
    );
  };

  const sections = [
    {
      title: "🔒 Security & Authentication",
      priority: "critical",
      items: [
        "Row-level security (RLS) policies implemented for sensitive entities",
        "SSL certificate configured (HTTPS)",
        "Admin user accounts created and tested",
        "Regular user permissions verified", 
        "File upload size limits and type restrictions",
        "Rate limiting on forms (contact, referrals)",
        "Environment variables secured for production",
        "Database backups automated"
      ]
    },
    {
      title: "💳 Payment Integration",
      priority: "critical", 
      items: [
        "Stripe production account setup",
        "Stripe webhook endpoints configured and tested",
        "PCI compliance verification",
        "Failed payment handling implemented",
        "Recurring donation management tested",
        "Tax receipt generation (501c3 compliance)",
        "Refund process documented and tested"
      ]
    },
    {
      title: "📧 Email & Communications",
      priority: "important",
      items: [
        "Transactional email service configured (SendGrid, Mailgun, etc.)",
        "Thank you emails for donations automated",
        "Referral confirmation emails setup",
        "Newsletter integration functional",
        "Email templates designed and tested",
        "Unsubscribe functionality working",
        "GDPR/privacy compliance for email collection"
      ]
    },
    {
      title: "📝 Content & Legal", 
      priority: "critical",
      items: [
        "Privacy Policy created and linked",
        "Terms of Service created and linked", 
        "501(c)(3) status prominently displayed",
        "Tax-deductible language added to donation forms",
        "Contact information updated and accurate",
        "About page content finalized",
        "Mission statement approved by board",
        "Photo releases for all gallery content"
      ]
    },
    {
      title: "🎨 Content Management",
      priority: "important", 
      items: [
        "Admin accounts for gallery management created",
        "Initial gallery content uploaded and categorized",
        "Sample donation and referral data removed",
        "Real testimonials and success stories added",
        "Professional photography/videos uploaded",
        "Featured content selected and marked"
      ]
    },
    {
      title: "📊 Analytics & Monitoring",
      priority: "important",
      items: [
        "Google Analytics 4 configured",
        "Facebook Pixel installed (if using social ads)",
        "Donation conversion tracking setup",
        "Form submission tracking implemented", 
        "Error monitoring service configured (Sentry, etc.)",
        "Uptime monitoring setup",
        "Performance monitoring dashboard created"
      ]
    },
    {
      title: "🚀 Performance & SEO",
      priority: "important",
      items: [
        "Images optimized for web (compressed, responsive)",
        "Page load speeds tested (<3 seconds)",
        "Mobile responsiveness verified on all devices",
        "SEO meta tags added to all pages",
        "Open Graph tags for social sharing",
        "XML sitemap generated",
        "Google Search Console configured",
        "Local SEO setup (Google My Business)"
      ]
    },
    {
      title: "♿ Accessibility & Compliance", 
      priority: "important",
      items: [
        "WCAG 2.1 AA compliance verified",
        "Alt text added to all images",
        "Keyboard navigation tested",
        "Screen reader compatibility tested",
        "Color contrast ratios verified",
        "Form labels and ARIA attributes added", 
        "Video captions/transcripts provided"
      ]
    },
    {
      title: "🧪 Testing & Quality Assurance",
      priority: "critical",
      items: [
        "Cross-browser testing completed (Chrome, Firefox, Safari, Edge)",
        "Mobile testing on iOS and Android devices",
        "Form submissions tested end-to-end", 
        "Payment flow tested with test cards",
        "Admin panel functionality verified",
        "Gallery upload/management tested",
        "Email delivery tested",
        "404/error page handling verified"
      ]
    },
    {
      title: "🌐 Domain & Hosting",
      priority: "critical",
      items: [
        "Production domain purchased and configured",
        "DNS records properly configured",
        "CDN setup for static assets (if needed)",
        "Database production instance configured", 
        "Backup and recovery procedures tested",
        "SSL certificate auto-renewal configured"
      ]
    },
    {
      title: "🎯 UP4S Specific Features",
      priority: "critical",
      items: [
        "Kid referral form submissions working properly",
        "Gallery video embeds (YouTube, Vimeo, Wistia) functional",
        "Featured gallery items display correctly on homepage",
        "Donation modal exit-intent capture working",
        "Mobile menu navigation smooth",
        "Newsletter subscription from footer working",
        "Admin dashboard data export functionality"
      ]
    }
  ];

  const totalItems = sections.reduce((sum, section) => sum + section.items.length, 0);
  const completedItems = checkedItems.size;
  const completionPercentage = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            UP4S Production Readiness Checklist
          </h1>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-lg text-gray-600">
              Progress: {completedItems}/{totalItems} items completed ({completionPercentage}%)
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex gap-4 mb-8">
            <Badge className="bg-red-100 text-red-800">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Critical - Must complete before launch
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800">
              <Clock className="w-3 h-3 mr-1" />
              Important - Should complete for optimal experience
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              <Zap className="w-3 h-3 mr-1" />
              Nice-to-have - Can add post-launch
            </Badge>
          </div>
        </div>

        <div className="grid gap-6">
          {sections.map((section, sectionIndex) => (
            <Card key={sectionIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {section.title}
                  <Badge className={
                    section.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    section.priority === 'important' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {section.priority}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <ChecklistItem 
                      key={`${sectionIndex}-${itemIndex}`}
                      id={`${sectionIndex}-${itemIndex}`}
                      text={item}
                      priority={section.priority}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Timeline & Contacts</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Estimated Timeline</h4>
              <p className="text-blue-700">2-3 weeks for full production readiness</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Key Stakeholders</h4>
              <p className="text-blue-700">Wendy Anderson (Founder), Technical Team, Board Members</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}