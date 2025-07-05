import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";

interface BlogCardProps {
  avatar: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  link?: string;
}

export default function BlogCard({ avatar, title, excerpt, author, date, link }: BlogCardProps) {
  return (
    <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-4">
      <div className="flex items-center justify-center w-20 h-20 m-4">
        <Image src={avatar} alt={author} width={56} height={56} className="rounded-full object-cover" />
      </div>
      <div className="flex flex-col justify-between p-4 flex-1">
        <div>
          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mb-2">Blog</span>
          <div className="mb-1">
            {link ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-bold flex items-center gap-1 whitespace-nowrap"
                style={{ color: '#2a2a2a' }}
                onMouseOver={e => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.cursor = 'pointer'; }}
                onMouseOut={e => { e.currentTarget.style.textDecoration = 'none'; e.currentTarget.style.cursor = 'default'; }}
              >
                {title}
                <ExternalLinkIcon className="w-4 h-4 ml-1" />
              </a>
            ) : (
              <span className="text-lg font-bold" style={{ color: '#2a2a2a' }}>{title}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{excerpt}</p>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>By {author}</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
} 