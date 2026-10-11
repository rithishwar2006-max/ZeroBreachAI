'use client';
import React, { useRef } from 'react';
import './dashboard.css';
import CosmosBackground from '@/components/dashboard/CosmosBackground';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import HeroSection from '@/components/dashboard/HeroSection';
import IngestSection from '@/components/dashboard/IngestSection';
import PreviewSection from '@/components/dashboard/PreviewSection';
import ThreatIntelSection from '@/components/dashboard/ThreatIntelSection';
import ReportsSection from '@/components/dashboard/ReportsSection';
import TicketsSection from '@/components/dashboard/TicketsSection';
import PipelineSection from '@/components/dashboard/PipelineSection';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import DocModal from '@/components/dashboard/DocModal';
import LiveCaptureModal from '@/components/dashboard/LiveCaptureModal';
import FullLogHistoryModal from '@/components/dashboard/FullLogHistoryModal';
import AIChatWidget from '@/components/dashboard/AIChatWidget';
import SOCAlertToast from '@/components/dashboard/SOCAlertToast';
import { useDashboardRuntime } from '@/components/dashboard/useDashboardRuntime';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useDashboardRuntime();

  return (
    <div ref={containerRef} suppressHydrationWarning={true} className="dashboard-container">
      <CosmosBackground />
      <DashboardHeader />
      <main>
        <HeroSection />
        <IngestSection />
        <PreviewSection />
        <ThreatIntelSection />
        <ReportsSection />
        <TicketsSection />
        <PipelineSection />
      </main>
      <DashboardFooter />
      <DocModal />
      <LiveCaptureModal />
      <FullLogHistoryModal />
      <AIChatWidget />
      <SOCAlertToast />
    </div>
  );
}
