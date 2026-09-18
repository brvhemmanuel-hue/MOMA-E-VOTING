import Image from "next/image";
import { SCHOOL_LOGO_PATH, SCHOOL_NAME } from "@/lib/config";

export function Logo({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src={SCHOOL_LOGO_PATH}
      alt={`${SCHOOL_NAME} crest`}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      priority
    />
  );
}
