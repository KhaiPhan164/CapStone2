import React, { useState, useEffect, useRef } from 'react';
import PaymentService from '../../../services/paymentservice';
import { getMembershipById } from '../../../services/membershipService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCalendarAlt, faDumbbell, faTimes, faDownload, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { QRCodeSVG } from 'qrcode.react';
import { Modal, Button, Tag, message } from 'antd';
import QRCodeService from '../../../services/qrCodeService';

const UserMemberships = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [showQRCode, setShowQRCode] = useState(null);
  const qrCodeRef = useRef(null);

  // Calculate remaining days with stack membership capability
  const calculateRemainingDays = (payments, duration) => {
    if (!payments.length) return 0;

    const today = new Date();
    let totalRemainingDays = 0;

    // Sort payments by date (oldest to newest)
    const sortedPayments = [...payments].sort((a, b) => 
      new Date(a.payment_date) - new Date(b.payment_date)
    );

    // Calculate expiry date of last payment
    let lastExpiryDate = null;

    sortedPayments.forEach((payment) => {
      const paymentDate = new Date(payment.payment_date);
      
      // If no expiry date yet or payment date is after expiry
      if (!lastExpiryDate || paymentDate > lastExpiryDate) {
        // Start counting from payment date
        lastExpiryDate = new Date(paymentDate);
      }
      
      // Add days from this payment
      lastExpiryDate.setDate(lastExpiryDate.getDate() + duration);
    });

    // Calculate remaining days from today to final expiry date
    if (lastExpiryDate) {
      const remainingDays = Math.floor((lastExpiryDate - today) / (1000 * 60 * 60 * 24));
      return Math.max(0, remainingDays);
    }

    return 0;
  };

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get all payments
      const payments = await PaymentService.getMyPaymentHistory();

      // 2. Filter successful payments and group by membership_id
      const groupedPayments = {};
      payments.filter(p => p.status_id === 2).forEach(payment => {
        if (!groupedPayments[payment.membership_id]) {
          groupedPayments[payment.membership_id] = [];
        }
        groupedPayments[payment.membership_id].push(payment);
      });

      // 3. Get membership info for each payment group
      const result = [];
      for (const [membershipId, payments] of Object.entries(groupedPayments)) {
        try {
          // Get membership info
          const membershipInfo = await getMembershipById(membershipId);

          // Get data from response
          const membershipData = membershipInfo.data;

          // Calculate total amount and total duration
          const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);
          const totalDuration = membershipData.duration * payments.length;

          // Sort payments by most recent (for display)
          const sortedPayments = [...payments].sort((a, b) => 
            new Date(b.payment_date) - new Date(a.payment_date)
          );

          // Get 2 most recent transactions
          const recentPayments = sortedPayments.slice(0, 2);

          // Calculate remaining days (considering stack membership)
          const remainingDays = calculateRemainingDays(payments, membershipData.duration);

          // Determine className based on remaining days
          let className = 'bg-green-500';
          let statusLabel = 'Active';
          
          if (remainingDays === 0) {
            className = 'bg-red-500'; // Expired
            statusLabel = 'Expired';
          } else if (remainingDays < 7) {
            className = 'bg-yellow-500'; // Expiring soon
            statusLabel = 'Expiring soon';
          }

          result.push({
            membership_id: membershipId,
            membership_name: membershipData.membership_name,
            membership_type: membershipData.membership_type || 1, // Default to 1 if not provided
            gym_name: payments[0].gym_name,
            gym_id: payments[0].gym_id,
            duration: membershipData.duration,
            total_duration: totalDuration,
            remaining_days: remainingDays,
            total_amount: totalAmount,
            payments: recentPayments.map(p => ({
              payment_id: p.payment_id,
              payment_date: p.payment_date,
              amount_paid: parseFloat(p.amount_paid),
              duration: membershipData.duration
            })),
            total_payments: payments.length,
            status: statusLabel,
            className: className,
            can_show_qr: (membershipData.membership_type === 1) // Only type 1 can show QR
          });
        } catch (err) {
          console.error("Error processing membership data:", err);
        }
      }

      setMemberships(result);

    } catch (err) {
      setError(err.message || 'Unable to load membership data');
    } finally {
      setLoading(false);
    }
  };

  // Download QR code as image
  const downloadQRCode = () => {
    if (!qrCodeRef.current) return;
    
    try {
      // Find SVG element in DOM
      const svgElement = qrCodeRef.current.querySelector('svg');
      
      if (!svgElement) {
        message.error('Could not find QR code');
        return;
      }
      
      // Convert SVG to URL data
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      // Create canvas to convert from SVG to PNG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Convert canvas to data URL
        const pngUrl = canvas.toDataURL('image/png');
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `qrcode-${showQRCode.membership_name.replace(/\s+/g, '-').toLowerCase()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Release object URL
        URL.revokeObjectURL(svgUrl);
        
        message.success('QR code downloaded successfully');
      };
      
      img.src = svgUrl;
    } catch (error) {
      console.error('Error downloading QR code:', error);
      message.error('Could not download QR code');
    }
  };

  // Handle click on membership
  const handleMembershipClick = (membership) => {
    // Check both remaining days and membership type
    if (membership.remaining_days > 0 && membership.can_show_qr) {
      setShowQRCode(membership);
    } else if (membership.remaining_days <= 0) {
      // Show notification when membership has expired
      Modal.info({
        title: 'Membership Expired',
        content: 'This membership has expired and cannot be scanned. Please renew to continue using.',
        okText: 'Close',
      });
    } else if (!membership.can_show_qr) {
      // Show notification when membership type is not supported for QR
      Modal.info({
        title: 'QR Code Not Available',
        content: 'This type of membership does not support QR code functionality.',
        okText: 'Close',
      });
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-40">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500" />
  </div>;

  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    <p className="font-medium">Error:</p>
    <p className="text-sm">{error}</p>
    <button onClick={fetchMemberships} className="mt-2 px-4 py-2 bg-red-600 text-white rounded">
      Try again
    </button>
  </div>;

  if (!memberships.length) return <div className="text-center p-4 bg-gray-50 rounded-lg">
    <p className="text-gray-600">No paid memberships yet.</p>
    <button onClick={() => window.location.href = '/gyms'} 
      className="mt-3 px-4 py-2 bg-primary-500 text-white rounded">
      Find a gym
    </button>
  </div>;

  // Generate QR code data string
  const generateQRValue = (membership) => {
    return QRCodeService.generateQRString(membership);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Paid Memberships</h2>
        <button onClick={fetchMemberships} 
          className="px-3 py-1 bg-primary-500 text-white rounded">
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {memberships.map((item, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow border border-gray-200 ${item.remaining_days > 0 && item.can_show_qr ? 'cursor-pointer hover:shadow-md transition' : ''}`}
            onClick={() => handleMembershipClick(item)}
          >
            <div className={`${item.className} text-white p-3 flex justify-between items-center`}>
              <div>
                <h3 className="font-bold">{item.membership_name}</h3>
                <p className="text-sm opacity-90">{item.gym_name}</p>
              </div>
              {item.remaining_days > 0 && item.can_show_qr && (
                <Tag color="blue" className="flex items-center">
                  <FontAwesomeIcon icon={faQrcode} className="mr-1" /> Scan QR
                </Tag>
              )}
            </div>
            
            <div className="p-3 space-y-2">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faClock} className="mr-2 text-primary-500" />
                <span>Total duration: <strong>{item.total_duration} days</strong></span>
              </div>

              <div className="flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-primary-500" />
                <span>Remaining: <strong>{item.remaining_days} days</strong></span>
                <Tag 
                  color={item.remaining_days === 0 ? 'red' : (item.remaining_days < 7 ? 'orange' : 'green')}
                  className="ml-2"
                >
                  {item.status}
                </Tag>
              </div>
              
              <div className="flex items-center">
                <FontAwesomeIcon icon={faDumbbell} className="mr-2 text-primary-500" />
                <span>Total amount: <strong>{item.total_amount.toLocaleString('en-US')} VND</strong></span>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {item.total_payments > 2 
                    ? `2 most recent transactions (total of ${item.total_payments} transactions):`
                    : 'Transactions:'}
                </p>
                <ul className="space-y-1 text-sm">
                  {item.payments.map((payment, idx) => (
                    <li key={idx} className="text-gray-600 py-1">
                      {new Date(payment.payment_date).toLocaleDateString('en-US')} - {payment.duration} days - {payment.amount_paid.toLocaleString('en-US')} VND
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QR code display modal */}
      <Modal
        title={`QR Code - ${showQRCode?.membership_name || 'Membership'}`}
        open={showQRCode !== null}
        onCancel={() => setShowQRCode(null)}
        footer={[
          <Button key="download" type="primary" onClick={downloadQRCode} icon={<FontAwesomeIcon icon={faDownload} />}>
            Download
          </Button>,
          <Button key="close" onClick={() => setShowQRCode(null)}>
            Close
          </Button>,
        ]}
        centered
        width={400}
      >
        {showQRCode && (
          <div className="flex flex-col items-center p-4" ref={qrCodeRef}>
            <div className="bg-white p-4 rounded-md shadow-md">
              <QRCodeSVG
                value={generateQRValue(showQRCode)}
                size={240}
                level={"H"}
                includeMargin={true}
                imageSettings={{
                  src: "https://i.imgur.com/3msKKFF.png", // Default logo
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold">{showQRCode.gym_name}</p>
              <p className="text-md">{showQRCode.membership_name}</p>
              <Tag color="green" className="mt-2 px-3 py-1">
                <span className="text-sm font-medium">
                  Remaining: {showQRCode.remaining_days} days
                </span>
              </Tag>
              <p className="text-xs text-gray-500 mt-3">
                Show this QR code to gym staff for check-in
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserMemberships; 