import Image from "next/image";

export function SecurityBadges({ className }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}>
      <Image
        src="/landing/cards-logos/visa-secure_blu_2021.png"
        alt="Visa Secure"
        width={80}
        height={26}
        className="h-7 w-auto"
      />
      <Image
        src="/landing/cards-logos/mastercardidentitycheck.png"
        alt="Mastercard Identity Check"
        width={91}
        height={29}
        className="h-7 w-auto"
      />
    </div>
  );
}
