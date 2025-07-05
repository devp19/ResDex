import { buttonVariants } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface PaginationWithSecondaryButtonProps {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

export default function PaginationWithSecondaryButton({
  page,
  setPage,
  totalPages,
}: PaginationWithSecondaryButtonProps) {
  return (
    <Pagination>
      <PaginationContent>
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious onClick={() => setPage(Math.max(1, page - 1))} className="cursor-pointer" />
          </PaginationItem>
        )}
        {Array.from({ length: totalPages }).map((_, idx) => (
          <PaginationItem key={idx}>
            <PaginationLink
              onClick={() => setPage(idx + 1)}
              isActive={page === idx + 1}
              className={cn(
                "!shadow-none !border-none cursor-pointer transition-colors",
                page === idx + 1 ? "bg-gray-100" : "hover:bg-gray-100",
                buttonVariants({
                  variant: "ghost",
                  size: "icon",
                })
              )}
            >
              {idx + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        {page < totalPages && (
          <PaginationItem>
            <PaginationNext onClick={() => setPage(Math.min(totalPages, page + 1))} className="cursor-pointer" />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
