import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Star, 
  CheckCircle2, 
  TrendingUp, 
  Search, 
  Phone, 
  MessageCircle, 
  Mail, 
  User 
} from "lucide-react";

interface CustomersViewProps {
  leads: any[];
  customers: any[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  setFilterStatus: (s: string) => void;
  navigate: (path: string) => void;
  setSelectedCustomerModal: (customer: any) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  leads,
  customers,
  searchTerm,
  setSearchTerm,
  setFilterStatus,
  navigate,
  setSelectedCustomerModal,
}) => {
  // Aggregate leads into unique customer records dynamically
  const leadMap: Record<string, any> = React.useMemo(() => {
    const map: Record<string, any> = {};
    leads.forEach(l => {
      if (!l.deleted_at && l.customer_name) {
        const key = (l.email || l.customer_email || l.contact_number || l.customer_phone || l.customer_name).trim().toLowerCase();
        const cityVal = l.city || l.customer_home_city || l.departure_city || '';
        const isConfirmed = (l.status || '').toLowerCase().includes('confirmed');
        if (!map[key]) {
          map[key] = {
            id: l.id,
            name: l.customer_name,
            mobile: l.contact_number || l.customer_phone || '---',
            email: l.email || l.customer_email || '---',
            home_city: cityVal || '---',
            total_leads: 1,
            total_bookings: isConfirmed ? 1 : 0,
            all_leads: [l]
          };
        } else {
          map[key].total_leads += 1;
          if (isConfirmed) map[key].total_bookings += 1;
          map[key].all_leads.push(l);
          if ((!map[key].home_city || map[key].home_city === '---') && cityVal) {
            map[key].home_city = cityVal;
          }
          if (map[key].mobile === '---' && (l.contact_number || l.customer_phone)) {
            map[key].mobile = l.contact_number || l.customer_phone;
          }
          if (map[key].email === '---' && (l.email || l.customer_email)) {
            map[key].email = l.email || l.customer_email;
          }
        }
      }
    });
    return map;
  }, [leads]);

  // Combine aggregated leads with seeded customers list
  const allCustomers = React.useMemo(() => {
    const list = [...Object.values(leadMap)];
    customers.forEach(mc => {
      const key = (mc.email || mc.mobile || mc.name).trim().toLowerCase();
      if (!leadMap[key]) {
        list.push({
          ...mc,
          all_leads: []
        });
      }
    });
    return list;
  }, [leadMap, customers]);

  const activeCustomerList = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allCustomers;
    return allCustomers.filter(c => {
      const name = (c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const mobile = (c.mobile || '').toLowerCase();
      const city = (c.home_city || '').toLowerCase();
      return name.includes(q) || email.includes(q) || mobile.includes(q) || city.includes(q);
    });
  }, [allCustomers, searchTerm]);

  const totalCustomers = allCustomers.length;
  const repeatTravelers = allCustomers.filter(c => c.total_leads > 1 || c.total_bookings > 1).length;
  const confirmedTravelers = allCustomers.filter(c => c.total_bookings > 0).length;
  const totalEnquiriesCount = allCustomers.reduce((sum, c) => sum + (c.total_leads || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-slate-900 dark:text-slate-100">
      {/* KPI STATS CARDS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card 
          onClick={() => setSearchTerm('')}
          className="border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-amber-500/60 group"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-amber-500 transition-colors">Total Registered Clients</p>
              <div className="text-2xl font-black text-slate-950 dark:text-white mt-0.5">{totalCustomers}</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">Unique CRM profiles</p>
            </div>
            <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => setSearchTerm('')}
          className="border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-indigo-500/60 group"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">Repeat Travelers</p>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{repeatTravelers}</div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold mt-0.5">Multiple enquiries</p>
            </div>
            <div className="p-3 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <Star className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => { setSearchTerm(''); setFilterStatus('Booking Confirmed'); navigate('/crm/leads'); }}
          className="border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-emerald-500/60 group"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-emerald-500 transition-colors">Confirmed Travelers</p>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{confirmedTravelers}</div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">Booked tour deals</p>
            </div>
            <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => { setSearchTerm(''); setFilterStatus('all'); navigate('/crm/leads'); }}
          className="border-border/60 bg-card shadow-xs cursor-pointer transition-all hover:scale-[1.02] hover:border-blue-500/60 group"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider group-hover:text-blue-500 transition-colors">Total Enquiries</p>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{totalEnquiriesCount}</div>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold mt-0.5">Generated enquiries</p>
            </div>
            <div className="p-3 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/30 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH & WORKSPACE HEADER */}
      <Card className="border-border/60 shadow-md bg-card">
        <CardHeader className="p-4 border-b border-border/40 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" /> Customers Directory
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                Browse registered client profiles, view booking histories, and initiate direct communication.
              </CardDescription>
            </div>
          </div>

          <div className="relative pt-1">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search customers by name, email, contact number, or home city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 text-xs rounded-xl bg-background text-slate-950 dark:text-white font-medium placeholder:text-slate-400 border-border/80"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900/80 border-b border-border/50 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-left">
                  <th className="py-3 px-4 text-left">Customer Profile</th>
                  <th className="py-3 px-4 text-left">Contact Info</th>
                  <th className="py-3 px-4 text-left">Home City</th>
                  <th className="py-3 px-4 text-center">Enquiries</th>
                  <th className="py-3 px-4 text-center">Status Tier</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {activeCustomerList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-600 dark:text-slate-300 text-xs font-medium">
                      <Users className="w-10 h-10 mx-auto mb-2 text-amber-500/50" />
                      No customer records found matching your search.
                    </td>
                  </tr>
                ) : (
                  activeCustomerList.map((c: any, idx: number) => (
                    <tr key={`cust-${c.id || idx}-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all border-b border-border/10">
                      <td className="py-3 px-4 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center font-black text-xs uppercase shrink-0 border border-amber-500/30">
                            {c.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-slate-950 dark:text-white uppercase tracking-wide">{c.name}</p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono font-medium">Client #{c.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-left space-y-0.5">
                        <p className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{c.mobile}</p>
                        <p className="font-mono text-xs text-slate-600 dark:text-slate-400">{c.email}</p>
                      </td>
                      <td className="py-3 px-4 text-left font-extrabold text-xs text-slate-900 dark:text-slate-100 uppercase">
                        {c.home_city && c.home_city !== '---' ? c.home_city : '---'}
                      </td>
                      <td className="py-3 px-4 text-center font-black text-xs text-slate-900 dark:text-slate-100">
                        {c.total_leads || 1} Enquiries
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            c.total_bookings > 0 ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40' :
                            (c.total_leads > 1 ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/40' : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-400')
                          }`}
                          variant="outline"
                        >
                          {c.total_bookings > 0 ? '⭐ Confirmed Traveler' : (c.total_leads > 1 ? 'Repeat Prospect' : 'Verified Prospect')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`tel:${c.mobile}`)}
                            className="h-8 w-8 p-0 rounded-lg text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                            title="Call Customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://wa.me/${c.mobile}`)}
                            className="h-8 w-8 p-0 rounded-lg text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                            title="WhatsApp Client"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`mailto:${c.email}`)}
                            className="h-8 w-8 p-0 rounded-lg text-blue-600 border-blue-500/30 hover:bg-blue-500/10"
                            title="Email Client"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setSelectedCustomerModal(c)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs h-8 rounded-lg px-2.5 shadow-xs"
                            title="View Full Passenger Profile & History"
                          >
                            <User className="w-3.5 h-3.5 mr-1" /> Profile
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersView;
