import Image from "next/image";

export function DecorativeLeaves() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden>
      <div className="absolute top-24 right-0 hidden xl:block opacity-[0.15] w-56 h-56">
        <Image
          src="/images/decor/leaf-top-right.jpg"
          alt=""
          width={224}
          height={224}
          className="object-contain"
        />
      </div>
      <div className="absolute bottom-40 right-0 hidden xl:block opacity-10 w-44 h-44">
        <Image
          src="/images/decor/leaf-bottom-right.jpg"
          alt=""
          width={176}
          height={176}
          className="object-contain"
        />
      </div>
    </div>
  );
}
