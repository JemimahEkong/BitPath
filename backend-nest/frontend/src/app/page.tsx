 
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CreditCard, FileSpreadsheet, TrendingUp, Settings, Bell } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';


export default function Home() {
  const router = useRouter();
  const [animationKey, setAnimationKey] = useState(0);


  const features = [
    {
      icon: CreditCard,
      title: 'Stripe Integration',
      description: 'Connect your Stripe account to automatically track invoices, payments, and customer billing information',
      color: 'var(--primary)',
      stats: 'Automated Payment Tracking'
    },
    {
      icon: FileSpreadsheet,
      title: 'Google Sheets Sync',
      description: 'Sync payment data directly to Google Sheets for easy reporting, analysis, and financial management',
      color: 'var(--accent-green)',
      stats: 'Real-time Data Sync'
    },
    {
      icon: Bell,
      title: 'Payment Recovery',
      description: 'Automated reminders and follow-ups for overdue payments to improve cash flow and reduce bad debt',
      color: 'var(--accent-orange)',
      stats: 'Reduce Overdue Payments by 60%'
    },
    {
      icon: TrendingUp,
      title: 'Revenue Analytics',
      description: 'Simple dashboard to track payment trends, revenue growth, and customer payment behavior',
      color: 'var(--primary)',
      stats: 'Clear Financial Insights'
    }
  ];


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div  style={{ backgroundColor: 'var(--background-page)' }}>
      {/* Header with Language Selector */}
      <header  style={{ borderColor: 'var(--input-border)' }}>
        <div >
          <div >
            <Image
              src="/myLogo.png"
              alt="RevOps AI Logo"
              fill
              sizes="(max-width: 768px) 32px, 40px"
            />
          </div>
        </div>
        
        <div>
          <motion.button
            onClick={() => router.push('/login')}
           
            style={{ color: 'var(--text-link)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            login
          </motion.button>
          <motion.button
            onClick={() => router.push('/signup')}
          
            style={{ backgroundColor: 'var(--primary)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            signup
          </motion.button>
        </div>
      </header>

      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
       
      >
 
        
 
        <motion.div
          variants={itemVariants}
        
        >
          <motion.button
            onClick={() => router.push('/signup')}
           
            style={{ backgroundColor: 'var(--primary)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
          getStarted
     
          </motion.button>
          
          <motion.button
            onClick={() => router.push('/login')}
            
            style={{ 
              borderColor: 'var(--primary)', 
              color: 'var(--primary)',
              backgroundColor: 'transparent'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>login</span>
          </motion.button>
        </motion.div>
      </motion.div>

    </div>
  );
}
