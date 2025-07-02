import React from "react";
import { cn } from "@/lib/utils";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { Ripple } from "@/components/magicui/ripple";
import { AnimatedListPortfolio } from "@/components/magicui/animated-list-portfolio";
import { FileTextIcon } from "@radix-ui/react-icons";
import { TrendingUp, MessageCircle, Flame, Zap } from "lucide-react";
import { AnimatedList } from "@/components/magicui/animated-list";
import { FlaskConical, Atom, Dna, Leaf, Brain, Sun, Syringe, Rocket, Watch, Waves, Bot, BookOpen } from "lucide-react";

export function FeaturesSectionDemo() {
  const features = [
    {
      title: "Showcase your research",
      description:
        "Take lead and show off your research with a portfolio that's as unique as you are.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: "Short-form content like never before",
      description:
        "Built for those endless scrollers, ResDex is the new way to scroll.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 dark:border-neutral-800",
    },
    {
      title: "Brainwaves of the future",
      description:
        "Whether its a thought or a question, ResDex is the place to share it because your next big discovery is just a click away.",
      skeleton: <Ripple className="absolute inset-0" mainCircleSize={120} mainCircleOpacity={0.12} />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r  dark:border-neutral-800",
    },
    {
      title: "Collaborate and connect",
      description:
        "Take your connections to the next level with our community features. Peer-review, collaborate, and get feedback on your work with anyone in the world.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    },
  ];
  return (
    <div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
          {`We're building the biggest research hub in the world - and `}
          <SparklesText colors={{ first: "#E5E3DF", second: "#E5E3DF" }} className="font-medium ml-3 mr-3 inline-block">
            you're
          </SparklesText>
          {` the center of it.`}
        </h4>

        <p className="text-sm lg:text-base  max-w-2xl  my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
          From portfolios to short-form research content for those endless scrollers, ResDex is redefining what it means to explore research.
        </p>
      </div>

      <div className="relative ">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-md dark:border-neutral-800">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className=" h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className=" max-w-5xl mx-auto text-left tracking-tight text-black dark:text-white text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base  max-w-4xl text-left mx-auto",
        "text-neutral-500 text-center font-normal dark:text-neutral-300",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

export const SkeletonOne = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full  p-5  mx-auto bg-white dark:bg-neutral-900 shadow-2xl group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2  ">
          {/* Portfolio image */}
          <img
            src="/portfolioimg.png"
            alt="Portfolio showcase"
            width={800}
            height={800}
            className="h-full w-full aspect-square object-cover object-center rounded-sm"
          />
        </div>
      </div>

      <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-white dark:from-black via-white dark:via-black to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-white dark:from-black via-transparent to-transparent w-full pointer-events-none" />
    </div>
  );
};

export const SkeletonThree = () => {
  return (
    <a
      href="https://www.youtube.com/watch?v=RPa3_AD1_Vs"
      target="__blank"
      className="relative flex gap-10  h-full group/image"
    >
      <div className="w-full  mx-auto bg-transparent dark:bg-transparent group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2  relative">
          {/* TODO */}
          <IconBrandYoutubeFilled className="h-20 w-20 absolute z-10 inset-0 text-red-500 m-auto " />
          <img
            src="https://assets.aceternity.com/fireship.jpg"
            alt="header"
            width={800}
            height={800}
            className="h-full w-full aspect-square object-cover object-center rounded-sm blur-none group-hover/image:blur-md transition-all duration-200"
          />
        </div>
      </div>
    </a>
  );
};

// Notification style animated list for feature section 2
const notificationsPortfolio = [
  {
    title: "AI Accelerates Protein Folding",
    content: "Deep learning models are now able to predict protein structures with unprecedented accuracy, revolutionizing drug discovery.",
    author: "Dr. Jane Smith",
    icon: <Dna className="text-[22px]" style={{ color: '#2a2a2a' }} />,
  },
  {
    title: "Quantum Computing Milestone",
    content: "Researchers achieve quantum supremacy, solving problems in seconds that would take classical computers millennia.",
    author: "Prof. Alan Turing",
    icon: <Atom className="text-[22px]" style={{ color: '#2a2a2a' }} />,
  },
  {
    title: "CRISPR Gene Editing Advances",
    content: "New CRISPR techniques allow for more precise and safer gene editing, opening doors to curing genetic diseases.",
    author: "Dr. Emily Zhang",
    icon: <FlaskConical className="text-[22px]" style={{ color: '#2a2a2a' }} />,
  },
  {
    title: "Climate Change Solutions",
    content: "Innovative carbon capture technologies are being deployed to combat global warming and reduce emissions.",
    author: "Dr. Michael Green",
    icon: <Leaf className="text-[22px]" style={{ color: '#2a2a2a' }} />,
  },
  {
    title: "Brain-Computer Interfaces",
    content: "BCIs are enabling direct communication between brains and computers, with potential for medical and consumer applications.",
    author: "Dr. Sarah Lee",
    icon: <Brain className="text-[22px]" style={{ color: '#2a2a2a' }} />,
  },
  {
    title: "Fusion Energy Breakthrough",
    content: "A new fusion reactor design achieves net positive energy, bringing us closer to limitless clean power.",
    author: "Prof. Isaac Newton",
    icon: <Sun className="text-[22px]" style={{ color: '#2a2a2a' }} />,
  },
  {
    title: "mRNA Vaccines Expand",
    content: "mRNA technology is now being used to develop vaccines for a range of diseases beyond COVID-19.",
    author: "Dr. Priya Patel",
    icon: <Syringe className="text-[22px]" style={{ color: '#2a2a2a' }} />,
  },
  {
    title: "Mars Rover Discovers Ice",
    content: "NASA's latest rover has found significant ice deposits beneath the Martian surface, fueling hopes for future missions.",
    author: "Dr. Alex Kim",
    icon: <Rocket className="text-[22px]" style={{ color: '#2a2a2a' }} />,
  },
  {
    title: "Wearable Health Tech",
    content: "Smart wearables are now able to monitor a wider range of health metrics, improving preventative care.",
    author: "Dr. Linda Brown",
    icon: <Watch className="text-[22px]" style={{ color: '#2a2a2a' }} />,
  },
  {
    title: "Ocean Cleanup Success",
    content: "Autonomous drones are removing tons of plastic from the oceans, making a measurable impact on marine life.",
    author: "Dr. Carlos Rivera",
    icon: <Waves className="text-[22px]" style={{ color: '#2a2a2a' }} />,
  },
  {
    title: "AI in Literature Review",
    content: "AI-powered tools are streamlining the literature review process, saving researchers countless hours.",
    author: "Dr. Maria Rossi",
    icon: <Bot className="text-[22px]" style={{ color: '#2a2a2a' }} />,
  },
  {
    title: "Open Science Movement",
    content: "More journals are adopting open access policies, making research freely available to all.",
    author: "Dr. John Doe",
    icon: <BookOpen className="text-[22px]" style={{ color: '#2a2a2a' }} />,
  },
];
const notificationsPortfolioList = Array.from({ length: 4 }, () => notificationsPortfolio).flat();

const NotificationPortfolio = ({ title, content, author, icon }: any) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[270px] cursor-pointer overflow-hidden rounded-2xl p-4",
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      )}
    >
      <div className="flex flex-row items-center gap-3 mb-2">
        <div
          className="flex size-9 items-center justify-center rounded-2xl"
          style={{ backgroundColor: '#E5E3DF' }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="text-base font-medium dark:text-white truncate">
            {title}
          </figcaption>
        </div>
      </div>
      <p className="text-xs font-normal dark:text-white/60 mb-4 min-h-[48px]">{content}</p>
      <div className="flex justify-end">
        <span className="text-[11px] text-gray-500 italic">{author}</span>
      </div>
    </figure>
  );
};

export function AnimatedListDemoPortfolio({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex h-[420px] w-full flex-col overflow-hidden pt-2 pb-0", className)}>
      <AnimatedList>
        {notificationsPortfolioList.map((item, idx) => (
          <NotificationPortfolio {...item} key={idx} />
        ))}
      </AnimatedList>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
    </div>
  );
}

export const SkeletonTwo = () => {
  return (
    <AnimatedListDemoPortfolio />
  );
};

export const SkeletonFour = () => {
  return (
    <div className="h-60 md:h-60  flex flex-col items-center relative bg-transparent dark:bg-transparent mt-10">
      <Globe className="absolute -right-10 md:-right-10 -bottom-80 md:-bottom-72" />
    </div>
  );
};

export const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [
        // longitude latitude
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
      ],
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={className}
    />
  );
}; 