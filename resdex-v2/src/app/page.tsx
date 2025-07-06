"use client";

import Image from "next/image";
import { TextAnimate } from "@/components/magicui/text-animate";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { Dock, DockIcon } from "@/components/magicui/dock";
import React, { useEffect, useState, useRef, RefObject } from "react";
import Link from "next/link";
import { HomeIcon, PencilIcon, MailIcon, CalendarIcon, ChevronDownIcon, ChevronDown } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";
import { TextReveal, TextRevealWithVerticalSlot } from "@/components/magicui/text-reveal";
import { NumberTicker } from "@/components/magicui/number-ticker";
import dynamic from "next/dynamic";
import { use3dTilt } from "@/hooks/use3dTilt";
import { WordRotate } from "@/components/magicui/word-rotate";
import { VelocityScroll } from "@/components/magicui/scroll-based-velocity";
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";
import AnimatedBeamMultipleOutputDemo from "@/components/magicui/animated-beam-multiple-outputs";
import { FileTextIcon, Share2Icon } from "@radix-ui/react-icons";
import { AnimatedList } from "@/components/magicui/animated-list";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip as RechartsTooltip } from "recharts";
import { Users, School, BrainCircuit } from "lucide-react";
import { Ripple } from "@/components/magicui/ripple";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Footer7 } from "@/components/footer7";
import { FaInstagram, FaDiscord } from "react-icons/fa";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton
} from "@/components/ui/navbar";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { FeaturesSectionDemo } from "@/components/ui/features-section-demo";
import { Timeline } from "@/components/ui/timeline";
import { Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { AvatarDropdown } from "@/components/ui/AvatarDropdown";

const Tilt = dynamic(() => import("react-parallax-tilt"), { ssr: false });

export type IconProps = React.HTMLAttributes<SVGElement>;

const Icons = {
  calendar: (props: IconProps) => <CalendarIcon {...props} />, 
  email: (props: IconProps) => <MailIcon {...props} />, 
  linkedin: (props: IconProps) => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>LinkedIn</title>
      <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  x: (props: IconProps) => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>X</title>
      <path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
  ),
  youtube: (props: IconProps) => (
    <svg width="32px" height="32px" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>youtube</title>
      <path d="M29.41,9.26a3.5,3.5,0,0,0-2.47-2.47C24.76,6.2,16,6.2,16,6.2s-8.76,0-10.94.59A3.5,3.5,0,0,0,2.59,9.26,36.13,36.13,0,0,0,2,16a36.13,36.13,0,0,0,.59,6.74,3.5,3.5,0,0,0,2.47,2.47C7.24,25.8,16,25.8,16,25.8s8.76,0,10.94-.59a3.5,3.5,0,0,0,2.47-2.47A36.13,36.13,0,0,0,30,16,36.13,36.13,0,0,0,29.41,9.26ZM13.2,20.2V11.8L20.47,16Z" />
    </svg>
  ),
  github: (props: IconProps) => (
    <svg viewBox="0 0 438.549 438.549" {...props}>
      <path
        fill="currentColor"
        d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
      />
    </svg>
  ),
};

const DATA = {
  navbar: [
    { href: "#", icon: HomeIcon, label: "Home" },
    { href: "#", icon: PencilIcon, label: "Blog" },
  ],
  contact: {
    social: {
      GitHub: {
        name: "GitHub",
        url: "#",
        icon: Icons.github,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "#",
        icon: Icons.linkedin,
      },
      X: {
        name: "X",
        url: "#",
        icon: Icons.x,
      },
      email: {
        name: "Send Email",
        url: "#",
        icon: Icons.email,
      },
    },
  },
};

// Marquee3D review data and components
const reviews = [
  {
    name: "Lucas Kim",
    username: "@lucaskim",
    body: "ResDex helped me land my first research position! The process was so much easier than cold emailing professors.",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Priya Singh",
    username: "@priyasingh",
    body: "I love how transparent and student-focused ResDex is. I found a lab that matched my interests perfectly.",
    img: "https://avatar.vercel.sh/jill",
  },
  {
    name: "Mateo Alvarez",
    username: "@mateoa",
    body: "The community features are amazing. I connected with peers and mentors who guided me through my research journey.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Emily Chen",
    username: "@emchen",
    body: "ResDex's interface is so easy to use. I found opportunities I never would have discovered otherwise!",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Noah Williams",
    username: "@noahw",
    body: "I appreciate the focus on student privacy and security. I feel safe sharing my achievements here.",
    img: "https://avatar.vercel.sh/jill",
  },
  {
    name: "Sara Müller",
    username: "@saramuller",
    body: "Connecting with professors was seamless. I got feedback on my research proposal within days!",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Omar Farouk",
    username: "@omarfarouk",
    body: "The verified opportunities gave me confidence that I was applying to real, quality positions.",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Julia Rossi",
    username: "@juliarossi",
    body: "ResDex is a game changer for undergrads looking to get into research. Highly recommend!",
    img: "https://avatar.vercel.sh/jill",
  },
];

const firstRow = reviews.slice(0, 2);
const secondRow = reviews.slice(2, 4);
const thirdRow = reviews.slice(4, 6);
const fourthRow = reviews.slice(6, 8);

const ReviewCard = ({ img, name, username, body }: { img: string; name: string; username: string; body: string }) => (
  <figure
    className={cn(
      "relative h-full w-fit sm:w-36 cursor-pointer overflow-hidden rounded-xl border p-4",
      "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
      "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
    )}
  >
    <div className="flex flex-row items-center gap-2">
      <img className="rounded-full" width="32" height="32" alt="" src={img} />
      <div className="flex flex-col">
        <figcaption className="text-sm font-medium dark:text-white">{name}</figcaption>
        <p className="text-xs font-medium dark:text-white/40">{username}</p>
      </div>
    </div>
    <blockquote className="mt-2 text-sm">{body}</blockquote>
  </figure>
);

function Marquee3D() {
  return (
    <div className="relative flex h-[32rem] max-w-7xl mx-auto flex-row items-center justify-center gap-4 overflow-hidden [perspective:300px]">
      <div
        className="flex flex-row items-center gap-4 w-full"
        style={{
          transform:
            "translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)",
        }}
      >
        <Marquee pauseOnHover vertical className="[--duration:20s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:20s]" vertical>
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:20s]" vertical>
          {thirdRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee pauseOnHover className="[--duration:20s]" vertical>
          {fourthRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background"></div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
    </div>
  );
}

// Notification demo data and component
const notifications = Array.from({ length: 10 }, () => [
  {
    name: "New follow request!",
    description: "Tirth Patel sent you a follow request!",
    time: "15m ago",
    icon: (
      <img
        src="https://github.com/impateltirth.png"
        alt="Dev Patel"
        className="w-6 h-6 rounded-full"
      />
    ),
    color: "#00C9A7",
  },
  {
    name: "New Comment",
    description: "Aaryan Bhavsar commented!",
    time: "10m ago",
    icon: "👤",
    color: "#FFB800",
  },
  {
    name: "Hey! How are you?",
    description: "Dev Patel sent you a message",
    time: "5m ago",
    icon: (
      <img
        src="https://github.com/devp19.png"
        alt="Dev Patel"
        className="w-6 h-6 rounded-full"
      />
    ),
    color: "#FF3D71",
  },
  {
    name: "Loves your paper!",
    description: "Fenil Shah liked your paper",
    time: "2m ago",
    icon: (
      <img
        src="https://github.com/Fshah05.png"
        alt="Fenil Shah"
        className="w-6 h-6 rounded-full"
      />
    ),
    color: "#1E86FF",
  },
]).flat();

interface NotificationProps {
  name: string;
  description: string;
  icon: string | React.ReactNode;
  color: string;
  time: string;
  small?: boolean;
}

const Notification = ({ name, description, icon, color, time, small = false }: NotificationProps) => {
  return (
    <figure
      className={cn(
        small
          ? "relative mx-auto min-h-fit w-full max-w-[260px] cursor-pointer overflow-hidden rounded-xl p-2"
          : "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
        // animation styles
        small
          ? "transition-all duration-200 ease-in-out hover:scale-[102%]"
          : "transition-all duration-200 ease-in-out hover:scale-[103%]",
        // light styles
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className={small ? "flex size-7 items-center justify-center rounded-xl" : "flex size-10 items-center justify-center rounded-2xl"}
          style={{ backgroundColor: color }}
        >
          {typeof icon === "string" ? (
            <span className={small ? "text-base" : "text-lg"}>{icon}</span>
          ) : (
            icon
          )}
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className={small ? "flex flex-row items-center whitespace-pre text-[15px] font-medium dark:text-white" : "flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white"}>
            <span className={small ? "text-xs sm:text-sm" : "text-sm sm:text-lg"}>{name}</span>
            <span className="mx-1">·</span>
            <span className={small ? "text-[10px] text-gray-500" : "text-xs text-gray-500"}>{time}</span>
          </figcaption>
          <p className={small ? "text-xs font-normal dark:text-white/60" : "text-sm font-normal dark:text-white/60"}>{description}</p>
        </div>
      </div>
    </figure>
  );
};

function AnimatedListDemo({ className = "" }) {
  return (
    <div className={cn(
      "relative flex h-[180px] w-full flex-col overflow-hidden p-1 mt-2",
      className
    )}>
      <AnimatedList>
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} small />
        ))}
      </AnimatedList>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
    </div>
  );
}

// Placeholder Calendar
const Calendar = ({ className = "" }) => (
  <div className={`flex items-center justify-center h-full w-full text-center text-neutral-400 ${className}`}>Calendar</div>
);

const files = [
  {
    name: "quantum-computing.pdf",
    body: "Quantum computing is a field of computing that uses quantum-mechanical phenomena, such as superposition and entanglement, to perform operations on data.",
  },
  {
    name: "large-language-models.pdf",
    body: "Large language models are a type of machine learning model that are trained on large amounts of text data. They are used to generate text, translate text, and answer questions.",
  },
  {
    name: "ai-in-research.pdf",
    body: "AI is being used in research to help with tasks such as literature review, data analysis, and writing.",
  },
  {
    name: "cell-phone-networks.pdf",
    body: "Cell phone networks are a type of wireless network that are used to communicate between devices.",
  },
  {
    name: "psychology.pdf",
    body: "Psychology is the study of the mind and behavior. It is a science that seeks to understand how people think, feel, and behave.",
  },
];

const features = [
  {
    Icon: FileTextIcon,
    name: "Create",
    description: "Let your ideas come to life right in your profile.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover={false}
        className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] "
      >
        {files.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none",
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium dark:text-white ">{f.name}</figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: Users,
    name: "Connect",
    description: "Collaborate with other students and professors to get your research done. We're building a community of researchers.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedListDemo className="absolute right-2 top-4 h-[300px] w-full scale-75 border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-90" />
    ),
  },
  {
    Icon: School,
    name: "Affiliations",
    description: "Supports organization portals to find your next research opportunity.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedBeamMultipleOutputDemo className="absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out filter grayscale [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
  {
    Icon: BrainCircuit,
    name: "Brainwave",
    description: "The ResDex way of blog-posting. Share your thoughts and ideas with the world.",
    className: "col-span-3 lg:col-span-1",
    href: "#",
    cta: "Learn more",
    background: (
      <Ripple className="absolute inset-0" mainCircleSize={120} mainCircleOpacity={0.12} />
    ),
  },
];

// Custom tooltip for the AreaChart
function CustomChartTooltip(props: any) {
  const { active, payload, label } = props;
  if (!active || !payload || !payload.length) return null;
  const platform = payload.find((p: any) => p.dataKey === "platform");
  const coldEmail = payload.find((p: any) => p.dataKey === "coldEmail");
  return (
    <div className="rounded-xl border border-gray-200 bg-white/90 px-4 py-2 shadow-xl text-sm text-gray-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-100">
      <div className="font-semibold mb-1">{label}</div>
      <div className="flex flex-col gap-1">
        {platform && (
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#f5f5f5', border: '1px solid #e5e5e5' }} />
            <span>Via ResDex:</span>
            <span className="font-bold">{platform.value}</span>
          </div>
        )}
        {coldEmail && (
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#e5e5e5', border: '1px solid #bdbdbd' }} />
            <span>Cold Email:</span>
            <span className="font-bold">{coldEmail.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const tilt1 = use3dTilt();
  const tilt2 = use3dTilt();
  const tilt3 = use3dTilt();
  const afterHeroRef = useRef<HTMLDivElement>(null);
  const [showDock, setShowDock] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginHovered, setLoginHovered] = useState(false);
  const [loginMobileHovered, setLoginMobileHovered] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signoutConfirmed, setSignoutConfirmed] = useState(false);
  const [dropdownHover, setDropdownHover] = useState<number | null>(null);
  const [hoverBgStyle, setHoverBgStyle] = useState<{ top: number; height: number } | null>(null);
  const dropdownOptionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Dropdown auto-close on mouse leave
  const closeDropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleDropdownMouseLeave = () => {
    closeDropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 120);
  };
  const handleDropdownMouseEnter = () => {
    if (closeDropdownTimeout.current) {
      clearTimeout(closeDropdownTimeout.current);
      closeDropdownTimeout.current = null;
    }
  };

  // User info for dropdown
  const fullName = profile?.display_name || profile?.full_name || profile?.username || currentUser?.user_metadata?.full_name || currentUser?.email;
  let username = profile?.username || currentUser?.user_metadata?.username || currentUser?.email?.split("@")[0];
  username = username ? `@${username}` : "";

  useEffect(() => {
    const handleScroll = () => {
      if (!afterHeroRef.current) return;
      const rect = afterHeroRef.current.getBoundingClientRect();
      // Show dock if the top of the section after hero is above the top of the viewport
      setShowDock(rect.top < 0);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
      if (data.user) {
        // Fetch profile from DB
        supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()
          .then(({ data: profileData }) => {
            setProfile(profileData);
            setLoading(false);
          });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
  }, []);

  // Example navigation items
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Blog", link: "/blog" },
    { name: "Contact", link: "/contact" },
  ];

  // Sign out handler
  const handleSignOut = async () => {
    setSigningOut(true);
    // Wait for animation before actual sign out
    setTimeout(async () => {
      await supabase.auth.signOut();
      setSigningOut(false);
      setDropdownOpen(false);
      setConfirmSignOut(false);
      window.location.reload();
    }, 900);
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      setDropdownOpen(false);
      setConfirmSignOut(false);
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [dropdownOpen]);

  // Update hover background position/size on hover
  useEffect(() => {
    if (dropdownHover === null || !dropdownOptionRefs.current[dropdownHover]) {
      setHoverBgStyle(null);
      return;
    }
    const el = dropdownOptionRefs.current[dropdownHover];
    if (el) {
      const parent = el.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const rect = el.getBoundingClientRect();
        setHoverBgStyle({
          top: rect.top - parentRect.top,
          height: rect.height,
        });
      }
    }
  }, [dropdownHover, dropdownOpen]);

  return (
    <>
      <div className="flex flex-col items-center min-h-screen px-4 sm:px-8 md:px-16 lg:px-32 xl:px-0 max-w-5xl mx-auto relative">
        {/* Navbar at the very top of the page */}
        <Navbar>
          <NavBody>
            <NavbarLogo />
            <NavItems items={navItems} />
            <div className="relative ml-4">
              {currentUser ? (
                <AvatarDropdown
                  userProfile={profile}
                  displayName={profile?.display_name || profile?.full_name || profile?.username || currentUser.email}
                  username={profile?.username || currentUser.email?.split("@")[0]}
                  avatarUrl={profile?.avatar_url || "/empty-pic.webp"}
                  onSignOut={handleSignOut}
                />
              ) : (
                <>
                  <div className="flex items-center">
                    <div
                      className="relative group px-4 py-2"
                      onMouseEnter={() => setLoginHovered(true)}
                      onMouseLeave={() => setLoginHovered(false)}
                    >
                      <Link href="/login" className="relative z-10 text-sm text-neutral-600 dark:text-neutral-300 font-medium hover:text-black dark:hover:text-white transition-colors">
                        Login
                      </Link>
                    </div>
                    <AnimatePresence>
                      {showDock && (
                        <motion.div
                          key="join-for-free-desktop"
                          initial={{ x: -32, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -32, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          style={{ display: 'inline-block' }}
                        >
                          <Link href="/signup">
                            <ShimmerButton type="button" className="px-5 py-2 rounded-full text-sm">Join for free</ShimmerButton>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </NavBody>
          <MobileNav visible={mobileOpen}>
            <MobileNavHeader>
              <NavbarLogo />
              <MobileNavToggle isOpen={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
            </MobileNavHeader>
            <MobileNavMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
              {navItems.map((item) => (
                <a key={item.name} href={item.link} onClick={() => setMobileOpen(false)} className="py-2 text-lg block">
                  {item.name}
                </a>
              ))}
              <div className="flex items-center gap-2">
                {currentUser ? (
                  <div className="relative">
                    <button
                      className="flex items-center gap-2 w-full focus:outline-none rounded-full transition-colors duration-150 hover:bg-gray-200/60 dark:hover:bg-neutral-800/60 cursor-pointer px-2 py-1"
                      onClick={() => setDropdownOpen((v) => !v)}
                    >
                      <img
                        src={profile?.avatar_url || currentUser?.user_metadata?.avatar_url || "/empty-pic.webp"}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-neutral-700"
                      />
                      <ChevronDownIcon
                        className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : "rotate-0"}`}
                        size={20}
                      />
                    </button>
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                          className="absolute right-0 mt-5 w-56 rounded-2xl bg-[rgba(230,230,230,0.65)] dark:bg-[rgba(24,24,27,0.80)] backdrop-blur-md shadow-lg border border-gray-200 dark:border-neutral-800 z-50 overflow-hidden p-2"
                          style={{ position: 'absolute' }}
                          onMouseLeave={handleDropdownMouseLeave}
                          onMouseEnter={handleDropdownMouseEnter}
                        >
                          {/* User info at top of dropdown */}
                          <div className="px-4 pt-2 pb-3 border-b border-gray-200 dark:border-neutral-800 mb-1">
                            <div className="font-semibold text-base text-black dark:text-white truncate">{fullName}</div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 opacity-80 truncate mt-0.5">{username}</div>
                          </div>
                          {/* Sliding hover background */}
                          <AnimatePresence>
                            {hoverBgStyle && (
                              <motion.div
                                layoutId="dropdown-hovered"
                                className="absolute left-0 w-full rounded-full bg-gray-300 dark:bg-neutral-800 z-0"
                                style={{
                                  top: hoverBgStyle.top + 4,
                                  height: hoverBgStyle.height - 8,
                                  left: 4,
                                  width: 'calc(100% - 8px)',
                                }}
                                initial={{ opacity: 0.7 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                              />
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <React.Fragment>
                    <div
                      className="relative group py-2 text-lg block"
                      onMouseEnter={() => setLoginMobileHovered(true)}
                      onMouseLeave={() => setLoginMobileHovered(false)}
                    >
                      <Link href="/login" className="relative z-10 text-lg text-neutral-600 dark:text-neutral-300 font-medium hover:text-black dark:hover:text-white transition-colors block">
                        Login
                      </Link>
                    </div>
                    <AnimatePresence>
                      {showDock && (
                        <motion.div
                          key="join-for-free-mobile"
                          initial={{ x: -32, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -32, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          style={{ display: 'inline-block' }}
                        >
                          <Link href="/signup">
                            <ShimmerButton type="button" className="px-5 py-2 rounded-full text-lg">Join for free</ShimmerButton>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                )}
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>
        {/* Main content */}
        <div className="w-full flex flex-col items-center justify-center min-h-screen">
          <Tilt glareEnable={true} glareMaxOpacity={0.08} glareColor="#fff" glarePosition="all" scale={1.01} transitionSpeed={2500} className="mb-4">
            <Image src="/beige-logo.png" alt="ResDex Logo" width={80} height={80} className="rounded-xl" />
          </Tilt>
          <TextAnimate
            animation="fadeIn"
            by="line"
            as="h1"
            className="title text-center"
          >
            {`Rediscover the world of research.`}
          </TextAnimate>
          <TextAnimate
            animation="fadeIn"
            by="line"
            as="p"
            className="description mt-4"
            delay={0.5}
          >
            {`Explore, connect, and stay updated with the latest in research and academia.`}
          </TextAnimate>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <InteractiveHoverButton className="bg-black border-black hover:text-black" dotClassName="bg-white" hoverArrowClassName="text-black">
              <span className="text-white group-hover:text-black">Join the waitlist</span>
            </InteractiveHoverButton>
            <InteractiveHoverButton className="bg-white text-black border-black">Learn more</InteractiveHoverButton>
          </div>
          <div className="supporting mt-20 mb-2 text-center">Used by students at</div>
          {/* Marquee with repeating university logos */}
          <div className="relative w-full mt-4 flex items-center justify-center overflow-hidden">
            <Marquee pauseOnHover={false} className="[--gap:3rem] py-2">
              {Array(3).fill([
                { src: "/McMaster.png", alt: "McMaster University" },
                { src: "/TMU.png", alt: "Toronto Metropolitan University" },
                { src: "/Laurier.png", alt: "Wilfrid Laurier University" },
                { src: "/UOFT.png", alt: "University of Toronto" },
                { src: "/UOttawa.png", alt: "University of Ottawa" },
              ]).flat().map((logo, i) => (
            <Image
                  key={i}
                  src={logo.src}
                  alt={logo.alt}
                  width={96}
                  height={96}
                  className="rounded-lg mx-6 object-contain"
                  draggable={false}
                />
              ))}
            </Marquee>
            {/* Gradient fade on left/right */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white dark:from-background" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white dark:from-background" />
          </div>
        </div>
        {/* Section: Research Made Easy with TextReveal */}
        <section ref={afterHeroRef} className="w-full text-[5rem] font-normal leading-[1.2] tracking-tight text-[#181818] flex flex-col items-center text-center justify-center mt-0 pt-0">
          <TextRevealWithVerticalSlot
            className="text-center text-[5rem] font-normal leading-[1.2] tracking-tight text-[#181818]"
            slotWords={["papers", "assistants", "positions", "experience"]}
          >
            {`Finding research __BLANK__ is hard. We know. So we made it easier.`}
          </TextRevealWithVerticalSlot>
        </section>
        <section>
          <FeaturesSectionDemo />
        </section>
        {/* Scroll-based velocity text animation */}
        <div className="w-full flex flex-col items-center justify-center font-medium mb-40 mt-20 relative overflow-hidden">
          <VelocityScroll numRows={2} defaultVelocity={5}>
            Research is a journey. Let your curiosity set the pace.
          </VelocityScroll>
          {/* Gradient fade on left/right */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white dark:from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white dark:from-background to-transparent" />
        </div>
        <Timeline
          data={[
            {
              title: <span style={{ color: '#2a2a2a', fontWeight: 500 }}>Transparency</span>,
              content: <p className="text-neutral-700 dark:text-neutral-300">We believe in open access to research opportunities. No hidden forms, no closed loops. Everything on ResDex — from positions to profiles — is built to be clear, searchable, and student-first.

</p>,
            },
            {
              title: <span style={{ color: '#2a2a2a', fontWeight: 500 }}>Equity</span>,
              content: <p className="text-neutral-700 dark:text-neutral-300">Research shouldn't be limited by privilege or proximity. ResDex levels the playing field by removing gatekeeping and giving every student, regardless of background, the chance to contribute meaningfully.

</p>,
            },
            {
              title: <span style={{ color: '#2a2a2a', fontWeight: 500 }}>Growth</span>,
              content: <p className="text-neutral-700 dark:text-neutral-300">ResDex isn't just about finding a position — it's about building a journey. From uploading your first research reflection to publishing with a supervisor, we support students at every stage of their development.

</p>,
            },
            {
              title: <span style={{ color: '#2a2a2a', fontWeight: 500 }}>Collaboration</span>,
              content: <p className="text-neutral-700 dark:text-neutral-300">Innovation thrives when people connect. Whether it's students co-authoring a paper, peer reviewers offering feedback, or labs mentoring first-time researchers — collaboration is at the heart of everything we do.

</p>,
            },
          ]}
        />
        {/* Section: Join the 1000 students, reshaping the future of research */}
        <section className="w-full flex flex-col items-center justify-center mt-20 my-12">
          <h2 className="text-3xl lg:text-5xl lg:leading-tight max-w-2xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
            <span>Join the <NumberTicker startValue={500} value={1000} className="text-3xl ml-2 mr-2 lg:text-5xl lg:leading-tight max-w-2xl mx-auto text-center tracking-tight font-bold text-black dark:text-white" />+ students, reshaping the future of research</span>
          </h2>
        </section>
        {/* 3D Marquee Section (MagicUI style) */}
        <section className="w-full flex flex-col items-center justify-center mb-24">
          <div className="w-full flex justify-center">
            <Marquee3D />
          </div>
        </section>
        {/* FAQ Section */}
        <section className="w-full flex flex-col items-center justify-center my-24">
          <TextAnimate animation="fadeIn" by="line" as="h2" className="text-3xl lg:text-5xl lg:leading-tight max-w-2xl mx-auto text-center tracking-tight font-medium text-black dark:text-white mb-10">Frequently Asked Questions</TextAnimate>
          <div className="w-full max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="">
              <AccordionItem value="item-1" className="px-6 py-4">
                <AccordionTrigger><TextAnimate animation="fadeIn" by="line">What is ResDex?</TextAnimate></AccordionTrigger>
                <AccordionContent>
                  ResDex is a platform for students to discover, apply to, and manage research opportunities. We connect students with professors and research groups, making research more accessible and transparent.
                </AccordionContent>
              </AccordionItem>
              <div className="w-full h-px bg-neutral-200 dark:bg-neutral-700 my-0.5" />
              <AccordionItem value="item-2" className="px-6 py-4">
                <AccordionTrigger><TextAnimate animation="fadeIn" by="line">I'm a student. How can I help?</TextAnimate></AccordionTrigger>
                <AccordionContent>
                  <>We're always looking for students to help us build the platform. If you're interested, please check out our <Link href="/careers" className="text-blue-500">careers page</Link> to become a student ambassador.</>
                </AccordionContent>
              </AccordionItem>
              <div className="w-full h-px bg-neutral-200 dark:bg-neutral-700 my-0.5" />
              <AccordionItem value="item-6" className="px-6 py-4">
                <AccordionTrigger><TextAnimate animation="fadeIn" by="line">What's next for ResDex?</TextAnimate></AccordionTrigger>
                <AccordionContent>
                  We're just getting started! Our vision is to transition ResDex into a full-fledged global research hub—where students, professors, and organizations can connect, share, and discover research in one place. Upcoming features include daily research digests, article and preprint postings, collaborative tools, and more. We want ResDex to be your all-in-one platform for everything research, from discovery to publication and beyond.
                </AccordionContent>
              </AccordionItem>
              <div className="w-full h-px bg-neutral-200 dark:bg-neutral-700 my-0.5" />
              <AccordionItem value="item-3" className="px-6 py-4">
                <AccordionTrigger><TextAnimate animation="fadeIn" by="line">Is ResDex free to use?</TextAnimate></AccordionTrigger>
                <AccordionContent>
                  Yes! ResDex is free for everyone. We believe in making research accessible to everyone.
                </AccordionContent>
              </AccordionItem>
              <div className="w-full h-px bg-neutral-200 dark:bg-neutral-700 my-0.5" />
              <AccordionItem value="item-4" className="px-6 py-4">
                <AccordionTrigger><TextAnimate animation="fadeIn" by="line">How is ResDex different from traditional research portals or job boards?</TextAnimate></AccordionTrigger>
                <AccordionContent>
                  ResDex is built by students, for students. Unlike traditional job boards or research portals, ResDex focuses on the unique needs of student researchers—offering verified research opportunities, a modern portfolio builder, direct faculty connections, and a supportive community. We combine discovery, application, and networking in one place, making research more accessible, transparent, and student-friendly.
                </AccordionContent>
              </AccordionItem>
              <div className="w-full h-px bg-neutral-200 dark:bg-neutral-700 my-0.5" />
              <AccordionItem value="item-5" className="px-6 py-4">
                <AccordionTrigger><TextAnimate animation="fadeIn" by="line">How is my data protected on ResDex?</TextAnimate></AccordionTrigger>
                <AccordionContent>
                  Your privacy and security are our top priorities. ResDex uses industry-standard encryption and best practices to protect your data. We never sell your information, and you have full control over your profile and what you share. For more details, see our Privacy Policy.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
        {/* Footer7 with TextAnimate on all content */}
        <Footer7
          logo={{
            url: "/",
            src: "/beige-logo.png",
            alt: "ResDex Logo",
            title: "ResDex"
          }}
          sections={[
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
                { name: "About", href: "/about" },
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
          ]}
        />
      </div>
    </>
  );
}
