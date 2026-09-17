import AssessmentCard from "@/components/AssessmentCard";
import AudienceSection from "@/components/AudienceSection";
import EvaluationFactors from "@/components/EvaluationFactors";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ReportPreview from "@/components/ReportPreview";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <div className="py-8 sm:py-12">
          <AssessmentCard />
        </div>
        <EvaluationFactors />
        <HowItWorks />
        <ReportPreview />
        <AudienceSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
