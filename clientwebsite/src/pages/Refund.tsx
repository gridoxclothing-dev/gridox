import React from 'react';
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Helmet } from "react-helmet-async";

const Refund = () => {
  return (
    <div className="min-h-screen bg-white text-[#000000] pb-16 md:pb-0 font-body">
      <Helmet>
        <title>Refund and Cancellation | GriDox</title>
      </Helmet>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="font-heading text-3xl md:text-4xl font-normal tracking-tight text-[#000000] italic mb-8">Refund and Cancellation Policy</h1>
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <h3 className="font-bold text-xl text-black mt-4">Cancellation Policy</h3>
          <p>Orders can be cancelled within 24 hours of placing the order. Once the order is shipped, it cannot be cancelled.</p>
          <h3 className="font-bold text-xl text-black mt-4">Refund Policy</h3>
          <p>If you are not satisfied with your purchase, you may return the item within 7 days of delivery for a full refund. The item must be in its original condition, unworn, and with all tags attached.</p>
          <h3 className="font-bold text-xl text-black mt-4">Process for Refund</h3>
          <p>To initiate a refund, please contact our customer support team at support@gridox.com with your order details. Refunds will be processed within 5-7 business days after we receive the returned item.</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};
export default Refund;
