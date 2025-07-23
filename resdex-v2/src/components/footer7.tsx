import React from "react";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { SiX } from "react-icons/si";
import { TextAnimate } from "@/components/magicui/text-animate";

interface Footer7Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: React.ReactNode;
  };
  sections?: Array<{
    title: React.ReactNode;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: React.ReactNode;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: React.ReactNode;
  legalLinks?: Array<{
    name: React.ReactNode;
    href: string;
  }>;
}

const defaultSections = [
  {
    title: "Product",
    links: [
      { name: "Overview", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Marketplace", href: "#" },
      { name: "Features", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#" },
      { name: "Team", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help", href: "#" },
      { name: "Sales", href: "#" },
      { name: "Advertise", href: "#" },
      { name: "Privacy", href: "#" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <SiX className="size-5" />, href: "#", label: "Twitter/X" },
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
];

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
];

const Footer7 = ({
  logo = {
    url: "https://www.resdex.ca",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
    alt: "logo",
    title: "ResDex",
  },
  sections = defaultSections,
  description = "Explore, connect, and stay updated with the latest in research and academia.",
  socialLinks = defaultSocialLinks,
  copyright = "© 2025 ResDex. All rights reserved.",
  legalLinks = defaultLegalLinks,
}: Footer7Props) => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <a href={logo.url}>
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={typeof logo.title === 'string' ? logo.title : ''}
                  className="h-8"
                />
              </a>
              <h2 className="text-xl font-semibold">{typeof logo.title === 'string' ? <TextAnimate animation="fadeIn" by="line">{logo.title}</TextAnimate> : logo.title}</h2>
            </div>
            <p className="text-muted-foreground max-w-[70%] text-sm">{typeof description === 'string' ? <TextAnimate as="span" animation="fadeIn" by="line">{description}</TextAnimate> : description}</p>
            <ul className="text-muted-foreground flex items-center space-x-6">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="hover:text-primary font-medium">
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-6 md:grid-cols-3 lg:gap-20">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold">{typeof section.title === 'string' ? <TextAnimate animation="fadeIn" by="line">{section.title}</TextAnimate> : section.title}</h3>
                <ul className="text-muted-foreground space-y-3 text-sm">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="hover:text-primary font-medium"
                    >
                      <a href={link.href}>{typeof link.name === 'string' ? <TextAnimate animation="fadeIn" by="line">{link.name}</TextAnimate> : link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="text-muted-foreground mt-8 flex flex-col justify-between gap-4 border-t py-8 text-xs font-medium md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">{typeof copyright === 'string' ? <TextAnimate as="span" animation="fadeIn" by="line">{copyright}</TextAnimate> : copyright}</p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-primary">
                <a href={link.href}> {typeof link.name === 'string' ? <TextAnimate animation="fadeIn" by="line">{link.name}</TextAnimate> : link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export { Footer7 };
