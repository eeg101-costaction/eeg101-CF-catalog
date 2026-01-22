"use client";

import Hero from "@/components/ui/Hero";
import TextSection from "@/components/ui/TextSection";
import InformationCard from "@/components/ui/InformationCard";
import { SignFrameworkButton } from "@/components/ui/Button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div>
      <Hero title="Resource catalog of the EEG101 Community Framework : About us" />

      <TextSection
        title="What is the EEG101 Community Framework?"
        subtitle={
          <>
            The EEG101 Community Framework (CF) is part of the{" "}
            <a
              href="http://www.eeg101.eu/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--text-link)",
                textDecoration: "underline",
              }}
            >
              EEG101 COST action
            </a>
            . In this specific workgroup, we define a set of deontological rules
            and guidelines for EEG science. It serves as a pledge and an
            invitation to update scientific practices towards a more rigorous,
            democratized, and responsible EEG science. The full text of the CF
            is available{" "}
            <a
              href="https://cuttingeeg.github.io/EEG101CommunityFramework/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--text-link)",
                textDecoration: "underline",
              }}
            >
              here
            </a>
            , and EEG practitioners from around the world are invited to{" "}
            <a
              href="https://cuttingeeg.github.io/EEG101CommunityFramework/#sign-the-pledge"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--text-link)",
                textDecoration: "underline",
              }}
            >
              sign the CF
            </a>{" "}
            and are welcome to use the resources provided in this website.
          </>
        }
      ></TextSection>

      <div className="flex justify-center mt-12">
        <SignFrameworkButton />
      </div>

      <TextSection title="Our mission" />

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 px-20 mb-8 mx-auto"
        style={{ maxWidth: "var(--container-max)" }}
      >
        <InformationCard content="Promote the CF principles and practices." />
        <InformationCard content="Offer resources for labs to adopt the CF principles." />
        <InformationCard content="Advocate with all stakeholders to change scientific culture." />
      </div>

      <TextSection
        title="This resource catalog"
        subtitle="This catalog is a live collection of tools and resources available to the community to turn the CF principles into actions."
      />

      <TextSection
        title="How you can contribute"
        subtitle="You can join the CF initiative and contribute to apply the CF principles by..."
      />

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 px-20 mb-8 mx-auto"
        style={{ maxWidth: "var(--container-max)" }}
      >
        <a
          href="https://cuttingeeg.github.io/EEG101CommunityFramework/#sign-the-pledge"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <InformationCard content="Signing the Community Framework" />
        </a>
        <Link href="/resources" style={{ textDecoration: "none" }}>
          <InformationCard content="Sharing resources in the catalog" />
        </Link>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSc3lL7oNRopg3y1Yq_z8K8we-vlDeUoXHpFMHczLyaAOmuevg/viewform"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <InformationCard content="Joining the EEG101 community" />
        </a>
      </div>

      <div className="flex justify-center mt-12 mb-8">
        <TextSection
          subtitle={
            <div style={{ fontSize: "var(--font-size-h4)" }}>
              Talk about it! Share this link:{" "}
              <a
                href="https://linktr.ee/eegcf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--text-link)",
                  textDecoration: "underline",
                }}
              >
                linktr.ee/eegcf
              </a>
            </div>
          }
        />
      </div>
    </div>
  );
}
