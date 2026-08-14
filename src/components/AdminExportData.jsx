import React from 'react';
import { DownloadCloud, Users, Milk, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

const AdminExportData = ({ registeredUsers, globalOrders, globalPayments, prices }) => {
  const downloadCSV = (filename, rows) => {
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCustomers = () => {
    const headers = ["Name", "Mobile", "Role", "Start Date"];
    const rows = [headers];
    registeredUsers.forEach(u => {
      rows.push([u.name, u.mobile, u.role, u.startDate || ""]);
    });
    downloadCSV("Customers_List.csv", rows);
  };

  const exportOrders = () => {
    const headers = ["Date", "Mobile", "Name", "Milk(L)", "Ghee(Kg)", "Chach(L)", "Paneer(Kg)", "Curd(Kg)", "Status", "Total(Rs)"];
    const rows = [headers];
    
    Object.keys(globalOrders || {}).forEach(mobile => {
      const userOrders = globalOrders[mobile];
      const user = registeredUsers.find(u => u.mobile === mobile);
      Object.keys(userOrders).forEach(date => {
        const o = userOrders[date];
        const dayTotal = (o.milk || 0) * prices.milk + (o.ghee || 0) * prices.ghee + (o.chach || 0) * prices.chach + (o.paneer || 0) * prices.paneer + (o.curd || 0) * prices.curd;
        rows.push([date, mobile, user ? user.name : "Unknown", o.milk || 0, o.ghee || 0, o.chach || 0, o.paneer || 0, o.curd || 0, o.status || "approved", dayTotal]);
      });
    });
    downloadCSV("All_Orders.csv", rows);
  };

  const exportPayments = () => {
    const headers = ["Timestamp", "Mobile", "Name", "Amount(Rs)", "UTR", "For Month", "Status"];
    const rows = [headers];
    
    Object.keys(globalPayments || {}).forEach(mobile => {
      const userPayments = globalPayments[mobile];
      const user = registeredUsers.find(u => u.mobile === mobile);
      userPayments.forEach(p => {
        rows.push([
          p.timestamp ? format(new Date(p.timestamp), 'yyyy-MM-dd HH:mm:ss') : "",
          mobile,
          user ? user.name : "Unknown",
          p.amount,
          p.utr || "",
          p.paymentMonth || "",
          p.status || "approved"
        ]);
      });
    });
    downloadCSV("All_Payments.csv", rows);
  };

  return (
    <div style={{ padding: '1rem', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>
        <DownloadCloud size={24} color="var(--primary)" /> Export Data
      </h2>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <button onClick={exportCustomers} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: '50%', color: '#0284c7' }}>
            <Users size={32} />
          </div>
          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Export Customers List</span>
        </button>
        
        <button onClick={exportOrders} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '50%', color: '#d97706' }}>
            <Milk size={32} />
          </div>
          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Export All Orders</span>
        </button>

        <button onClick={exportPayments} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '50%', color: '#16a34a' }}>
            <IndianRupee size={32} />
          </div>
          <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Export All Payments</span>
        </button>
      </div>
    </div>
  );
};

export default AdminExportData;
