import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { leadService } from '@/services/leadService';

interface CSVImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const CSVImport: React.FC<CSVImportProps> = ({ isOpen, onClose, onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setErrors([]);
      } else {
        setErrors(['Please select a valid CSV file']);
      }
    }
  };

  const parseCSV = (content: string) => {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const expectedHeaders = ['customer_name', 'contact_number', 'email', 'customer_type', 'tour_description', 'call_summary'];
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }
    
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const record: any = {};
        
        headers.forEach((header, index) => {
          record[header] = values[index] || null;
        });
        
        // Validate required fields
        if (!record.customer_name || !record.contact_number || !record.customer_type || !record.call_summary) {
          throw new Error(`Row ${i}: Missing required fields (customer_name, contact_number, customer_type, call_summary)`);
        }
        
        // Validate customer_type
        if (!['Direct Customer', 'Phone', 'Facebook', 'Insta'].includes(record.customer_type)) {
          throw new Error(`Row ${i}: Invalid customer_type. Must be one of: Direct Customer, Phone, Facebook, Insta`);
        }
        
        records.push(record);
      }
    }
    
    return records;
  };

  const handleImport = async () => {
    if (!file) return;
    
    setImporting(true);
    setErrors([]);
    
    try {
      const content = await file.text();
      const records = parseCSV(content);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Insert leads via PHP MySQL backend (avoids Supabase RLS and syncs with CRM)
      let successCount = 0;
      const failedRecords: string[] = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        try {
          await leadService.createLead({
            customerName: record.customer_name || record.name || 'Imported Lead',
            customerPhone: record.customer_phone || record.phone || record.contact_number || '',
            customerEmail: record.customer_email || record.email || '',
            source: record.source || record.customer_type || 'CSV Import',
            destinations: record.destinations || record.destination || record.packageName || '',
            status: record.status || 'New',
            notes: record.notes || record.remarks || '',
            packagePrice: parseFloat(record.package_price) || 0,
            packageCost: parseFloat(record.package_cost) || 0,
            duration: record.duration || '',
            packageName: record.package_name || record.destinations || 'Imported Package'
          } as any);
          successCount++;
        } catch (err: any) {
          failedRecords.push(`Row ${i + 1}: ${err.message || 'Failed to save'}`);
        }
      }

      if (failedRecords.length > 0 && successCount === 0) {
        throw new Error(failedRecords.join('; '));
      }

      toast({
        title: 'Success',
        description: `Successfully imported ${successCount} leads to CRM${failedRecords.length > 0 ? ` (${failedRecords.length} failed)` : ''}`
      });
      
      onImportComplete();
      onClose();
      
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      setErrors([errorMessage]);
      toast({
        title: 'Import Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['customer_name', 'contact_number', 'email', 'customer_type', 'tour_description', 'call_summary'];
    const sampleData = [
      'John Doe,9876543210,john@example.com,Direct Customer,Kashmir Tour Package,Interested in 5-day package'
    ];
    
    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Leads from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple leads at once.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mt-1"
            />
          </div>
          
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          <Alert>
            <AlertDescription>
              <strong>Required fields:</strong> customer_name, contact_number, customer_type, call_summary
              <br />
              <strong>Optional fields:</strong> email, tour_description
              <br />
              <strong>Customer types:</strong> Direct Customer, Phone, Facebook, Insta
            </AlertDescription>
          </Alert>
          
          <Button variant="outline" onClick={downloadTemplate} className="w-full">
            Download CSV Template
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || importing}
            className="min-w-24"
          >
            {importing ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};