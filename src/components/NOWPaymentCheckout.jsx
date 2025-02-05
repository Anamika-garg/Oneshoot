"use client";

import { useState } from "react";

const NOWPaymentsCheckout = ({ amount, email, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateInvoice = async () => {
    setIsLoading(true);
    try {
      const invoiceData = {
        price_amount: amount.toFixed(2),
        order_id: `ORDER-${Date.now()}`,
        order_description: "Payment for items in cart",
      };

      console.log("Sending invoice data:", invoiceData);

      const response = await fetch("/api/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create invoice: ${errorData.error}`);
      }

      const { invoiceUrl } = await response.json();
      console.log("Redirecting to invoice URL:", invoiceUrl);
      window.location.href = invoiceUrl;
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert(`Failed to initiate payment: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
      role='dialog'
      aria-modal='true'
    >
      <div className='bg-lightBlack p-6 rounded-lg max-w-md w-full'>
        <h2 className='text-2xl font-bold text-white mb-4'>Crypto Payment</h2>
        <p className='text-white mb-4'>Total Amount: ${amount.toFixed(2)}</p>
        <button
          onClick={handleCreateInvoice}
          disabled={isLoading}
          className='w-full bg-yellow text-black py-2 rounded-lg hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400'
          tabIndex='0'
          aria-label='Initiate crypto payment'
        >
          {isLoading ? "Processing..." : "Pay Now"}
        </button>
        <button
          onClick={onClose}
          className='w-full mt-2 border border-white text-white py-2 rounded-lg hover:bg-white hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-white'
          tabIndex='0'
          aria-label='Cancel payment'
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default NOWPaymentsCheckout;
