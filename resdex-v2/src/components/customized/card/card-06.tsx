import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  HeartIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  ShareIcon,
} from "lucide-react";
import Image from "next/image";

interface CardPostProps {
  avatar: string;
  name: string;
  username: string;
  title: string;
  content: string;
  hashtags?: string[];
}

export default function CardPost({ avatar, name, username, title, content, hashtags }: CardPostProps) {
  return (
    <Card className="w-full h-full max-w-sm shadow-none text-base">
      <CardHeader className="flex flex-row items-center justify-between py-1 px-3">
        <div className="flex items-center gap-3">
          <Image
            src={avatar}
            className="h-8 w-8 rounded-full bg-secondary object-contain"
            alt={name}
            height={32}
            width={32}
          />
          <div className="flex flex-col gap-0.5">
            <h6 className="text-sm leading-none font-medium">{name}</h6>
            <span className="text-xs">{username}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontalIcon />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-video bg-muted border-y" />
        <div className="pt-2 pb-3 px-4">
          <h2 className="font-semibold text-base">{title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {content} {hashtags && hashtags.map((tag, i) => (
              <span key={i} className="text-blue-500">{tag} </span>
            ))}
          </p>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex py-1 px-3 gap-2">
        <Button variant="ghost" className="w-auto text-muted-foreground flex-1">
          <HeartIcon /> <span className="hidden sm:inline">Like</span>
        </Button>
        <Button variant="ghost" className="w-auto text-muted-foreground flex-1">
          <MessageCircleIcon />
          <span className="hidden sm:inline">Comment</span>
        </Button>
        <Button variant="ghost" className="w-auto text-muted-foreground flex-1">
          <ShareIcon /> <span className="hidden sm:inline">Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
