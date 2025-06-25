import { TextAnimate } from "@/components/magicui/text-animate";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-8 md:px-16 lg:px-32 xl:px-0 max-w-2xl mx-auto">
      <div className="w-full flex flex-col items-center">
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
          {`ResDex helps you explore, connect, and stay updated with the latest in research and academia.`}
        </TextAnimate>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <InteractiveHoverButton className="bg-black border-black hover:text-black" dotClassName="bg-white" hoverArrowClassName="text-black">
            <TextAnimate animation="fadeIn" by="line" as="span" className="text-white group-hover:text-black">
              {`Sign up now`}
            </TextAnimate>
          </InteractiveHoverButton>
          <InteractiveHoverButton className="bg-white text-black border-black">
            <TextAnimate animation="fadeIn" by="line" as="span" className="text-black" delay={0.2}>
              {`Learn more`}
            </TextAnimate>
          </InteractiveHoverButton>
        </div>
      </div>
    </div>
  );
}
