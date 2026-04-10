import Image from "next/image";
import Link from "next/link";

<Link href="/" className="flex items-center">
  <Image
    src="/logo-horizontal.png"
    alt="Coreframe Cloud"
    width={160}
    height={40}
    priority
    className="h-8 w-auto md:h-9"
  />
</Link>
