import React from 'react';
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Helmet } from "react-helmet-async";

const Terms = () => {
  return (
    <div className="min-h-screen bg-white text-[#000000] pb-16 md:pb-0 font-body">
      <Helmet>
        <title>Terms and Conditions | GriDox</title>
      </Helmet>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="font-heading text-3xl md:text-4xl font-normal tracking-tight text-[#000000] italic mb-8">Terms and Conditions</h1>
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>Welcome to GriDox. By accessing this website, we assume you accept these terms and conditions in full.</p>
          <h3 className="font-bold text-xl text-black mt-4">1. Introduction</h3>
          <p>These terms govern your use of our website; by using our website, you accept these terms in full. If you disagree with these terms or any part of these terms, you must not use our website.</p>
          <h3 className="font-bold text-xl text-black mt-4">2. Intellectual Property Rights</h3>
          <p>Unless otherwise stated, we or our licensors own the intellectual property rights in the website and material on the website.</p>
          <h3 className="font-bold text-xl text-black mt-4">3. License to Use Website</h3>
          <p>You may view, download for caching purposes only, and print pages from the website for your own personal use, subject to the restrictions set out below and elsewhere in these terms and conditions.</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};
export default Terms;
