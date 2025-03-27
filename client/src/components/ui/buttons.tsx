import { Image } from "@mantine/core";

export const QuickActions = ({
  image,
  alt,
  header,
}: {
  image: string;
  alt: string;
  header: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-gray-100 shadow-sm hover:shadow-md transition">
      <Image
        radius="md"
        h={55}
        w={55}
        src={image}
        alt={alt}
        fallbackSrc="https://placehold.co/600x400"
      />
      <h1 className="text-sm font-semibold text-black mt-2">{header}</h1>
    </div>
  );
};
